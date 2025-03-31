import { useFinanceDateStore } from '@/store/useFinanceDateStore';
import { useTransactionsStore } from '@/store/useTransactionsStore';
import { useCategoriesStore } from '@/store/useCategoriesStore';
import { useBudgetsStore } from '@/store/useBudgetsStore';
import { useGoalsStore } from '@/store/useGoalsStore';
import { useInstitutionsStore } from '@/store/useInstitutionsStore';
import { useCardsStore } from '@/store/useCardsStore';
import { fetchAllFinanceData } from '@/services/financeService';
import { TransactionFilterType } from '@/types/transaction';
import { useNavigate } from 'react-router-dom';

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
    getMonthDateRange,
    setCurrentDate
  } = useFinanceDateStore();

  return {
    selectedMonth,
    currentDate,
    setSelectedMonth,
    navigateToPreviousMonth,
    navigateToNextMonth,
    getMonthDateRange,
    setCurrentDate
  };
};

/**
 * Hook for financial data access from all domains
 */
export const useFinancialData = () => {
  // Store selectors - always call these regardless of condition
  const transactionsStore = useTransactionsStore();
  const categoriesStore = useCategoriesStore();
  const budgetsStore = useBudgetsStore();
  const goalsStore = useGoalsStore();
  const institutionsStore = useInstitutionsStore();
  const cardsStore = useCardsStore();

  // Extract data from stores
  const transactions = transactionsStore.transactions;
  const filteredTransactions = transactionsStore.filteredTransactions;
  const categories = categoriesStore.categories;
  const subcategories = categoriesStore.subcategories;
  const budgetGoals = budgetsStore.budgetGoals;
  const goals = goalsStore.goals;
  const institutions = institutionsStore.institutions;
  const financialInstitutions = institutionsStore.financialInstitutions;
  const cards = cardsStore.cards;
  const creditCards = cardsStore.creditCards;

  // Loading states from all domain stores
  const isLoading =
    transactionsStore.isLoading ||
    categoriesStore.isLoading ||
    budgetsStore.isLoading ||
    goalsStore.isLoading ||
    institutionsStore.isLoading ||
    cardsStore.isLoading;

  // Error states from all domain stores
  const error =
    transactionsStore.error ||
    categoriesStore.error ||
    budgetsStore.error ||
    goalsStore.error ||
    institutionsStore.error ||
    cardsStore.error;

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
  // Get all store functions first
  const dateNavigationStore = useDateNavigation();
  const { getMonthDateRange, selectedMonth } = dateNavigationStore;

  const financialDataStore = useFinancialData();
  const { transactions } = financialDataStore;

  const transactionStore = useTransactionsStore();
  const {
    calculateTotalIncome,
    calculateTotalExpenses,
    calculateBalance,
    getTransactionsByCategory,
    formatCurrency
  } = transactionStore;

  const categoryStore = useCategoriesStore();
  const { expenseBreakdown } = categoryStore;

  // Financial summary based on the current month
  const getFinancialSummary = () => {
    const { startDate, endDate } = getMonthDateRange();
    return {
      totalIncome: calculateTotalIncome(startDate, endDate),
      totalExpenses: calculateTotalExpenses(startDate, endDate),
      balance: calculateBalance(startDate, endDate)
    };
  };

  const financialSummary = getFinancialSummary();

  // Check if there's data for the current month
  const getHasDataForCurrentMonth = () => {
    if (!transactions || !transactions.length) return false;

    const { startDate, endDate } = getMonthDateRange();
    return transactions.some(
      transaction => new Date(transaction.date) >= startDate && new Date(transaction.date) <= endDate
    );
  };

  const hasDataForCurrentMonth = getHasDataForCurrentMonth();

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

// Adicionar navigateToTransactions e navegação para goals
export function useFinanceNavigation() {
  const navigate = useNavigate();
  
  const navigateToTransactions = (period = 'all', categoryId?: string, cardId?: string) => {
    navigate('/transactions', { state: { period, categoryId, cardId } });
  };
  
  const navigateToGoalDetail = (id: string) => {
    navigate(`/goals/${id}`);
  };
  
  return { navigateToTransactions, navigateToGoalDetail };
}

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
  const financeNavigation = useFinanceNavigation();

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
    
    // Finance Navigation
    ...financeNavigation,
    
    // Adicionando as funções de navegação
    navigateToTransactions: financeNavigation.navigateToTransactions,
    navigateToGoalDetail: financeNavigation.navigateToGoalDetail,
    
    // Adicionando funções de data
    setCurrentDate: dateNavigation.setCurrentDate,
    getMonthDateRange: dateNavigation.getMonthDateRange,
    selectedMonth: dateNavigation.selectedMonth,
    currentDate: dateNavigation.currentDate,
    setSelectedMonth: dateNavigation.setSelectedMonth,
    navigateToPreviousMonth: dateNavigation.navigateToPreviousMonth,
    navigateToNextMonth: dateNavigation.navigateToNextMonth,
  };
};
