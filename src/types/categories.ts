import { Category, Subcategory } from '@/types/finance';

export interface CategoriesState {
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
  expenseBreakdown: () => any[];
} 