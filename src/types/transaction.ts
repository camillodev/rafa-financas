import { TransactionType } from './finance';

/**
 * Type for filtering transactions in the application
 */
export interface TransactionFilterType {
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  status?: string;
  type?: TransactionType;
  search?: string;
  institution?: string;
  card?: string;
}

/**
 * Interface for API parameters when fetching transactions
 */
export interface TransactionApiParams {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  category_id?: string;
  institution_id?: string;
  card_id?: string;
  transaction_type?: string;
  status?: string;
  search?: string;
}

/**
 * Interface for the response from a transaction creation/update operation
 */
export interface TransactionResponse {
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
}

// Add this at the end of the file to export the type
export type { TransactionFilterType };
