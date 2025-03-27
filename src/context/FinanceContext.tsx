import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { Transaction, Category, BudgetGoal, FinancialSummary, FinancialInstitution, CreditCard, Subcategory, GoalModification } from '../types/finance';
import { useNavigate } from 'react-router-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { fetchTransactions, addTransaction as createTransaction, updateTransaction as updateTransactionService, deleteTransaction as deleteTransactionService, getFinancialSummary } from '@/services/transactionService';
import { fetchCategories, addCategory as createCategory, updateCategory as updateCategoryService, deleteCategory as deleteCategoryService, fetchSubcategories } from '@/services/categoryService';
import { fetchBudgets, addBudget as createBudgetGoal, updateBudget as updateBudgetGoalService, deleteBudget as deleteBudgetGoalService } from '@/services/budgetService';
import { fetchInstitutions, addInstitution as createFinancialInstitution, updateInstitution as updateFinancialInstitutionService, deleteInstitution as deleteFinancialInstitutionService } from '@/services/institutionService';
import { fetchCards, addCard as createCreditCard, updateCard as updateCreditCardService, deleteCard as deleteCreditCardService } from '@/services/cardService';
import { fetchGoals, addGoal as createGoal, updateGoal as updateGoalService, deleteGoal as deleteGoalService, addContribution, removeContribution, addGoalModification as addGoalModificationService } from '@/services/goalService';

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
        // Load transactions
        const transactionsData = await fetchTransactions();
        if (transactionsData && transactionsData.data) {
          // Transform API data to match Transaction interface
          const formattedTransactions = transactionsData.data.map(t => ({
            id: t.id,
            amount: t.amount,
            type: t.transaction_type === 'income' ? 'income' : 'expense',
            category: t.category_id,
            subcategory: t.subcategory_id,
            date: new Date(t.date),
            settlementDate: t.settlement_date ? new Date(t.settlement_date) : undefined,
            description: t.description,
            financialInstitution: t.institution_id,
            status: t.status || 'completed',
            card: t.card_id
          } as Transaction));
          setTransactions(formattedTransactions);
        }

        // Load categories
        const categoriesData = await fetchCategories();
        if (categoriesData) {
          const formattedCategories = categoriesData.map(c => ({
            id: c.id,
            name: c.name,
            icon: c.icon,
            color: c.color,
            type: c.type === 'income' ? 'income' : 'expense',
            isActive: c.is_active
          } as Category));
          setCategories(formattedCategories);
        }

        // Load subcategories
        const subcategoriesData = await fetchSubcategories('all');
        setSubcategories(subcategoriesData || []);

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

        // Load financial institutions
        const institutionsData = await fetchInstitutions();
        const formattedInstitutions = institutionsData.map(i => ({
          id: i.id,
          name: i.name,
          icon: i.logo,
          currentBalance: i.current_balance,
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

  const navigateToNextMonth = useCallback(() => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  }, []);

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
        institution_id: transaction.financialInstitution || null,
        card_id: transaction.card || null,
        status: transaction.status
      });

      if (response && response.data) {
        const newTransaction: Transaction = {
          id: response.data.id,
          amount: response.data.amount,
          type: response.data.transaction_type === 'income' ? 'income' : 'expense',
          category: response.data.category_id,
          subcategory: response.data.subcategory_id || undefined,
          date: new Date(response.data.date),
          settlementDate: response.data.settlement_date ? new Date(response.data.settlement_date) : undefined,
          description: response.data.description,
          financialInstitution: response.data.institution_id || undefined,
          status: response.data.status as 'completed' | 'pending',
          card: response.data.card_id || undefined
        };

        setTransactions(prev => [newTransaction, ...prev]);
        updateSummary();
        toast.success('Transaction added successfully');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
    }
  }, []);

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

  const addFinancialInstitution = useCallback((institution: Omit<FinancialInstitution, 'id' | 'archived'>) => {
    const newInstitution = {
      ...institution,
      id: `fi${financialInstitutions.length + 1}`,
      archived: false
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

  const archiveFinancialInstitution = useCallback((id: string, archived: boolean) => {
    setFinancialInstitutions(prev => 
      prev.map(fi => (fi.id === id ? { ...fi, archived } : fi))
    );
    toast.success(archived 
      ? 'Instituição financeira arquivada com sucesso' 
      : 'Instituição financeira desarquivada com sucesso');
  }, []);

  const addCreditCard = useCallback((card: Omit<CreditCard, 'id' | 'archived'>) => {
    const newCard = {
      ...card,
      id: `cc${creditCards.length + 1}`,
      archived: false
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

  const archiveCreditCard = useCallback((id: string, archived: boolean) => {
    setCreditCards(prev => 
      prev.map(cc => (cc.id === id ? { ...cc, archived } : cc))
    );
    toast.success(archived 
      ? 'Cartão de crédito arquivado com sucesso' 
      : 'Cartão de crédito desarquivado com sucesso');
  }, []);

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'transactions' | 'modifications'>) => {
    const newGoal = {
      ...goal,
      id: `g${goals.length + 1}`,
      transactions: [],
      modifications: []
    };
    setGoals(prev => [...prev, newGoal]);
    toast.success('Meta adicionada com sucesso');
  }, [goals]);

  const navigateToGoalDetail = useCallback((goalId: string) => {
    navigate(`/goals/${goalId}`);
  }, [navigate]);

  const addGoalModification = useCallback((goalId: string, modification: Omit<GoalModification, 'id' | 'goalId' | 'date'>) => {
    setGoals(prev => {
      return prev.map(goal => {
        if (goal.id !== goalId) return goal;
        
        const newModification = {
          ...modification,
          id: `gm${Math.random().toString(36).substring(2, 9)}`,
          goalId,
          date: new Date()
        };
        
        return {
          ...goal,
          modifications: [...(goal.modifications || []), newModification]
        };
      });
    });
  }, []);

  const getGoalModifications = useCallback((goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    return goal?.modifications || [];
  }, [goals]);

  const addGoalTransaction = useCallback((goalId: string, transaction: Omit<GoalTransaction, 'id'>) => {
    setGoals(prev => {
      return prev.map(goal => {
        if (goal.id !== goalId) return goal;
        
        const newTransaction = {
          ...transaction,
          id: `gt${Math.random().toString(36).substring(2, 9)}`,
        };
        
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
    
    addGoalModification(goalId, {
      type: transaction.type === 'add' ? 'contribution' : 'withdrawal',
      description: transaction.description,
      amount: transaction.amount
    });
    
    toast.success(`${transaction.type === 'add' ? 'Valor adicionado' : 'Valor retirado'} com sucesso`);
  }, [addGoalModification]);

  const updateGoal = useCallback((id: string, goalUpdate: Partial<Omit<Goal, 'id' | 'transactions' | 'modifications'>>) => {
    setGoals(prev => {
      return prev.map(goal => {
        if (goal.id !== id) return goal;
        
        if (goalUpdate.targetAmount && goalUpdate.targetAmount !== goal.targetAmount) {
          addGoalModification(id, {
            type: 'target_change',
            description: 'Alteração do valor alvo',
            previousValue: goal.targetAmount,
            newValue: goalUpdate.targetAmount
          });
        }
        
        if (goalUpdate.targetDate && goalUpdate.targetDate !== goal.targetDate) {
          addGoalModification(id, {
            type: 'date_change',
            description: 'Alteração da data alvo',
            previousValue: goal.targetDate,
            newValue: goalUpdate.targetDate
          });
        }
        
        if (goalUpdate.name && goalUpdate.name !== goal.name) {
          addGoalModification(id, {
            type: 'description_change',
            description: 'Alteração do nome da meta',
            previousValue: goal.name,
            newValue: goalUpdate.name
          });
        }
        
        return { ...goal, ...goalUpdate };
      });
    });
    
    toast.success('Meta atualizada com sucesso');
  }, [addGoalModification]);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    toast.success('Meta excluída com sucesso');
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

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const navigateToTransactions = (filter: TransactionFilterType = 'all', institutionId?: string, cardId?: string) => {
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
  };

  const addBudgetGoal = useCallback((budgetGoal: Omit<BudgetGoal, 'id' | 'spent'>) => {
    const newBudgetGoal = {
      ...budgetGoal,
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
        navigateToGoalDetail,
        budgetReallocation,
        setBudgetTotalAmount,
        updateBudgetAllocation,
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
