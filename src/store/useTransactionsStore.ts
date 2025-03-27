
import { create } from 'zustand';
import { format } from 'date-fns';
import * as transactionService from '@/services/transactionService';
import { Transaction, BankTransactionResponse } from '@/types/finance';
import { TransactionFilterType, TransactionApiParams } from '@/types/transaction';

interface TransactionsState {
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
}

// Convert API transactions to our app's transaction format
const convertApiTransactions = (apiTransactions: BankTransactionResponse[]): Transaction[] => {
  return apiTransactions.map(tx => ({
    id: tx.id,
    amount: tx.amount,
    type: tx.type as 'income' | 'expense',
    category: tx.categories?.name || '',
    date: new Date(tx.date),
    description: tx.description,
    status: tx.status as 'completed' | 'pending',
    settlementDate: tx.settlement_date ? new Date(tx.settlement_date) : undefined,
    financialInstitution: tx.institutions?.name,
    transactionType: tx.transaction_type as any,
  }));
};

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  filteredTransactions: [],
  isLoading: false,
  error: null,
  
  fetchTransactions: async (params?: TransactionApiParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await transactionService.fetchTransactions(params);
      const transactions = convertApiTransactions(response.data);
      set({ 
        transactions, 
        filteredTransactions: transactions,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  },
  
  applyFilters: (filters: TransactionFilterType) => {
    const { transactions } = get();
    
    let filtered = [...transactions];
    
    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.description.toLowerCase().includes(searchLower) || 
        tx.category.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.startDate) {
      filtered = filtered.filter(tx => tx.date >= new Date(filters.startDate as string));
    }
    
    if (filters.endDate) {
      filtered = filtered.filter(tx => tx.date <= new Date(filters.endDate as string));
    }
    
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(tx => filters.categories?.includes(tx.category));
    }
    
    if (filters.type) {
      filtered = filtered.filter(tx => tx.type === filters.type);
    }
    
    if (filters.status) {
      filtered = filtered.filter(tx => tx.status === filters.status);
    }
    
    if (filters.institution) {
      filtered = filtered.filter(tx => tx.financialInstitution === filters.institution);
    }
    
    set({ filteredTransactions: filtered });
  },
  
  addTransaction: async (transaction: Omit<Transaction, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const newTransaction = await transactionService.addTransaction(transaction);
      set(state => ({
        transactions: [...state.transactions, newTransaction],
        filteredTransactions: [...state.filteredTransactions, newTransaction],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding transaction:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  
  updateTransaction: async (transaction: Transaction) => {
    set({ isLoading: true, error: null });
    try {
      await transactionService.updateTransaction(transaction.id, transaction);
      set(state => ({
        transactions: state.transactions.map(t => t.id === transaction.id ? transaction : t),
        filteredTransactions: state.filteredTransactions.map(t => t.id === transaction.id ? transaction : t),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating transaction:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  
  deleteTransaction: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await transactionService.deleteTransaction(id);
      set(state => ({
        transactions: state.transactions.filter(t => t.id !== id),
        filteredTransactions: state.filteredTransactions.filter(t => t.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  
  calculateTotalIncome: (startDate: Date, endDate: Date) => {
    return get().transactions
      .filter(tx => 
        tx.type === 'income' && 
        tx.date >= startDate && 
        tx.date <= endDate
      )
      .reduce((sum, tx) => sum + tx.amount, 0);
  },
  
  calculateTotalExpenses: (startDate: Date, endDate: Date) => {
    return get().transactions
      .filter(tx => 
        tx.type === 'expense' && 
        tx.date >= startDate && 
        tx.date <= endDate
      )
      .reduce((sum, tx) => sum + tx.amount, 0);
  },
  
  calculateBalance: (startDate: Date, endDate: Date) => {
    const income = get().calculateTotalIncome(startDate, endDate);
    const expenses = get().calculateTotalExpenses(startDate, endDate);
    return income - expenses;
  },
  
  getTransactionsByCategory: (categoryName: string, startDate: Date, endDate: Date) => {
    return get().transactions.filter(tx => 
      tx.category === categoryName &&
      tx.date >= startDate && 
      tx.date <= endDate
    );
  }
}));
