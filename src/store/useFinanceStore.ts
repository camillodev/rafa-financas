import { create } from 'zustand';
import { format, subMonths, addMonths, getMonth, getYear } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { 
  Category, Subcategory, Transaction, FinancialInstitution, 
  CreditCard, Goal, Budget, PaginatedResponse, BankTransactionResponse
} from '@/types/finance';
import { TransactionFilterType, TransactionApiParams } from '@/types/transaction';
import * as categoryService from '@/services/categoryService';
import * as transactionService from '@/services/transactionService';
import * as institutionService from '@/services/institutionService';
import * as cardService from '@/services/cardService';
import * as goalService from '@/services/goalService';
import * as budgetService from '@/services/budgetService';

interface FinanceState {
  // Data
  categories: Category[];
  subcategories: Subcategory[];
  transactions: Transaction[];
  budgetGoals: Budget[];
  goals: Goal[];
  institutions: FinancialInstitution[];
  financialInstitutions: FinancialInstitution[];
  cards: CreditCard[];
  creditCards: CreditCard[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  selectedMonth: Date;
  currentDate: Date;
  selectedCategories: string[];
  filteredTransactions: Transaction[];
  
  // Computed data
  financialSummary: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    savingsGoal: number;
    savingsProgress: number;
  };
  
  // Methods
  fetchAllData: () => Promise<void>;
  hasDataForCurrentMonth: () => boolean;
  setSelectedMonth: (date: Date) => void;
  navigateToPreviousMonth: () => void;
  navigateToNextMonth: () => void;
  navigateToTransactions: (filter?: TransactionFilterType) => void;
  navigateToGoalDetail: (id: string) => void;
  formatCurrency: (value: number) => string;
  calculateTotalIncome: (month: Date) => number;
  calculateTotalExpenses: (month: Date) => number;
  calculateBalance: (month: Date) => number;
  getTransactionsByCategory: (categoryName: string, month: Date) => Transaction[];
  findCategoryById: (id: string) => Category | undefined;
  findCategoryByName: (name: string) => Category | undefined;
  expenseBreakdown: () => { name: string; value: number; color: string }[];
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
  addBudgetGoal: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudgetGoal: (budget: Budget) => Promise<void>;
  deleteBudgetGoal: (id: string) => Promise<void>;
  addFinancialInstitution: (institution: Omit<FinancialInstitution, 'id'>) => Promise<void>;
  updateFinancialInstitution: (institution: FinancialInstitution) => Promise<void>;
  deleteFinancialInstitution: (id: string) => Promise<void>;
  archiveFinancialInstitution: (id: string) => Promise<void>;
  addCreditCard: (card: Omit<CreditCard, 'id'>) => Promise<void>;
  updateCreditCard: (card: CreditCard) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;
  archiveCreditCard: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addGoalTransaction: (goalId: string, transaction: any) => Promise<void>;
  deleteGoalTransaction: (id: string) => Promise<void>;
  addGoalModification: (modification: any) => Promise<void>;
  getGoalModifications: (goalId: string) => Promise<any[]>;
}

// Convert API transactions to our app's transaction format
const convertApiTransactions = (apiTransactions: BankTransactionResponse[]): Transaction[] => {
  return apiTransactions.map(tx => ({
    id: tx.id,
    amount: tx.amount,
    type: tx.type as 'income' | 'expense',
    category: tx.categories.name,
    date: new Date(tx.date),
    description: tx.description,
    status: tx.status as 'completed' | 'pending',
    settlementDate: tx.settlement_date ? new Date(tx.settlement_date) : undefined,
    financialInstitution: tx.institutions?.name,
    transactionType: tx.transaction_type as any,
    // Add any other needed fields
  }));
};

// Helper to build date range for the current month
const getMonthDateRange = (date: Date) => {
  const year = getYear(date);
  const month = getMonth(date);
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  return { startDate, endDate };
};

