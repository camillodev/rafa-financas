
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
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

export type TransactionFilterType = 'all' | 'income' | 'expense';

interface FinanceContextType {
  transactions: Transaction[];
  currentMonthTransactions: Transaction[];
  categories: Category[];
  budgetGoals: BudgetGoal[];
  financialSummary: FinancialSummary;
  monthlyData: Array<{ month: string; income: number; expenses: number }>;
  expenseBreakdown: Array<{ category: string; value: number; color: string }>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  formatCurrency: (value: number) => string;
  navigateToTransactions: (filter?: TransactionFilterType) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [categories] = useState<Category[]>(initialCategories);
  const [budgetGoals] = useState<BudgetGoal[]>(initialBudgetGoals);
  const [financialSummary] = useState<FinancialSummary>(initialFinancialSummary);
  const [monthlyData] = useState(initialMonthlyData);
  const [expenseBreakdown] = useState(initialExpenseBreakdown);
  const navigate = useNavigate();

  // Get current month transactions
  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: `t${transactions.length + 1}`,
    };
    setTransactions([...transactions, newTransaction]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
    setTransactions(
      transactions.map(t => (t.id === id ? { ...t, ...transaction } : t))
    );
  };

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
        currentMonthTransactions,
        categories,
        budgetGoals,
        financialSummary,
        monthlyData,
        expenseBreakdown,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        formatCurrency,
        navigateToTransactions,
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
