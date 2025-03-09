
import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { 
  transactions as initialTransactions, 
  categories as initialCategories, 
  budgetGoals as initialBudgetGoals,
  financialSummary as initialFinancialSummary,
  monthlyData as initialMonthlyData,
  expenseBreakdown as initialExpenseBreakdown,
  financialInstitutions as initialFinancialInstitutions,
  creditCards as initialCreditCards,
  subcategories as initialSubcategories
} from '../data/mockData';
import { Transaction, Category, BudgetGoal, FinancialSummary, FinancialInstitution, CreditCard, Subcategory } from '../types/finance';
import { useNavigate } from 'react-router-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { toast } from "sonner";

export type TransactionFilterType = 'all' | 'income' | 'expense';

interface FinanceContextType {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  categories: Category[];
  subcategories: Subcategory[];
  budgetGoals: BudgetGoal[];
  financialSummary: FinancialSummary;
  monthlyData: Array<{ month: string; income: number; expenses: number }>;
  expenseBreakdown: Array<{ category: string; value: number; color: string }>;
  financialInstitutions: FinancialInstitution[];
  creditCards: CreditCard[];
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  navigateToPreviousMonth: () => void;
  navigateToNextMonth: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  formatCurrency: (value: number) => string;
  navigateToTransactions: (filter?: TransactionFilterType, institutionId?: string, cardId?: string) => void;
  hasDataForCurrentMonth: boolean;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addSubcategory: (subcategory: Omit<Subcategory, 'id'>) => void;
  updateSubcategory: (id: string, subcategory: Partial<Subcategory>) => void;
  deleteSubcategory: (id: string) => void;
  addFinancialInstitution: (institution: Omit<FinancialInstitution, 'id'>) => void;
  updateFinancialInstitution: (id: string, institution: Partial<FinancialInstitution>) => void;
  deleteFinancialInstitution: (id: string) => void;
  addCreditCard: (card: Omit<CreditCard, 'id'>) => void;
  updateCreditCard: (id: string, card: Partial<CreditCard>) => void;
  deleteCreditCard: (id: string) => void;
  selectedCategories: string[];
  toggleCategorySelection: (categoryId: string) => void;
  resetCategorySelection: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(initialSubcategories);
  const [budgetGoals] = useState<BudgetGoal[]>(initialBudgetGoals);
  const [financialSummary] = useState<FinancialSummary>(initialFinancialSummary);
  const [monthlyData] = useState(initialMonthlyData);
  const [expenseBreakdown] = useState(initialExpenseBreakdown);
  const [financialInstitutions, setFinancialInstitutions] = useState<FinancialInstitution[]>(initialFinancialInstitutions);
  const [creditCards, setCreditCards] = useState<CreditCard[]>(initialCreditCards);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  // Get filtered transactions for the selected month
  const filteredTransactions = useMemo(() => {
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }, [transactions, currentDate]);

  // Check if there's data for the current month
  const hasDataForCurrentMonth = useMemo(() => {
    return filteredTransactions.length > 0;
  }, [filteredTransactions]);

