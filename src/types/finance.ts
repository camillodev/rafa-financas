
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
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
  type: TransactionType;
}

export interface BudgetGoal {
  category: string;
  amount: number;
  spent: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
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
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  brand: string;
  dueDate: number; // Day of the month
  institutionId: string;
}
