import { create } from 'zustand';
import { Transaction, TransactionType, BankTransactionResponse } from '@/types/finance';
import { PaginatedResponse } from '@/types/transaction';
import * as transactionService from '@/services/transactionService';

interface TransactionsState {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  totalTransactions: number;
  totalPages: number;
  
  setTransactions: (transactions: Transaction[]) => void;
  setFilteredTransactions: (transactions: Transaction[]) => void;
  
  fetchTransactions: (params?: any) => Promise<void>;
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  calculateTotalIncome: (startDate?: Date, endDate?: Date) => number;
  calculateTotalExpenses: (startDate?: Date, endDate?: Date) => number;
  calculateBalance: (startDate?: Date, endDate?: Date) => number;
  getTransactionsByCategory: (categoryId: string) => Transaction[];
  formatCurrency: (amount: number) => string;
  
  expenseBreakdown: (startDate?: Date, endDate?: Date) => { category: string; amount: number; color: string; }[];
}

const initialPageSize = 10;

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  filteredTransactions: [],
  isLoading: false,
  error: null,
  page: 1,
  pageSize: initialPageSize,
  totalTransactions: 0,
  totalPages: 1,
  
  setTransactions: (transactions: Transaction[]) => set({ transactions }),
  setFilteredTransactions: (filteredTransactions: Transaction[]) => set({ filteredTransactions }),
  
  fetchTransactions: async (params?: any) => {
    set({ isLoading: true, error: null });
    try {
      const response: PaginatedResponse<BankTransactionResponse> = await transactionService.fetchTransactions(params);
      
      // Transform BankTransactionResponse to Transaction
      const transactions: Transaction[] = response.data.map(item => ({
        id: item.id,
        amount: item.amount,
        type: item.type as TransactionType,
        category: item.categories?.name || 'Uncategorized',
        date: new Date(item.date),
        description: item.description,
        status: item.status as 'completed' | 'pending',
        institution: item.institutions?.name || 'Unknown',
        dueDate: item.due_date ? new Date(item.due_date) : undefined,
        card: item.card_id || undefined,
      }));
      
      set({
        transactions,
        filteredTransactions: transactions,
        totalTransactions: response.total,
        totalPages: Math.ceil(response.total / initialPageSize),
        isLoading: false,
        page: params?.page || 1,
        pageSize: params?.pageSize || initialPageSize,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch transactions'
      });
    }
  },
  
  calculateTotalIncome: (startDate?: Date, endDate?: Date) => {
    return get().transactions
      .filter(transaction => transaction.type === 'income' &&
                             (!startDate || transaction.date >= startDate) &&
                             (!endDate || transaction.date <= endDate))
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  },
  
  calculateTotalExpenses: (startDate?: Date, endDate?: Date) => {
    return get().transactions
      .filter(transaction => transaction.type === 'expense' &&
                             (!startDate || transaction.date >= startDate) &&
                             (!endDate || transaction.date <= endDate))
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  },
  
  calculateBalance: (startDate?: Date, endDate?: Date) => {
    const totalIncome = get().calculateTotalIncome(startDate, endDate);
    const totalExpenses = get().calculateTotalExpenses(startDate, endDate);
    return totalIncome - totalExpenses;
  },
  
  getTransactionsByCategory: (categoryId: string) => {
    return get().transactions.filter(transaction => transaction.category === categoryId);
  },
  
  formatCurrency: (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  },
  
  expenseBreakdown: (startDate?: Date, endDate?: Date) => {
    const expenses = get().transactions.filter(transaction => transaction.type === 'expense' &&
                                                              (!startDate || transaction.date >= startDate) &&
                                                              (!endDate || transaction.date <= endDate));
    
    const categoryTotals: { [category: string]: number } = {};
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    
    const breakdown = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16) // Generate random color
    }));
    
    return breakdown;
  },
  
  addTransaction: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    try {
      // Converter para o formato esperado pela API
      const apiTransaction = {
        amount: transaction.amount,
        type: transaction.type,
        category_id: transaction.category,
        subcategory_id: transaction.subcategory,
        date: transaction.date,
        description: transaction.description,
        status: transaction.status || 'completed', // Valor padrão
        institution_id: transaction.institution,
        card_id: transaction.card,
      };
      
      const response = await transactionService.addTransaction(apiTransaction);
      
      // Converter de volta para o formato usado na aplicação
      const newTransaction: Transaction = {
        id: response.id,
        amount: response.amount,
        type: response.type as TransactionType,
        category: response.category || '',
        subcategory: response.subcategory || undefined,
        date: new Date(response.date),
        description: response.description,
        status: response.status as 'completed' | 'pending',
        institution: response.institution || undefined,
        dueDate: transaction.dueDate,
        card: transaction.card
      };
      
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },
  
  updateTransaction: async (id: string, transaction: Partial<Transaction>): Promise<void> => {
    try {
      await transactionService.updateTransaction(id, transaction);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },
  
  deleteTransaction: async (id: string): Promise<void> => {
    try {
      await transactionService.deleteTransaction(id);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }
}));
