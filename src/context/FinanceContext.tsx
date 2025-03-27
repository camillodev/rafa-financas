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
  };

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
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
