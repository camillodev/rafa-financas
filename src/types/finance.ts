export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  subcategory?: string;
  date: Date;
  settlementDate?: Date;
  description: string;
  paymentMethod?: string;
  financialInstitution?: string;
  transactionType?: 'Credit Card' | 'Transfer' | 'Debit' | 'Other';
  status: 'completed' | 'pending';
  dueDate?: Date; // Added dueDate property
  card?: string; // Added card property for credit card transactions
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
  type: TransactionType;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  color?: string;
}

export interface BudgetGoal {
  category: string;
  amount: number;
  spent: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date?: Date; // Added date property for budget goals
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsGoal: number;
  savingsProgress: number;
}

export interface FinancialInstitution {
  id: string;
  name: string;
  icon: string;
  currentBalance: number;
  isActive: boolean;
  type?: string;
  logoUrl?: string;
  balance?: number;
  color?: string;
  archived?: boolean;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  brand: string;
  dueDate: number; // Day of the month
  institutionId: string;
  number?: string;
  institution?: string;
  closingDay?: number;
  dueDay?: number;
  color?: string;
  used?: number;
  archived?: boolean;
}

export interface GoalTransaction {
  id: string;
  date: Date;
  amount: number;
  type: 'add' | 'remove';
  description: string;
}

export interface GoalModification {
  id: string;
  goalId: string;
  date: Date;
  type: 'contribution' | 'withdrawal' | 'target_change' | 'date_change' | 'description_change';
  description: string;
  previousValue?: number | string;
  newValue?: number | string;
  amount?: number;
}
