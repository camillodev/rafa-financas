
import { create } from 'zustand';
import * as goalService from '@/services/goalService';
import { Goal, GoalResponse } from '@/types/finance';

interface GoalsState {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  
  // Fetch operations
  fetchGoals: () => Promise<void>;
  
  // CRUD operations
  addGoal: (goal: Omit<Goal, 'id' | 'transactions'>) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addGoalTransaction: (goalId: string, transaction: any) => Promise<void>;
  deleteGoalTransaction: (id: string) => Promise<void>;
  addGoalModification: (modification: any) => Promise<void>;
  getGoalModifications: (goalId: string) => Promise<any[]>;
}

// Convert API goal responses to our app's goal format
const convertApiGoals = (apiGoals: GoalResponse[]): Goal[] => {
  return apiGoals.map(goal => ({
    id: goal.id,
    name: goal.title,
    targetAmount: goal.target_amount,
    currentAmount: goal.current_amount,
    targetDate: goal.target_date,
    category: goal.categories.name,
    icon: goal.categories.icon,
    color: goal.categories.color,
    transactions: []
  }));
};

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,
  
  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const goalsData = await goalService.fetchGoals();
      const goals = convertApiGoals(goalsData);
      set({ goals, isLoading: false });
    } catch (error) {
      console.error('Error fetching goals:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  },
  
  addGoal: async (goal: Omit<Goal, 'id' | 'transactions'>) => {
    set({ isLoading: true, error: null });
    try {
      const newGoal = await goalService.addGoal({
        ...goal,
        transactions: []
      });
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
      
      // Update the goal with the new transaction
      const updatedGoal = get().goals.find(g => g.id === goalId);
      if (updatedGoal) {
        const updatedGoalWithTx = {
          ...updatedGoal,
          transactions: [...(updatedGoal.transactions || []), transaction]
        };
        
        set(state => ({
          goals: state.goals.map(g => g.id === goalId ? updatedGoalWithTx : g),
          isLoading: false
        }));
      }
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
      
      // Update all goals by removing this transaction
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
      await goalService.addGoalModification(modification);
      
      // Update the goal with the new modification
      const goalId = modification.goalId;
      const updatedGoal = get().goals.find(g => g.id === goalId);
      
      if (updatedGoal) {
        const updatedGoalWithMod = {
          ...updatedGoal,
          modifications: [...(updatedGoal.modifications || []), modification]
        };
        
        set(state => ({
          goals: state.goals.map(g => g.id === goalId ? updatedGoalWithMod : g),
          isLoading: false
        }));
      }
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
      const modifications = await goalService.addGoalModification({ goalId });
      
      // Update the goal with the fetched modifications
      const updatedGoal = get().goals.find(g => g.id === goalId);
      if (updatedGoal) {
        const updatedGoalWithMods = {
          ...updatedGoal,
          modifications
        };
        
        set(state => ({
          goals: state.goals.map(g => g.id === goalId ? updatedGoalWithMods : g),
          isLoading: false
        }));
      }
      
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
