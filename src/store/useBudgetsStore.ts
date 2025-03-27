
import { create } from 'zustand';
import * as budgetService from '@/services/budgetService';
import { BudgetGoal, BudgetResponse } from '@/types/finance';

interface BudgetsState {
  budgetGoals: BudgetGoal[];
  isLoading: boolean;
  error: string | null;
  
  // Fetch operations
  fetchBudgets: (month: number, year: number) => Promise<void>;
  
  // CRUD operations
  addBudgetGoal: (budget: Omit<BudgetGoal, 'id'>) => Promise<void>;
  updateBudgetGoal: (budget: BudgetGoal) => Promise<void>;
  deleteBudgetGoal: (id: string) => Promise<void>;
}

// Convert API budget responses to our app's budget format
const convertApiBudgets = (apiBudgets: BudgetResponse[]): BudgetGoal[] => {
  return apiBudgets.map(budget => ({
    id: budget.id,
    category: budget.categories.name,
    color: budget.categories.color,
    icon: budget.categories.icon,
    amount: budget.amount,
    spent: 0, // This might need to be calculated based on transactions
    period: 'monthly',
    month: budget.month,
    year: budget.year
  }));
};

export const useBudgetsStore = create<BudgetsState>((set) => ({
  budgetGoals: [],
  isLoading: false,
  error: null,
  
  fetchBudgets: async (month: number, year: number) => {
    set({ isLoading: true, error: null });
    try {
      const budgetData = await budgetService.fetchBudgets(month, year);
      const budgets = convertApiBudgets(budgetData);
      set({ budgetGoals: budgets, isLoading: false });
    } catch (error) {
      console.error('Error fetching budgets:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  },
  
  addBudgetGoal: async (budget: Omit<BudgetGoal, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const newBudget = await budgetService.addBudget(budget);
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
  
  updateBudgetGoal: async (budget: BudgetGoal) => {
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
  }
}));
