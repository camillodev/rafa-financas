# Domain-Specific Hooks Guide

This document provides guidance on how to use our domain-specific hooks for the Rafa Finanças application.

## Introduction

We've refactored our state management to follow domain-driven design principles. Instead of a monolithic store and context, we now have:

1. Specialized domain stores using Zustand
2. Purpose-specific React hooks for accessing each domain
3. TypeScript interfaces for each domain

## Available Domain Hooks

### 1. `useDateNavigation`

For date-related operations and navigation:

```tsx
const { 
  selectedMonth,
  currentDate,
  setSelectedMonth,
  navigateToPreviousMonth,
  navigateToNextMonth,
  getMonthDateRange
} = useDateNavigation();
```

### 2. `useFinancialData`

For accessing all financial data:

```tsx
const {
  transactions,
  filteredTransactions,
  categories,
  subcategories,
  budgetGoals,
  goals,
  institutions,
  financialInstitutions,
  cards,
  creditCards,
  isLoading,
  error
} = useFinancialData();
```

### 3. `useFinancialCalculations`

For calculations and reporting:

```tsx
const {
  formatCurrency,
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateBalance,
  getTransactionsByCategory,
  expenseBreakdown,
  financialSummary,
  hasDataForCurrentMonth
} = useFinancialCalculations();
```

### 4. `useCategoryOperations`

For managing categories:

```tsx
const {
  selectedCategories,
  toggleCategorySelection,
  resetCategorySelection,
  findCategoryById,
  findCategoryByName,
  addCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory
} = useCategoryOperations();
```

### 5. `useTransactionOperations`

For managing transactions:

```tsx
const {
  addTransaction,
  updateTransaction,
  deleteTransaction
} = useTransactionOperations();
```

### 6. `useBudgetOperations`

For managing budgets:

```tsx
const {
  addBudgetGoal,
  updateBudgetGoal,
  deleteBudgetGoal
} = useBudgetOperations();
```

### 7. `useGoalOperations`

For managing financial goals:

```tsx
const {
  addGoal,
  updateGoal,
  deleteGoal,
  addGoalTransaction,
  deleteGoalTransaction,
  addGoalModification,
  getGoalModifications
} = useGoalOperations();
```

### 8. `useInstitutionOperations`

For managing financial institutions:

```tsx
const {
  addFinancialInstitution,
  updateFinancialInstitution,
  deleteFinancialInstitution,
  archiveFinancialInstitution
} = useInstitutionOperations();
```

### 9. `useCardOperations`

For managing credit cards:

```tsx
const {
  addCreditCard,
  updateCreditCard,
  deleteCreditCard,
  archiveCreditCard
} = useCardOperations();
```

## Migration Guide

### For Existing Components

If you have existing components that use the `useFinance` hook, you can continue to use it since it aggregates all domain hooks. However, we recommend gradually migrating to the specific hooks:

```tsx
// Before
import { useFinance } from '@/context/FinanceContext';

function MyComponent() {
  const { 
    transactions, 
    addTransaction, 
    categories 
  } = useFinance();
  
  // Component logic
}

// After
import { 
  useFinancialData, 
  useTransactionOperations 
} from '@/hooks/useFinance';

function MyComponent() {
  const { transactions, categories } = useFinancialData();
  const { addTransaction } = useTransactionOperations();
  
  // Component logic
}
```

### For New Components

For new components, always use the specialized hooks directly:

```tsx
import { 
  useFinancialData, 
  useTransactionOperations,
  useDateNavigation
} from '@/hooks/useFinance';

function NewTransactionForm() {
  const { categories } = useFinancialData();
  const { addTransaction } = useTransactionOperations();
  const { selectedMonth } = useDateNavigation();
  
  // Component logic
}
```

## Benefits of Using Specialized Hooks

1. **Performance**: Only re-render when the specific data you need changes
2. **Bundle Size**: Import only what you need
3. **Readability**: Clearer what data and operations your component uses
4. **Maintainability**: Easier to refactor and update
5. **Testing**: Simpler to mock specific hooks for testing

## Example

See `src/components/examples/CategoriesManager.tsx` for a complete example of using specialized hooks. 