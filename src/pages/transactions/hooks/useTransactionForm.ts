import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Transaction, TransactionType } from '@/types/finance';

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
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
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
  handleSubmit: (e: React.FormEvent) => void;
  handleConfirmDelete: () => void;
  setEditingTransaction: (transaction: Transaction | null) => void;
}

export function useTransactionForm(
  actions: TransactionFormActions
): UseTransactionFormReturn {
  const { addTransaction, updateTransaction, deleteTransaction, categories, financialInstitutions } = actions;

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
  };

  const handleConfirmDelete = () => {
    if (editingTransaction) {
      deleteTransaction(editingTransaction.id);
      setIsDeleteDialogOpen(false);
      setEditingTransaction(null);
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
    handleConfirmDelete,
    setEditingTransaction
  };
} 