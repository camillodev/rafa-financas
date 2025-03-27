// Define the BudgetGoal type with all required properties
export interface BudgetGoal {
  id: string;
  category: string;
  amount: number;
  spent: number;
  period: string;

  // Add missing properties that are used in components
  name: string;
  currentAmount: number;
  targetAmount: number;
  targetDate: string;
  icon: string;
  color: string;
  transactions: any[]; // Or use a proper transaction type
} 