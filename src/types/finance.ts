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
  dueDate?: Date;
  card?: string;
  isActive?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
  type: TransactionType;
  isActive?: boolean;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  color?: string;
}

export interface BudgetGoal {
  id?: string;          
  category: string;
  categoryId?: string;  
  amount: number;
  spent: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date?: Date;
}

// Alias for back-compatibility
export type Budget = BudgetGoal;

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
  brand?: string;
  dueDate: number;
  institutionId: string;
  number?: string;
  institution?: string;
  closingDay?: number;
  dueDay?: number;
  color?: string;
  used?: number;
  archived?: boolean;
  isActive?: boolean;
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

// Novas interfaces para a funcionalidade "Dividir Contas"
export interface SplitBillParticipant {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  group_id?: string;
}

export interface SplitBillGroup {
  id: string;
  name: string;
  participants: SplitBillParticipant[];
  createdAt: Date;
  updatedAt: Date;
}

export type SplitBillDivisionMethod = 'equal' | 'fixed' | 'percentage' | 'weight';

export interface SplitBillParticipantShare {
  participantId: string;
  amount?: number;
  percentage?: number;
  weight?: number;
  isIncluded: boolean;
}

export interface SplitBill {
  id: string;
  name: string;
  totalAmount: number;
  category?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  receiptImageUrl?: string;
  divisionMethod: SplitBillDivisionMethod;
  participants: SplitBillParticipantShare[];
  groupId?: string;
  status: 'active' | 'completed';
}

export interface SplitBillPayment {
  id: string;
  splitBillId: string;
  participantId: string;
  amount: number;
  date: Date;
  notes?: string;
}

// New type for transaction filtering
export type TransactionFilterType = {
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  status?: string;
  type?: TransactionType;
  search?: string;
  institution?: string;
  card?: string;
}

// Type for bank transaction response from API
export interface BankTransactionResponse {
  id: string;
  amount: number;
  type: string;
  category_id: string;
  subcategory_id?: string;
  date: string;
  settlement_date?: string;
  description: string;
  payment_method?: string;
  institution_id?: string;
  transaction_type?: string;
  status: string;
  due_date?: string;
  card_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  categories: {
    name: string;
    color: string;
    icon: string;
    type: string;
  };
  institutions?: {
    name: string;
    logo: string;
  };
}

// Type for API responses with pagination
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  icon: string;
  color: string;
  transactions: GoalTransaction[];
}
