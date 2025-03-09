
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance, GoalTransaction } from '@/context/FinanceContext';
import { Edit, MoreHorizontal, Plus, Target, Trash2, ArrowUpRight, ArrowDownRight, Calendar, PlusCircle, MinusCircle, Eye, ChevronRight, History, CircleDollarSign, Clock, CalendarDays } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { format, differenceInMonths, formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from "sonner";

export function Goals() {
  const { formatCurrency, categories, goals, addGoal, updateGoal, deleteGoal, addGoalTransaction, deleteGoalTransaction } = useFinance();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openAddFundsDialog, setOpenAddFundsDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [editGoal, setEditGoal] = useState<typeof goals[0] | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<typeof goals[0] | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: '',
    category: '',
    color: '#4F46E5',
  });
  
  const [transactionData, setTransactionData] = useState({
    amount: 0,
    type: 'add' as 'add' | 'remove',
    description: '',
  });
  
  const handleOpenDialog = (goal?: typeof goals[0]) => {
    if (goal) {
      setEditGoal(goal);
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate,
        category: goal.category,
        color: goal.color,
      });
    } else {
      setEditGoal(null);
      setFormData({
        name: '',
        targetAmount: 0,
        currentAmount: 0,
        targetDate: new Date().toISOString().split('T')[0],
        category: categories.length > 0 ? categories[0].name : '',
        color: '#4F46E5',
      });
    }
    setOpenDialog(true);
  };
  
  const handleOpenDetailDialog = (goal: typeof goals[0]) => {
    setSelectedGoal(goal);
    setOpenDetailDialog(true);
  };
  
  const handleOpenAddFundsDialog = (goal: typeof goals[0], type: 'add' | 'remove') => {
    setSelectedGoal(goal);
    setTransactionData({
      amount: 0,
      type: type,
      description: type === 'add' ? 'Adição de fundos' : 'Retirada de fundos',
    });
    setOpenAddFundsDialog(true);
  };
  
  const handleOpenHistoryDialog = (goal: typeof goals[0]) => {
    setSelectedGoal(goal);
    setOpenHistoryDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditGoal(null);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editGoal) {
      updateGoal(editGoal.id, formData);
    } else {
      addGoal(formData);
    }
    
    handleCloseDialog();
  };
  
  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGoal) return;
    
    if (transactionData.type === 'remove' && transactionData.amount > selectedGoal.currentAmount) {
      toast.error("Não é possível retirar mais do que o valor atual da meta");
      return;
    }
    
    addGoalTransaction(selectedGoal.id, {
      date: new Date(),
      amount: transactionData.amount,
      type: transactionData.type,
      description: transactionData.description,
    });
    
    setOpenAddFundsDialog(false);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleTransactionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setTransactionData({ ...transactionData, [name]: parseFloat(value) || 0 });
    } else {
      setTransactionData({ ...transactionData, [name]: value });
    }
  };
  
  const handleDeleteGoal = (id: string) => {
    deleteGoal(id);
  };
  
  const handleDeleteTransaction = (goalId: string, transactionId: string) => {
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
  
  // Group goals by completion status
  const completedGoals = goals.filter(goal => goal.currentAmount >= goal.targetAmount);
  const activeGoals = goals.filter(goal => goal.currentAmount < goal.targetAmount);
  
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Metas Financeiras</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe o progresso das suas metas financeiras
        </p>
      </div>
      
      <div className="flex justify-between mb-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">
              Metas Ativas ({activeGoals.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Metas Concluídas ({completedGoals.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button onClick={() => handleOpenDialog()}>
          <Plus size={16} className="mr-1" />
          Nova Meta
        </Button>
      </div>
      
      <Tabs defaultValue="active">
        <TabsContent value="active">
          {activeGoals.length === 0 ? (
            <div className="text-center p-12 border rounded-lg bg-muted/10">
              <Target size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma meta ativa</h3>
              <p className="text-muted-foreground mb-4">
                Crie uma meta financeira para acompanhar seu progresso
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus size={16} className="mr-2" />
                Adicionar meta
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeGoals.map((goal) => {
                const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                const remainingAmount = goal.targetAmount - goal.currentAmount;
                const monthlyContribution = calculateMonthlyContribution(goal);
                const remainingTime = calculateRemainingTime(goal.targetDate);
                
                return (
                  <Card key={goal.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${goal.color}20` }}
                          >
                            <Target size={20} style={{ color: goal.color }} />
                          </div>
                          <div>
                            <h3 className="font-medium">{goal.name}</h3>
                            <div className="text-xs text-muted-foreground">{goal.category}</div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenAddFundsDialog(goal, 'add')}>
                              <PlusCircle size={16} className="mr-2 text-finance-income" />
                              Adicionar Fundos
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenAddFundsDialog(goal, 'remove')}>
                              <MinusCircle size={16} className="mr-2 text-finance-expense" />
                              Retirar Fundos
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenHistoryDialog(goal)}>
                              <History size={16} className="mr-2" />
                              Histórico
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenDetailDialog(goal)}>
                              <Eye size={16} className="mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenDialog(goal)}>
                              <Edit size={16} className="mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteGoal(goal.id)}
                            >
                              <Trash2 size={16} className="mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        
                        <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${progress}%`,
                              backgroundColor: goal.color,
                            }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">
                            <AnimatedNumber 
                              value={goal.currentAmount} 
                              formatValue={(val) => formatCurrency(val)} 
                            />
                          </span>
                          <span className="text-muted-foreground">
                            {formatCurrency(goal.targetAmount)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground">Faltam</div>
                          <div className="font-medium">
                            {formatCurrency(remainingAmount)}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Meta mensal</div>
                          <div className="font-medium">
                            {formatCurrency(monthlyContribution)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground">Data Alvo</div>
                          <div className="font-medium flex items-center gap-1">
                            <Clock size={14} />
                            <span>{remainingTime}</span>
                          </div>
                        </div>
                        
                        <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => handleOpenDetailDialog(goal)}>
                          Ver Detalhes
                          <ChevronRight size={14} className="ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      
        <TabsContent value="completed">
          {completedGoals.length === 0 ? (
            <div className="text-center p-10 border rounded-lg bg-muted/10">
              <Target size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma meta concluída</h3>
              <p className="text-muted-foreground">
                Suas metas concluídas aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedGoals.map((goal) => (
                <Card key={goal.id} className="overflow-hidden border-green-200 bg-green-50/30 dark:bg-green-950/10 dark:border-green-900">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${goal.color}20` }}
                        >
                          <Target size={20} style={{ color: goal.color }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{goal.name}</h3>
                            <Badge variant="success" className="bg-green-500 hover:bg-green-600">Concluída</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">{goal.category}</div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenHistoryDialog(goal)}>
                            <History size={16} className="mr-2" />
                            Histórico
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDetailDialog(goal)}>
                            <Eye size={16} className="mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <Trash2 size={16} className="mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Meta Alcançada</span>
                        <span className="font-medium">100%</span>
                      </div>
                      
                      <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: "100%",
                            backgroundColor: goal.color,
                          }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          <AnimatedNumber 
                            value={goal.currentAmount} 
                            formatValue={(val) => formatCurrency(val)} 
                          />
                        </span>
                        <span className="text-muted-foreground">
                          {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground">Data Alvo</div>
                        <div className="font-medium">
                          {new Date(goal.targetDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Data Concluída</div>
                        <div className="font-medium">
                          {/* Show the date of the last transaction that caused completion */}
                          {goal.transactions.length > 0 
                            ? format(
                                goal.transactions
                                  .filter(t => t.type === 'add')
                                  .sort((a, b) => b.date.getTime() - a.date.getTime())[0].date,
                                'dd/MM/yyyy'
                              )
                            : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Create/Edit Goal Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editGoal ? 'Editar Meta' : 'Nova Meta'}
            </DialogTitle>
            <DialogDescription>
              {editGoal 
                ? 'Edite os detalhes da sua meta financeira' 
                : 'Adicione uma nova meta financeira para acompanhar seu progresso'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
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
                <Label htmlFor="currentAmount">Valor Atual</Label>
                <Input 
                  id="currentAmount" 
                  name="currentAmount" 
                  type="number" 
                  step="0.01" 
                  value={formData.currentAmount} 
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
                  onValueChange={(value) => setFormData({...formData, category: value})}
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
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editGoal ? 'Salvar Alterações' : 'Adicionar'}
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
                ? `Adicione fundos à sua meta "${selectedGoal?.name}"` 
                : `Retire fundos da sua meta "${selectedGoal?.name}"`}
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
      
      {/* Goal Details Dialog */}
      <Dialog open={openDetailDialog} onOpenChange={setOpenDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${selectedGoal?.color}20` }}
              >
                <Target size={14} style={{ color: selectedGoal?.color }} />
              </div>
              <span>{selectedGoal?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Detalhes e histórico de transações da meta
            </DialogDescription>
          </DialogHeader>
          
          {selectedGoal && (
            <div className="py-2">
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="transactions">Transações</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Valor Atual</p>
                      <p className="text-2xl font-bold">{formatCurrency(selectedGoal.currentAmount)}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Valor Alvo</p>
                      <p className="text-2xl font-bold">{formatCurrency(selectedGoal.targetAmount)}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Data Alvo</p>
                      <div className="flex items-center gap-2">
                        <CalendarDays size={16} />
                        <p className="text-xl font-medium">
                          {new Date(selectedGoal.targetDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Contribuição Mensal Necessária</p>
                      <div className="flex items-center gap-2">
                        <CircleDollarSign size={16} />
                        <p className="text-xl font-medium">
                          {formatCurrency(calculateMonthlyContribution(selectedGoal))}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Progresso</p>
                    <div className="h-4 w-full bg-accent rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${calculateProgress(selectedGoal.currentAmount, selectedGoal.targetAmount)}%`,
                          backgroundColor: selectedGoal.color,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>
                        {calculateProgress(selectedGoal.currentAmount, selectedGoal.targetAmount)}% completo
                      </span>
                      <span>
                        {selectedGoal.currentAmount >= selectedGoal.targetAmount
                          ? "Meta alcançada!"
                          : `Faltam ${formatCurrency(selectedGoal.targetAmount - selectedGoal.currentAmount)}`
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={() => handleOpenAddFundsDialog(selectedGoal, 'add')}
                      className="flex-1"
                    >
                      <PlusCircle size={16} className="mr-2" />
                      Adicionar Fundos
                    </Button>
                    <Button 
                      onClick={() => handleOpenAddFundsDialog(selectedGoal, 'remove')}
                      variant="outline"
                      className="flex-1"
                      disabled={selectedGoal.currentAmount <= 0}
                    >
                      <MinusCircle size={16} className="mr-2" />
                      Retirar Fundos
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="transactions" className="mt-4">
                  <div className="rounded-md border">
                    <div className="py-2 px-4 bg-muted font-medium text-sm grid grid-cols-12">
                      <div className="col-span-2">Data</div>
                      <div className="col-span-3">Tipo</div>
                      <div className="col-span-4">Descrição</div>
                      <div className="col-span-3 text-right">Valor</div>
                    </div>
                    <div className="divide-y">
                      {selectedGoal.transactions.length > 0 ? (
                        [...selectedGoal.transactions]
                          .sort((a, b) => b.date.getTime() - a.date.getTime())
                          .map(transaction => (
                            <div key={transaction.id} className="py-3 px-4 text-sm grid grid-cols-12 items-center">
                              <div className="col-span-2">
                                {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                              </div>
                              <div className="col-span-3">
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
                              <div className="col-span-4 truncate" title={transaction.description}>
                                {transaction.description}
                              </div>
                              <div className={`col-span-3 text-right font-medium ${
                                transaction.type === 'add' ? 'text-finance-income' : 'text-finance-expense'
                              }`}>
                                {transaction.type === 'add' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
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
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setOpenDetailDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Goal History Dialog */}
      <Dialog open={openHistoryDialog} onOpenChange={setOpenHistoryDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Histórico de Modificações</DialogTitle>
            <DialogDescription>
              Histórico completo de alterações da meta {selectedGoal?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedGoal && (
            <div className="flex-1 overflow-auto pr-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedGoal.transactions.length > 0 ? (
                    [...selectedGoal.transactions]
                      .sort((a, b) => b.date.getTime() - a.date.getTime())
                      .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {format(new Date(transaction.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.type === 'add' ? 'outline' : 'destructive'} className="whitespace-nowrap">
                              {transaction.type === 'add' ? 'Adição' : 'Retirada'}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell className={`text-right font-medium ${
                            transaction.type === 'add' ? 'text-finance-income' : 'text-finance-expense'
                          }`}>
                            {transaction.type === 'add' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTransaction(selectedGoal.id, transaction.id)}
                            >
                              <Trash2 size={16} className="text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        Nenhuma transação registrada para esta meta
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setOpenHistoryDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

export default Goals;
