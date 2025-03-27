
import React, { createContext, useContext, ReactNode } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Category, Subcategory, Transaction, BudgetGoal, FinancialInstitution, CreditCard } from '@/types/finance';

// Export the TransactionFilterType from our types
export type { TransactionFilterType } from '@/types/finance';

// This is now a compatibility layer that uses the Zustand store
// But provides the same API as the old context for backward compatibility

interface FinanceContextType {
  categories: Category[];
  subcategories: Subcategory[];
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  budgetGoals: BudgetGoal[];
  goals: BudgetGoal[];
  institutions: FinancialInstitution[];
  financialInstitutions: FinancialInstitution[];
  cards: CreditCard[];
  creditCards: CreditCard[];
  isLoading: boolean;
  error: string | null;
  selectedMonth: Date;
  currentDate: Date;
  financialSummary: any;
  hasDataForCurrentMonth: () => boolean;
  setSelectedMonth: (date: Date) => void;
  navigateToPreviousMonth: () => void;
  navigateToNextMonth: () => void;
  navigateToTransactions: (filter?: any) => void;
  navigateToGoalDetail: (id: string) => void;
  formatCurrency: (value: number) => string;
  calculateTotalIncome: (month: Date) => number;
  calculateTotalExpenses: (month: Date) => number;
  calculateBalance: (month: Date) => number;
  getTransactionsByCategory: (categoryName: string, month: Date) => Transaction[];
  findCategoryById: (id: string) => Category | undefined;
  findCategoryByName: (name: string) => Category | undefined;
  expenseBreakdown: () => { name: string; value: number; color: string }[];
  selectedCategories: string[];
  toggleCategorySelection: (categoryId: string) => void;
  resetCategorySelection: () => void;
  
  // CRUD operations
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubcategory: (subcategory: Omit<Subcategory, 'id'>) => Promise<void>;
  updateSubcategory: (subcategory: Subcategory) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addBudgetGoal: (budget: Omit<BudgetGoal, 'id'>) => Promise<void>;
  updateBudgetGoal: (budget: BudgetGoal) => Promise<void>;
  deleteBudgetGoal: (id: string) => Promise<void>;
  addFinancialInstitution: (institution: Omit<FinancialInstitution, 'id'>) => Promise<void>;
  updateFinancialInstitution: (institution: FinancialInstitution) => Promise<void>;
  deleteFinancialInstitution: (id: string) => Promise<void>;
  archiveFinancialInstitution: (id: string) => Promise<void>;
  addCreditCard: (card: Omit<CreditCard, 'id'>) => Promise<void>;
  updateCreditCard: (card: CreditCard) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;
  archiveCreditCard: (id: string) => Promise<void>;
  addGoal: (goal: Omit<BudgetGoal, 'id'>) => Promise<void>;
  updateGoal: (goal: BudgetGoal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addGoalTransaction: (goalId: string, transaction: any) => Promise<void>;
  deleteGoalTransaction: (id: string) => Promise<void>;
  addGoalModification: (modification: any) => Promise<void>;
  getGoalModifications: (goalId: string) => Promise<any[]>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const finance = useFinanceStore();
  
  // Create a context value that matches the expected shape
  const value: FinanceContextType = {
    ...finance
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
