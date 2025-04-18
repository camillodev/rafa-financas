import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TransactionValues } from '@/schemas/transactionSchema';

// Type for filter state
export type TransactionFilterType = {
  type?: 'income' | 'expense' | 'all';
};

// Type for advanced filters
export interface AdvancedFilters {
  dateRange: {
    start: string;
    end: string;
  };
  category: string;
  subcategory: string;
  institution: string;
  transactionType: string;
  paymentMethod: string;
  status: string;
  amountRange: {
    min: string;
    max: string;
  };
}

interface UseTransactionFiltersReturn {
  filter: TransactionFilterType;
  searchTerm: string;
  isFilterPopoverOpen: boolean;
  advancedFilters: AdvancedFilters;
  filteredTransactions: TransactionValues[];
  setSearchTerm: (term: string) => void;
  setIsFilterPopoverOpen: (open: boolean) => void;
  handleSetFilter: (newFilter: string) => void;
  handleClearFilter: () => void;
  handleAdvancedFilterChange: (field: string, value: string) => void;
  hasActiveFilters: () => boolean;
}

export function useTransactionFilters(
  transactions: TransactionValues[],
  financialInstitutions: Array<{ id: string; name: string }> = []
): UseTransactionFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<TransactionFilterType>({});
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Advanced filters
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    dateRange: {
      start: '',
      end: '',
    },
    category: '',
    subcategory: '',
    institution: '',
    transactionType: '',
    paymentMethod: '',
    status: '',
    amountRange: {
      min: '',
      max: '',
    },
  });

  // Initialize filters from URL parameters
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam && ['income', 'expense', 'all'].includes(filterParam)) {
      setFilter({ type: filterParam as 'income' | 'expense' | 'all' });
    } else {
      setFilter({});
    }
  }, [searchParams]);

  // Apply all filters (type, search, advanced)
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Type filter
      if (filter.type && filter.type !== 'all' && transaction.type !== filter.type) {
        return false;
      }

      // Search filter
      if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Advanced filters
      if (advancedFilters.dateRange.start && new Date(transaction.date) < new Date(advancedFilters.dateRange.start)) {
        return false;
      }

      if (advancedFilters.dateRange.end && new Date(transaction.date) > new Date(advancedFilters.dateRange.end)) {
        return false;
      }

      if (advancedFilters.category && advancedFilters.category !== 'all' && transaction.categoryId !== advancedFilters.category) {
        return false;
      }

      if (advancedFilters.subcategory && transaction.subcategory !== advancedFilters.subcategory) {
        return false;
      }

      if (advancedFilters.institution && advancedFilters.institution !== 'all') {
        const matchingInstitution = financialInstitutions.find(inst => inst.id === advancedFilters.institution);
        if (matchingInstitution && transaction.financialInstitution !== matchingInstitution.name) {
          return false;
        }
      }

      if (advancedFilters.transactionType && advancedFilters.transactionType !== 'all' && transaction.transactionType !== advancedFilters.transactionType) {
        return false;
      }

      if (advancedFilters.paymentMethod && advancedFilters.paymentMethod !== 'all' && transaction.paymentMethod !== advancedFilters.paymentMethod) {
        return false;
      }

      if (advancedFilters.status && advancedFilters.status !== 'all' && transaction.status !== advancedFilters.status) {
        return false;
      }

      if (advancedFilters.amountRange.min && transaction.amount < Number(advancedFilters.amountRange.min)) {
        return false;
      }

      if (advancedFilters.amountRange.max && transaction.amount > Number(advancedFilters.amountRange.max)) {
        return false;
      }

      return true;
    });
  }, [
    transactions,
    filter.type,
    searchTerm,
    advancedFilters.dateRange.start,
    advancedFilters.dateRange.end,
    advancedFilters.category,
    advancedFilters.subcategory,
    advancedFilters.institution,
    advancedFilters.transactionType,
    advancedFilters.paymentMethod,
    advancedFilters.status,
    advancedFilters.amountRange.min,
    advancedFilters.amountRange.max,
    financialInstitutions
  ]);

  // Set filter type
  const handleSetFilter = useCallback((newFilter: string) => {
    if (newFilter === 'all') {
      setSearchParams({});
      setFilter({});
    } else {
      setSearchParams({ filter: newFilter });
      setFilter({ type: newFilter as 'income' | 'expense' });
    }
  }, [setSearchParams]);

  // Clear all filters
  const handleClearFilter = useCallback(() => {
    setSearchParams({});
    setFilter({});
    setSearchTerm('');
    setAdvancedFilters({
      dateRange: { start: '', end: '' },
      category: '',
      subcategory: '',
      institution: '',
      transactionType: '',
      paymentMethod: '',
      status: '',
      amountRange: { min: '', max: '' },
    });
  }, [setSearchParams]);

  // Update advanced filters
  const handleAdvancedFilterChange = useCallback((field: string, value: string) => {
    setAdvancedFilters(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        const result = { ...prev };

        if (parent === 'dateRange') {
          result.dateRange = {
            ...prev.dateRange,
            [child]: value
          };
        } else if (parent === 'amountRange') {
          result.amountRange = {
            ...prev.amountRange,
            [child]: value
          };
        }

        return result;
      }
      return { ...prev, [field]: value };
    });
  }, []);

  // Check if any filter is active
  const hasActiveFilters = useCallback(() => {
    return Boolean(filter.type) ||
      Boolean(searchTerm) ||
      Object.values(advancedFilters).some(value =>
        typeof value === 'string' ? Boolean(value) : Object.values(value).some(v => Boolean(v))
      );
  }, [filter.type, searchTerm, advancedFilters]);

  return {
    filter,
    searchTerm,
    isFilterPopoverOpen,
    advancedFilters,
    filteredTransactions,
    setSearchTerm,
    setIsFilterPopoverOpen,
    handleSetFilter,
    handleClearFilter,
    handleAdvancedFilterChange,
    hasActiveFilters
  };
} 