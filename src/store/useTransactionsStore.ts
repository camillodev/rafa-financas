import { create } from 'zustand';
import { format } from 'date-fns';
import * as transactionService from '@/services/transactionService';
import { Transaction, BankTransactionResponse } from '@/types/finance';
import { TransactionFilterType, TransactionApiParams } from '@/types/transaction';
import { TransactionsState } from '@/types/transactions';

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  filteredTransactions: [],
  isLoading: false,
  error: null,
  
  // Fetch operations
  fetchTransactions: async (params?: TransactionApiParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await transactionService.fetchTransactions(params);

      // Map API response to our internal Transaction type
      const transactions = response.data.map((item: BankTransactionResponse): Transaction => ({
        id: item.id,
        amount: item.amount,
        date: new Date(item.date),
        description: item.description,
        type: item.type,
        category: item.categories.name,
        categoryId: item.category_id,
        institution: item.institutions.name,
        institutionId: item.institution_id,
        status: item.status,
        isActive: item.is_active
      }));

      set({ 
        transactions, 
        filteredTransactions: transactions,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch transactions',
        isLoading: false 
      });
    }
  },
  
  applyFilters: (filters: TransactionFilterType) => {
    const { transactions } = get();
    
    let filtered = [...transactions];
    
    // Apply category filter
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(transaction =>
        filters.categories.includes(transaction.categoryId)
      );
    }
    
    // Apply date range filter
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);

      filtered = filtered.filter(transaction => {
        const date = new Date(transaction.date);
        return date >= start && date <= end;
      });
    }
    
    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(transaction =>
        transaction.type === filters.type
      );
    }
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchLower) ||
        transaction.category.toLowerCase().includes(searchLower)
      );
    }
    
    set({ filteredTransactions: filtered });
  },
  
  // CRUD operations
  addTransaction: async (transaction: Omit<Transaction, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      // Transform to API format
      const apiTransaction = {
        amount: transaction.amount,
        date: format(transaction.date, 'yyyy-MM-dd'),
        description: transaction.description,
        type: transaction.type,
        category_id: transaction.categoryId,
        institution_id: transaction.institutionId,
        status: transaction.status || 'completed'
      };

      const newTransaction = await transactionService.createTransaction(apiTransaction);

      set(state => ({
        transactions: [...state.transactions, {
          ...transaction,
          id: newTransaction.id
        } as Transaction],
        filteredTransactions: [...state.filteredTransactions, {
          ...transaction,
          id: newTransaction.id
        } as Transaction],
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add transaction',
        isLoading: false 
      });
    }
  },
  
  updateTransaction: async (transaction: Transaction) => {
    set({ isLoading: true, error: null });
    try {
      // Transform to API format
      const apiTransaction = {
        id: transaction.id,
        amount: transaction.amount,
        date: format(transaction.date, 'yyyy-MM-dd'),
        description: transaction.description,
        type: transaction.type,
        category_id: transaction.categoryId,
        institution_id: transaction.institutionId,
        status: transaction.status
      };

      await transactionService.updateTransaction(apiTransaction);

      set(state => {
        const updatedTransactions = state.transactions.map(t =>
          t.id === transaction.id ? transaction : t
        );

        const updatedFilteredTransactions = state.filteredTransactions.map(t =>
          t.id === transaction.id ? transaction : t
        );

        return {
          transactions: updatedTransactions,
          filteredTransactions: updatedFilteredTransactions,
          isLoading: false
        };
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update transaction',
        isLoading: false 
      });
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
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete transaction',
        isLoading: false 
      });
    }
  },
  
  // Calculations
  calculateTotalIncome: (startDate: Date, endDate: Date) => {
    const { transactions } = get();

    return transactions
      .filter(transaction => {
        const date = new Date(transaction.date);
        return (
          transaction.type === 'income' &&
          date >= startDate &&
          date <= endDate
        );
      })
      .reduce((total, transaction) => total + transaction.amount, 0);
  },
  
  calculateTotalExpenses: (startDate: Date, endDate: Date) => {
    const { transactions } = get();

    return transactions
      .filter(transaction => {
        const date = new Date(transaction.date);
        return (
          transaction.type === 'expense' &&
          date >= startDate &&
          date <= endDate
        );
      })
      .reduce((total, transaction) => total + transaction.amount, 0);
  },
  
  calculateBalance: (startDate: Date, endDate: Date) => {
    const income = get().calculateTotalIncome(startDate, endDate);
    const expenses = get().calculateTotalExpenses(startDate, endDate);
    return income - expenses;
  },
  
  getTransactionsByCategory: (categoryName: string, startDate: Date, endDate: Date) => {
    const { transactions } = get();

    return transactions.filter(transaction => {
      const date = new Date(transaction.date);
      return (
        transaction.category === categoryName &&
        date >= startDate &&
        date <= endDate
      );
    });
  },

  formatCurrency: (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}));
