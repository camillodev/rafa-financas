import React, { useEffect, useState } from 'react';
import { useCategoryOperations, useFinancialData } from '@/hooks/useFinance';
import { Category } from '@/types/finance';

/**
 * Example component that demonstrates using the specialized domain hooks directly.
 * This is the recommended approach for new components.
 */
export default function CategoriesManager() {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Get categories data from useFinancialData hook
  const { categories } = useFinancialData();

  // Get category operations from the specialized hook
  const {
    addCategory,
    updateCategory,
    deleteCategory,
    findCategoryById
  } = useCategoryOperations();

  // Get the currently selected category
  const selectedCategory = selectedCategoryId
    ? findCategoryById(selectedCategoryId)
    : null;

  // Handle form submission for adding a new category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addCategory({
        name: newCategoryName,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16), // Random color
        icon: 'tag', // Default icon
        type: 'expense',
        isActive: true
      });
      setNewCategoryName('');
    }
  };

  // Handle deleting a category
  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id);
      if (selectedCategoryId === id) {
        setSelectedCategoryId(null);
      }
    }
  };

  // Handle updating a category
  const handleUpdateCategory = (category: Category) => {
    updateCategory(category);
    setSelectedCategoryId(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Categories Manager</h1>

      {/* Add new category form */}
      <form onSubmit={handleAddCategory} className="mb-6">
        <input
          type="text"
          placeholder="New category name"
          className="border p-2 mr-2"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={!newCategoryName.trim()}
        >
          Add Category
        </button>
      </form>

      {/* Categories list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => (
          <div
            key={category.id}
            className="border p-3 rounded flex justify-between items-center"
            style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
          >
            <div>
              <span className="font-medium">{category.name}</span>
              <span className="ml-2 text-sm text-gray-500">{category.type}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedCategoryId(category.id)}
                className="text-blue-500 hover:text-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit category modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Edit Category</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateCategory({
                  ...selectedCategory,
                  name: formData.get('name') as string,
                  color: formData.get('color') as string,
                  type: formData.get('type') as 'income' | 'expense',
                });
              }}
            >
              <div className="mb-4">
                <label className="block mb-1">Name</label>
                <input
                  name="name"
                  defaultValue={selectedCategory.name}
                  className="border p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Color</label>
                <input
                  name="color"
                  type="color"
                  defaultValue={selectedCategory.color}
                  className="border p-1 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Type</label>
                <select
                  name="type"
                  defaultValue={selectedCategory.type}
                  className="border p-2 w-full"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId(null)}
                  className="border px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 