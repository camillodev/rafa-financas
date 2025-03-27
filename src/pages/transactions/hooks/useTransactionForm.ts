import { useState } from 'react';
import { toast } from 'sonner';
import { TransactionFormValues, TransactionValues } from '@/schemas/transactionSchema';

interface UseTransactionFormConfig {
  addTransaction: (transaction: TransactionFormValues) => Promise<void>;
  updateTransaction: (id: string, transaction: TransactionFormValues) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  categories?: Array<{ id: string; name: string; type: 'income' | 'expense' }>;
  financialInstitutions?: Array<{ id: string; name: string }>;
}

interface UseTransactionFormReturn {
  editingTransaction: TransactionValues | null;
  isDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  handleOpenAddDialog: () => void;
  handleOpenEditDialog: (transaction: TransactionValues) => void;
  handleSubmit: (data: TransactionFormValues) => Promise<void>;
  handleDeleteTransaction: () => Promise<void>;
  setEditingTransaction: (transaction: TransactionValues | null) => void;
}

export function useTransactionForm({
  addTransaction,
  updateTransaction,
  deleteTransaction
}: UseTransactionFormConfig): UseTransactionFormReturn {
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionValues | null>(null);

  // Form handlers
  const handleOpenAddDialog = () => {
    setEditingTransaction(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (transaction: TransactionValues) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  // Form submission
  const handleSubmit = async (data: TransactionFormValues) => {
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, data);
        toast.success('Transação atualizada com sucesso');
      } else {
        await addTransaction(data);
        toast.success('Transação adicionada com sucesso');
      }
      setIsDialogOpen(false);
    } catch (error) {
      const actionName = editingTransaction ? 'atualizar' : 'adicionar';
      toast.error(`Erro ao ${actionName} transação`);
      console.error(error);
    }
  };

  // Delete handling
  const handleDeleteTransaction = async () => {
    if (!editingTransaction) return;

    try {
      await deleteTransaction(editingTransaction.id);
      toast.success('Transação excluída com sucesso');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao excluir transação');
      console.error(error);
    }
  };

  return {
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
  };
} 