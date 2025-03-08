
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance, TransactionFilterType } from '@/context/FinanceContext';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Filter, X, AlertCircle, Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MonthFilter from '@/components/ui/MonthFilter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Transaction, TransactionType } from '@/types/finance';

export function Transactions() {
  const { 
    transactions, 
    filteredTransactions, 
    formatCurrency, 
    currentDate, 
    navigateToPreviousMonth, 
    navigateToNextMonth,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    categories
  } = useFinance();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<TransactionFilterType>('all');
  const [periodFilterActive, setPeriodFilterActive] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    amount: 0,
    type: 'expense' as TransactionType,
    category: '',
    subcategory: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    settlementDate: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    paymentMethod: 'Débito',
    financialInstitution: 'Banco do Brasil',
    status: 'completed' as 'completed' | 'pending'
  });
  
  useEffect(() => {
    const filterParam = searchParams.get('filter') as TransactionFilterType | null;
    if (filterParam && ['income', 'expense'].includes(filterParam)) {
      setFilter(filterParam);
    } else {
      setFilter('all');
    }
  }, [searchParams]);
  
  // Apply type filter
  const typeFilteredTransactions = filteredTransactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });
  
  const handleClearFilter = () => {
    setSearchParams({});
    setFilter('all');
  };
  
  const handleSetFilter = (newFilter: TransactionFilterType) => {
    if (newFilter === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ filter: newFilter });
    }
    setFilter(newFilter);
  };

  const handleOpenEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      subcategory: transaction.subcategory || '',
      date: format(new Date(transaction.date), 'yyyy-MM-dd'),
      settlementDate: format(new Date(transaction.date), 'yyyy-MM-dd'), // Assuming settlement date is the same as transaction date in mock data
      description: transaction.description,
      paymentMethod: transaction.paymentMethod || 'Débito',
      financialInstitution: 'Banco do Brasil', // Default value
      status: transaction.status
    });
    setIsDialogOpen(true);
  };

  const handleOpenAddDialog = () => {
    setEditingTransaction(null);
    setFormData({
      amount: 0,
      type: 'expense',
      category: categories[0]?.name || '',
      subcategory: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      settlementDate: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      paymentMethod: 'Débito',
      financialInstitution: 'Banco do Brasil',
      status: 'completed'
    });
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transactionData = {
      amount: formData.amount,
      type: formData.type as TransactionType,
      category: formData.category,
      subcategory: formData.subcategory || undefined,
      date: new Date(formData.date),
      description: formData.description,
      paymentMethod: formData.paymentMethod,
      status: formData.status as 'completed' | 'pending'
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }

    setIsDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (editingTransaction) {
      deleteTransaction(editingTransaction.id);
      setIsDeleteDialogOpen(false);
      setEditingTransaction(null);
    }
  };
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
        <p className="text-muted-foreground mt-1">
          Visualize e gerencie todas as suas transações
        </p>
      </div>

      {/* Month Filter */}
      <MonthFilter 
        currentDate={currentDate}
        onPreviousMonth={navigateToPreviousMonth}
        onNextMonth={navigateToNextMonth}
        periodFilterActive={periodFilterActive}
      />
      
      {/* Filter Bar */}
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="bg-accent p-2 rounded-lg flex items-center">
            <Filter size={16} className="mr-2 text-muted-foreground" />
            <span className="text-sm font-medium mr-2">Filtrar por:</span>
            
            <div className="flex gap-1">
              <button 
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-background'
                }`}
                onClick={() => handleSetFilter('all')}
              >
                Todos
              </button>
              <button 
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  filter === 'income' ? 'bg-finance-income text-white' : 'bg-background'
                }`}
                onClick={() => handleSetFilter('income')}
              >
                Receitas
              </button>
              <button 
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  filter === 'expense' ? 'bg-finance-expense text-white' : 'bg-background'
                }`}
                onClick={() => handleSetFilter('expense')}
              >
                Despesas
              </button>
            </div>
          </div>
          
          {filter !== 'all' && (
            <button 
              className="flex items-center gap-1 text-xs bg-background px-3 py-1 rounded-md border"
              onClick={handleClearFilter}
            >
              <span>Limpar filtro</span>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Add Transaction Button */}
        <Button onClick={handleOpenAddDialog} className="gap-1">
          <Plus size={16} />
          <span>Nova Transação</span>
        </Button>
      </div>
      
      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Transações</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as suas movimentações financeiras
          </CardDescription>
        </CardHeader>
        <CardContent>
          {typeFilteredTransactions.length > 0 ? (
            <div className="space-y-4">
              {typeFilteredTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' 
                          ? 'bg-finance-income/10 text-finance-income' 
                          : 'bg-finance-expense/10 text-finance-expense'
                      }`}
                    >
                      {transaction.type === 'income' ? (
                        <ArrowUpRight size={18} />
                      ) : (
                        <ArrowDownRight size={18} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })} • {transaction.category}
                        {transaction.subcategory && ` > ${transaction.subcategory}`} • 
                        {transaction.status === 'completed' ? ' Concluído' : ' Pendente'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className={`font-medium ${
                        transaction.type === 'income' ? 'text-finance-income' : 'text-finance-expense'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded-full hover:bg-accent">
                          <MoreHorizontal size={16} className="text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEditDialog(transaction)}>
                          <Pencil size={16} className="mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setEditingTransaction(transaction);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h4 className="text-xl font-medium">Nenhuma transação encontrada</h4>
              <p className="text-sm text-muted-foreground mt-2">
                {filter !== 'all' 
                  ? `Não existem transações do tipo ${filter === 'income' ? 'receita' : 'despesa'} para o período selecionado`
                  : 'Não existem transações registradas para o período selecionado'}
              </p>
              {filter !== 'all' && (
                <button 
                  className="mt-4 px-4 py-2 bg-accent rounded-lg text-sm font-medium"
                  onClick={handleClearFilter}
                >
                  Limpar filtro
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Transaction Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTransaction ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
            <DialogDescription>
              {editingTransaction 
                ? 'Edite os detalhes da transação abaixo.'
                : 'Preencha os detalhes da nova transação abaixo.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Tipo
                </Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="income">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descrição
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Valor
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Categoria
                </Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter(cat => cat.type === formData.type)
                      .map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subcategory" className="text-right">
                  Subcategoria
                </Label>
                <Input
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Data
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="settlementDate" className="text-right">
                  Data de Liquidação
                </Label>
                <Input
                  id="settlementDate"
                  name="settlementDate"
                  type="date"
                  value={formData.settlementDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="financialInstitution" className="text-right">
                  Instituição
                </Label>
                <Select 
                  value={formData.financialInstitution} 
                  onValueChange={(value) => handleSelectChange('financialInstitution', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Banco do Brasil">Banco do Brasil</SelectItem>
                    <SelectItem value="Nubank">Nubank</SelectItem>
                    <SelectItem value="Itaú">Itaú</SelectItem>
                    <SelectItem value="Bradesco">Bradesco</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paymentMethod" className="text-right">
                  Método de Pagamento
                </Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => handleSelectChange('paymentMethod', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Débito">Débito</SelectItem>
                    <SelectItem value="Crédito">Cartão de Crédito</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange('status', value as 'completed' | 'pending')}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingTransaction ? 'Salvar Alterações' : 'Adicionar Transação'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

export default Transactions;
