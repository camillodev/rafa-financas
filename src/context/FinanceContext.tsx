
import React, { createContext, useContext, useState, useEffect } from 'react';
import { addMonths, subMonths, format, getYear, getMonth, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { 
  Transaction, 
  Category, 
  CreditCard, 
  FinancialInstitution, 
  Budget, 
  TransactionType,
  Goal
} from '@/types/finance';

// Import service functions
import { 
  fetchCategories, 
  addCategory,
  updateCategory,
  deleteCategory
} from '@/services/categoryService';

import {
  fetchTransactions,
  addTransaction,
  updateTransaction as updateTransactionService,
  deleteTransaction as deleteTransactionService
} from '@/services/transactionService';

import {
  fetchInstitutions,
  addInstitution,
  updateInstitution,
  deleteInstitution
} from '@/services/institutionService';

import {
  fetchCards,
  addCard,
  updateCard,
  deleteCard
} from '@/services/cardService';

import {
  fetchBudgets,
  fetchBudgetsByMonth,
  addBudget,
  updateBudget,
  deleteBudget
} from '@/services/budgetService';

import {
  fetchGoals,
  addGoal,
  updateGoal,
  deleteGoal
} from '@/services/goalService';

// Interfaces and Types
export type TransactionFilterType = 'all' | 'income' | 'expense';

type FinanceContextType = {
  transactions: Transaction[];
  categories: Category[];
  creditCards: CreditCard[];
  financialInstitutions: FinancialInstitution[];
  budgets: Budget[];
  goals: Goal[];
  filteredTransactions: Transaction[];
  currentDate: Date;
  formatCurrency: (value: number) => string;
  navigateToPreviousMonth: () => void;
  navigateToNextMonth: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addFinancialInstitution: (institution: Omit<FinancialInstitution, 'id'>) => void;
  updateFinancialInstitution: (id: string, institution: Partial<FinancialInstitution>) => void;
  deleteFinancialInstitution: (id: string) => void;
  addCreditCard: (card: Omit<CreditCard, 'id'>) => void;
  updateCreditCard: (id: string, card: Partial<CreditCard>) => void;
  deleteCreditCard: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  getBudgetByCategory: (categoryId: string) => Budget | undefined;
  getMonthlyTotals: () => { income: number; expense: number; balance: number };
  getCategoryTotal: (categoryId: string, type: TransactionType) => number;
};

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [financialInstitutions, setFinancialInstitutions] = useState<FinancialInstitution[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on initial load and when date changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch all data
        const categoriesData = await fetchCategories();
        const institutionsData = await fetchInstitutions();
        const cardsData = await fetchCards();
        const goalsData = await fetchGoals();
        
        setCategories(categoriesData);
        setFinancialInstitutions(institutionsData);
        setCreditCards(cardsData);
        setGoals(goalsData);
        
        // Fetch date-specific data
        const year = getYear(currentDate);
        const month = getMonth(currentDate) + 1; // JS months are 0-indexed
        
        const transactionsData = await fetchTransactions({
          startDate: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(currentDate), 'yyyy-MM-dd')
        });
        
        const budgetsData = await fetchBudgetsByMonth(month, year);
        
        setTransactions(transactionsData.data || []);
        setBudgets(budgetsData || []);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [currentDate]);

  // Filtered transactions for the current month
  const filteredTransactions = transactions;

  // Format currency for display
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Navigation
  const navigateToPreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const navigateToNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  // Transactions CRUD
  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const newTransaction = await addTransaction(transaction);
      setTransactions(prev => [newTransaction, ...prev]);
      toast.success("Transação adicionada com sucesso");
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Erro ao adicionar transação");
    }
  };

  const handleUpdateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    try {
      const updatedTransaction = await updateTransactionService(id, transaction);
      setTransactions(prev => 
        prev.map(t => t.id === id ? { ...t, ...updatedTransaction } : t)
      );
      toast.success("Transação atualizada com sucesso");
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Erro ao atualizar transação");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransactionService(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success("Transação excluída com sucesso");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Erro ao excluir transação");
    }
  };

  // Categories CRUD
  const handleAddCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const newCategory = await addCategory(category);
      setCategories(prev => [...prev, newCategory]);
      toast.success("Categoria adicionada com sucesso");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Erro ao adicionar categoria");
    }
  };

  const handleUpdateCategory = async (id: string, category: Partial<Category>) => {
    try {
      const updatedCategory = await updateCategory(id, category);
      setCategories(prev => 
        prev.map(c => c.id === id ? { ...c, ...updatedCategory } : c)
      );
      toast.success("Categoria atualizada com sucesso");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Erro ao atualizar categoria");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success("Categoria excluída com sucesso");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Erro ao excluir categoria");
    }
  };

  // Financial Institutions CRUD
  const handleAddFinancialInstitution = async (institution: Omit<FinancialInstitution, 'id'>) => {
    try {
      const newInstitution = await addInstitution(institution);
      setFinancialInstitutions(prev => [...prev, newInstitution]);
      toast.success("Instituição adicionada com sucesso");
    } catch (error) {
      console.error("Error adding institution:", error);
      toast.error("Erro ao adicionar instituição");
    }
  };

  const handleUpdateFinancialInstitution = async (id: string, institution: Partial<FinancialInstitution>) => {
    try {
      const updatedInstitution = await updateInstitution(id, institution);
      setFinancialInstitutions(prev => 
        prev.map(i => i.id === id ? { ...i, ...updatedInstitution } : i)
      );
      toast.success("Instituição atualizada com sucesso");
    } catch (error) {
      console.error("Error updating institution:", error);
      toast.error("Erro ao atualizar instituição");
    }
  };

  const handleDeleteFinancialInstitution = async (id: string) => {
    try {
      await deleteInstitution(id);
      setFinancialInstitutions(prev => prev.filter(i => i.id !== id));
      toast.success("Instituição excluída com sucesso");
    } catch (error) {
      console.error("Error deleting institution:", error);
      toast.error("Erro ao excluir instituição");
    }
  };

  // Credit Cards CRUD
  const handleAddCreditCard = async (card: Omit<CreditCard, 'id'>) => {
    try {
      const newCard = await addCard(card);
      setCreditCards(prev => [...prev, newCard]);
      toast.success("Cartão adicionado com sucesso");
    } catch (error) {
      console.error("Error adding card:", error);
      toast.error("Erro ao adicionar cartão");
    }
  };

  const handleUpdateCreditCard = async (id: string, card: Partial<CreditCard>) => {
    try {
      const updatedCard = await updateCard(id, card);
      setCreditCards(prev => 
        prev.map(c => c.id === id ? { ...c, ...updatedCard } : c)
      );
      toast.success("Cartão atualizado com sucesso");
    } catch (error) {
      console.error("Error updating card:", error);
      toast.error("Erro ao atualizar cartão");
    }
  };

  const handleDeleteCreditCard = async (id: string) => {
    try {
      await deleteCard(id);
      setCreditCards(prev => prev.filter(c => c.id !== id));
      toast.success("Cartão excluído com sucesso");
    } catch (error) {
      console.error("Error deleting card:", error);
      toast.error("Erro ao excluir cartão");
    }
  };

  // Budgets CRUD
  const handleAddBudget = async (budget: Omit<Budget, 'id'>) => {
    try {
      const newBudget = await addBudget(budget);
      setBudgets(prev => [...prev, newBudget]);
      toast.success("Orçamento adicionado com sucesso");
    } catch (error) {
      console.error("Error adding budget:", error);
      toast.error("Erro ao adicionar orçamento");
    }
  };

  const handleUpdateBudget = async (id: string, budget: Partial<Budget>) => {
    try {
      const updatedBudget = await updateBudget(id, budget);
      setBudgets(prev => 
        prev.map(b => b.id === id ? { ...b, ...updatedBudget } : b)
      );
      toast.success("Orçamento atualizado com sucesso");
    } catch (error) {
      console.error("Error updating budget:", error);
      toast.error("Erro ao atualizar orçamento");
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await deleteBudget(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
      toast.success("Orçamento excluído com sucesso");
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error("Erro ao excluir orçamento");
    }
  };

  // Goals CRUD
  const handleAddGoal = async (goal: Omit<Goal, 'id'>) => {
    try {
      const newGoal = await addGoal(goal);
      setGoals(prev => [...prev, newGoal]);
      toast.success("Meta adicionada com sucesso");
    } catch (error) {
      console.error("Error adding goal:", error);
      toast.error("Erro ao adicionar meta");
    }
  };

  const handleUpdateGoal = async (id: string, goal: Partial<Goal>) => {
    try {
      const updatedGoal = await updateGoal(id, goal);
      setGoals(prev => 
        prev.map(g => g.id === id ? { ...g, ...updatedGoal } : g)
      );
      toast.success("Meta atualizada com sucesso");
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error("Erro ao atualizar meta");
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteGoal(id);
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success("Meta excluída com sucesso");
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Erro ao excluir meta");
    }
  };

  // Helper function to get budget for a specific category
  const getBudgetByCategory = (categoryId: string): Budget | undefined => {
    const currentMonth = getMonth(currentDate) + 1;
    const currentYear = getYear(currentDate);
    
    return budgets.find(
      budget => 
        budget.category === categoryId && 
        budget.month === currentMonth && 
        budget.year === currentYear
    );
  };

  // Calculate monthly totals
  const getMonthlyTotals = () => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      income,
      expense,
      balance: income - expense
    };
  };

  // Calculate total for a specific category
  const getCategoryTotal = (categoryId: string, type: TransactionType) => {
    return filteredTransactions
      .filter(t => t.category === categoryId && t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const contextValue: FinanceContextType = {
    transactions,
    categories,
    creditCards,
    financialInstitutions,
    budgets,
    goals,
    filteredTransactions,
    currentDate,
    formatCurrency,
    navigateToPreviousMonth,
    navigateToNextMonth,
    addTransaction: handleAddTransaction,
    updateTransaction: handleUpdateTransaction,
    deleteTransaction: handleDeleteTransaction,
    addCategory: handleAddCategory,
    updateCategory: handleUpdateCategory,
    deleteCategory: handleDeleteCategory,
    addFinancialInstitution: handleAddFinancialInstitution,
    updateFinancialInstitution: handleUpdateFinancialInstitution,
    deleteFinancialInstitution: handleDeleteFinancialInstitution,
    addCreditCard: handleAddCreditCard,
    updateCreditCard: handleUpdateCreditCard,
    deleteCreditCard: handleDeleteCreditCard,
    addBudget: handleAddBudget,
    updateBudget: handleUpdateBudget,
    deleteBudget: handleDeleteBudget,
    addGoal: handleAddGoal,
    updateGoal: handleUpdateGoal,
    deleteGoal: handleDeleteGoal,
    getBudgetByCategory,
    getMonthlyTotals,
    getCategoryTotal
  };

  return (
    <FinanceContext.Provider value={contextValue}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
