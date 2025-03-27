
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Category, 
  Subcategory, 
  Transaction, 
  BudgetGoal, 
  FinancialInstitution, 
  CreditCard,
  FinancialSummary,
  PaginatedResponse,
  BankTransactionResponse,
  TransactionFilterType,
  GoalTransaction,
  GoalModification,
  TransactionType
} from '@/types/finance';
import { fetchCategories } from '@/services/categoryService';
import { fetchTransactions } from '@/services/transactionService';
import { fetchInstitutions } from '@/services/institutionService';
import { fetchCards } from '@/services/cardService';
import { fetchBudgets } from '@/services/budgetService';
import { fetchGoals } from '@/services/goalService';
import { supabase } from '@/integrations/supabase/client';
import { addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth, isSameYear } from 'date-fns';

interface FinanceState {
  // Data
  categories: Category[];
  subcategories: Subcategory[];
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  budgetGoals: BudgetGoal[];
  goals: BudgetGoal[];
  institutions: FinancialInstitution[];
  cards: CreditCard[];
  creditCards: CreditCard[];
  financialInstitutions: FinancialInstitution[];
  isLoading: boolean;
  error: string | null;
  selectedMonth: Date;
  currentDate: Date;
  selectedCategories: string[];
  userId: string | null;
  financialSummary: FinancialSummary;
  
  // Methods for data fetching
  fetchAllData: () => Promise<void>;
  
  // Navigation methods
  setSelectedMonth: (date: Date) => void;
  navigateToPreviousMonth: () => void;
  navigateToNextMonth: () => void;
  navigateToTransactions: (filter?: TransactionFilterType) => void;
  navigateToGoalDetail: (id: string) => void;
  
  // Format and calculation methods
  formatCurrency: (value: number) => string;
  calculateTotalIncome: (month: Date) => number;
  calculateTotalExpenses: (month: Date) => number;
  calculateBalance: (month: Date) => number;
  getTransactionsByCategory: (categoryName: string, month: Date) => Transaction[];
  findCategoryById: (id: string) => Category | undefined;
  findCategoryByName: (name: string) => Category | undefined;
  hasDataForCurrentMonth: () => boolean;
  
  // Category operations
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubcategory: (subcategory: Omit<Subcategory, 'id'>) => Promise<void>;
  updateSubcategory: (subcategory: Subcategory) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;
  
  // Transaction operations
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Budget operations
  addBudgetGoal: (budget: Omit<BudgetGoal, 'id'>) => Promise<void>;
  updateBudgetGoal: (budget: BudgetGoal) => Promise<void>;
  deleteBudgetGoal: (id: string) => Promise<void>;
  
  // Institution operations
  addFinancialInstitution: (institution: Omit<FinancialInstitution, 'id'>) => Promise<void>;
  updateFinancialInstitution: (institution: FinancialInstitution) => Promise<void>;
  deleteFinancialInstitution: (id: string) => Promise<void>;
  archiveFinancialInstitution: (id: string) => Promise<void>;
  
  // Card operations
  addCreditCard: (card: Omit<CreditCard, 'id'>) => Promise<void>;
  updateCreditCard: (card: CreditCard) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;
  archiveCreditCard: (id: string) => Promise<void>;
  
  // Goal operations
  addGoal: (goal: Omit<BudgetGoal, 'id'>) => Promise<void>;
  updateGoal: (goal: BudgetGoal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  // Goal transaction operations
  addGoalTransaction: (goalId: string, transaction: Omit<GoalTransaction, 'id'>) => Promise<void>;
  deleteGoalTransaction: (id: string) => Promise<void>;
  
  // Goal modification operations
  addGoalModification: (modification: Omit<GoalModification, 'id'>) => Promise<void>;
  getGoalModifications: (goalId: string) => Promise<GoalModification[]>;
  
  // Category selection for charts
  toggleCategorySelection: (categoryId: string) => void;
  resetCategorySelection: () => void;
  
  // Filtering for charts and reports
  expenseBreakdown: () => { name: string; value: number; color: string }[];
}

// Helper functions for data transformation
const transformCategories = (apiCategories: any[]): Category[] => {
  return apiCategories.map(cat => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    type: cat.type as TransactionType,
    isActive: cat.is_active
  }));
};

