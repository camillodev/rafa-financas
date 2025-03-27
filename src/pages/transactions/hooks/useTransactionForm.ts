import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Transaction, TransactionType } from '@/types/finance';
import { TransactionFormValues } from '@/schemas/transactionSchema';

type TransactionFormType = {
  amount: number;
  type: TransactionType;
  category: string;
  subcategory: string;
  date: string;
  settlementDate: string;
  description: string;
  paymentMethod: string;
  financialInstitution: string;
  transactionType: 'Credit Card' | 'Transfer' | 'Debit' | 'Other';
  status: 'completed' | 'pending';
};

interface TransactionFormActions {
  addTransaction: (transaction: TransactionFormValues) => Promise<void>;
  updateTransaction: (id: string, transaction: TransactionFormValues) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  categories: Array<{ id: string; name: string; type: TransactionType }>;
  financialInstitutions: Array<{ id: string; name: string }>;
}

interface UseTransactionFormReturn {
  formData: TransactionFormType;
  editingTransaction: Transaction | null;
  isDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  handleOpenAddDialog: () => void;
  handleOpenEditDialog: (transaction: Transaction) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSubmit: (data: TransactionFormValues) => Promise<void>;
  handleDeleteTransaction: () => Promise<void>;
  setEditingTransaction: (transaction: Transaction | null) => void;
}

export function useTransactionForm({
  addTransaction,
  updateTransaction,
  deleteTransaction,
  categories,
  financialInstitutions
}: TransactionFormActions): UseTransactionFormReturn {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Form state
  const [formData, setFormData] = useState<TransactionFormType>({
    amount: 0,
    type: 'expense',
    category: '',
    subcategory: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    settlementDate: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    paymentMethod: 'Débito',
    financialInstitution: 'Banco do Brasil',
    transactionType: 'Debit',
    status: 'completed'
  });

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

  const handleOpenEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      subcategory: transaction.subcategory || '',
      date: format(new Date(transaction.date), 'yyyy-MM-dd'),
      settlementDate: transaction.settlementDate
        ? format(new Date(transaction.settlementDate), 'yyyy-MM-dd')
        : format(new Date(transaction.date), 'yyyy-MM-dd'),
      description: transaction.description,
      paymentMethod: transaction.paymentMethod || 'Débito',
      financialInstitution: transaction.financialInstitution || 'Banco do Brasil',
      transactionType: transaction.transactionType as 'Credit Card' | 'Transfer' | 'Debit' | 'Other' || 'Debit',
      status: transaction.status
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
    handleDeleteTransaction,
    setEditingTransaction
  };
} 