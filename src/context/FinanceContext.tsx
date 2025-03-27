import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { Transaction, Category, BudgetGoal, FinancialSummary, FinancialInstitution, CreditCard, Subcategory, GoalModification, TransactionType } from '../types/finance';
import { useNavigate } from 'react-router-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { fetchTransactions, addTransaction as createTransaction, updateTransaction as updateTransactionService, deleteTransaction as deleteTransactionService, getFinancialSummary } from '@/services/transactionService';
import { fetchCategories, addCategory as createCategory, updateCategory as updateCategoryService, deleteCategory as deleteCategoryService, fetchSubcategories } from '@/services/categoryService';
import { fetchBudgets, addBudget as createBudgetGoal, updateBudget as updateBudgetGoalService, deleteBudget as deleteBudgetGoalService } from '@/services/budgetService';
import { fetchInstitutions, addInstitution as createFinancialInstitution, updateInstitution as updateFinancialInstitutionService, deleteInstitution as deleteFinancialInstitutionService } from '@/services/institutionService';
import { fetchCards, addCard as createCreditCard, updateCard as updateCreditCardService, deleteCard as deleteCreditCardService } from '@/services/cardService';
import { fetchGoals, addGoal as createGoal, updateGoal as updateGoalService, deleteGoal as deleteGoalService, addContribution, removeContribution, addGoalModification as addGoalModificationService } from '@/services/goalService';
import { supabase } from '@/integrations/supabase/client';

export type TransactionFilterType = 'all' | 'income' | 'expense';

// Goal transaction interface
export interface GoalTransaction {
  id: string;
  date: Date;
  amount: number;
  type: 'add' | 'remove';
  description: string;
}

// Financial goal interface
export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  icon: string;
  color: string;
  transactions: GoalTransaction[];
  modifications?: GoalModification[]; // Add modifications array to Goal interface
}

