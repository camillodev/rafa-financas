
import { create } from 'zustand';
import { addTransaction, updateTransaction, deleteTransaction } from '@/services/transactionService';
import { Transaction, TransactionType } from '@/types/finance';
import { TransactionFilterType } from '@/types/transaction';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface TransactionsState {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  filter: TransactionFilterType | null;

  // Actions
  setTransactions: (transactions: Transaction[]) => void;
  setFilter: (filter: TransactionFilterType | null) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  clearFilters: () => void;

  // Calculations
  calculateTotalIncome: (startDate?: Date, endDate?: Date) => number;
  calculateTotalExpenses: (startDate?: Date, endDate?: Date) => number;
  calculateBalance: (startDate?: Date, endDate?: Date) => number;
  getTransactionsByCategory: (
    categoryId: string,
    startDate?: Date,
    endDate?: Date
  ) => Transaction[];
  formatCurrency: (value: number) => string;
}

// Função de utilidade para converter strings para os tipos corretos
const ensureCorrectTypes = (transaction: any): Transaction => {
  return {
    ...transaction,
    type: transaction.type as TransactionType,
    status: transaction.status as 'completed' | 'pending',
    amount: Number(transaction.amount),
    date: new Date(transaction.date)
  };
};

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  filteredTransactions: [],
  isLoading: false,
  error: null,
  filter: null,

  setTransactions: (transactions) => {
    const typedTransactions = transactions.map(ensureCorrectTypes);
    set({ 
      transactions: typedTransactions, 
      filteredTransactions: typedTransactions 
    });
  },

  setFilter: (filter) => {
    set({ filter });
    
    if (!filter) {
      set(state => ({ filteredTransactions: state.transactions }));
      return;
    }

    set(state => {
      let filtered = [...state.transactions];

      // Filter by date range
      if (filter.startDate) {
        filtered = filtered.filter(t => new Date(t.date) >= filter.startDate!);
      }
      
      if (filter.endDate) {
        filtered = filtered.filter(t => new Date(t.date) <= filter.endDate!);
      }

      // Filter by categories
      if (filter.categories && filter.categories.length > 0) {
        filtered = filtered.filter(t => filter.categories!.includes(t.categoryId));
      }

      // Filter by type
      if (filter.type) {
        filtered = filtered.filter(t => t.type === filter.type);
      }

      // Filter by status
      if (filter.status) {
        filtered = filtered.filter(t => t.status === filter.status);
      }

      // Filter by institution
      if (filter.institution) {
        filtered = filtered.filter(t => t.institutionId === filter.institution);
      }
      
      // Filter by card
      if (filter.card) {
        filtered = filtered.filter(t => t.card === filter.card);
      }
      
      // Filter by search term
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filtered = filtered.filter(
          t => 
            t.description.toLowerCase().includes(searchLower) || 
            (t.category && t.category.toLowerCase().includes(searchLower))
        );
      }

      return { filteredTransactions: filtered };
    });
  },

  addTransaction: async (transaction) => {
    try {
      set({ isLoading: true });
      const result = await addTransaction(transaction);
      set(state => ({
        transactions: [...state.transactions, { ...transaction, id: result.id }],
        filteredTransactions: [...state.filteredTransactions, { ...transaction, id: result.id }],
        isLoading: false,
      }));
      toast.success('Transação adicionada com sucesso!');
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
      toast.error('Erro ao adicionar transação.');
    }
  },

  updateTransaction: async (transaction) => {
    try {
      set({ isLoading: true });
      await updateTransaction(transaction);
      
      set(state => {
        const updatedTransactions = state.transactions.map(t => 
          t.id === transaction.id ? transaction : t
        );
        
        // Apply the current filter to the updated transactions
        let updatedFilteredTransactions = updatedTransactions;
        if (state.filter) {
          get().setFilter(state.filter);
          // We'll use the filtered transactions set by setFilter
          return { 
            transactions: updatedTransactions,
            isLoading: false 
          };
        }
        
        return {
          transactions: updatedTransactions,
          filteredTransactions: updatedFilteredTransactions,
          isLoading: false,
        };
      });
      
      toast.success('Transação atualizada com sucesso!');
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
      toast.error('Erro ao atualizar transação.');
    }
  },

  deleteTransaction: async (id) => {
    try {
      set({ isLoading: true });
      await deleteTransaction(id);
      
      set(state => ({
        transactions: state.transactions.filter(t => t.id !== id),
        filteredTransactions: state.filteredTransactions.filter(t => t.id !== id),
        isLoading: false,
      }));
      
      toast.success('Transação excluída com sucesso!');
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
      toast.error('Erro ao excluir transação.');
    }
  },

  clearFilters: () => {
    set(state => ({
      filter: null,
      filteredTransactions: state.transactions,
    }));
  },

  calculateTotalIncome: (startDate, endDate) => {
    const { transactions } = get();
    
    return transactions
      .filter(t => t.type === 'income')
      .filter(t => {
        const date = new Date(t.date);
        if (startDate && date < startDate) return false;
        if (endDate && date > endDate) return false;
        return true;
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  },

  calculateTotalExpenses: (startDate, endDate) => {
    const { transactions } = get();
    
    return transactions
      .filter(t => t.type === 'expense')
      .filter(t => {
        const date = new Date(t.date);
        if (startDate && date < startDate) return false;
        if (endDate && date > endDate) return false;
        return true;
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  },

  calculateBalance: (startDate, endDate) => {
    const income = get().calculateTotalIncome(startDate, endDate);
    const expenses = get().calculateTotalExpenses(startDate, endDate);
    return income - expenses;
  },

  getTransactionsByCategory: (categoryId, startDate, endDate) => {
    const { transactions } = get();
    
    return transactions
      .filter(t => t.categoryId === categoryId)
      .filter(t => {
        const date = new Date(t.date);
        if (startDate && date < startDate) return false;
        if (endDate && date > endDate) return false;
        return true;
      });
  },

  formatCurrency: (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}));
