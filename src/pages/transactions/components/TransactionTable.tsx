import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Pencil, Trash2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction } from '@/types/finance';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransactionTableProps {
  filteredTransactions: Transaction[];
  paginatedTransactions: Transaction[];
  formatCurrency: (value: number) => string;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
  handleOpenEditDialog: (transaction: Transaction) => void;
  setEditingTransaction: (transaction: Transaction) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  PAGE_SIZES: number[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({
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
  PAGE_SIZES
}) => {
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
  );
};

export default TransactionTable; 