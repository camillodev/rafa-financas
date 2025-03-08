
import { Transaction, Category, BudgetGoal, FinancialSummary } from '../types/finance';

// Categories
export const categories: Category[] = [
  { id: '1', name: 'Salary', icon: 'briefcase', color: '#38bdf8', type: 'income' },
  { id: '2', name: 'Investments', icon: 'trending-up', color: '#4ade80', type: 'income' },
  { id: '3', name: 'Gifts', icon: 'gift', color: '#a78bfa', type: 'income' },
  { id: '4', name: 'Housing', icon: 'home', color: '#f97316', type: 'expense' },
  { id: '5', name: 'Food', icon: 'utensils', color: '#f43f5e', type: 'expense' },
  { id: '6', name: 'Transportation', icon: 'car', color: '#10b981', type: 'expense' },
  { id: '7', name: 'Entertainment', icon: 'film', color: '#8b5cf6', type: 'expense' },
  { id: '8', name: 'Shopping', icon: 'shopping-bag', color: '#ec4899', type: 'expense' },
  { id: '9', name: 'Utilities', icon: 'zap', color: '#06b6d4', type: 'expense' },
  { id: '10', name: 'Healthcare', icon: 'activity', color: '#14b8a6', type: 'expense' },
  { id: '11', name: 'Education', icon: 'book', color: '#6366f1', type: 'expense' },
  { id: '12', name: 'Subscriptions', icon: 'repeat', color: '#f59e0b', type: 'expense' },
];

// Transactions
export const transactions: Transaction[] = [
  {
    id: 't1',
    amount: 8500,
    type: 'income',
    category: 'Salary',
    date: new Date(2023, 7, 1),
    description: 'Monthly salary',
    paymentMethod: 'Bank transfer',
    status: 'completed'
  },
  {
    id: 't2',
    amount: 2500,
    type: 'expense',
    category: 'Housing',
    subcategory: 'Rent',
    date: new Date(2023, 7, 5),
    description: 'Monthly rent',
    paymentMethod: 'Bank transfer',
    status: 'completed'
  },
  {
    id: 't3',
    amount: 120,
    type: 'expense',
    category: 'Utilities',
    subcategory: 'Electricity',
    date: new Date(2023, 7, 10),
    description: 'Electricity bill',
    paymentMethod: 'Credit card',
    status: 'completed'
  },
  {
    id: 't4',
    amount: 350,
    type: 'expense',
    category: 'Food',
    subcategory: 'Groceries',
    date: new Date(2023, 7, 12),
    description: 'Weekly grocery shopping',
    paymentMethod: 'Credit card',
    status: 'completed'
  },
  {
    id: 't5',
    amount: 45,
    type: 'expense',
    category: 'Transportation',
    subcategory: 'Fuel',
    date: new Date(2023, 7, 15),
    description: 'Gas for car',
    paymentMethod: 'Debit card',
    status: 'completed'
  },
  {
    id: 't6',
    amount: 25,
    type: 'expense',
    category: 'Subscriptions',
    subcategory: 'Streaming',
    date: new Date(2023, 7, 15),
    description: 'Netflix subscription',
    paymentMethod: 'Credit card',
    status: 'completed'
  },
  {
    id: 't7',
    amount: 80,
    type: 'expense',
    category: 'Entertainment',
    subcategory: 'Dining out',
    date: new Date(2023, 7, 18),
    description: 'Dinner with friends',
    paymentMethod: 'Credit card',
    status: 'completed'
  },
  {
    id: 't8',
    amount: 200,
    type: 'expense',
    category: 'Shopping',
    subcategory: 'Clothing',
    date: new Date(2023, 7, 20),
    description: 'New shoes',
    paymentMethod: 'Credit card',
    status: 'completed'
  },
  {
    id: 't9',
    amount: 1000,
    type: 'income',
    category: 'Investments',
    date: new Date(2023, 7, 22),
    description: 'Stock dividends',
    paymentMethod: 'Bank transfer',
    status: 'completed'
  },
  {
    id: 't10',
    amount: 150,
    type: 'expense',
    category: 'Healthcare',
    subcategory: 'Doctor',
    date: new Date(2023, 7, 25),
    description: 'Doctor appointment',
    paymentMethod: 'Health insurance',
    status: 'completed'
  },
];

// Budget goals
export const budgetGoals: BudgetGoal[] = [
  { category: 'Housing', amount: 2500, spent: 2500, period: 'monthly' },
  { category: 'Food', amount: 600, spent: 450, period: 'monthly' },
  { category: 'Transportation', amount: 200, spent: 150, period: 'monthly' },
  { category: 'Entertainment', amount: 200, spent: 180, period: 'monthly' },
  { category: 'Shopping', amount: 300, spent: 250, period: 'monthly' },
  { category: 'Utilities', amount: 300, spent: 280, period: 'monthly' },
  { category: 'Healthcare', amount: 200, spent: 150, period: 'monthly' },
  { category: 'Education', amount: 100, spent: 0, period: 'monthly' },
  { category: 'Subscriptions', amount: 50, spent: 25, period: 'monthly' },
];

// Financial summary
export const financialSummary: FinancialSummary = {
  totalIncome: 9500,
  totalExpenses: 3950,
  netBalance: 5550,
  savingsGoal: 3000,
  savingsProgress: 2550,
};

// Monthly data for charts
export const monthlyData = [
  { month: 'Jan', income: 8500, expenses: 4200 },
  { month: 'Feb', income: 8500, expenses: 4100 },
  { month: 'Mar', income: 8700, expenses: 4300 },
  { month: 'Apr', income: 8500, expenses: 4150 },
  { month: 'May', income: 8500, expenses: 4250 },
  { month: 'Jun', income: 9200, expenses: 4400 },
  { month: 'Jul', income: 9500, expenses: 3950 },
  { month: 'Aug', income: 0, expenses: 0 },
  { month: 'Sep', income: 0, expenses: 0 },
  { month: 'Oct', income: 0, expenses: 0 },
  { month: 'Nov', income: 0, expenses: 0 },
  { month: 'Dec', income: 0, expenses: 0 },
];

// Category breakdown for charts
export const expenseBreakdown = [
  { category: 'Housing', value: 2500, color: '#f97316' },
  { category: 'Food', value: 450, color: '#f43f5e' },
  { category: 'Transportation', value: 150, color: '#10b981' },
  { category: 'Entertainment', value: 180, color: '#8b5cf6' },
  { category: 'Shopping', value: 250, color: '#ec4899' },
  { category: 'Utilities', value: 280, color: '#06b6d4' },
  { category: 'Healthcare', value: 150, color: '#14b8a6' },
  { category: 'Education', value: 0, color: '#6366f1' },
  { category: 'Subscriptions', value: 25, color: '#f59e0b' },
];
