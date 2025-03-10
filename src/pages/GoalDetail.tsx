
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance } from '@/context/FinanceContext';
import { 
  Target, 
  ArrowLeft, 
  Calendar, 
  Edit, 
  Plus, 
  Trash2, 
  Coins, 
  LineChart, 
  BanknoteIcon, 
  Clock,
  History,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { differenceInMonths, format, isAfter, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { GoalModification, GoalTransaction } from '@/types/finance';

export function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    goals, 
    categories, 
    formatCurrency, 
    updateGoal, 
    deleteGoal, 
    addGoalTransaction, 
    deleteGoalTransaction,
    addGoalModification,
    getGoalModifications
  } = useFinance();
  
  const goal = goals.find(g => g.id === id);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isDeleteTransactionDialogOpen, setIsDeleteTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<GoalTransaction | null>(null);
  
  const [modificationHistory, setModificationHistory] = useState<GoalModification[]>([]);
  
  const [editFormData, setEditFormData] = useState({
    name: '',
    targetAmount: 0,
    targetDate: '',
    category: '',
    icon: '',
    color: '',
  });
  
  const [transactionFormData, setTransactionFormData] = useState({
    amount: 0,
    type: 'add',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  
  // Load modification history
  useEffect(() => {
    if (id) {
      const modifications = getGoalModifications(id);
      setModificationHistory(modifications);
    }
  }, [id, getGoalModifications]);
  
  // Initialize form data with goal details
  useEffect(() => {
    if (goal) {
      setEditFormData({
        name: goal.name,
        targetAmount: goal.targetAmount,
        targetDate: goal.targetDate,
        category: goal.category,
        icon: goal.icon,
        color: goal.color,
      });
    }
  }, [goal]);
  
  if (!goal) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertTriangle size={48} className="text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Meta não encontrada</h1>
          <p className="text-muted-foreground mb-6">A meta que você está procurando não existe ou foi removida.</p>
          <Button onClick={() => navigate('/goals')}>
            <ArrowLeft size={16} className="mr-2" />
            Voltar para Metas
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  const percentage = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
  
  const calculateMonthlyContribution = () => {
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const monthsRemaining = Math.max(1, differenceInMonths(targetDate, today) || 1);
    const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
    
    return remainingAmount / monthsRemaining;
  };
  
  const isTargetDatePassed = isAfter(new Date(), parseISO(goal.targetDate));
  
  const handleGoBack = () => {
    navigate('/goals');
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleTransactionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setTransactionFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'type') {
      setTransactionFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateGoal(goal.id, editFormData);
    setIsEditDialogOpen(false);
  };
  
  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transaction = {
      date: new Date(transactionFormData.date),
      amount: transactionFormData.amount,
      type: transactionFormData.type as 'add' | 'remove',
      description: transactionFormData.description,
    };
    
    addGoalTransaction(goal.id, transaction);
    setIsTransactionDialogOpen(false);
    
    // Reset form
    setTransactionFormData({
      amount: 0,
      type: 'add',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
  };
  
  const handleDeleteGoal = () => {
    deleteGoal(goal.id);
    navigate('/goals');
    toast.success('Meta excluída com sucesso');
  };
  
  const handleOpenDeleteTransactionDialog = (transaction: GoalTransaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteTransactionDialogOpen(true);
  };
  
  const handleDeleteTransaction = () => {
    if (selectedTransaction) {
      deleteGoalTransaction(goal.id, selectedTransaction.id);
      setIsDeleteTransactionDialogOpen(false);
    }
  };
  
  const formatModificationType = (type: string) => {
    switch (type) {
      case 'contribution':
        return 'Contribuição';
      case 'withdrawal':
        return 'Retirada';
      case 'target_change':
        return 'Alteração do valor';
      case 'date_change':
        return 'Alteração da data';
      case 'description_change':
        return 'Alteração da descrição';
      default:
        return type;
    }
  };
  
  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex items-center mb-1">
          <Button variant="ghost" size="icon" onClick={handleGoBack} className="mr-2">
            <ArrowLeft size={16} />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{goal.name}</h1>
        </div>
        <div className="flex items-center ml-9 text-muted-foreground">
          <Calendar size={14} className="mr-1" />
          <span>Meta para {format(new Date(goal.targetDate), 'dd MMMM yyyy', { locale: ptBR })}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>Progresso</CardTitle>
                <CardDescription>Acompanhe seu progresso em direção à meta</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                  <Edit size={14} className="mr-1" />
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 size={14} className="mr-1" />
                  Excluir
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <div className="flex justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">Valor Atual</span>
                  <p className="text-2xl font-semibold">{formatCurrency(goal.currentAmount)}</p>
                </div>
                
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">Meta</span>
                  <p className="text-2xl font-semibold">{formatCurrency(goal.targetAmount)}</p>
                </div>
              </div>
              
              <div className="h-4 w-full bg-secondary rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full transition-all duration-500 ease-out rounded-full relative"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: goal.color
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                    {percentage}%
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between text-sm mt-1">
                <span>
                  {percentage < 100 
                    ? `Faltando ${formatCurrency(goal.targetAmount - goal.currentAmount)}`
                    : 'Meta atingida!'}
                </span>
                {isTargetDatePassed && percentage < 100 && (
                  <span className="text-destructive flex items-center">
                    <Clock size={12} className="mr-1" />
                    Data alvo já passou
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins size={16} className="text-muted-foreground" />
                    <h3 className="text-sm font-medium">Contribuição Mensal</h3>
                  </div>
                  <p className="text-xl font-semibold">{formatCurrency(calculateMonthlyContribution())}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para atingir a meta até {format(new Date(goal.targetDate), 'MMM yyyy', { locale: ptBR })}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BanknoteIcon size={16} className="text-muted-foreground" />
                    <h3 className="text-sm font-medium">Categoria</h3>
                  </div>
                  <p className="text-xl font-semibold">{goal.category}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Classificação da meta
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <h3 className="text-sm font-medium">Tempo Restante</h3>
                  </div>
                  <p className="text-xl font-semibold">
                    {differenceInMonths(new Date(goal.targetDate), new Date())} meses
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Até {format(new Date(goal.targetDate), 'dd/MM/yyyy')}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setIsTransactionDialogOpen(true)}>
                <Plus size={14} className="mr-1" />
                Adicionar Transação
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
            <CardDescription>Detalhes da sua meta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Data de Criação</span>
                  <span className="font-medium">
                    {format(new Date(2023, 0, 1), 'dd/MM/yyyy')}
                  </span>
                </div>
                <Separator />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Data Alvo</span>
                  <span className="font-medium">
                    {format(new Date(goal.targetDate), 'dd/MM/yyyy')}
                  </span>
                </div>
                <Separator />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total de Depósitos</span>
                  <span className="font-medium text-finance-income">
                    {formatCurrency(
                      goal.transactions
                        .filter(t => t.type === 'add')
                        .reduce((acc, t) => acc + t.amount, 0)
                    )}
                  </span>
                </div>
                <Separator />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total de Retiradas</span>
                  <span className="font-medium text-finance-expense">
                    {formatCurrency(
                      goal.transactions
                        .filter(t => t.type === 'remove')
                        .reduce((acc, t) => acc + t.amount, 0)
                    )}
                  </span>
                </div>
                <Separator />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Número de Transações</span>
                  <span className="font-medium">
                    {goal.transactions.length}
                  </span>
                </div>
                <Separator />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Categoria</span>
                  <span className="font-medium">
                    {goal.category}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="transactions">
        <TabsList className="mb-4">
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="history">Histórico de Modificações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transações</CardTitle>
              <CardDescription>
                Todas as contribuições e retiradas desta meta
              </CardDescription>
            </CardHeader>
            <CardContent>
              {goal.transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...goal.transactions]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(transaction => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {format(new Date(transaction.date), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Badge variant={transaction.type === 'add' ? 'default' : 'destructive'}>
                              {transaction.type === 'add' ? 'Depósito' : 'Retirada'}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right ${
                            transaction.type === 'add' 
                              ? 'text-finance-income' 
                              : 'text-finance-expense'
                          }`}>
                            {transaction.type === 'add' ? '+' : '-'} {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleOpenDeleteTransactionDialog(transaction)}
                            >
                              <Trash2 size={16} className="text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Coins size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma transação</h3>
                  <p className="text-muted-foreground mb-4">
                    Adicione depósitos ou retiradas para acompanhar seu progresso
                  </p>
                  <Button onClick={() => setIsTransactionDialogOpen(true)}>
                    <Plus size={16} className="mr-2" />
                    Adicionar Transação
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Modificações</CardTitle>
              <CardDescription>
                Registro de todas as alterações realizadas nesta meta
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modificationHistory && modificationHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...modificationHistory]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(modification => (
                        <TableRow key={modification.id}>
                          <TableCell>
                            {format(new Date(modification.date), 'dd/MM/yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {formatModificationType(modification.type)}
                            </Badge>
                          </TableCell>
                          <TableCell>{modification.description}</TableCell>
                          <TableCell>
                            {modification.type === 'contribution' && (
                              <span className="text-finance-income">
                                +{formatCurrency(modification.amount || 0)}
                              </span>
                            )}
                            
                            {modification.type === 'withdrawal' && (
                              <span className="text-finance-expense">
                                -{formatCurrency(modification.amount || 0)}
                              </span>
                            )}
                            
                            {(modification.type === 'target_change' || modification.type === 'date_change' || modification.type === 'description_change') && (
                              <span className="text-xs">
                                <span className="text-muted-foreground">De: </span>
                                <span className="font-medium">
                                  {modification.type === 'target_change' 
                                    ? formatCurrency(Number(modification.previousValue) || 0)
                                    : modification.previousValue}
                                </span>
                                <span className="text-muted-foreground"> Para: </span>
                                <span className="font-medium">
                                  {modification.type === 'target_change' 
                                    ? formatCurrency(Number(modification.newValue) || 0)
                                    : modification.newValue}
                                </span>
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <History size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma modificação registrada</h3>
                  <p className="text-muted-foreground">
                    O histórico de modificações aparecerá aqui
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Goal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Meta</DialogTitle>
            <DialogDescription>
              Atualize os detalhes da sua meta financeira
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Meta</Label>
                <Input
                  id="name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={editFormData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="Viagem">Viagem</SelectItem>
                    <SelectItem value="Veículo">Veículo</SelectItem>
                    <SelectItem value="Casa">Casa</SelectItem>
                    <SelectItem value="Educação">Educação</SelectItem>
                    <SelectItem value="Economia">Economia</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="targetAmount">Valor da Meta</Label>
                <Input
                  id="targetAmount"
                  name="targetAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.targetAmount}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="targetDate">Data Alvo</Label>
                <Input
                  id="targetDate"
                  name="targetDate"
                  type="date"
                  value={editFormData.targetDate}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="color">Cor</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    value={editFormData.color}
                    onChange={handleEditInputChange}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={editFormData.color}
                    onChange={(e) => handleSelectChange('color', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Add Transaction Dialog */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Transação</DialogTitle>
            <DialogDescription>
              Registre um depósito ou retirada na sua meta
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleTransactionSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo de Transação</Label>
                <Select
                  value={transactionFormData.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Depósito</SelectItem>
                    <SelectItem value="remove">Retirada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="amount">Valor</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={transactionFormData.amount}
                  onChange={handleTransactionInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={transactionFormData.date}
                  onChange={handleTransactionInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={transactionFormData.description}
                  onChange={handleTransactionInputChange}
                  required
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Goal Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Meta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a meta "{goal.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteGoal}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Transaction Dialog */}
      <Dialog open={isDeleteTransactionDialogOpen} onOpenChange={setIsDeleteTransactionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Transação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteTransactionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteTransaction}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

export default GoalDetail;