  // Month navigation functions
  const navigateToPreviousMonth = useCallback(() => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  }, []);

  const navigateToNextMonth = useCallback(() => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  }, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: `t${transactions.length + 1}`,
    };
    setTransactions(prev => [...prev, newTransaction]);
    toast.success('Transação adicionada com sucesso');
  }, [transactions]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.success('Transação excluída com sucesso');
  }, []);

  const updateTransaction = useCallback((id: string, transaction: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(t => (t.id === id ? { ...t, ...transaction } : t))
    );
    toast.success('Transação atualizada com sucesso');
  }, []);

  // Category management
  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory = {
      ...category,
      id: `c${categories.length + 1}`,
    };
    setCategories(prev => [...prev, newCategory]);
    toast.success('Categoria adicionada com sucesso');
  }, [categories]);

  const updateCategory = useCallback((id: string, category: Partial<Category>) => {
    setCategories(prev => 
      prev.map(c => (c.id === id ? { ...c, ...category } : c))
    );
    toast.success('Categoria atualizada com sucesso');
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    toast.success('Categoria excluída com sucesso');
  }, []);

  // Subcategory management
  const addSubcategory = useCallback((subcategory: Omit<Subcategory, 'id'>) => {
    const newSubcategory = {
      ...subcategory,
      id: `sc${subcategories.length + 1}`,
    };
    setSubcategories(prev => [...prev, newSubcategory]);
    toast.success('Subcategoria adicionada com sucesso');
  }, [subcategories]);

  const updateSubcategory = useCallback((id: string, subcategory: Partial<Subcategory>) => {
    setSubcategories(prev => 
      prev.map(sc => (sc.id === id ? { ...sc, ...subcategory } : sc))
    );
    toast.success('Subcategoria atualizada com sucesso');
  }, []);

  const deleteSubcategory = useCallback((id: string) => {
    setSubcategories(prev => prev.filter(sc => sc.id !== id));
    toast.success('Subcategoria excluída com sucesso');
  }, []);

  // Financial Institution management
  const addFinancialInstitution = useCallback((institution: Omit<FinancialInstitution, 'id'>) => {
    const newInstitution = {
      ...institution,
      id: `fi${financialInstitutions.length + 1}`,
    };
    setFinancialInstitutions(prev => [...prev, newInstitution]);
    toast.success('Instituição financeira adicionada com sucesso');
  }, [financialInstitutions]);

  const updateFinancialInstitution = useCallback((id: string, institution: Partial<FinancialInstitution>) => {
    setFinancialInstitutions(prev => 
      prev.map(fi => (fi.id === id ? { ...fi, ...institution } : fi))
    );
    toast.success('Instituição financeira atualizada com sucesso');
  }, []);

  const deleteFinancialInstitution = useCallback((id: string) => {
    setFinancialInstitutions(prev => prev.filter(fi => fi.id !== id));
    toast.success('Instituição financeira excluída com sucesso');
  }, []);

  // Credit Card management
  const addCreditCard = useCallback((card: Omit<CreditCard, 'id'>) => {
    const newCard = {
      ...card,
      id: `cc${creditCards.length + 1}`,
    };
    setCreditCards(prev => [...prev, newCard]);
    toast.success('Cartão de crédito adicionado com sucesso');
  }, [creditCards]);

  const updateCreditCard = useCallback((id: string, card: Partial<CreditCard>) => {
    setCreditCards(prev => 
      prev.map(cc => (cc.id === id ? { ...cc, ...card } : cc))
    );
    toast.success('Cartão de crédito atualizado com sucesso');
  }, []);

  const deleteCreditCard = useCallback((id: string) => {
    setCreditCards(prev => prev.filter(cc => cc.id !== id));
    toast.success('Cartão de crédito excluído com sucesso');
  }, []);

  // Toggle category selection for filtering
  const toggleCategorySelection = useCallback((categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  }, []);

  const resetCategorySelection = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  // Format currency to Brazilian Real format
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const navigateToTransactions = (filter: TransactionFilterType = 'all', institutionId?: string, cardId?: string) => {
    // Construct query parameters
    const params = new URLSearchParams();
    
    if (filter !== 'all') {
      params.append('filter', filter);
    }
    
    if (institutionId) {
      params.append('institution', institutionId);
    }
    
    if (cardId) {
      params.append('card', cardId);
      params.append('transactionType', 'Credit Card');
    }
    
    // Navigate to transactions page with filter
    navigate(`/transactions${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        filteredTransactions,
        categories,
        subcategories,
        budgetGoals,
        financialSummary,
        monthlyData,
        expenseBreakdown,
        financialInstitutions,
        creditCards,
        currentDate,
        setCurrentDate,
        navigateToPreviousMonth,
        navigateToNextMonth,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        formatCurrency,
        navigateToTransactions,
        hasDataForCurrentMonth,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubcategory,
        updateSubcategory,
        deleteSubcategory,
        addFinancialInstitution,
        updateFinancialInstitution,
        deleteFinancialInstitution,
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        selectedCategories,
        toggleCategorySelection,
        resetCategorySelection,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
