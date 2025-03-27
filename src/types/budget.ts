
/**
 * BudgetGoal type definition that includes all required properties
 * for financial goals in the application
 */
export interface BudgetGoal {
  id: string;
  // Budget properties
  category: string;
  amount: number;
  spent: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  
  // Goal properties
  name: string;
  currentAmount: number;
  targetAmount: number;
  targetDate: string;
  icon: string;
  color: string;
  transactions: GoalTransaction[];
}

/**
 * Goal transaction type for tracking contributions to a goal
 */
export interface GoalTransaction {
  id: string;
  date: Date;
  amount: number;
  type: 'add' | 'remove';
  description: string;
}

/**
 * Budget record for monthly category budget allocations
 */
export interface BudgetRecord {
  id: string;
  categoryId: string;
  category?: string;
  amount: number;
  spent: number;
  month: number;
  year: number;
}
