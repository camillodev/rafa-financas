import { Transaction, TransactionType, BankTransactionResponse, PaginatedResponse } from '@/types/finance';
import { TransactionFilterType, TransactionApiParams } from '@/types/transaction';

export interface TransactionsState {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  // Fetch operations
  fetchTransactions: (params?: TransactionApiParams) => Promise<void>;
  applyFilters: (filters: TransactionFilterType) => void;

  // CRUD operations
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Calculations
  calculateTotalIncome: (startDate: Date, endDate: Date) => number;
  calculateTotalExpenses: (startDate: Date, endDate: Date) => number;
  calculateBalance: (startDate: Date, endDate: Date) => number;
  getTransactionsByCategory: (categoryName: string, startDate: Date, endDate: Date) => Transaction[];
  formatCurrency: (value: number) => string;
} 