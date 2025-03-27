
import { create } from 'zustand';
import * as categoryService from '@/services/categoryService';
import { Category, CategoryResponse, Subcategory } from '@/types/finance';

interface CategoriesState {
  categories: Category[];
  subcategories: Subcategory[];
  selectedCategories: string[];
  isLoading: boolean;
  error: string | null;
  
  // Fetch operations
  fetchCategories: () => Promise<void>;
  
  // CRUD operations
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubcategory: (subcategory: Omit<Subcategory, 'id'>) => Promise<void>;
  updateSubcategory: (subcategory: Subcategory) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;
  
  // Selection
  toggleCategorySelection: (categoryId: string) => void;
  resetCategorySelection: () => void;
  
  // Helpers
  findCategoryById: (id: string) => Category | undefined;
  findCategoryByName: (name: string) => Category | undefined;
}

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
  }
}));
