import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useDate } from './useDate';
import { TransactionFormValues, TransactionValues } from '@/schemas/transactionSchema';

// Mock data - replace with API calls
import { mockTransactions, mockCategories, mockFinancialInstitutions } from '@/mocks/data';

interface UseTransactionReturn {
  // Transaction data
  transactions: TransactionValues[];
  filteredTransactions: TransactionValues[];
  categories: { id: string; name: string; type: 'income' | 'expense' }[];
  financialInstitutions: { id: string; name: string }[];

  // Transaction CRUD operations
  addTransaction: (transaction: TransactionFormValues) => Promise<void>;
  updateTransaction: (id: string, transaction: TransactionFormValues) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Date-related operations
  currentDate: Date;
  navigateToPreviousMonth: () => void;
  navigateToNextMonth: () => void;

  // Utilities
  formatCurrency: (amount: number) => string;
}

/**
 * Hook for managing transactions with CRUD operations
 */
export function useTransaction(): UseTransactionReturn {
  const [transactions, setTransactions] = useState<TransactionValues[]>([]);
  const { currentDate, navigateToPreviousMonth, navigateToNextMonth } = useDate();

  // Fetch transactions for current month
  useEffect(() => {
    const fetchTransactions = () => {
      try {
        // In a real app, replace with API call using the current month
        // For now, use mock data
        setTransactions(mockTransactions);
      } catch (error) {
        toast.error('Failed to fetch transactions');
        console.error(error);
      }
    };

    fetchTransactions();
  }, [currentDate]);

  // Filter transactions for current month
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });

  // Transaction CRUD operations
  const addTransaction = useCallback(async (transaction: TransactionFormValues) => {
    try {
      // In a real app, replace with API call
      const newTransaction: TransactionValues = {
        ...transaction,
        id: `transaction-${Date.now()}`, // Generate temporary ID (would come from backend)
      };

      setTransactions(prev => [...prev, newTransaction]);
      toast.success('Transação adicionada com sucesso');
    } catch (error) {
      toast.error('Falha ao adicionar transação');
      console.error(error);
      throw error;
    }
  }, []);

  const updateTransaction = useCallback(async (id: string, transaction: TransactionFormValues) => {
    try {
      // In a real app, replace with API call
      setTransactions(prev =>
        prev.map(item =>
          item.id === id
            ? { ...transaction, id }
            : item
        )
      );
      toast.success('Transação atualizada com sucesso');
    } catch (error) {
      toast.error('Falha ao atualizar transação');
      console.error(error);
      throw error;
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      // In a real app, replace with API call
      setTransactions(prev => prev.filter(item => item.id !== id));
      toast.success('Transação excluída com sucesso');
    } catch (error) {
      toast.error('Falha ao excluir transação');
      console.error(error);
      throw error;
    }
  }, []);

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  return {
    // Transaction data
    transactions,
    filteredTransactions,
    categories: mockCategories,
    financialInstitutions: mockFinancialInstitutions,

    // Transaction CRUD operations
    addTransaction,
    updateTransaction,
    deleteTransaction,

    // Date-related operations
    currentDate,
    navigateToPreviousMonth,
    navigateToNextMonth,

    // Utilities
    formatCurrency,
  };
} 