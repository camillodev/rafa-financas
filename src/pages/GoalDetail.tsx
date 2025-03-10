
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance, GoalTransaction } from '@/context/FinanceContext';
import { 
  Edit, 
  ChevronLeft, 
  PlusCircle, 
  MinusCircle, 
  Target, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  CircleDollarSign, 
  Clock, 
  CalendarDays,
  History, 
  Info,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { format, differenceInMonths, formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export function GoalDetail() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const { formatCurrency, categories, goals, updateGoal, deleteGoal, addGoalTransaction, deleteGoalTransaction } = useFinance();
  
  const [goal, setGoal] = useState<typeof goals[0] | null>(null);
  const [openAddFundsDialog, setOpenAddFundsDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: '',
    category: '',
    color: '#4F46E5',
    icon: 'target',
  });
  
  const [transactionData, setTransactionData] = useState({
    amount: 0,
    type: 'add' as 'add' | 'remove',
    description: '',
  });
  
  useEffect(() => {
    if (goalId) {
      const foundGoal = goals.find(g => g.id === goalId);
      if (foundGoal) {
        setGoal(foundGoal);
        setFormData({
          name: foundGoal.name,
          targetAmount: foundGoal.targetAmount,
          currentAmount: foundGoal.currentAmount,
          targetDate: foundGoal.targetDate,
          category: foundGoal.category,
          color: foundGoal.color,
          icon: foundGoal.icon
        });
      } else {
        // Meta não encontrada, redirecionar para página de metas
        navigate('/goals');
        toast.error('Meta não encontrada');
      }
    }
  }, [goalId, goals, navigate]);
  
  const handleOpenAddFundsDialog = (type: 'add' | 'remove') => {
    setTransactionData({
      amount: 0,
      type: type,
      description: type === 'add' ? 'Adição de fundos' : 'Retirada de fundos',
    });
    setOpenAddFundsDialog(true);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };
  
  const handleTransactionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setTransactionData({ ...transactionData, [name]: parseFloat(value) || 0 });
    } else {
      setTransactionData({ ...transactionData, [name]: value });
    }
  };
  
  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalId) return;
    
    updateGoal(goalId, formData);
    setOpenEditDialog(false);
  };
  
  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalId || !goal) return;
    
    if (transactionData.type === 'remove' && transactionData.amount > goal.currentAmount) {
      toast.error("Não é possível retirar mais do que o valor atual da meta");
      return;
    }
    
    addGoalTransaction(goalId, {
      date: new Date(),
      amount: transactionData.amount,
      type: transactionData.type,
      description: transactionData.description,
    });
    
    setOpenAddFundsDialog(false);
  };
  
  const handleDeleteGoal = () => {
    if (!goalId) return;
    
    deleteGoal(goalId);
    navigate('/goals');
    toast.success('Meta excluída com sucesso');
  };
  
  const handleDeleteTransaction = (transactionId: string) => {
    if (!goalId) return;
    
    deleteGoalTransaction(goalId, transactionId);
  };
  
  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };
  
  const calculateMonthlyContribution = (goal: typeof goals[0]) => {
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    
    // If target date is in the past, return 0
    if (targetDate < today) return 0;
    
    // Calculate months between now and target date (add 1 to include current month)
    const months = differenceInMonths(targetDate, today) + 1;
    if (months <= 0) return 0;
    
    // Calculate remaining amount
    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0) return 0;
    
    // Calculate monthly contribution
    return remaining / months;
  };

  // Calculate remaining time until target date
  const calculateRemainingTime = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    
    if (target < today) {
      return "Meta vencida";
    }
    
    return formatDistance(today, target, { 
      locale: ptBR,
      addSuffix: true 
    });
  };
  
  if (!goal) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Info size={48} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Carregando meta...</h2>
            <p className="text-muted-foreground">
              Se esta mensagem persistir, a meta pode não existir.
            </p>
            <Button className="mt-4" onClick={() => navigate('/goals')}>
              <ChevronLeft size={16} className="mr-2" />
              Voltar para Metas
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
  const remainingAmount = goal.targetAmount - goal.currentAmount;
  const monthlyContribution = calculateMonthlyContribution(goal);
  const remainingTime = calculateRemainingTime(goal.targetDate);
  const isCompleted = goal.currentAmount >= goal.targetAmount;
  
  return (
    <AppLayout>
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Button variant="outline" size="icon" className="mr-4" onClick={() => navigate('/goals')}>
            <ChevronLeft size={16} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${goal.color}20` }}
              >
                <Target size={20} style={{ color: goal.color }} />
              </div>
              {goal.name}
              {isCompleted && (
                <Badge variant="outline" className="bg-green-500 text-white hover:bg-green-600 ml-2">
                  Concluída
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              {goal.category} — Criado em {format(goal.transactions[0]?.date || new Date(), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setOpenEditDialog(true)}>
            <Edit size={16} className="mr-2" />
            Editar Meta
          </Button>
          <Button variant="outline" onClick={() => handleOpenAddFundsDialog('add')}>
            <PlusCircle size={16} className="mr-2 text-finance-income" />
            Adicionar Fundos
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleOpenAddFundsDialog('remove')}
            disabled={goal.currentAmount <= 0}
          >
            <MinusCircle size={16} className="mr-2 text-finance-expense" />
            Retirar Fundos
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setOpenDeleteDialog(true)}
          >
            <Trash2 size={16} className="mr-2" />
            Excluir
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Progresso da Meta</CardTitle>
              <CardDescription>Acompanhe o progresso rumo ao seu objetivo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Valor Atual</p>
                  <p className="text-3xl font-bold">
                    <AnimatedNumber 
                      value={goal.currentAmount} 
                      formatValue={(val) => formatCurrency(val)} 
                    />
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Valor Alvo</p>
                  <p className="text-3xl font-bold">{formatCurrency(goal.targetAmount)}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                
                <div className="h-4 w-full bg-accent rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: goal.color,
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Faltam</p>
                  <p className="text-xl font-medium">
                    {isCompleted ? (
                      <span className="text-green-500">Meta atingida!</span>
                    ) : (
                      formatCurrency(remainingAmount)
                    )}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Data Alvo</p>
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    <p className="text-xl font-medium">
                      {format(new Date(goal.targetDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>
              
              {!isCompleted && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Planejamento para atingir a meta</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Tempo Restante</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock size={16} />
                          <p className="font-medium">{remainingTime}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Contribuição Mensal Necessária</p>
                        <div className="flex items-center gap-2 mt-1">
                          <CircleDollarSign size={16} />
                          <p className="font-medium">{formatCurrency(monthlyContribution)}</p>
                        </div>
                      </div>
                    </div>
                    
                    {new Date(goal.targetDate) < new Date() && (
                      <div className="rounded-md border-destructive border bg-destructive/10 p-3 mt-3">
                        <div className="flex gap-2 items-center">
                          <AlertTriangle className="text-destructive h-5 w-5" />
                          <p className="text-sm font-medium">A data alvo já passou!</p>
                        </div>
                        <p className="text-sm mt-1 pl-7">
                          Atualize a data alvo ou aumente suas contribuições para atingir sua meta.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Alterações</CardTitle>
              <CardDescription>Registro completo de todas as transações desta meta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="py-2 px-4 bg-muted font-medium text-sm grid grid-cols-12">
                  <div className="col-span-2">Data</div>
                  <div className="col-span-2">Tipo</div>
                  <div className="col-span-5">Descrição</div>
                  <div className="col-span-2 text-right">Valor</div>
                  <div className="col-span-1 text-right">Ações</div>
                </div>
                <div className="divide-y">
                  {goal.transactions.length > 0 ? (
                    [...goal.transactions]
                      .sort((a, b) => b.date.getTime() - a.date.getTime())
                      .map(transaction => (
                        <div key={transaction.id} className="py-3 px-4 text-sm grid grid-cols-12 items-center">
                          <div className="col-span-2">
                            {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center gap-1">
                              {transaction.type === 'add' ? (
                                <>
                                  <ArrowUpRight size={16} className="text-finance-income" />
                                  <span className="text-finance-income">Adição</span>
                                </>
                              ) : (
                                <>
                                  <ArrowDownRight size={16} className="text-finance-expense" />
                                  <span className="text-finance-expense">Retirada</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="col-span-5 truncate" title={transaction.description}>
                            {transaction.description}
                          </div>
                          <div className={`col-span-2 text-right font-medium ${
                            transaction.type === 'add' ? 'text-finance-income' : 'text-finance-expense'
                          }`}>
                            {transaction.type === 'add' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </div>
                          <div className="col-span-1 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                            >
                              <Trash2 size={16} className="text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="py-6 text-center text-muted-foreground">
                      Nenhuma transação registrada para esta meta
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Meta</CardTitle>
              <CardDescription>Informações detalhadas sobre sua meta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Nome</p>
                <p className="font-medium">{goal.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Categoria</p>
                <p className="font-medium">{goal.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Data Alvo</p>
                <p className="font-medium">
                  {format(new Date(goal.targetDate), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <p className="font-medium">
                  {isCompleted ? (
                    <span className="text-green-500">Concluída</span>
                  ) : (
                    <span>Em andamento</span>
                  )}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total de Transações</p>
                <p className="font-medium">{goal.transactions.length}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Adicionado</p>
                <p className="font-medium text-finance-income">
                  {formatCurrency(
                    goal.transactions
                      .filter(t => t.type === 'add')
                      .reduce((acc, t) => acc + t.amount, 0)
                  )}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Retirado</p>
                <p className="font-medium text-finance-expense">
                  {formatCurrency(
                    goal.transactions
                      .filter(t => t.type === 'remove')
                      .reduce((acc, t) => acc + t.amount, 0)
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Edit Goal Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Meta</DialogTitle>
            <DialogDescription>
              Edite os detalhes da sua meta financeira
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Meta</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="targetAmount">Valor Alvo</Label>
                <Input 
                  id="targetAmount" 
                  name="targetAmount" 
                  type="number" 
                  step="0.01" 
                  value={formData.targetAmount} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="targetDate">Data Alvo</Label>
                <Input 
                  id="targetDate" 
                  name="targetDate" 
                  type="date" 
                  value={formData.targetDate} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="color">Cor</Label>
                <div className="flex gap-2">
                  <Input 
                    id="color" 
                    name="color" 
                    type="color" 
                    value={formData.color} 
                    onChange={handleChange} 
                    className="w-12 h-10 p-1"
                  />
                  <Input 
                    type="text" 
                    value={formData.color} 
                    onChange={(e) => setFormData({...formData, color: e.target.value})} 
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEditDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Add/Remove Funds Dialog */}
      <Dialog open={openAddFundsDialog} onOpenChange={setOpenAddFundsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {transactionData.type === 'add' ? 'Adicionar Fundos' : 'Retirar Fundos'}
            </DialogTitle>
            <DialogDescription>
              {transactionData.type === 'add' 
                ? `Adicione fundos à sua meta "${goal.name}"` 
                : `Retire fundos da sua meta "${goal.name}"`}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddFunds}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Valor</Label>
                <Input 
                  id="amount" 
                  name="amount" 
                  type="number" 
                  step="0.01" 
                  value={transactionData.amount} 
                  onChange={handleTransactionChange} 
                  required 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Input 
                  id="description" 
                  name="description" 
                  value={transactionData.description} 
                  onChange={handleTransactionChange} 
                  required 
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAddFundsDialog(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit"
                variant={transactionData.type === 'add' ? 'default' : 'destructive'}
              >
                {transactionData.type === 'add' ? 'Adicionar' : 'Retirar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Meta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a meta "{goal.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteGoal}>
              Excluir Meta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

export default GoalDetail;
