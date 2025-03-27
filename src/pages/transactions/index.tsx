import React, { useCallback, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

import { useTransaction } from '@/hooks/useTransaction';
import { useDataTable } from '@/hooks/ui';
import {
  useTransactionFilters,
  useTransactionForm,
  useTransactionExport
} from './hooks';
import { getTransactionFilterOptions, getAdvancedFilterFields } from './utils';
import { TransactionValues } from '@/schemas/transactionSchema';

import TransactionTable from './components/TransactionTable';
import TransactionFormDialog from './components/TransactionFormDialog';
import TransactionHeader from './components/TransactionHeader';

// Default pagination settings
const PAGE_SIZES = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

export function Transactions() {
  // Use the transaction hook for data and operations
  const {
    transactions,
    filteredTransactions: monthTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    categories,
    financialInstitutions,
    formatCurrency,
    currentDate,
    navigateToPreviousMonth,
    navigateToNextMonth,
  } = useTransaction();

  // Custom hooks for transactions page
  const {
    filter,
    searchTerm,
    isFilterPopoverOpen,
    advancedFilters,
    filteredTransactions,
    setSearchTerm,
    setIsFilterPopoverOpen,
    handleSetFilter,
    handleClearFilter,
    handleAdvancedFilterChange,
    hasActiveFilters
  } = useTransactionFilters(monthTransactions);

  // Calculate if filters are active
  const isAnyFilterActive = hasActiveFilters();

  // Memoize the filtered transactions to prevent re-renders
  const memoizedFilteredTransactions = useMemo(() => filteredTransactions, [filteredTransactions]);

  // State variables for sorting and pagination
  const [sortKey, setSortKey] = useState<keyof TransactionValues | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const totalPages = useMemo(() => Math.ceil(memoizedFilteredTransactions.length / pageSize), [memoizedFilteredTransactions.length, pageSize]);
  const pageSizeOptions = useMemo(() => PAGE_SIZES, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const handleSort = useCallback((key: keyof TransactionValues) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  }, [sortKey]);

  // Form handling
  const {
    editingTransaction,
    isDialogOpen,
    isDeleteDialogOpen,
    setIsDialogOpen,
    setIsDeleteDialogOpen,
    handleOpenAddDialog,
    handleOpenEditDialog,
    handleSubmit,
    handleDeleteTransaction,
    setEditingTransaction
  } = useTransactionForm({
    addTransaction,
    updateTransaction,
    deleteTransaction,
    categories,
    financialInstitutions
  });

  const { exportTransactions } = useTransactionExport({
    currentDate
  });

  // Memoize the export callback
  const handleExportTransactions = useCallback(() => {
    exportTransactions(filteredTransactions);
  }, [exportTransactions, filteredTransactions]);

  // Memoize the onClose callback for AdvancedFiltersBuilder
  const handleCloseAdvancedFilters = useCallback(() => {
    setIsFilterPopoverOpen(false);
  }, [setIsFilterPopoverOpen]);

  // Get filter options and field configurations
  const filterOptions = getTransactionFilterOptions();
  const advancedFilterFields = useMemo(() =>
    getAdvancedFilterFields(advancedFilters, categories, financialInstitutions),
    [advancedFilters, categories, financialInstitutions]
  );

  return (
    <AppLayout>
      <TransactionHeader
        // Date navigation props
        currentDate={currentDate}
        onPreviousMonth={navigateToPreviousMonth}
        onNextMonth={navigateToNextMonth}

        // Filter props
        filterValue={filter.type || 'all'}
        searchTerm={searchTerm}
        isAdvancedFilterOpen={isFilterPopoverOpen}
        setIsAdvancedFilterOpen={setIsFilterPopoverOpen}
        setSearchTerm={setSearchTerm}
        handleSetFilter={handleSetFilter}
        handleClearFilter={handleClearFilter}
        hasActiveFilters={isAnyFilterActive}
        filterOptions={filterOptions}
        advancedFilterFields={advancedFilterFields}
        handleAdvancedFilterChange={handleAdvancedFilterChange}

        // Action props
        onAddTransaction={handleOpenAddDialog}
        onExportTransactions={handleExportTransactions}
      />

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
            paginatedTransactions={filteredTransactions}
            formatCurrency={formatCurrency}
            handlePageChange={handlePageChange}
            handlePageSizeChange={handlePageSizeChange}
            handleOpenEditDialog={handleOpenEditDialog}
            setEditingTransaction={setEditingTransaction}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            PAGE_SIZES={pageSizeOptions}
            sortKey={sortKey}
            sortDirection={sortDirection}
            handleSort={handleSort}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Transaction Dialog */}
      <TransactionFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingTransaction={editingTransaction}
        onSubmit={handleSubmit}
        categories={categories}
        financialInstitutions={financialInstitutions}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteTransaction}
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