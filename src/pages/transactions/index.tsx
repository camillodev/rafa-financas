import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Download } from 'lucide-react';
import { toast } from "sonner";

import AppLayout from '@/components/layout/AppLayout';
import MonthFilter from '@/components/ui/MonthFilter';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import Filters from '@/components/ui/Filters';
import AdvancedFiltersBuilder, { FilterField } from '@/components/ui/AdvancedFiltersBuilder';

import { useFinance, TransactionFilterType } from '@/hooks/useFinance';
import { Transaction } from '@/types/finance';

import TransactionTable from './components/TransactionTable';
import TransactionFormDialog from './components/TransactionFormDialog';

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
  const [filter, setFilter] = useState<TransactionFilterType>({});
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
    type: 'expense' as 'income' | 'expense',
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
    const filterParam = searchParams.get('filter');
    if (filterParam && ['income', 'expense', 'all'].includes(filterParam)) {
      setFilter(filterParam as unknown as TransactionFilterType);
    } else {
      setFilter({});
    }
  }, [searchParams]);

  // Apply all filters (type, search, advanced)
  const filteredTransactions = monthFilteredTransactions.filter(transaction => {
    // Type filter
    if (filter.type && transaction.type !== filter.type) {
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
    setFilter({});
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

  const handleSetFilter = (newFilter: string) => {
    if (newFilter === 'all') {
      setSearchParams({});
      setFilter({});
    } else {
      setSearchParams({ filter: newFilter });
      setFilter({ type: newFilter as 'income' | 'expense' });
    }
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
      transactionType: transaction.transactionType as 'Credit Card' | 'Transfer' | 'Debit' | 'Other' || 'Debit',
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

    const selectedCategory = categories.find(c => c.name === formData.category);

    if (!selectedCategory) {
      toast.error("Categoria não encontrada");
      return;
    }

    const transactionData = {
      amount: formData.amount,
      type: formData.type,
      category: formData.category,
      categoryId: selectedCategory.id,
      subcategory: formData.subcategory || undefined,
      date: new Date(formData.date),
      settlementDate: new Date(formData.settlementDate),
      description: formData.description,
      paymentMethod: formData.paymentMethod,
      financialInstitution: formData.financialInstitution,
      transactionType: formData.transactionType,
      status: formData.status
    };

    if (editingTransaction) {
      updateTransaction({
        id: editingTransaction.id,
        ...transactionData
      });
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

  const exportTransactions = () => {
    // Get filtered transactions based on current filters
    const dataToExport = filteredTransactions;

    // Create CSV content
    let csvContent = 'Data,Data de Liquidação,Categoria,Subcategoria,Instituição,Tipo de Transação,Descrição,Valor,Status,Tipo\n';

    dataToExport.forEach(transaction => {
      const row = [
        transaction.date,
        transaction.settlementDate || '',
        transaction.category,
        transaction.subcategory || '',
        transaction.financialInstitution || '',
        transaction.transactionType || '',
        transaction.description,
        transaction.amount,
        transaction.status,
        transaction.type
      ].map(value => {
        // Ensure strings are properly escaped for CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');

      csvContent += row + '\n';
    });

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rafa-financas-transacoes-${format(currentDate, 'MMM-yyyy', { locale: ptBR })}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Transações exportadas com sucesso");
  };

  // Replace the existing TransactionFilters with the new reusable Filters
  const filterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'income', label: 'Receitas', color: 'bg-finance-income text-white' },
    { value: 'expense', label: 'Despesas', color: 'bg-finance-expense text-white' }
  ];

  // Check if there are active filters
  const hasActiveFilters = () => {
    return Boolean(filter.type) ||
      Boolean(searchTerm) ||
      Object.values(advancedFilters).some(value =>
        typeof value === 'string' ? Boolean(value) : Object.values(value).some(v => Boolean(v))
      );
  };

  // Create fields for advanced filters
  const advancedFilterFields: FilterField[] = [
    {
      type: 'dateRange',
      name: 'dateRange',
      label: 'Data',
      value: advancedFilters.dateRange
    },
    {
      type: 'select',
      name: 'category',
      label: 'Categoria',
      value: advancedFilters.category,
      options: [
        { value: 'all', label: 'Todas as categorias' },
        ...categories.map(category => ({ value: category.name, label: category.name }))
      ]
    },
    {
      type: 'input',
      name: 'subcategory',
      label: 'Subcategoria',
      value: advancedFilters.subcategory,
      placeholder: 'Filtrar por subcategoria'
    },
    {
      type: 'select',
      name: 'institution',
      label: 'Instituição Financeira',
      value: advancedFilters.institution,
      options: [
        { value: 'all', label: 'Todas as instituições' },
        ...financialInstitutions.map(institution => ({ value: institution.name, label: institution.name }))
      ]
    },
    {
      type: 'select',
      name: 'transactionType',
      label: 'Tipo de Transação',
      value: advancedFilters.transactionType,
      options: [
        { value: 'all', label: 'Todos os tipos' },
        { value: 'Credit Card', label: 'Cartão de Crédito' },
        { value: 'Transfer', label: 'Transferência' },
        { value: 'Debit', label: 'Débito' },
        { value: 'Other', label: 'Outro' }
      ]
    },
    {
      type: 'select',
      name: 'paymentMethod',
      label: 'Método de Pagamento',
      value: advancedFilters.paymentMethod,
      options: [
        { value: 'all', label: 'Todos os métodos' },
        { value: 'Débito', label: 'Débito' },
        { value: 'Crédito', label: 'Cartão de Crédito' },
        { value: 'Transferência', label: 'Transferência' },
        { value: 'Dinheiro', label: 'Dinheiro' },
        { value: 'Outros', label: 'Outros' }
      ]
    },
    {
      type: 'select',
      name: 'status',
      label: 'Status',
      value: advancedFilters.status,
      options: [
        { value: 'all', label: 'Todos os status' },
        { value: 'completed', label: 'Concluído' },
        { value: 'pending', label: 'Pendente' }
      ]
    },
    {
      type: 'numberRange',
      name: 'amountRange',
      label: 'Valor',
      value: advancedFilters.amountRange,
      placeholder: 'R$ 0,00',
      min: 0,
      step: 0.01
    }
  ];

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
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <Filters
          filter={filter.type || 'all'}
          searchTerm={searchTerm}
          isAdvancedFilterOpen={isFilterPopoverOpen}
          setIsAdvancedFilterOpen={setIsFilterPopoverOpen}
          setSearchTerm={setSearchTerm}
          handleSetFilter={handleSetFilter}
          handleClearFilter={handleClearFilter}
          hasActiveFilters={hasActiveFilters()}
          searchPlaceholder="Buscar transações..."
          filterOptions={filterOptions}
          advancedFiltersContent={
            <AdvancedFiltersBuilder
              fields={advancedFilterFields}
              onChange={handleAdvancedFilterChange}
              onClear={handleClearFilter}
              onClose={() => setIsFilterPopoverOpen(false)}
            />
          }
        />

        {/* Add Transaction Button */}
        <div className="flex gap-2">
          <Button onClick={handleOpenAddDialog} className="gap-1">
            <Plus size={16} />
            <span>Nova Transação</span>
          </Button>

          {/* Export Button */}
          <Button variant="outline" size="icon" onClick={exportTransactions}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
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
          <TransactionTable
            filteredTransactions={filteredTransactions}
            paginatedTransactions={paginatedTransactions}
            formatCurrency={formatCurrency}
            handlePageChange={handlePageChange}
            handlePageSizeChange={handlePageSizeChange}
            handleOpenEditDialog={handleOpenEditDialog}
            setEditingTransaction={setEditingTransaction}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            PAGE_SIZES={PAGE_SIZES}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Transaction Dialog */}
      <TransactionFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingTransaction={editingTransaction}
        formData={formData}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onSubmit={handleSubmit}
      />

      {/* Replace with reusable ConfirmationDialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        confirmVariant="destructive"
      />
    </AppLayout>
  );
}

export default Transactions; 