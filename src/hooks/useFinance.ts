import { useFinanceDateStore } from '@/store/useFinanceDateStore';
import { useTransactionsStore } from '@/store/useTransactionsStore';
import { useCategoriesStore } from '@/store/useCategoriesStore';
import { useBudgetsStore } from '@/store/useBudgetsStore';
import { useGoalsStore } from '@/store/useGoalsStore';
import { useInstitutionsStore } from '@/store/useInstitutionsStore';
import { useCardsStore } from '@/store/useCardsStore';
import { fetchAllFinanceData } from '@/services/financeService';
import { TransactionFilterType } from '@/types/transaction';
import { useMemo } from 'react';
import { TransactionsState } from '@/types/transactions';
import { CategoriesState } from '@/types/categories';
import { BudgetsState } from '@/types/budgets';
import { GoalsState } from '@/types/goals';
import { InstitutionsState } from '@/types/institutions';
import { CardsState } from '@/types/cards';
import { FinanceDateState } from '@/types/date';

export type { TransactionFilterType };

/**
 * Hook for date navigation and filtering by date range
 */
export const useDateNavigation = () => {
  const {
    selectedMonth,
    currentDate,
    setSelectedMonth,
    navigateToPreviousMonth,
    navigateToNextMonth,
    getMonthDateRange
  } = useFinanceDateStore();

  return {
    selectedMonth,
    currentDate,
    setSelectedMonth,
    navigateToPreviousMonth,
    navigateToNextMonth,
    getMonthDateRange
  };
};

/**
 * Hook for financial data access from all domains
 */
export const useFinancialData = () => {
  const { transactions, filteredTransactions } = useTransactionsStore();
  const { categories, subcategories } = useCategoriesStore();
  const { budgetGoals } = useBudgetsStore();
  const { goals } = useGoalsStore();
  const { institutions, financialInstitutions } = useInstitutionsStore();
  const { cards, creditCards } = useCardsStore();

  // Loading states from all domain stores
  const isLoading =
    useTransactionsStore(state => state.isLoading) ||
    useCategoriesStore(state => state.isLoading) ||
    useBudgetsStore(state => state.isLoading) ||
    useGoalsStore(state => state.isLoading) ||
    useInstitutionsStore(state => state.isLoading) ||
    useCardsStore(state => state.isLoading);

  // Error states from all domain stores
  const error =
    useTransactionsStore(state => state.error) ||
    useCategoriesStore(state => state.error) ||
    useBudgetsStore(state => state.error) ||
    useGoalsStore(state => state.error) ||
    useInstitutionsStore(state => state.error) ||
    useCardsStore(state => state.error);

  return {
// Raw data
    transactions,
    filteredTransactions,
    categories,
    subcategories,
    budgetGoals,
    goals,
    institutions,
    financialInstitutions,
    cards,
    creditCards,

    // Status
    isLoading,
    error,

    // Data initialization
    fetchAllData: fetchAllFinanceData
  };
};

/**
 * Hook for calculations and financial metrics
 */
export const useFinancialCalculations = () => {
  const { getMonthDateRange, selectedMonth } = useDateNavigation();
  const { transactions } = useFinancialData();

  const {
    calculateTotalIncome,
    calculateTotalExpenses,
    calculateBalance,
    getTransactionsByCategory,
    formatCurrency
  } = useTransactionsStore();

  const { expenseBreakdown } = useCategoriesStore();

  // Financial summary based on the current month
  const financialSummary = useMemo(() => {
    const { startDate, endDate } = getMonthDateRange();
    return {
      totalIncome: calculateTotalIncome(startDate, endDate),
      totalExpenses: calculateTotalExpenses(startDate, endDate),
      balance: calculateBalance(startDate, endDate)
    };
  }, [calculateTotalIncome, calculateTotalExpenses, calculateBalance, getMonthDateRange, selectedMonth]);

  // Check if there's data for the current month
  const hasDataForCurrentMonth = useMemo(() => {
    if (!transactions.length) return false;

    const { startDate, endDate } = getMonthDateRange();
    return transactions.some(
      transaction => new Date(transaction.date) >= startDate && new Date(transaction.date) <= endDate
    );
  }, [transactions, getMonthDateRange, selectedMonth]);

  return {
    formatCurrency,
    calculateTotalIncome,
    calculateTotalExpenses,
    calculateBalance,
    getTransactionsByCategory,
    expenseBreakdown,
    financialSummary,
    hasDataForCurrentMonth
  };
};

/**
 * Hook for category-related operations
 */
export const useCategoryOperations = () => {
  const {
    selectedCategories,
    toggleCategorySelection,
    resetCategorySelection,
    findCategoryById,
    findCategoryByName,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory
  } = useCategoriesStore();

  return {
    selectedCategories,
    toggleCategorySelection,
    resetCategorySelection,
    findCategoryById,
    findCategoryByName,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory
  };
};

/**
 * Hook for transaction operations
 */
export const useTransactionOperations = () => {
  const {
    addTransaction,
    updateTransaction,
    deleteTransaction
  } = useTransactionsStore();

  return {
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
};

/**
 * Hook for budget operations
 */
export const useBudgetOperations = () => {
  const {
    addBudgetGoal,
    updateBudgetGoal,
    deleteBudgetGoal
  } = useBudgetsStore();

  return {
    addBudgetGoal,
    updateBudgetGoal,
    deleteBudgetGoal
  };
};

/**
 * Hook for goal operations
 */
export const useGoalOperations = () => {
  const {
    addGoal,
    updateGoal,
    deleteGoal,
    addGoalTransaction,
    deleteGoalTransaction,
    addGoalModification,
    getGoalModifications
  } = useGoalsStore();

  return {
    addGoal,
    updateGoal,
    deleteGoal,
    addGoalTransaction,
    deleteGoalTransaction,
    addGoalModification,
    getGoalModifications
  };
};

/**
 * Hook for financial institution operations
 */
export const useInstitutionOperations = () => {
  const {
    addFinancialInstitution,
    updateFinancialInstitution,
    deleteFinancialInstitution,
    archiveFinancialInstitution
  } = useInstitutionsStore();

  return {
    addFinancialInstitution,
    updateFinancialInstitution,
    deleteFinancialInstitution,
    archiveFinancialInstitution
  };
};

/**
 * Hook for credit card operations
 */
export const useCardOperations = () => {
  const {
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    archiveCreditCard
  } = useCardsStore();

  return {
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    archiveCreditCard
  };
};

/**
 * Main finance hook that aggregates all specialized hooks
 * This hook exists to maintain backward compatibility with existing components
 * Ideally, components should migrate to using the specialized hooks
 */
export const useFinance = () => {
  const dateNavigation = useDateNavigation();
  const financialData = useFinancialData();
  const financialCalculations = useFinancialCalculations();
  const categoryOperations = useCategoryOperations();
  const transactionOperations = useTransactionOperations();
  const budgetOperations = useBudgetOperations();
  const goalOperations = useGoalOperations();
  const institutionOperations = useInstitutionOperations();
  const cardOperations = useCardOperations();

  return {
    // Date Navigation
    ...dateNavigation,

    // Financial Data
    ...financialData,

    // Financial Calculations
    ...financialCalculations,

    // Category Operations
    ...categoryOperations,

    // Transaction Operations
    ...transactionOperations,

    // Budget Operations
    ...budgetOperations,

    // Goal Operations
    ...goalOperations,

    // Institution Operations
    ...institutionOperations,

    // Card Operations
    ...cardOperations,
  };
};

