import { useFinanceDateStore } from '@/store/useFinanceDateStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { TransactionFilterType } from '@/types/transaction';
export type { TransactionFilterType };

export const useFinance = () => {
  const {
    selectedMonth,
    currentDate,
    setSelectedMonth,
    navigateToPreviousMonth,
    navigateToNextMonth,
    getMonthDateRange
  } = useFinanceDateStore();

  const {
    // Data
    categories,
    subcategories,
    transactions,
    filteredTransactions,
    budgetGoals,
    goals,
    institutions,
    financialInstitutions,
    cards,
    creditCards,

    // UI State
    isLoading,
    error,
    selectedCategories,

    // Computed data
    financialSummary,

    // Methods
    fetchAllData,
    hasDataForCurrentMonth,
    formatCurrency,
    calculateTotalIncome,
    calculateTotalExpenses,
    calculateBalance,
    getTransactionsByCategory,
    findCategoryById,
    findCategoryByName,
    expenseBreakdown,
    toggleCategorySelection,
    resetCategorySelection,

    // CRUD operations
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudgetGoal,
    updateBudgetGoal,
    deleteBudgetGoal,
    addFinancialInstitution,
    updateFinancialInstitution,
    deleteFinancialInstitution,
    archiveFinancialInstitution,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    archiveCreditCard,
    addGoal,
    updateGoal,
    deleteGoal,
    addGoalTransaction,
    deleteGoalTransaction,
    addGoalModification,
    getGoalModifications,
  } = useFinanceStore();

  return {
    // Data
    categories,
    subcategories,
    transactions,
    filteredTransactions,
    budgetGoals,
    goals,
    institutions,
    financialInstitutions,
    cards,
    creditCards,

    // UI State
    isLoading,
    error,
    selectedMonth,
    currentDate,
    selectedCategories,

    // Computed data
    financialSummary,

    // Methods
    fetchAllData,
    hasDataForCurrentMonth,
    setSelectedMonth,
    navigateToPreviousMonth,
    navigateToNextMonth,
    getMonthDateRange,
    formatCurrency,
    calculateTotalIncome,
    calculateTotalExpenses,
    calculateBalance,
    getTransactionsByCategory,
    findCategoryById,
    findCategoryByName,
    expenseBreakdown,
    toggleCategorySelection,
    resetCategorySelection,

    // CRUD operations
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudgetGoal,
    updateBudgetGoal,
    deleteBudgetGoal,
    addFinancialInstitution,
    updateFinancialInstitution,
    deleteFinancialInstitution,
    archiveFinancialInstitution,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    archiveCreditCard,
    addGoal,
    updateGoal,
    deleteGoal,
    addGoalTransaction,
    deleteGoalTransaction,
    addGoalModification,
    getGoalModifications,
  };
};

