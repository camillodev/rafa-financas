
import { Category, Subcategory, CategoryResponse } from '@/types/finance';

// Define the base API URL
const API_URL = 'https://api.example.com';

// Fetch all categories
export const fetchCategories = async (): Promise<CategoryResponse[]> => {
  // Mock data for development
  const mockCategories: CategoryResponse[] = [
    { id: '1', name: 'Alimentação', color: '#FF6B6B', icon: 'utensils', type: 'expense', is_active: true, user_id: '1', created_at: '2021-01-01', updated_at: '2021-01-01' },
    { id: '2', name: 'Transporte', color: '#4ECDC4', icon: 'car', type: 'expense', is_active: true, user_id: '1', created_at: '2021-01-01', updated_at: '2021-01-01' },
    { id: '3', name: 'Moradia', color: '#C7F464', icon: 'home', type: 'expense', is_active: true, user_id: '1', created_at: '2021-01-01', updated_at: '2021-01-01' },
    { id: '4', name: 'Lazer', color: '#FF9F1C', icon: 'smile', type: 'expense', is_active: true, user_id: '1', created_at: '2021-01-01', updated_at: '2021-01-01' },
    { id: '5', name: 'Salário', color: '#2EC4B6', icon: 'briefcase', type: 'income', is_active: true, user_id: '1', created_at: '2021-01-01', updated_at: '2021-01-01' },
    { id: '6', name: 'Investimentos', color: '#E71D36', icon: 'chart-line', type: 'income', is_active: true, user_id: '1', created_at: '2021-01-01', updated_at: '2021-01-01' }
  ];

  return Promise.resolve(mockCategories);
};

// Add a new category
export const addCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  // Mock implementation
  const newCategory: Category = {
    id: Math.random().toString(36).substring(7),
    ...category
  };
  
  return Promise.resolve(newCategory);
};

// Update an existing category
export const updateCategory = async (id: string, category: Partial<Category>): Promise<void> => {
  // Mock implementation - in a real app this would make an API call
  return Promise.resolve();
};

// Delete a category
export const deleteCategory = async (id: string): Promise<void> => {
  // Mock implementation - in a real app this would make an API call
  return Promise.resolve();
};

// Add a new subcategory
export const addSubcategory = async (subcategory: Omit<Subcategory, 'id'>): Promise<Subcategory> => {
  // Mock implementation
  const newSubcategory: Subcategory = {
    id: Math.random().toString(36).substring(7),
    ...subcategory
  };
  
  return Promise.resolve(newSubcategory);
};

// Helper to convert API response to our app format
export const mapCategoryResponse = (response: CategoryResponse): Category => {
  return {
    id: response.id,
    name: response.name,
    color: response.color,
    icon: response.icon,
    type: response.type as 'income' | 'expense',
    isActive: response.is_active
  };
};