export const useFinanceStore = create<FinanceState>((set, get) => ({
  // Initialize state
  categories: [],
  subcategories: [],
  transactions: [],
  filteredTransactions: [],
  budgetGoals: [],
  goals: [],
  institutions: [],
  financialInstitutions: [],
  cards: [],
  creditCards: [],
  isLoading: false,
  error: null,
  selectedMonth: new Date(),
  currentDate: new Date(),
  selectedCategories: [],
  financialSummary: {
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    savingsGoal: 0,
    savingsProgress: 0
  },
  
  // Fetch data methods
  fetchAllData: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch categories
      const categoriesData = await categoryService.fetchCategories();
      
      // Fetch transactions for current month
      const { startDate, endDate } = getMonthDateRange(get().selectedMonth);
      const transactionsData = await transactionService.fetchTransactions({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      });
      
      // Convert API format to our app format
      const transactions = convertApiTransactions(transactionsData.data);
      
      // Fetch institutions
      const institutionsData = await institutionService.fetchInstitutions();
      
      // Fetch credit cards
      const cardsData = await cardService.fetchCreditCards();
      
      // Fetch goals
      const goalsData = await goalService.fetchGoals();
      
      // Fetch budget goals
      const budgetData = await budgetService.fetchBudgets(
        getMonth(get().selectedMonth) + 1, 
        getYear(get().selectedMonth)
      );
      
      // Calculate financial summary
      const totalIncome = transactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const totalExpenses = transactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const netBalance = totalIncome - totalExpenses;
      
      // Update state with all fetched data
      set({
        categories: categoriesData,
        transactions,
        filteredTransactions: transactions,
        institutions: institutionsData,
        financialInstitutions: institutionsData,
        cards: cardsData,
        creditCards: cardsData,
        goals: goalsData,
        budgetGoals: budgetData,
        isLoading: false,
        financialSummary: {
          totalIncome,
          totalExpenses,
          netBalance,
          savingsGoal: 0, // Calculate if needed
          savingsProgress: 0 // Calculate if needed
        }
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  },
  
  // Other helper methods
  hasDataForCurrentMonth: () => {
    return get().filteredTransactions.length > 0;
  },
  
  setSelectedMonth: (date: Date) => {
    set({ selectedMonth: date });
    get().fetchAllData();
  },
  
  navigateToPreviousMonth: () => {
    const newDate = subMonths(get().selectedMonth, 1);
    get().setSelectedMonth(newDate);
  },
  
  navigateToNextMonth: () => {
    const newDate = addMonths(get().selectedMonth, 1);
    get().setSelectedMonth(newDate);
  },
  
  navigateToTransactions: (filter?: TransactionFilterType) => {
    // This function should be implemented in components that need navigation
    // using react-router-dom's useNavigate
    console.log('Navigate to transactions with filter:', filter);
  },
  
  navigateToGoalDetail: (id: string) => {
    // This function should be implemented in components that need navigation
    console.log('Navigate to goal detail:', id);
  },
  
  formatCurrency: (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },
  
  calculateTotalIncome: (month: Date) => {
    const { startDate, endDate } = getMonthDateRange(month);
    return get().transactions
      .filter(tx => 
        tx.type === 'income' && 
        tx.date >= startDate && 
        tx.date <= endDate
      )
      .reduce((sum, tx) => sum + tx.amount, 0);
  },
  
  calculateTotalExpenses: (month: Date) => {
    const { startDate, endDate } = getMonthDateRange(month);
    return get().transactions
      .filter(tx => 
        tx.type === 'expense' && 
        tx.date >= startDate && 
        tx.date <= endDate
      )
      .reduce((sum, tx) => sum + tx.amount, 0);
  },
  
  calculateBalance: (month: Date) => {
    return get().calculateTotalIncome(month) - get().calculateTotalExpenses(month);
  },
  
  getTransactionsByCategory: (categoryName: string, month: Date) => {
    const { startDate, endDate } = getMonthDateRange(month);
    return get().transactions.filter(tx => 
      tx.category === categoryName &&
      tx.date >= startDate && 
      tx.date <= endDate
    );
  },
  
  findCategoryById: (id: string) => {
    return get().categories.find(cat => cat.id === id);
  },
  
  findCategoryByName: (name: string) => {
    return get().categories.find(cat => cat.name === name);
  },
  
  expenseBreakdown: () => {
    // Get current month's expense transactions
    const { startDate, endDate } = getMonthDateRange(get().selectedMonth);
    const expenseTransactions = get().transactions.filter(tx => 
      tx.type === 'expense' && 
      tx.date >= startDate && 
      tx.date <= endDate
    );
    
    // Group by category and calculate totals
    const categoryTotals: Record<string, { total: number, color: string }> = {};
    
    expenseTransactions.forEach(tx => {
      const category = get().findCategoryByName(tx.category);
      if (!categoryTotals[tx.category]) {
        categoryTotals[tx.category] = {
          total: 0,
          color: category?.color || '#888888'
        };
      }
      categoryTotals[tx.category].total += tx.amount;
    });
    
    // Convert to array format for charts
    return Object.entries(categoryTotals).map(([name, { total, color }]) => ({
      name,
      value: total,
      color
    }));
  },
  
  toggleCategorySelection: (categoryId: string) => {
    set(state => {
      if (state.selectedCategories.includes(categoryId)) {
        return {
          selectedCategories: state.selectedCategories.filter(id => id !== categoryId)
        };
      } else {
        return {
          selectedCategories: [...state.selectedCategories, categoryId]
        };
      }
    });
  },
  
  resetCategorySelection: () => {
    set({ selectedCategories: [] });
  },
  
  // CRUD operations
  addCategory: async (category: Omit<Category, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const newCategory = await categoryService.createCategory(category);
      set(state => ({
        categories: [...state.categories, newCategory],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding category:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  },
  
  updateCategory: async (category: Category) => {
    set({ isLoading: true, error: null });
    try {
      await categoryService.updateCategory(category.id, category);
      set(state => ({
        categories: state.categories.map(c => c.id === category.id ? category : c),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating category:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  },
  
  deleteCategory: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await categoryService.deleteCategory(id);
      set(state => ({
        categories: state.categories.filter(c => c.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting category:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  },
  
  addSubcategory: async (subcategory: Omit<Subcategory, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const newSubcategory = await categoryService.createSubcategory(subcategory);
      set(state => ({
        subcategories: [...state.subcategories, newSubcategory],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding subcategory:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  updateSubcategory: async (subcategory: Subcategory) => {
    set({ isLoading: true, error: null });
    try {
      await categoryService.updateSubcategory(subcategory.id, subcategory);
      set(state => ({
        subcategories: state.subcategories.map(s => s.id === subcategory.id ? subcategory : s),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating subcategory:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  deleteSubcategory: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await categoryService.deleteSubcategory(id);
      set(state => ({
        subcategories: state.subcategories.filter(s => s.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  addTransaction: async (transaction: Omit<Transaction, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const newTransaction = await transactionService.addTransaction(transaction);
      set(state => ({
        transactions: [...state.transactions, newTransaction],
        filteredTransactions: [...state.filteredTransactions, newTransaction],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding transaction:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  updateTransaction: async (transaction: Transaction) => {
    set({ isLoading: true, error: null });
    try {
      await transactionService.updateTransaction(transaction.id, transaction);
      set(state => ({
        transactions: state.transactions.map(t => t.id === transaction.id ? transaction : t),
        filteredTransactions: state.filteredTransactions.map(t => t.id === transaction.id ? transaction : t),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating transaction:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  deleteTransaction: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await transactionService.deleteTransaction(id);
      set(state => ({
        transactions: state.transactions.filter(t => t.id !== id),
        filteredTransactions: state.filteredTransactions.filter(t => t.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  addBudgetGoal: async (budget: Omit<Budget, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const newBudget = await budgetService.createBudget(budget);
      set(state => ({
        budgetGoals: [...state.budgetGoals, newBudget],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding budget goal:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  updateBudgetGoal: async (budget: Budget) => {
    set({ isLoading: true, error: null });
    try {
      await budgetService.updateBudget(budget.id, budget);
      set(state => ({
        budgetGoals: state.budgetGoals.map(b => b.id === budget.id ? budget : b),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating budget goal:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  deleteBudgetGoal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await budgetService.deleteBudget(id);
      set(state => ({
        budgetGoals: state.budgetGoals.filter(b => b.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting budget goal:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  addFinancialInstitution: async (institution: Omit<FinancialInstitution, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const newInstitution = await institutionService.createInstitution(institution);
      set(state => ({
        institutions: [...state.institutions, newInstitution],
        financialInstitutions: [...state.financialInstitutions, newInstitution],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding financial institution:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  updateFinancialInstitution: async (institution: FinancialInstitution) => {
    set({ isLoading: true, error: null });
    try {
      await institutionService.updateInstitution(institution.id, institution);
      set(state => ({
        institutions: state.institutions.map(i => i.id === institution.id ? institution : i),
        financialInstitutions: state.financialInstitutions.map(i => i.id === institution.id ? institution : i),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating financial institution:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  deleteFinancialInstitution: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await institutionService.deleteInstitution(id);
      set(state => ({
        institutions: state.institutions.filter(i => i.id !== id),
        financialInstitutions: state.financialInstitutions.filter(i => i.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting financial institution:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  archiveFinancialInstitution: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await institutionService.archiveInstitution(id);
      set(state => ({
        institutions: state.institutions.map(i => i.id === id ? { ...i, archived: true } : i),
        financialInstitutions: state.financialInstitutions.map(i => i.id === id ? { ...i, archived: true } : i),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error archiving financial institution:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  addCreditCard: async (card: Omit<CreditCard, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const newCard = await cardService.createCreditCard(card);
      set(state => ({
        cards: [...state.cards, newCard],
        creditCards: [...state.creditCards, newCard],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding credit card:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  updateCreditCard: async (card: CreditCard) => {
    set({ isLoading: true, error: null });
    try {
      await cardService.updateCreditCard(card.id, card);
      set(state => ({
        cards: state.cards.map(c => c.id === card.id ? card : c),
        creditCards: state.creditCards.map(c => c.id === card.id ? card : c),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating credit card:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  deleteCreditCard: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await cardService.deleteCreditCard(id);
      set(state => ({
        cards: state.cards.filter(c => c.id !== id),
        creditCards: state.creditCards.filter(c => c.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting credit card:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  archiveCreditCard: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await cardService.archiveCreditCard(id);
      set(state => ({
        cards: state.cards.map(c => c.id === id ? { ...c, archived: true } : c),
        creditCards: state.creditCards.map(c => c.id === id ? { ...c, archived: true } : c),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error archiving credit card:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  addGoal: async (goal: Omit<Goal, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const newGoal = await goalService.createGoal(goal);
      set(state => ({
        goals: [...state.goals, newGoal],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding goal:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  updateGoal: async (goal: Goal) => {
    set({ isLoading: true, error: null });
    try {
      await goalService.updateGoal(goal.id, goal);
      set(state => ({
        goals: state.goals.map(g => g.id === goal.id ? goal : g),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating goal:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  deleteGoal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await goalService.deleteGoal(id);
      set(state => ({
        goals: state.goals.filter(g => g.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting goal:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  addGoalTransaction: async (goalId: string, transaction: any) => {
    set({ isLoading: true, error: null });
    try {
      await goalService.addGoalTransaction(goalId, transaction);
      set(state => ({
        goals: state.goals.map(g =>
          g.id === goalId
            ? { ...g, transactions: [...(g.transactions || []), transaction] }
            : g
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding goal transaction:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  deleteGoalTransaction: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await goalService.deleteGoalTransaction(id);
      set(state => ({
        goals: state.goals.map(g => ({
          ...g,
          transactions: g.transactions.filter(t => t.id !== id)
        })),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting goal transaction:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  addGoalModification: async (modification: any) => {
    set({ isLoading: true, error: null });
    try {
      // Assuming the API returns the new modification after adding it
      // const newModification = await goalService.addGoalModification(modification);
      set(state => ({
        goals: state.goals.map(g =>
          g.id === modification.goalId
            ? { ...g, modifications: [...(g.modifications || []), modification] }
            : g
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding goal modification:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  getGoalModifications: async (goalId: string) => {
    set({ isLoading: true, error: null });
    try {
      const modifications = await goalService.getGoalModifications(goalId);
      set(state => ({
        goals: state.goals.map(g =>
          g.id === goalId ? { ...g, modifications: modifications } : g
        ),
        isLoading: false
      }));
      return modifications;
    } catch (error) {
      console.error('Error getting goal modifications:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }
}));
