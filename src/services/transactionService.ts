import { Transaction, BankTransactionResponse } from '@/types/finance';
import { TransactionApiParams } from '@/types/transaction';
import { PaginatedResponse } from '@/types/finance';

// Define the base API URL
const API_URL = 'https://api.example.com';

// Fetch transactions with optional filtering
export const fetchTransactions = async (params?: TransactionApiParams): Promise<PaginatedResponse<BankTransactionResponse>> => {
  // Mock data for development
  const mockTransactions: BankTransactionResponse[] = [
    {
      id: '1',
      amount: 2500,
      date: '2023-05-01',
      description: 'Salário',
      status: 'completed',
      transaction_type: 'income',
      category_id: '5',
      institution_id: '1',
      user_id: '1',
      created_at: '2023-05-01',
      updated_at: '2023-05-01',
      type: 'income',
      is_active: true,
      categories: {
        name: 'Salário',
        color: '#2EC4B6',
        icon: 'briefcase',
        type: 'income'
      },
      institutions: {
        name: 'Nubank',
        logo: 'nubank.png'
      }
    },
    {
      id: '2',
      amount: 150,
      date: '2023-05-05',
      description: 'Supermercado',
      status: 'completed',
      transaction_type: 'expense',
      category_id: '1',
      institution_id: '1',
      user_id: '1',
      created_at: '2023-05-05',
      updated_at: '2023-05-05',
      type: 'expense',
      is_active: true,
      categories: {
        name: 'Alimentação',
        color: '#FF6B6B',
        icon: 'utensils',
        type: 'expense'
      },
      institutions: {
        name: 'Nubank',
        logo: 'nubank.png'
      }
    },
    {
      id: '3',
      amount: 300,
      date: '2023-05-10',
      description: 'Aluguel',
      status: 'pending',
      transaction_type: 'expense',
      category_id: '3',
      institution_id: '2',
      user_id: '1',
      created_at: '2023-05-10',
      updated_at: '2023-05-10',
      type: 'expense',
      is_active: true,
      categories: {
        name: 'Moradia',
        color: '#C7F464',
        icon: 'home',
        type: 'expense'
      },
      institutions: {
        name: 'Itaú',
        logo: 'itau.png'
      }
    }
  ];

  const {
    page = 1,
    pageSize = 10,
    startDate,
    endDate,
    category_id,
    institution_id,
    card_id,
    transaction_type,
    status,
    search
  } = params || {};

  // Simple filtering based on date range if provided
  let filteredTransactions = [...mockTransactions];
  
  if (params?.startDate) {
    filteredTransactions = filteredTransactions.filter(
      t => new Date(t.date) >= new Date(params.startDate as string)
    );
  }
  
  if (params?.endDate) {
    filteredTransactions = filteredTransactions.filter(
      t => new Date(t.date) <= new Date(params.endDate as string)
    );
  }

  const data = filteredTransactions.slice((page - 1) * pageSize, page * pageSize);
  const count = filteredTransactions.length;

  // Ajustar o retorno para incluir todos os campos necessários
  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize,
    total: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
};

// Add a new transaction
export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  // Mock implementation
  const newTransaction: Transaction = {
    id: Math.random().toString(36).substring(7),
    ...transaction
  };
  
  return Promise.resolve(newTransaction);
};

// Update an existing transaction
export const updateTransaction = async (id: string, transaction: Partial<Transaction>): Promise<void> => {
  // Mock implementation - in a real app this would make an API call
  return Promise.resolve();
};

// Delete a transaction
export const deleteTransaction = async (id: string): Promise<void> => {
  // Mock implementation - in a real app this would make an API call
  return Promise.resolve();
};