const transformTransactions = (apiResponse: PaginatedResponse<BankTransactionResponse>): Transaction[] => {
  if (!apiResponse?.data) return [];
  
  return apiResponse.data.map(tx => ({
    id: tx.id,
    amount: tx.amount,
    type: tx.type as TransactionType,
    category: tx.categories?.name || '',
    date: new Date(tx.date),
    settlementDate: tx.settlement_date ? new Date(tx.settlement_date) : undefined,
    description: tx.description,
    paymentMethod: tx.payment_method,
    financialInstitution: tx.institutions?.name,
    transactionType: tx.transaction_type as any,
    status: tx.status as any,
    dueDate: tx.due_date ? new Date(tx.due_date) : undefined,
    card: tx.card_id,
    isActive: tx.is_active
  }));
};

const transformInstitutions = (apiInstitutions: any[]): FinancialInstitution[] => {
  return apiInstitutions.map(inst => ({
    id: inst.id,
    name: inst.name,
    icon: inst.logo,
    currentBalance: inst.current_balance,
    isActive: inst.is_active,
    type: inst.type,
    color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color if not provided
  }));
};

const transformCards = (apiCards: any[]): CreditCard[] => {
  return apiCards.map(card => ({
    id: card.id,
    name: card.name,
    limit: card.limit_amount,
    dueDate: card.due_day,
    institutionId: card.institution_id,
    institution: card.institutions?.name,
    closingDay: card.closing_day,
    dueDay: card.due_day,
    isActive: card.is_active,
    color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color if not provided
  }));
};

