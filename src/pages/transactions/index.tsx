import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

import { useFinance } from '@/hooks/useFinance';
import { usePagination } from '@/hooks/ui/usePagination';
import {
  useTransactionFilters,
  useTransactionForm,
  useTransactionExport
} from './hooks';
import { getTransactionFilterOptions, getAdvancedFilterFields } from './utils';

import TransactionTable from './components/TransactionTable';
import TransactionFormDialog from './components/TransactionFormDialog';
import TransactionHeader from './components/TransactionHeader';

// Default pagination settings
const PAGE_SIZES = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

export function Transactions() {
  const {
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
  } = useFinance();

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
  } = useTransactionFilters(monthFilteredTransactions);

  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedItems: paginatedTransactions,
    handlePageChange,
    handlePageSizeChange,
    pageSizeOptions
  } = usePagination(filteredTransactions, {
    defaultPageSize: DEFAULT_PAGE_SIZE,
    pageSizeOptions: PAGE_SIZES
  });

  const {
    formData,
    editingTransaction,
    isDialogOpen,
    isDeleteDialogOpen,
    setIsDialogOpen,
    setIsDeleteDialogOpen,
    handleOpenAddDialog,
    handleOpenEditDialog,
    handleInputChange,
    handleSelectChange,
    handleSubmit,
    setEditingTransaction,
    handleConfirmDelete
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

  // Get filter options and field configurations
  const filterOptions = getTransactionFilterOptions();
  const advancedFilterFields = getAdvancedFilterFields(
    advancedFilters,
    categories,
    financialInstitutions
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
        hasActiveFilters={hasActiveFilters()}
        filterOptions={filterOptions}
        advancedFilterFields={advancedFilterFields}
        handleAdvancedFilterChange={handleAdvancedFilterChange}

        // Action props
        onAddTransaction={handleOpenAddDialog}
        onExportTransactions={() => exportTransactions(filteredTransactions)}
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
            PAGE_SIZES={pageSizeOptions}
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

      {/* Confirmation Dialog */}
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