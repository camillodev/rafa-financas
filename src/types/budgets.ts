import { BudgetGoal } from '@/types/finance';

export interface BudgetsState {
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