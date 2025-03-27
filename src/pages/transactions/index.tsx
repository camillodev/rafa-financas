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

import { useTransaction } from '@/hooks/useTransaction';
import { useDataTable } from '@/hooks/ui';
import { TransactionFormValues } from '@/schemas/transactionSchema';
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

  // Use useDataTable for table data management
  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedItems: paginatedTransactions,
    handlePageChange,
    handlePageSizeChange,
    pageSizeOptions,
    sortKey,
    sortDirection,
    handleSort
  } = useDataTable({
    data: filteredTransactions,
    defaultPageSize: DEFAULT_PAGE_SIZE,
    pageSizeOptions: PAGE_SIZES
  });

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
    updateTransaction: (id, data) => updateTransaction(id, data),
    deleteTransaction
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