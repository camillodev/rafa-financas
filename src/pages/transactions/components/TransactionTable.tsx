import React, { memo, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Pencil, Trash2, AlertCircle, ArrowUpDown } from 'lucide-react';
import { TransactionValues } from '@/schemas/transactionSchema';
import { SortDirection } from '@/hooks/ui/useSort';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TablePagination from './TablePagination';
import { Badge } from '@/components/ui/badge';

interface TransactionTableProps {
  filteredTransactions: TransactionValues[];
  paginatedTransactions: TransactionValues[];
  formatCurrency: (amount: number) => string;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
  handleOpenEditDialog: (transaction: TransactionValues) => void;
  setEditingTransaction: (transaction: TransactionValues) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  PAGE_SIZES: number[];
  // Sorting props
  sortKey: string | null;
  sortDirection: SortDirection;
  handleSort: (key: string) => void;
}

// Define interface for TransactionRow props
interface TransactionRowProps {
  transaction: TransactionValues;
  formatCurrency: (amount: number) => string;
  handleOpenEditDialog: (transaction: TransactionValues) => void;
  setEditingTransaction: (transaction: TransactionValues) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
}

// Memoize the row component to prevent re-renders
const TransactionRow = memo(({
  transaction,
  formatCurrency, 
  handleOpenEditDialog,
  setEditingTransaction, 
  setIsDeleteDialogOpen
}: TransactionRowProps) => {
  // Memoize handlers to prevent re-renders
  const handleEditClick = useCallback(() => {
    handleOpenEditDialog(transaction);
  }, [handleOpenEditDialog, transaction]);

  const handleDeleteClick = useCallback(() => {
    setEditingTransaction(transaction);
    setIsDeleteDialogOpen(true);
  }, [setEditingTransaction, setIsDeleteDialogOpen, transaction]);

  return (
    <TableRow>
      <TableCell>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${transaction.type === 'income'
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
        <span className={`px-2 py-1 rounded-full text-xs ${transaction.status === 'completed'
          ? 'bg-green-100 text-green-700'
          : 'bg-amber-100 text-amber-700'
          }`}>
          {transaction.status === 'completed' ? 'Concluído' : 'Pendente'}
        </span>
      </TableCell>
      <TableCell
        className={`font-medium ${transaction.type === 'income' ? 'text-finance-income' : 'text-finance-expense'
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
            <DropdownMenuItem onClick={handleEditClick}>
              <Pencil size={16} className="mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDeleteClick}
              className="text-destructive"
            >
              <Trash2 size={16} className="mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

TransactionRow.displayName = 'TransactionRow';

const TransactionTable: React.FC<TransactionTableProps> = memo(({
  filteredTransactions,
  paginatedTransactions,
  formatCurrency,
  handlePageChange,
  handlePageSizeChange,
  handleOpenEditDialog,
  setEditingTransaction,
  setIsDeleteDialogOpen,
  currentPage,
  totalPages,
  pageSize,
  PAGE_SIZES,
  // Sorting props
  sortKey,
  sortDirection,
  handleSort
}) => {
  // Helper function to render sort indicator
  const renderSortableHeader = useCallback((label: string, key: string) => (
    <div
      className="flex items-center cursor-pointer"
      onClick={() => handleSort(key)}
    >
      {label}
      <ArrowUpDown size={16} className="ml-1 text-muted-foreground/70" />
      {sortKey === key && (
        <span className="ml-1 text-xs text-muted-foreground">
          {sortDirection === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </div>
  ), [sortKey, sortDirection, handleSort]);

  if (filteredTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h4 className="text-xl font-medium">Nenhuma transação encontrada</h4>
        <p className="text-sm text-muted-foreground mt-2">
          Não existem transações registradas para o período selecionado
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>{renderSortableHeader('Descrição', 'description')}</TableHead>
              <TableHead>{renderSortableHeader('Data', 'date')}</TableHead>
              <TableHead>{renderSortableHeader('Data Liquidação', 'settlementDate')}</TableHead>
              <TableHead>{renderSortableHeader('Categoria', 'category')}</TableHead>
              <TableHead>{renderSortableHeader('Subcategoria', 'subcategory')}</TableHead>
              <TableHead>{renderSortableHeader('Instituição', 'financialInstitution')}</TableHead>
              <TableHead>{renderSortableHeader('Tipo Transação', 'transactionType')}</TableHead>
              <TableHead>{renderSortableHeader('Status', 'status')}</TableHead>
              <TableHead>{renderSortableHeader('Valor', 'amount')}</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                formatCurrency={formatCurrency}
                handleOpenEditDialog={handleOpenEditDialog}
                setEditingTransaction={setEditingTransaction}
                setIsDeleteDialogOpen={setIsDeleteDialogOpen}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredTransactions.length}
          pageSizeOptions={PAGE_SIZES}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </>
  );
});

TransactionTable.displayName = 'TransactionTable';

export default TransactionTable; 