
import { BudgetGoal, BudgetResponse } from '@/types/finance';

// Define the base API URL
const API_URL = 'https://api.example.com';

// Fetch budgets for a specific month and year
export const fetchBudgets = async (month: number, year: number): Promise<BudgetResponse[]> => {
  // Mock data for development
  const mockBudgets: BudgetResponse[] = [
    {
      id: '1',
      amount: 1000,
      month: 5,
      year: 2023,
      category_id: '1',
      user_id: '1',
      created_at: '2023-04-30',
      updated_at: '2023-04-30',
      categories: {
        name: 'Alimentação',
        color: '#FF6B6B',
        icon: 'utensils',
        type: 'expense'
      }
    },
    {
      id: '2',
      amount: 500,
      month: 5,
      year: 2023,
      category_id: '2',
      user_id: '1',
      created_at: '2023-04-30',
      updated_at: '2023-04-30',
      categories: {
        name: 'Transporte',
        color: '#4ECDC4',
        icon: 'car',
        type: 'expense'
      }
    },
    {
      id: '3',
      amount: 800,
      month: 5,
      year: 2023,
      category_id: '3',
      user_id: '1',
      created_at: '2023-04-30',
      updated_at: '2023-04-30',
      categories: {
        name: 'Moradia',
        color: '#C7F464',
        icon: 'home',
        type: 'expense'
      }
    }
  ];

  // Filter by month and year
  const filteredBudgets = mockBudgets.filter(
    b => b.month === month && b.year === year
  );

  return Promise.resolve(filteredBudgets);
};

// Add a new budget
export const addBudget = async (budget: Omit<BudgetGoal, 'id'>): Promise<BudgetGoal> => {
  // Mock implementation
  const newBudget: BudgetGoal = {
    id: Math.random().toString(36).substring(7),
    ...budget
  };
  
  return Promise.resolve(newBudget);
};

// Update an existing budget
export const updateBudget = async (id: string, budget: Partial<BudgetGoal>): Promise<void> => {
  // Mock implementation - in a real app this would make an API call
  return Promise.resolve();
};

// Delete a budget
export const deleteBudget = async (id: string): Promise<void> => {
  // Mock implementation - in a real app this would make an API call
  return Promise.resolve();
};
