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
  institution: string;
  dueDate?: Date;
  card?: string;
}

export type TransactionType = 'income' | 'expense';

export interface BankTransactionResponse {
  id: string;
  amount: number;
  date: string;
  description: string;
  status: string;
  transaction_type: string;
  category_id: string;
  institution_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  type: 'income' | 'expense';
  is_active: boolean;
  categories: {
    name: string;
    color: string;
    icon: string;
    type: 'income' | 'expense';
  };
  institutions: {
    name: string;
    logo: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// SplitBill types
export type SplitBillDivisionMethod = 'equal' | 'percentage' | 'custom' | 'exact';

export interface SplitBillParticipantShare {
  id: string;
  participantId: string;
  participantName: string;
  amount: number;
  isPaid: boolean;
  paidAmount?: number;
  paidDate?: Date;
}

export interface SplitBillParticipant {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  groupId?: string;
}

export interface SplitBillGroup {
  id: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  participants?: SplitBillParticipant[];
}

export interface SplitBill {
  id: string;
  name: string;
  totalAmount: number;
  date: Date;
  category?: string;
  divisionMethod: SplitBillDivisionMethod;
  participants: SplitBillParticipantShare[];
  groupId?: string;
  status: 'active' | 'settled' | 'archived';
  createdAt?: Date;
  updatedAt?: Date;
  receiptImageUrl?: string;
}

export interface SplitBillPayment {
  id: string;
  billId: string;
  participantId: string;
  amount: number;
  date: Date;
  method?: string;
  notes?: string;
}

export interface GoalModification {
  id: string;
  goalId: string;
  type: 'deposit' | 'withdrawal' | 'target_change' | 'date_change';
  date: Date;
  description: string;
  previousValue?: number;
  newValue?: number;
  amount?: number;
}

export interface GoalTransaction {
  id: string;
  goalId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: Date;
  description: string;
}
