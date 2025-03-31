export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense';
  isActive: boolean;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  color?: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  categoryId: string;
  subcategory?: string;
  date: Date;
  description: string;
  status: 'completed' | 'pending';
  settlementDate?: Date;
  institution?: string;
  institutionId?: string;
  financialInstitution?: string;
  paymentMethod?: string;
  transactionType?: 'Credit Card' | 'Transfer' | 'Debit' | 'Other';
  isActive?: boolean;
  dueDate?: Date;
  card?: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
}

export interface FinancialInstitution {
  id: string;
  name: string;
  type: string;
  institutionId?: string;
  isActive: boolean;
  logoUrl?: string;
  color?: string;
  balance?: number;
  archived?: boolean;
}

export interface CreditCard {
  id: string;
  name: string;
  type: string;
  institution?: string;
  institutionId: string;
  limit: number;
  dueDate: number;
  closingDate?: number;
  isActive: boolean;
  number?: string;
  brand?: string;
  color?: string;
  used?: number;
  dueDay?: number;
  closingDay?: number;
  archived?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface BudgetGoal {
  id: string;
  category: string;
  categoryId?: string;
  amount: number;
  spent: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  color?: string;
  name?: string;
  icon?: string;
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: string;
  date?: Date;
  year?: number;
  month?: number;
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
  transactions: any[];
  modifications?: any[];
}

export interface FinancialInstitutionResponse {
  id: string;
  name: string;
  type: string;
  logo: string;
  current_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreditCardResponse {
  id: string;
  name: string;
  type: string;
  institution_id: string;
  limit: number;
  due_date: number;
  closing_date: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  institutions?: {
    name: string;
    logo: string;
  };
}

export interface BankTransactionResponse {
  id: string;
  amount: number;
  date: string;
  description: string;
  status: string;
  settlement_date?: string;
  notes?: string;
  transaction_type: string;
  category_id?: string;
  subcategory_id?: string;
  institution_id?: string;
  card_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
    color: string;
    icon: string;
    type: string;
  };
  institutions?: {
    name: string;
    logo: string;
  };
  type: string;
  is_active: boolean;
}

export interface CategoryResponse {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface GoalResponse {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  start_date: string;
  is_completed: boolean;
  category_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  categories: {
    name: string;
    color: string;
    icon: string;
    type: string;
  };
}

export interface BudgetResponse {
  id: string;
  amount: number;
  month: number;
  year: number;
  category_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  categories: {
    name: string;
    color: string;
    icon: string;
    type: string;
  };
}

export type SplitBillDivisionMethod = 'equal' | 'custom' | 'percentage';
export type SplitBillStatus = 'active' | 'settled' | 'archived' | 'completed';

export interface SplitBillGroup {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SplitBillParticipant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  group_id?: string;
  groupId?: string;
  createdAt?: Date;
}

export interface SplitBillParticipantShare {
  participantId: string;
  amount?: number;
  percentage?: number;
  weight?: number;
  isIncluded: boolean;
  participantName?: string;
}

export interface SplitBill {
  id: string;
  name: string;
  totalAmount: number;
  date: Date;
  category?: string;
  divisionMethod: SplitBillDivisionMethod;
  status: SplitBillStatus;
  groupId?: string;
  participants: SplitBillParticipantShare[];
  receiptImageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SplitBillPayment {
  id: string;
  splitBillId: string;
  participantId: string;
  amount: number;
  date: Date;
  notes?: string;
}

export interface GoalModification {
  id: string;
  goalId: string;
  type: string;
  description: string;
  amount?: number;
  previousValue?: string;
  newValue?: string;
  date: string | Date;
}

export interface GoalTransaction {
  id: string;
  goalId: string;
  amount: number;
  type: 'add' | 'remove';
  description: string;
  date: string | Date;
}
