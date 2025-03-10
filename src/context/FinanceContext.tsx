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
import { Transaction, Category, BudgetGoal, FinancialSummary, FinancialInstitution, CreditCard, Subcategory, GoalModification } from '../types/finance';
import { useNavigate } from 'react-router-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { toast } from "sonner";

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
  addBudgetGoal: (budgetGoal: Omit<BudgetGoal, 'spent'>) => void;
  updateBudgetGoal: (category: string, budgetGoal: Partial<Omit<BudgetGoal, 'spent'>>) => void;
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

// Initial Goals mock data with modifications
const initialGoals: Goal[] = [
  {
    id: 'g1',
    name: 'Viagem para Europa',
    targetAmount: 15000,
    currentAmount: 6000,
    targetDate: '2023-12-31',
    category: 'Viagem',
    icon: 'target',
    color: '#4F46E5',
    transactions: [
      { id: 'gt1', date: new Date(2023, 4, 15), amount: 3000, type: 'add', description: 'Depósito inicial' },
      { id: 'gt2', date: new Date(2023, 5, 10), amount: 2000, type: 'add', description: 'Bônus do trabalho' },
      { id: 'gt3', date: new Date(2023, 6, 5), amount: 1500, type: 'add', description: 'Economia mensal' },
      { id: 'gt4', date: new Date(2023, 6, 20), amount: 500, type: 'remove', description: 'Compra de passagem' },
    ],
    modifications: [
      { id: 'gm1', goalId: 'g1', date: new Date(2023, 4, 15), type: 'contribution', description: 'Depósito inicial', amount: 3000 },
      { id: 'gm2', goalId: 'g1', date: new Date(2023, 5, 10), type: 'target_change', description: 'Aumento do objetivo', previousValue: 12000, newValue: 15000 },
      { id: 'gm3', goalId: 'g1', date: new Date(2023, 6, 5), type: 'contribution', description: 'Economia mensal', amount: 1500 },
      { id: 'gm4', goalId: 'g1', date: new Date(2023, 6, 20), type: 'withdrawal', description: 'Compra de passagem', amount: 500 },
    ]
  },
  {
    id: 'g2',
    name: 'Comprar um carro',
    targetAmount: 60000,
    currentAmount: 35000,
    targetDate: '2024-06-30',
    category: 'Veículo',
    icon: 'target',
    color: '#10B981',
    transactions: [
      { id: 'gt5', date: new Date(2023, 2, 10), amount: 20000, type: 'add', description: 'Venda de investimentos' },
      { id: 'gt6', date: new Date(2023, 3, 15), amount: 5000, type: 'add', description: 'Economia trimestral' },
      { id: 'gt7', date: new Date(2023, 4, 20), amount: 10000, type: 'add', description: 'Bônus anual' },
    ],
    modifications: [
      { id: 'gm5', goalId: 'g2', date: new Date(2023, 2, 10), type: 'contribution', description: 'Venda de investimentos', amount: 20000 },
      { id: 'gm6', goalId: 'g2', date: new Date(2023, 3, 15), type: 'date_change', description: 'Prazo estendido', previousValue: '2023-12-31', newValue: '2024-06-30' },
      { id: 'gm7', goalId: 'g2', date: new Date(2023, 4, 20), type: 'contribution', description: 'Bônus anual', amount: 10000 },
    ]
  },
  {
    id: 'g3',
    name: 'Reserva de emergência',
    targetAmount: 20000,
    currentAmount: 12000,
    targetDate: '2023-09-30',
    category: 'Economia',
    icon: 'target',
    color: '#F59E0B',
    transactions: [
      { id: 'gt8', date: new Date(2023, 0, 5), amount: 5000, type: 'add', description: 'Depósito inicial' },
      { id: 'gt9', date: new Date(2023, 1, 10), amount: 3000, type: 'add', description: 'Economia mensal' },
      { id: 'gt10', date: new Date(2023, 2, 15), amount: 4000, type: 'add', description: 'Economia mensal' },
    ],
    modifications: [
      { id: 'gm8', goalId: 'g3', date: new Date(2023, 0, 5), type: 'contribution', description: 'Depósito inicial', amount: 5000 },
      { id: 'gm9', goalId: 'g3', date: new Date(2023, 1, 10), type: 'description_change', description: 'Mudança de descrição', previousValue: 'Fundo de emergência', newValue: 'Reserva de emergência' },
      { id: 'gm10', goalId: 'g3', date: new Date(2023, 2, 15), type: 'contribution', description: 'Economia mensal', amount: 4000 },
    ]
  },
];

// Adicionar propriedade archived para financialInstitutions e creditCards
const institutionsWithArchive = initialFinancialInstitutions.map(institution => ({
  ...institution,
  archived: false,
}));

const cardsWithArchive = initialCreditCards.map(card => ({
  ...card,
  archived: false,
}));

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(initialSubcategories);
  const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>(initialBudgetGoals);
  const [financialSummary] = useState<FinancialSummary>(initialFinancialSummary);
  const [monthlyData] = useState(initialMonthlyData);
  const [expenseBreakdown] = useState(initialExpenseBreakdown);
  const [financialInstitutions, setFinancialInstitutions] = useState<(FinancialInstitution & { archived: boolean })[]>(institutionsWithArchive);
  const [creditCards, setCreditCards] = useState<(CreditCard & { archived: boolean })[]>(cardsWithArchive);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [budgetReallocation, setBudgetReallocation] = useState<BudgetReallocation>({
    totalBudget: budgetGoals.reduce((acc, budget) => acc + budget.amount, 0),
    allocatedAmount: budgetGoals.reduce((acc, budget) => acc + budget.amount, 0),
    unallocatedAmount: 0
  });
  const navigate = useNavigate();

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

  const addBudgetGoal = useCallback((budgetGoal: Omit<BudgetGoal, 'spent'>) => {
    const newBudgetGoal = {
      ...budgetGoal,
      spent: 0,
    };
    
    setBudgetGoals(prev => [...prev, newBudgetGoal]);
    toast.success('Orçamento adicionado com sucesso');
  }, []);

  const updateBudgetGoal = useCallback((category: string, budgetGoal: Partial<Omit<BudgetGoal, 'spent'>>) => {
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
