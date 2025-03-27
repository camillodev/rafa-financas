
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, Subcategory, Transaction, BudgetGoal, FinancialInstitution, CreditCard } from '@/types/finance';
import { fetchCategories } from '@/services/categoryService';
import { fetchTransactions } from '@/services/transactionService';
import { fetchInstitutions } from '@/services/institutionService';
import { fetchCards } from '@/services/cardService';
import { fetchBudgets } from '@/services/budgetService';
import { fetchGoals } from '@/services/goalService';
import { supabase } from '@/integrations/supabase/client';

interface FinanceState {
  // Data
  categories: Category[];
  subcategories: Subcategory[];
  transactions: Transaction[];
  budgetGoals: BudgetGoal[];
  institutions: FinancialInstitution[];
  cards: CreditCard[];
  isLoading: boolean;
  error: string | null;
  selectedMonth: Date;
  userId: string | null;
  
  // Methods
  fetchAllData: () => Promise<void>;
  setSelectedMonth: (date: Date) => void;
  formatCurrency: (value: number) => string;
  calculateTotalIncome: (month: Date) => number;
  calculateTotalExpenses: (month: Date) => number;
  calculateBalance: (month: Date) => number;
  getTransactionsByCategory: (categoryName: string, month: Date) => Transaction[];
  findCategoryById: (id: string) => Category | undefined;
  findCategoryByName: (name: string) => Category | undefined;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      categories: [],
      subcategories: [],
      transactions: [],
      budgetGoals: [],
      institutions: [],
      cards: [],
      isLoading: false,
      error: null,
      selectedMonth: new Date(),
      userId: null,
      
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
            year: currentMonth.getFullYear(),
            month: currentMonth.getMonth() + 1,
          });
          
          const institutionsData = await fetchInstitutions();
          const cardsData = await fetchCards();
          
          // Fetch budgets for the selected month
          const budgetsData = await fetchBudgets({
            year: currentMonth.getFullYear(),
            month: currentMonth.getMonth() + 1,
          });
          
          // Fetch goals
          const goalsData = await fetchGoals();
          
          set({
            categories: categoriesData,
            subcategories: subcategoriesData,
            transactions: transactionsData,
            institutions: institutionsData,
            cards: cardsData,
            budgetGoals: budgetsData,
            userId,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error fetching finance data:', error);
          set({ error: 'Failed to load finance data', isLoading: false });
        }
      },
      
      setSelectedMonth: (date: Date) => {
        set({ selectedMonth: date });
        // Refetch data for the new month
        get().fetchAllData();
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
            const transactionDate = new Date(transaction.date);
            return (
              transactionDate.getMonth() === month.getMonth() &&
              transactionDate.getFullYear() === month.getFullYear() &&
              transaction.type === 'income'
            );
          })
          .reduce((total, transaction) => total + transaction.amount, 0);
      },
      
      calculateTotalExpenses: (month: Date) => {
        const { transactions } = get();
        
        return transactions
          .filter((transaction) => {
            const transactionDate = new Date(transaction.date);
            return (
              transactionDate.getMonth() === month.getMonth() &&
              transactionDate.getFullYear() === month.getFullYear() &&
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
          const transactionDate = new Date(transaction.date);
          return (
            transactionDate.getMonth() === month.getMonth() &&
            transactionDate.getFullYear() === month.getFullYear() &&
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
    }),
    {
      name: 'finance-storage',
      partialize: (state) => ({
        selectedMonth: state.selectedMonth,
      }),
    }
  )
);
