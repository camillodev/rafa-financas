import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance, TransactionFilterType } from '@/context/FinanceContext';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreHorizontal, 
  Filter, 
  X, 
  AlertCircle, 
  Plus, 
  Pencil, 
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction, TransactionType } from '@/types/finance';

// Pagination constants
const PAGE_SIZES = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

export function Transactions() {
  const { 
    transactions, 
    filteredTransactions: monthFilteredTransactions, 
    formatCurrency, 
    currentDate, 
    navigateToPreviousMonth, 
    navigateToNextMonth,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    categories,
    financialInstitutions,
    creditCards
  } = useFinance();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<TransactionFilterType>('all');
  const [periodFilterActive, setPeriodFilterActive] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Advanced filters
  const [advancedFilters, setAdvancedFilters] = useState({
    dateRange: {
      start: '',
      end: '',
    },
    category: '',
    subcategory: '',
    institution: '',
    transactionType: '',
    paymentMethod: '',
    status: '',
    amountRange: {
      min: '',
      max: '',
    },
  });

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
    transactionType: 'Debit' as 'Credit Card' | 'Transfer' | 'Debit' | 'Other',
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
  
  // Apply all filters (type, search, advanced)
  const filteredTransactions = monthFilteredTransactions.filter(transaction => {
    // Type filter
    if (filter !== 'all' && transaction.type !== filter) {
      return false;
    }
    
    // Search filter
    if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Advanced filters
    if (advancedFilters.dateRange.start && new Date(transaction.date) < new Date(advancedFilters.dateRange.start)) {
      return false;
    }
    
    if (advancedFilters.dateRange.end && new Date(transaction.date) > new Date(advancedFilters.dateRange.end)) {
      return false;
    }
    
    if (advancedFilters.category && transaction.category !== advancedFilters.category) {
      return false;
    }
    
    if (advancedFilters.subcategory && transaction.subcategory !== advancedFilters.subcategory) {
      return false;
    }
    
    if (advancedFilters.institution && transaction.financialInstitution !== advancedFilters.institution) {
      return false;
    }
    
    if (advancedFilters.transactionType && transaction.transactionType !== advancedFilters.transactionType) {
      return false;
    }
    
    if (advancedFilters.paymentMethod && transaction.paymentMethod !== advancedFilters.paymentMethod) {
      return false;
    }
    
    if (advancedFilters.status && transaction.status !== advancedFilters.status) {
      return false;
    }
    
    if (advancedFilters.amountRange.min && transaction.amount < Number(advancedFilters.amountRange.min)) {
      return false;
    }
    
    if (advancedFilters.amountRange.max && transaction.amount > Number(advancedFilters.amountRange.max)) {
      return false;
    }
    
    return true;
  });
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  const handleClearFilter = () => {
    setSearchParams({});
    setFilter('all');
    setSearchTerm('');
    setAdvancedFilters({
      dateRange: { start: '', end: '' },
      category: '',
      subcategory: '',
      institution: '',
      transactionType: '',
      paymentMethod: '',
      status: '',
      amountRange: { min: '', max: '' },
    });
  };
  
  const handleSetFilter = (newFilter: TransactionFilterType) => {
    if (newFilter === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ filter: newFilter });
    }
    setFilter(newFilter);
  };

  const handleAdvancedFilterChange = (field: string, value: string) => {
    setAdvancedFilters(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        const result = { ...prev };
        
        if (parent === 'dateRange') {
          result.dateRange = {
            ...prev.dateRange,
            [child]: value
          };
        } else if (parent === 'amountRange') {
          result.amountRange = {
            ...prev.amountRange,
            [child]: value
          };
        }
        
        return result;
      }
      return { ...prev, [field]: value };
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleOpenEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      subcategory: transaction.subcategory || '',
      date: format(new Date(transaction.date), 'yyyy-MM-dd'),
      settlementDate: transaction.settlementDate ? format(new Date(transaction.settlementDate), 'yyyy-MM-dd') : format(new Date(transaction.date), 'yyyy-MM-dd'),
      description: transaction.description,
      paymentMethod: transaction.paymentMethod || 'Débito',
      financialInstitution: transaction.financialInstitution || 'Banco do Brasil',
      transactionType: transaction.transactionType || 'Debit',
      status: transaction.status
    });
    setIsDialogOpen(true);
  };

  const handleOpenAddDialog = () => {
    setEditingTransaction(null);
    setFormData({
      amount: 0,
      type: 'expense',
      category: categories.find(c => c.type === 'expense')?.name || '',
      subcategory: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      settlementDate: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      paymentMethod: 'Débito',
      financialInstitution: financialInstitutions[0]?.name || 'Banco do Brasil',
      transactionType: 'Debit',
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
      settlementDate: new Date(formData.settlementDate),
      description: formData.description,
      paymentMethod: formData.paymentMethod,
      financialInstitution: formData.financialInstitution,
      transactionType: formData.transactionType,
      status: formData.status as 'completed' | 'pending'
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }

    setIsDialogOpen(false);
    // Reset to first page to show the new/updated transaction
    setCurrentPage(1);
  };

  const handleConfirmDelete = () => {
    if (editingTransaction) {
      deleteTransaction(editingTransaction.id);
      setIsDeleteDialogOpen(false);
      setEditingTransaction(null);
    }
  };

  // Helper function to render pagination
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border disabled:opacity-50"
      >
        <ChevronLeft size={16} />
      </button>
    );
    
    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
          className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-primary text-primary-foreground' : 'border'}`}
        >
          1
        </button>
      );
      
      // Ellipsis if needed
      if (startPage > 2) {
        pages.push(<span key="ellipsis1">...</span>);
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded ${currentPage === i ? 'bg-primary text-primary-foreground' : 'border'}`}
        >
          {i}
        </button>
      );
    }
    
    // Last page
    if (endPage < totalPages) {
      // Ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2">...</span>);
      }
      
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-primary text-primary-foreground' : 'border'}`}
        >
          {totalPages}
        </button>
      );
    }
    
    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || totalPages === 0}
        className="px-3 py-1 rounded border disabled:opacity-50"
      >
        <ChevronRight size={16} />
      </button>
    );
    
    return pages;
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
      
      {/* Search & Filter Bar */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
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
          
          {/* Search Input */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar transações..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                onClick={() => setSearchTerm('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
          
          {/* Advanced Filter Button */}
          <Popover open={isFilterPopoverOpen} onOpenChange={setIsFilterPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <SlidersHorizontal size={16} />
                <span>Filtros Avançados</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-4">
              <h4 className="font-medium mb-4">Filtros Avançados</h4>
              
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="date-start">Data Inicial</Label>
                    <Input
                      id="date-start"
                      type="date"
                      value={advancedFilters.dateRange.start}
                      onChange={e => handleAdvancedFilterChange('dateRange.start', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="date-end">Data Final</Label>
                    <Input
                      id="date-end"
                      type="date"
                      value={advancedFilters.dateRange.end}
                      onChange={e => handleAdvancedFilterChange('dateRange.end', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="filter-category">Categoria</Label>
                  <Select 
                    value={advancedFilters.category} 
                    onValueChange={value => handleAdvancedFilterChange('category', value)}
                  >
                    <SelectTrigger id="filter-category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="filter-subcategory">Subcategoria</Label>
                  <Input
                    id="filter-subcategory"
                    placeholder="Filtrar por subcategoria"
                    value={advancedFilters.subcategory}
                    onChange={e => handleAdvancedFilterChange('subcategory', e.target.value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="filter-institution">Instituição Financeira</Label>
                  <Select 
                    value={advancedFilters.institution}
                    onValueChange={value => handleAdvancedFilterChange('institution', value)}
                  >
                    <SelectTrigger id="filter-institution">
                      <SelectValue placeholder="Selecione uma instituição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as instituições</SelectItem>
                      {financialInstitutions.map(institution => (
                        <SelectItem key={institution.id} value={institution.name}>
                          {institution.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="filter-transaction-type">Tipo de Transação</Label>
                  <Select 
                    value={advancedFilters.transactionType}
                    onValueChange={value => handleAdvancedFilterChange('transactionType', value)}
                  >
                    <SelectTrigger id="filter-transaction-type">
                      <SelectValue placeholder="Selecione um tipo de transação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="Credit Card">Cartão de Crédito</SelectItem>
                      <SelectItem value="Transfer">Transferência</SelectItem>
                      <SelectItem value="Debit">Débito</SelectItem>
                      <SelectItem value="Other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="filter-payment-method">Método de Pagamento</Label>
                  <Select 
                    value={advancedFilters.paymentMethod}
                    onValueChange={value => handleAdvancedFilterChange('paymentMethod', value)}
                  >
                    <SelectTrigger id="filter-payment-method">
                      <SelectValue placeholder="Selecione um método de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os métodos</SelectItem>
                      <SelectItem value="Débito">Débito</SelectItem>
                      <SelectItem value="Crédito">Cartão de Crédito</SelectItem>
                      <SelectItem value="Transferência">Transferência</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="filter-status">Status</Label>
                  <Select 
                    value={advancedFilters.status}
                    onValueChange={value => handleAdvancedFilterChange('status', value)}
                  >
                    <SelectTrigger id="filter-status">
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="amount-min">Valor Mínimo</Label>
                    <Input
                      id="amount-min"
                      type="number"
                      placeholder="R$ 0,00"
                      min="0"
                      step="0.01"
                      value={advancedFilters.amountRange.min}
                      onChange={e => handleAdvancedFilterChange('amountRange.min', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="amount-max">Valor Máximo</Label>
                    <Input
                      id="amount-max"
                      type="number"
                      placeholder="R$ 999999,99"
                      min="0"
                      step="0.01"
                      value={advancedFilters.amountRange.max}
                      onChange={e => handleAdvancedFilterChange('amountRange.max', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearFilter}
                  >
                    Limpar Filtros
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => setIsFilterPopoverOpen(false)}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Clear Filters Button */}
          {(filter !== 'all' || searchTerm || Object.values(advancedFilters).some(value => 
            typeof value === 'string' ? value : Object.values(value).some(v => v)
          )) && (
            <button 
              className="flex items-center gap-1 text-xs bg-background px-3 py-1 rounded-md border"
              onClick={handleClearFilter}
            >
              <span>Limpar filtros</span>
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
      
      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Transações</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as suas movimentações financeiras
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Data Liquidação</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Subcategoria</TableHead>
                      <TableHead>Instituição</TableHead>
                      <TableHead>Tipo Transação</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              transaction.type === 'income' 
                                ? 'bg-finance-income/10 text-finance-income' 
                                : 'bg-finance-expense/10 text-finance-expense'
                            }`}
                          >
                            {transaction.type === 'income' ? (
                              <ArrowUpRight size={16} />
                            ) : (
                              <ArrowDownRight size={16} />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{transaction.description}</TableCell>
                        <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                        <TableCell>
                          {transaction.settlementDate 
                            ? format(new Date(transaction.settlementDate), 'dd/MM/yyyy', { locale: ptBR })
                            : '-'}
                        </TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>{transaction.subcategory || '-'}</TableCell>
                        <TableCell>{transaction.financialInstitution || '-'}</TableCell>
                        <TableCell>{transaction.transactionType || '-'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {transaction.status === 'completed' ? 'Concluído' : 'Pendente'}
                          </span>
                        </TableCell>
                        <TableCell 
                          className={`font-medium ${
                            transaction.type === 'income' ? 'text-finance-income' : 'text-finance-expense'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-right">
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination Controls */}
              <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Mostrando {paginatedTransactions.length} de {filteredTransactions.length} resultados
                  </span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => handlePageSizeChange(Number(value))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZES.map(size => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} itens
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  {renderPagination()}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h4 className="text-xl font-medium">Nenhuma transação encontrada</h4>
              <p className="text-sm text-muted-foreground mt-2">
                {filter !== 'all' 
                  ? `Não existem transações do tipo ${filter === 'income' ? 'receita' : 'despesa'} para o período selecionado`
                  : 'Não existem transações registradas para o período selecionado'}
              </p>
              {(filter !== 'all' || searchTerm || Object.values(advancedFilters).some(value => 
                typeof value === 'string' ? value : Object.values(value).some(v => v)
              )) && (
                <button 
                  className="mt-4 px-4 py-2 bg-accent rounded-lg text-sm font-medium"
                  onClick={handleClearFilter}
                >
                  Limpar filtros
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
                    {financialInstitutions.map(institution => (
                      <SelectItem key={institution.id} value={institution.name}>
                        {institution.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transactionType" className="text-right">
                  Tipo de Transação
                </Label>
                <Select 
                  value={formData.transactionType} 
                  onValueChange={(value) => handleSelectChange('transactionType', value as 'Credit Card' | 'Transfer' | 'Debit' | 'Other')}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit Card">Cartão de Crédito</SelectItem>
                    <SelectItem value="Transfer">Transferência</SelectItem>
                    <SelectItem value="Debit">Débito</SelectItem>
                    <SelectItem value="Other">Outro</SelectItem>
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
