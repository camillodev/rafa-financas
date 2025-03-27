import { create } from 'zustand';
import * as categoryService from '@/services/categoryService';
import { Category, CategoryResponse, Subcategory } from '@/types/finance';
import { CategoriesState } from '@/types/categories';
import { useTransactionsStore } from './useTransactionsStore';

// Helper function to convert API response to our app's category format
const convertApiCategories = (apiCategories: CategoryResponse[]): Category[] => {
  return apiCategories.map(cat => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
    icon: cat.icon,
    type: cat.type as 'income' | 'expense',
    isActive: cat.is_active
  }));
};

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  subcategories: [],
  selectedCategories: [],
  isLoading: false,
  error: null,
  
  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categoriesData = await categoryService.fetchCategories();
      const categories = convertApiCategories(categoriesData);
      set({ categories, isLoading: false });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  },
  
  addCategory: async (category: Omit<Category, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const newCategory = await categoryService.addCategory(category);
      set(state => ({
        categories: [...state.categories, newCategory],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding category:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  },
  
  updateCategory: async (category: Category) => {
    set({ isLoading: true, error: null });
    try {
      await categoryService.updateCategory(category.id, category);
      set(state => ({
        categories: state.categories.map(c => c.id === category.id ? category : c),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating category:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  },
  
  deleteCategory: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await categoryService.deleteCategory(id);
      set(state => ({
        categories: state.categories.filter(c => c.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting category:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  },
  
  addSubcategory: async (subcategory: Omit<Subcategory, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const newSubcategory = await categoryService.addSubcategory(subcategory);
      set(state => ({
        subcategories: [...state.subcategories, newSubcategory],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding subcategory:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  
  updateSubcategory: async (subcategory: Subcategory) => {
    set({ isLoading: true, error: null });
    try {
      await categoryService.updateCategory(subcategory.id, subcategory);
      set(state => ({
        subcategories: state.subcategories.map(s => s.id === subcategory.id ? subcategory : s),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating subcategory:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  
  deleteSubcategory: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await categoryService.deleteCategory(id);
      set(state => ({
        subcategories: state.subcategories.filter(s => s.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  
  toggleCategorySelection: (categoryId: string) => {
    set(state => {
      if (state.selectedCategories.includes(categoryId)) {
        return {
          selectedCategories: state.selectedCategories.filter(id => id !== categoryId)
        };
      } else {
        return {
          selectedCategories: [...state.selectedCategories, categoryId]
        };
      }
    });
  },
  
  resetCategorySelection: () => {
    set({ selectedCategories: [] });
  },
  
  findCategoryById: (id: string) => {
    return get().categories.find(cat => cat.id === id);
  },
  
  findCategoryByName: (name: string) => {
    return get().categories.find(cat => cat.name === name);
  },

  // Add the expenseBreakdown method to match interface
  expenseBreakdown: () => {
    const { transactions } = useTransactionsStore.getState();
    const { categories } = get();

    // Only include expense categories
    const expenseCategories = categories.filter(cat => cat.type === 'expense');

    return expenseCategories.map(category => {
      // Get transactions for this category
      const categoryTransactions = transactions.filter(
        transaction => transaction.categoryId === category.id && transaction.type === 'expense'
      );

      // Calculate total amount
      const totalAmount = categoryTransactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );

      return {
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        totalAmount: totalAmount,
        percentage: 0, // Will be calculated after
        transactions: categoryTransactions
      };
    }).filter(cat => cat.totalAmount > 0)
      .map(category => {
        // Calculate the total of all categories
        const totalExpenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        // Calculate percentage if total expenses > 0
        const percentage = totalExpenses > 0
          ? Math.round((category.totalAmount / totalExpenses) * 100)
          : 0;

        return {
          ...category,
          percentage
        };
      })
      // Sort by amount descending
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }
}));