// Budget reallocation context
export interface BudgetReallocation {
  totalBudget: number;
  allocatedAmount: number;
  unallocatedAmount: number;
}

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
  goals: Goal[];
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
  addFinancialInstitution: (institution: Omit<FinancialInstitution, 'id' | 'archived'>) => void;
  updateFinancialInstitution: (id: string, institution: Partial<FinancialInstitution>) => void;
  deleteFinancialInstitution: (id: string) => void;
  archiveFinancialInstitution: (id: string, archived: boolean) => void;
  addCreditCard: (card: Omit<CreditCard, 'id' | 'archived'>) => void;
  updateCreditCard: (id: string, card: Partial<CreditCard>) => void;
  deleteCreditCard: (id: string) => void;
  archiveCreditCard: (id: string, archived: boolean) => void;
  selectedCategories: string[];
  toggleCategorySelection: (categoryId: string) => void;
  resetCategorySelection: () => void;
  // Budget goal functions
  addBudgetGoal: (budgetGoal: Omit<BudgetGoal, 'id' | 'spent'>) => void;
  updateBudgetGoal: (category: string, budgetGoal: Partial<Omit<BudgetGoal, 'id' | 'spent'>>) => void;
  deleteBudgetGoal: (category: string) => void;
  // Goal management functions
  addGoal: (goal: Omit<Goal, 'id' | 'transactions' | 'modifications'>) => void;
  updateGoal: (id: string, goal: Partial<Omit<Goal, 'id' | 'transactions' | 'modifications'>>) => void;
  deleteGoal: (id: string) => void;
  addGoalTransaction: (goalId: string, transaction: Omit<GoalTransaction, 'id'>) => void;
  deleteGoalTransaction: (goalId: string, transactionId: string) => void;
  // New functions for goal modifications
  addGoalModification: (goalId: string, modification: Omit<GoalModification, 'id' | 'goalId' | 'date'>) => void;
  getGoalModifications: (goalId: string) => GoalModification[];
  // Budget reallocation
  budgetReallocation: BudgetReallocation;
  setBudgetTotalAmount: (amount: number) => void;
  updateBudgetAllocation: (category: string, amount: number) => void;
  navigateToGoalDetail: (goalId: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    savingsGoal: 0,
    savingsProgress: 0
  });
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; income: number; expenses: number }>>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<Array<{ category: string; value: number; color: string }>>([]);
  const [financialInstitutions, setFinancialInstitutions] = useState<FinancialInstitution[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [budgetReallocation, setBudgetReallocation] = useState<BudgetReallocation>({
    totalBudget: 0,
    allocatedAmount: 0,
    unallocatedAmount: 0
  });
  const navigate = useNavigate();

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if we're authenticated first
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          console.log("No active session, attempting anonymous sign-in");
          const { error } = await supabase.auth.signInAnonymously();
          if (error) {
            console.error("Failed to sign in anonymously:", error);
            toast.error("Falha na autenticação");
            return;
          }
        }
        
        // Load categories
        const categoriesData = await fetchCategories();
        if (categoriesData) {
          const formattedCategories = categoriesData.map(c => ({
            id: c.id,
            name: c.name,
            icon: c.icon || '',
            color: c.color || '#000000',
            type: c.type === 'income' ? 'income' : 'expense',
            isActive: c.is_active
          } as Category));
          setCategories(formattedCategories);
        }

        // Load institutions
        const institutionsData = await fetchInstitutions();
        const formattedInstitutions = institutionsData.map(i => ({
          id: i.id,
          name: i.name,
          icon: i.logo || '',
          currentBalance: i.current_balance || 0,
          isActive: i.is_active,
          type: i.type,
          archived: false
        } as FinancialInstitution));
        setFinancialInstitutions(formattedInstitutions);

        // Load credit cards
        const cardsData = await fetchCards();
        const formattedCards = cardsData.map(c => ({
          id: c.id,
          name: c.name,
          limit: c.limit_amount,
          dueDate: c.due_day,
          institutionId: c.institution_id,
          closingDay: c.closing_day,
          isActive: c.is_active,
          archived: false
        } as CreditCard));
        setCreditCards(formattedCards);

        // Load subcategories
        const subcategoriesData = await fetchSubcategories('all');
        setSubcategories(subcategoriesData || []);

        // Load transactions
        const transactionsResponse = await fetchTransactions();
        if (transactionsResponse && transactionsResponse.data) {
          const formattedTransactions = transactionsResponse.data.map(t => ({
            id: t.id,
            amount: t.amount,
            type: t.transaction_type === 'income' ? 'income' : 'expense',
            category: t.category_id,
            subcategory: t.subcategory_id,
            date: new Date(t.date),
            settlementDate: t.settlement_date ? new Date(t.settlement_date) : undefined,
            description: t.description,
            financialInstitution: t.institution_id,
            status: t.status as 'completed' | 'pending',
            card: t.card_id
          } as Transaction));
          setTransactions(formattedTransactions);
        }

        // Load budget goals
        const budgetGoalsData = await fetchBudgets(new Date().getMonth() + 1, new Date().getFullYear());
        // Transform API data to match BudgetGoal interface
        if (budgetGoalsData) {
          const formattedBudgetGoals = budgetGoalsData.map(b => ({
            id: b.id,
            category: b.category_id,
            amount: b.amount,
            spent: 0, // Will need to calculate this based on transactions
            period: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly'
          }));
          setBudgetGoals(formattedBudgetGoals);
        }

        // Load goals
        const goalsData = await fetchGoals();
        // Transform API data to match Goal interface
        if (goalsData) {
          const formattedGoals = goalsData.map(g => ({
            id: g.id,
            name: g.title,
            targetAmount: g.target_amount,
            currentAmount: g.current_amount,
            targetDate: g.target_date,
            category: g.category_id,
            icon: g.categories?.icon || 'target',
            color: g.categories?.color || '#4F46E5',
            transactions: [] // Will load these separately if needed
          }));
          setGoals(formattedGoals);
        }

        // Update budget reallocation
        const totalBudget = budgetGoalsData ? budgetGoalsData.reduce((acc, budget) => acc + budget.amount, 0) : 0;
        setBudgetReallocation({
          totalBudget,
          allocatedAmount: totalBudget,
          unallocatedAmount: 0
        });

        // Load financial summary
        const date = new Date();
        const summaryData = await getFinancialSummary(date.getMonth() + 1, date.getFullYear());
        setFinancialSummary({
          totalIncome: summaryData.totalIncome,
          totalExpenses: summaryData.totalExpenses,
          netBalance: summaryData.netBalance,
          savingsGoal: summaryData.totalIncome * 0.2, // Default savings goal is 20% of income
          savingsProgress: Math.max(0, summaryData.netBalance)
        } as FinancialSummary);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Erro ao carregar dados');
      }
    };

    loadData();
  }, []);

  // Update financial summary when current date changes
  useEffect(() => {
    const updateSummary = async () => {
      try {
        const summaryData = await getFinancialSummary(
          currentDate.getMonth() + 1,
          currentDate.getFullYear()
        );
        setFinancialSummary({
          totalIncome: summaryData.totalIncome,
          totalExpenses: summaryData.totalExpenses,
          netBalance: summaryData.netBalance,
          savingsGoal: summaryData.totalIncome * 0.2, // Default savings goal is 20% of income
          savingsProgress: Math.max(0, summaryData.netBalance)
        });
      } catch (error) {
        console.error('Error updating financial summary:', error);
      }
    };

    updateSummary();
  }, [currentDate]);

  const filteredTransactions = useMemo(() => {
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }, [transactions, currentDate]);

  const hasDataForCurrentMonth = useMemo(() => {
    return filteredTransactions.length > 0;
  }, [filteredTransactions]);

  const navigateToPreviousMonth = useCallback(() => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  }, []);

  const navigateToNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const response = await createTransaction({
        amount: transaction.amount,
        transaction_type: transaction.type,
        category_id: transaction.category,
        subcategory_id: transaction.subcategory || null,
        date: format(transaction.date, 'yyyy-MM-dd'),
        settlement_date: transaction.settlementDate ? format(transaction.settlementDate, 'yyyy-MM-dd') : null,
        description: transaction.description,
        financialInstitution: transaction.financialInstitution || null,
        card_id: transaction.card || null,
        status: transaction.status
      } as any);

      if (response) {
        const newTransaction: Transaction = {
          id: response.id,
          amount: response.amount,
          type: response.transaction_type === 'income' ? 'income' : 'expense',
          category: response.category_id,
          subcategory: response.subcategory_id || undefined,
          date: new Date(response.date),
          settlementDate: response.settlement_date ? new Date(response.settlement_date) : undefined,
          description: response.description,
          financialInstitution: response.institution_id || undefined,
          status: response.status as 'completed' | 'pending',
          card: response.card_id || undefined
        };

        setTransactions(prev => [newTransaction, ...prev]);
        // Update summary
        try {
          const updateSummary = async () => {
            await getFinancialSummary(
              currentDate.getMonth() + 1,
              currentDate.getFullYear()
            );
          };
          updateSummary();
        } catch (error) {
          console.error('Error updating summary:', error);
        }
        toast.success('Transaction added successfully');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
    }
  }, [currentDate]);

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

  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    try {
      const response = await createCategory({
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type
      });

      if (response) {
        const newCategory: Category = {
          id: response.id,
          name: response.name,
          icon: response.icon || '',
          color: response.color || '#000000',
          type: response.type === 'income' ? 'income' : 'expense',
          isActive: true
        };

        setCategories(prev => [...prev, newCategory]);
        toast.success('Categoria adicionada com sucesso');
        return newCategory;
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  }, []);

  const updateCategory = useCallback((id: string, category: Partial<Category>) => {
    setCategories(prev => 
      prev.map(c => c.id === id ? { ...c, ...category } : c)
    );
    toast.success("Categoria atualizada com sucesso");
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    toast.success('Categoria excluída com sucesso');
  }, []);

  const addSubcategory = useCallback((subcategory: Omit<Subcategory, 'id'>) => {
    const newSubcategory = {
      ...subcategory,
      id: uuidv4(),
    };
    setSubcategories(prev => [...prev, newSubcategory]);
    toast.success('Subcategoria adicionada com sucesso');
    return newSubcategory;
  }, []);

  const updateSubcategory = useCallback((id: string, subcategory: Partial<Subcategory>) => {
    setSubcategories(prev => 
      prev.map(c => c.id === id ? { ...c, ...subcategory } : c)
    );
    toast.success("Subcategoria atualizada com sucesso");
  }, []);

  const deleteSubcategory = useCallback((id: string) => {
    setSubcategories(prev => prev.filter(c => c.id !== id));
    toast.success("Subcategoria excluída com sucesso");
  }, []);

  const addFinancialInstitution = useCallback((institution: Omit<FinancialInstitution, 'id'>) => {
    const newInstitution = {
      ...institution,
      id: uuidv4(),
    };
    setFinancialInstitutions(prev => [...prev, newInstitution]);
    toast.success('Instituição financeira adicionada com sucesso');
    return newInstitution;
  }, []);

  const updateFinancialInstitution = useCallback((id: string, institution: Partial<FinancialInstitution>) => {
    const updatedInstitution = { id, ...institution };
    setFinancialInstitutions(prev => 
      prev.map(i => i.id === id ? { ...i, ...institution } : i)
    );
    toast.success('Instituição financeira atualizada com sucesso');
    return updatedInstitution;
  }, []);

  const deleteFinancialInstitution = useCallback((id: string) => {
    setFinancialInstitutions(prev => prev.filter(i => i.id !== id));
    toast.success('Instituição financeira excluída com sucesso');
  }, []);

  const archiveFinancialInstitution = useCallback((id: string, archived: boolean) => {
    setFinancialInstitutions(prev =>
      prev.map(i => i.id === id ? { ...i, archived } : i)
    );
    toast.success(`Instituição ${archived ? 'arquivada' : 'desarquivada'} com sucesso`);
  }, []);

  const addCreditCard = useCallback((card: Omit<CreditCard, 'id'>) => {
    const newCard = {
      ...card,
      id: uuidv4(),
    };
    setCreditCards(prev => [...prev, newCard]);
    toast.success("Cartão adicionado com sucesso");
    return newCard;
  }, []);

  const updateCreditCard = useCallback((id: string, card: Partial<CreditCard>) => {
    const updatedCard = { id, ...card };
    setCreditCards(prev => 
      prev.map(c => c.id === id ? { ...c, ...card } : c)
    );
    toast.success("Cartão atualizado com sucesso");
    return updatedCard;
  }, []);

  const deleteCreditCard = useCallback((id: string) => {
    setCreditCards(prev => prev.filter(c => c.id !== id));
    toast.success("Cartão excluído com sucesso");
  }, []);

  const archiveCreditCard = useCallback((id: string, archived: boolean) => {
    setCreditCards(prev =>
      prev.map(c => c.id === id ? { ...c, archived } : c)
    );
    toast.success(`Cartão ${archived ? 'arquivado' : 'desarquivado'} com sucesso`);
  }, []);

  const addBudgetGoal = useCallback((budgetGoal: Omit<BudgetGoal, 'id' | 'spent'>) => {
    const newBudgetGoal = {
      ...budgetGoal,
      id: uuidv4(),
      spent: 0,
    };

    setBudgetGoals(prev => [...prev, newBudgetGoal]);
    toast.success('Orçamento adicionado com sucesso');
  }, []);

  const updateBudgetGoal = useCallback((category: string, budgetGoal: Partial<Omit<BudgetGoal, 'id' | 'spent'>>) => {
    setBudgetGoals(prev =>
      prev.map(bg =>
        bg.category === category
          ? { ...bg, ...budgetGoal }
          : bg
      )
    );
    toast.success('Orçamento atualizado com sucesso');
  }, []);

  const deleteBudgetGoal = useCallback((category: string) => {
    setBudgetGoals(prev => prev.filter(bg => bg.category !== category));
    toast.success('Orçamento excluído com sucesso');
  }, []);

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

  const formatCurrency = useCallback((value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }, []);

  const navigateToTransactions = useCallback((filter: TransactionFilterType = 'all', institutionId?: string, cardId?: string) => {
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
    
    navigate(`/transactions${params.toString() ? `?${params.toString()}` : ''}`);
  }, [navigate]);

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'transactions' | 'modifications'>) => {
    const newGoal = {
      ...goal,
      id: uuidv4(),
      transactions: [],
      modifications: []
    };
    setGoals(prev => [...prev, newGoal]);
    toast.success('Meta adicionada com sucesso');
    return newGoal;
  }, []);

  const updateGoal = useCallback((id: string, goal: Partial<Omit<Goal, 'id' | 'transactions' | 'modifications'>>) => {
    setGoals(prev =>
      prev.map(g => g.id === id ? { ...g, ...goal } : g)
    );
    toast.success('Meta atualizada com sucesso');
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    toast.success('Meta excluída com sucesso');
  }, []);

  const addGoalTransaction = useCallback((goalId: string, transaction: Omit<GoalTransaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: uuidv4()
    };

    setGoals(prev => {
      return prev.map(goal => {
        if (goal.id !== goalId) return goal;

        let newAmount = goal.currentAmount;
        if (transaction.type === 'add') {
          newAmount += transaction.amount;
        } else {
          newAmount = Math.max(0, newAmount - transaction.amount);
        }

        return {
          ...goal,
          currentAmount: newAmount,
          transactions: [...goal.transactions, newTransaction]
        };
      });
    });
    
    toast.success('Transação da meta adicionada com sucesso');
  }, []);

  const deleteGoalTransaction = useCallback((goalId: string, transactionId: string) => {
    setGoals(prev => {
      return prev.map(goal => {
        if (goal.id !== goalId) return goal;

        const transaction = goal.transactions.find(t => t.id === transactionId);
        if (!transaction) return goal;

        let newAmount = goal.currentAmount;
        if (transaction.type === 'add') {
          newAmount = Math.max(0, newAmount - transaction.amount);
        } else {
          newAmount += transaction.amount;
        }

        return {
          ...goal,
          currentAmount: newAmount,
          transactions: goal.transactions.filter(t => t.id !== transactionId)
        };
      });
    });

    toast.success('Transação da meta excluída com sucesso');
  }, []);

  const addGoalModification = useCallback((goalId: string, modification: Omit<GoalModification, 'id' | 'goalId' | 'date'>) => {
    const newModification = {
      ...modification,
      id: uuidv4(),
      goalId,
      date: new Date()
    };

    setGoals(prev => {
      return prev.map(goal => {
        if (goal.id !== goalId) return goal;

        return {
          ...goal,
          modifications: [...(goal.modifications || []), newModification]
        };
      });
    });

    toast.success('Modificação da meta registrada com sucesso');
  }, []);

  const getGoalModifications = useCallback((goalId: string): GoalModification[] => {
    const goal = goals.find(g => g.id === goalId);
    return goal?.modifications || [];
  }, [goals]);

  const setBudgetTotalAmount = useCallback((amount: number) => {
    const currentAllocated = budgetGoals.reduce((acc, budget) => acc + budget.amount, 0);
    
    setBudgetReallocation({
      totalBudget: amount,
      allocatedAmount: currentAllocated,
      unallocatedAmount: amount - currentAllocated
    });
  }, [budgetGoals]);

  const updateBudgetAllocation = useCallback((category: string, amount: number) => {
    let newAllocatedAmount = 0;
    
    setBudgetGoals(prev => {
      const updated = prev.map(bg => {
        if (bg.category === category) {
          return { ...bg, amount };
        }
        return bg;
      });
      
      newAllocatedAmount = updated.reduce((acc, budget) => acc + budget.amount, 0);
      return updated;
    });
    
    setBudgetReallocation(prev => ({
      ...prev,
      allocatedAmount: newAllocatedAmount,
      unallocatedAmount: prev.totalBudget - newAllocatedAmount
    }));
  }, []);

  const navigateToGoalDetail = useCallback((goalId: string) => {
    navigate(`/goals/${goalId}`);
  }, [navigate]);

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
        goals,
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
        archiveFinancialInstitution,
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        archiveCreditCard,
        selectedCategories,
        toggleCategorySelection,
        resetCategorySelection,
        addBudgetGoal,
        updateBudgetGoal,
        deleteBudgetGoal,
        addGoal,
        updateGoal,
        deleteGoal,
        addGoalTransaction,
        deleteGoalTransaction,
        addGoalModification,
        getGoalModifications,
        budgetReallocation,
        setBudgetTotalAmount,
        updateBudgetAllocation,
        navigateToGoalDetail,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
