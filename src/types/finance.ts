
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
  color?: string; // Adicionado para resolver erros em Categories.tsx
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
  dueDate?: Date; // Adicionado para UpcomingBills.tsx
  card?: string; // Adicionado para Reports.tsx
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
  icon: string;
  currentBalance: number;
  isActive: boolean;
  logoUrl?: string; // Adicionado para Institutions.tsx
  balance?: number; // Adicionado para Institutions.tsx
  color?: string; // Adicionado para Institutions.tsx
  archived?: boolean; // Adicionado para Institutions.tsx
}

export interface CreditCard {
  id: string;
  name: string;
  type: string;
  institution: string;
  institutionId: string;
  limit: number;
  dueDate: number;
  closingDate: number;
  isActive: boolean;
  // Campos adicionais para Cards.tsx
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

// Update the BudgetGoal type to align with what's used in the application
export interface BudgetGoal {
  id: string;
  category: string;
  categoryId?: string; // Adicionado para Budgets.tsx
  amount: number;
  spent: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  
  // Campos opcionais para flexibilidade
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

// Update Goal interface to make transactions optional on creation
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

// Add FinancialInstitutionResponse for API responses
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

// Add CreditCardResponse for API responses
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

// Update the BankTransactionResponse to include all needed fields
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

// CategoryResponse for API responses
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

// GoalResponse for API responses
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

// BudgetResponse for API responses
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

// Adicionar tipos para funcionalidade de divisão de contas
export interface SplitBillParticipant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface SplitBillParticipantShare {
  participantId: string;
  isIncluded: boolean;
  amount?: number;
  percentage?: number;
  weight?: number;
}

export type SplitBillDivisionMethod = 'equal' | 'fixed' | 'percentage' | 'weight';

export interface SplitBill {
  id: string;
  name: string;
  totalAmount: number;
  date: Date;
  category?: string;
  divisionMethod: SplitBillDivisionMethod;
  groupId?: string;
  participants: SplitBillParticipantShare[];
  status: 'active' | 'settled' | 'archived';
}

export interface SplitBillGroup {
  id: string;
  name: string;
  participants: SplitBillParticipant[];
}

export interface SplitBillPayment {
  id: string;
  splitBillId: string;
  participantId: string;
  amount: number;
  date: Date;
  notes?: string;
}

// Tipos para Goal transactions e modificações
export interface GoalTransaction {
  id: string;
  date: Date;
  amount: number;
  type: 'add' | 'remove';
  description: string;
}

export interface GoalModification {
  id: string;
  date: Date;
  type: 'contribution' | 'withdrawal' | 'target_change' | 'date_change' | 'description_change';
  description: string;
  previousValue?: any;
  newValue?: any;
}
