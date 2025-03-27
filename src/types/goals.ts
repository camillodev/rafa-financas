import { Goal } from '@/types/finance';

export interface GoalsState {
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