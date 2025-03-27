
import React, { createContext, useContext, ReactNode } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Category, Subcategory, Transaction, BudgetGoal, FinancialInstitution, CreditCard } from '@/types/finance';

// This is now a compatibility layer that uses the Zustand store
// But provides the same API as the old context for backward compatibility

interface FinanceContextType {
  categories: Category[];
  subcategories: Subcategory[];
  transactions: Transaction[];
  budgetGoals: BudgetGoal[];
  institutions: FinancialInstitution[];
  cards: CreditCard[];
  isLoading: boolean;
  error: string | null;
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
  formatCurrency: (value: number) => string;
  calculateTotalIncome: (month: Date) => number;
  calculateTotalExpenses: (month: Date) => number;
  calculateBalance: (month: Date) => number;
  getTransactionsByCategory: (categoryName: string, month: Date) => Transaction[];
  findCategoryById: (id: string) => Category | undefined;
  findCategoryByName: (name: string) => Category | undefined;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const finance = useFinanceStore();
  
  const value: FinanceContextType = {
    categories: finance.categories,
    subcategories: finance.subcategories || [],
    transactions: finance.transactions,
    budgetGoals: finance.budgetGoals,
    institutions: finance.institutions,
    cards: finance.cards,
    isLoading: finance.isLoading,
    error: finance.error,
    selectedMonth: finance.selectedMonth,
    setSelectedMonth: finance.setSelectedMonth,
    formatCurrency: finance.formatCurrency,
    calculateTotalIncome: finance.calculateTotalIncome,
    calculateTotalExpenses: finance.calculateTotalExpenses,
    calculateBalance: finance.calculateBalance,
    getTransactionsByCategory: finance.getTransactionsByCategory,
    findCategoryById: finance.findCategoryById,
    findCategoryByName: finance.findCategoryByName,
  };
  
  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};
