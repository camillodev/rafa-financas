
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { 
  transactions as initialTransactions, 
  categories as initialCategories, 
  budgetGoals as initialBudgetGoals,
  financialSummary as initialFinancialSummary,
  monthlyData as initialMonthlyData,
  expenseBreakdown as initialExpenseBreakdown
} from '../data/mockData';
import { Transaction, Category, BudgetGoal, FinancialSummary } from '../types/finance';
import { useNavigate } from 'react-router-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { toast } from "sonner";

export type TransactionFilterType = 'all' | 'income' | 'expense';

interface FinanceContextType {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  categories: Category[];
  budgetGoals: BudgetGoal[];
  financialSummary: FinancialSummary;
  monthlyData: Array<{ month: string; income: number; expenses: number }>;
  expenseBreakdown: Array<{ category: string; value: number; color: string }>;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  navigateToPreviousMonth: () => void;
  navigateToNextMonth: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  formatCurrency: (value: number) => string;
  navigateToTransactions: (filter?: TransactionFilterType) => void;
  hasDataForCurrentMonth: boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [categories] = useState<Category[]>(initialCategories);
  const [budgetGoals] = useState<BudgetGoal[]>(initialBudgetGoals);
  const [financialSummary] = useState<FinancialSummary>(initialFinancialSummary);
  const [monthlyData] = useState(initialMonthlyData);
  const [expenseBreakdown] = useState(initialExpenseBreakdown);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const navigate = useNavigate();

  // Get filtered transactions for the selected month
  const filteredTransactions = useMemo(() => {
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }, [transactions, currentDate]);

  // Check if there's data for the current month
  const hasDataForCurrentMonth = useMemo(() => {
    return filteredTransactions.length > 0;
  }, [filteredTransactions]);

  // Month navigation functions
  const navigateToPreviousMonth = useCallback(() => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  }, []);

  const navigateToNextMonth = useCallback(() => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  }, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: `t${transactions.length + 1}`,
    };
    setTransactions(prev => [...prev, newTransaction]);
    toast.success('Transação adicionada com sucesso');
  }, [transactions]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.success('Transação excluída com sucesso');
  }, []);

  const updateTransaction = useCallback((id: string, transaction: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(t => (t.id === id ? { ...t, ...transaction } : t))
    );
    toast.success('Transação atualizada com sucesso');
  }, []);

  // Format currency to Brazilian Real format
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const navigateToTransactions = (filter: TransactionFilterType = 'all') => {
    // Navigate to transactions page with filter
    navigate(`/transactions${filter !== 'all' ? `?filter=${filter}` : ''}`);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        filteredTransactions,
        categories,
        budgetGoals,
        financialSummary,
        monthlyData,
        expenseBreakdown,
        currentDate,
        setCurrentDate,
        navigateToPreviousMonth,
        navigateToNextMonth,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        formatCurrency,
        navigateToTransactions,
        hasDataForCurrentMonth,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