const transformBudgets = (apiBudgets: any[]): BudgetGoal[] => {
  return apiBudgets.map(budget => ({
    id: budget.id,
    category: budget.categories?.name || '',
    categoryId: budget.category_id,
    amount: budget.amount,
    spent: 0, // This would need to be calculated based on transactions
    period: 'monthly', // Default to monthly budgets
    date: new Date(budget.year, budget.month - 1, 1)
  }));
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      categories: [],
      subcategories: [],
      transactions: [],
      filteredTransactions: [],
      budgetGoals: [],
      goals: [],
      institutions: [],
      cards: [],
      creditCards: [],
      financialInstitutions: [],
      isLoading: false,
      error: null,
      selectedMonth: new Date(),
      currentDate: new Date(),
      selectedCategories: [],
      userId: null,
      financialSummary: {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        savingsGoal: 0,
        savingsProgress: 0
      },
      
      fetchAllData: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Get current user
          const { data: sessionData } = await supabase.auth.getSession();
          const userId = sessionData.session?.user.id || null;
          
          // Fetch all data
          const categoriesData = await fetchCategories();
          
          // For now, we'll use an empty array for subcategories as we don't have the table yet
          const subcategoriesData: Subcategory[] = [];
          
          const currentMonth = get().selectedMonth;
          
          const transactionsData = await fetchTransactions({
            startDate: startOfMonth(currentMonth),
            endDate: endOfMonth(currentMonth)
          });
          
          const institutionsData = await fetchInstitutions();
          const cardsData = await fetchCards();
          
          // Fetch budgets for the selected month
          const budgetsData = await fetchBudgets(
            currentMonth.getFullYear(), 
            currentMonth.getMonth() + 1
          );
          
          // Fetch goals
          const goalsData = await fetchGoals();
          
          // Transform API responses to our internal types
          const transformedCategories = transformCategories(categoriesData);
          const transformedTransactions = transformTransactions(transactionsData);
          const transformedInstitutions = transformInstitutions(institutionsData);
          const transformedCards = transformCards(cardsData);
          const transformedBudgets = transformBudgets(budgetsData);
          
          // Calculate financial summary
          const totalIncome = transformedTransactions
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0);
            
          const totalExpenses = transformedTransactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);
          
          const financialSummary = {
            totalIncome,
            totalExpenses,
            netBalance: totalIncome - totalExpenses,
            savingsGoal: 2000, // Default value, should be fetched from settings
            savingsProgress: ((totalIncome - totalExpenses) / 2000) * 100
          };
          
          set({
            categories: transformedCategories,
            subcategories: subcategoriesData,
            transactions: transformedTransactions,
            filteredTransactions: transformedTransactions,
            institutions: transformedInstitutions,
            financialInstitutions: transformedInstitutions,
            cards: transformedCards,
            creditCards: transformedCards,
            budgetGoals: transformedBudgets,
            goals: transformedBudgets,
            userId,
            isLoading: false,
            financialSummary
          });
        } catch (error) {
          console.error('Error fetching finance data:', error);
          set({ error: 'Failed to load finance data', isLoading: false });
        }
      },
      
      setSelectedMonth: (date: Date) => {
        set({ selectedMonth: date, currentDate: date });
        // Refetch data for the new month
        get().fetchAllData();
      },
      
      navigateToPreviousMonth: () => {
        const currentDate = get().currentDate;
        const newDate = subMonths(currentDate, 1);
        set({ currentDate: newDate, selectedMonth: newDate });
        get().fetchAllData();
      },
      
      navigateToNextMonth: () => {
        const currentDate = get().currentDate;
        const newDate = addMonths(currentDate, 1);
        set({ currentDate: newDate, selectedMonth: newDate });
        get().fetchAllData();
      },
      
      navigateToTransactions: (filter?: TransactionFilterType) => {
        // This would be implemented with react-router
        console.log('Navigate to transactions with filter:', filter);
        // Implementation would depend on routing library
      },
      
      navigateToGoalDetail: (id: string) => {
        // This would be implemented with react-router
        console.log('Navigate to goal detail:', id);
        // Implementation would depend on routing library
      },
      
      formatCurrency: (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value);
      },
      
      calculateTotalIncome: (month: Date) => {
        const { transactions } = get();
        
        return transactions
          .filter((transaction) => {
            const transactionDate = transaction.date;
            return (
              isSameMonth(transactionDate, month) &&
              isSameYear(transactionDate, month) &&
              transaction.type === 'income'
            );
          })
          .reduce((total, transaction) => total + transaction.amount, 0);
      },
      
      calculateTotalExpenses: (month: Date) => {
        const { transactions } = get();
        
        return transactions
          .filter((transaction) => {
            const transactionDate = transaction.date;
            return (
              isSameMonth(transactionDate, month) &&
              isSameYear(transactionDate, month) &&
              transaction.type === 'expense'
            );
          })
          .reduce((total, transaction) => total + transaction.amount, 0);
      },
      
      calculateBalance: (month: Date) => {
        const totalIncome = get().calculateTotalIncome(month);
        const totalExpenses = get().calculateTotalExpenses(month);
        return totalIncome - totalExpenses;
      },
      
      getTransactionsByCategory: (categoryName: string, month: Date) => {
        const { transactions } = get();
        
        return transactions.filter((transaction) => {
          const transactionDate = transaction.date;
          return (
            isSameMonth(transactionDate, month) &&
            isSameYear(transactionDate, month) &&
            transaction.category === categoryName
          );
        });
      },
      
      findCategoryById: (id: string) => {
        return get().categories.find((category) => category.id === id);
      },
      
      findCategoryByName: (name: string) => {
        return get().categories.find((category) => category.name === name);
      },
      
      hasDataForCurrentMonth: () => {
        const { transactions, currentDate } = get();
        return transactions.some(tx => 
          isSameMonth(tx.date, currentDate) && 
          isSameYear(tx.date, currentDate)
        );
      },
      
      // Category operations - these would call the API services
      addCategory: async (category) => {
        // Implementation would call categoryService
        console.log('Add category:', category);
      },
      
      updateCategory: async (category) => {
        // Implementation would call categoryService
        console.log('Update category:', category);
      },
      
      deleteCategory: async (id) => {
        // Implementation would call categoryService
        console.log('Delete category:', id);
      },
      
      addSubcategory: async (subcategory) => {
        // Implementation would call categoryService
        console.log('Add subcategory:', subcategory);
      },
      
      updateSubcategory: async (subcategory) => {
        // Implementation would call categoryService
        console.log('Update subcategory:', subcategory);
      },
      
      deleteSubcategory: async (id) => {
        // Implementation would call categoryService
        console.log('Delete subcategory:', id);
      },
      
      // Transaction operations
      addTransaction: async (transaction) => {
        // Implementation would call transactionService
        console.log('Add transaction:', transaction);
      },
      
      updateTransaction: async (transaction) => {
        // Implementation would call transactionService
        console.log('Update transaction:', transaction);
      },
      
      deleteTransaction: async (id) => {
        // Implementation would call transactionService
        console.log('Delete transaction:', id);
      },
      
      // Budget operations
      addBudgetGoal: async (budget) => {
        // Implementation would call budgetService
        console.log('Add budget goal:', budget);
      },
      
      updateBudgetGoal: async (budget) => {
        // Implementation would call budgetService
        console.log('Update budget goal:', budget);
      },
      
      deleteBudgetGoal: async (id) => {
        // Implementation would call budgetService
        console.log('Delete budget goal:', id);
      },
      
      // Institution operations
      addFinancialInstitution: async (institution) => {
        // Implementation would call institutionService
        console.log('Add financial institution:', institution);
      },
      
      updateFinancialInstitution: async (institution) => {
        // Implementation would call institutionService
        console.log('Update financial institution:', institution);
      },
      
      deleteFinancialInstitution: async (id) => {
        // Implementation would call institutionService
        console.log('Delete financial institution:', id);
      },
      
      archiveFinancialInstitution: async (id) => {
        // Implementation would call institutionService
        console.log('Archive financial institution:', id);
      },
      
      // Card operations
      addCreditCard: async (card) => {
        // Implementation would call cardService
        console.log('Add credit card:', card);
      },
      
      updateCreditCard: async (card) => {
        // Implementation would call cardService
        console.log('Update credit card:', card);
      },
      
      deleteCreditCard: async (id) => {
        // Implementation would call cardService
        console.log('Delete credit card:', id);
      },
      
      archiveCreditCard: async (id) => {
        // Implementation would call cardService
        console.log('Archive credit card:', id);
      },
      
      // Goal operations
      addGoal: async (goal) => {
        // Implementation would call goalService
        console.log('Add goal:', goal);
      },
      
      updateGoal: async (goal) => {
        // Implementation would call goalService
        console.log('Update goal:', goal);
      },
      
      deleteGoal: async (id) => {
        // Implementation would call goalService
        console.log('Delete goal:', id);
      },
      
      // Goal transaction operations
      addGoalTransaction: async (goalId, transaction) => {
        // Implementation would call goalService
        console.log('Add goal transaction:', goalId, transaction);
      },
      
      deleteGoalTransaction: async (id) => {
        // Implementation would call goalService
        console.log('Delete goal transaction:', id);
      },
      
      // Goal modification operations
      addGoalModification: async (modification) => {
        // Implementation would call goalService
        console.log('Add goal modification:', modification);
      },
      
      getGoalModifications: async (goalId) => {
        // Implementation would call goalService
        console.log('Get goal modifications:', goalId);
        return [];
      },
      
      // Category selection for charts
      toggleCategorySelection: (categoryId) => {
        const { selectedCategories } = get();
        if (selectedCategories.includes(categoryId)) {
          set({ selectedCategories: selectedCategories.filter(id => id !== categoryId) });
        } else {
          set({ selectedCategories: [...selectedCategories, categoryId] });
        }
      },
      
      resetCategorySelection: () => {
        set({ selectedCategories: [] });
      },
      
      // Expense breakdown for charts
      expenseBreakdown: () => {
        const { transactions, categories, selectedMonth } = get();
        
        const expensesByCategory = transactions
          .filter(tx => 
            tx.type === 'expense' && 
            isSameMonth(tx.date, selectedMonth) && 
            isSameYear(tx.date, selectedMonth)
          )
          .reduce((acc, tx) => {
            const categoryName = tx.category;
            acc[categoryName] = (acc[categoryName] || 0) + tx.amount;
            return acc;
          }, {} as Record<string, number>);
        
        return Object.entries(expensesByCategory).map(([name, value]) => {
          const category = categories.find(c => c.name === name);
          return {
            name,
            value,
            color: category?.color || '#cccccc'
          };
        });
      }
    }),
    {
      name: 'finance-storage',
      partialize: (state) => ({
        selectedMonth: state.selectedMonth,
        currentDate: state.currentDate,
        selectedCategories: state.selectedCategories
      }),
    }
  )
);
