import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Transaction, TransactionType } from '@/types/finance';
import { TransactionFilterType } from '@/hooks/useFinance';

interface AdvancedFilters {
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
  filteredTransactions: Transaction[];
  setSearchTerm: (term: string) => void;
  setIsFilterPopoverOpen: (open: boolean) => void;
  handleSetFilter: (newFilter: string) => void;
  handleClearFilter: () => void;
  handleAdvancedFilterChange: (field: string, value: string) => void;
  hasActiveFilters: () => boolean;
}

export function useTransactionFilters(transactions: Transaction[]): UseTransactionFiltersReturn {
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

  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam && ['income', 'expense', 'all'].includes(filterParam)) {
      setFilter({ type: filterParam as TransactionType });
    } else {
      setFilter({});
    }
  }, [searchParams]);

  // Apply all filters (type, search, advanced)
  const filteredTransactions = transactions.filter(transaction => {
    // Type filter
    if (filter.type && transaction.type !== filter.type) {
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

    if (advancedFilters.category && advancedFilters.category !== 'all' && transaction.category !== advancedFilters.category) {
      return false;
    }

    if (advancedFilters.subcategory && transaction.subcategory !== advancedFilters.subcategory) {
      return false;
    }

    if (advancedFilters.institution && advancedFilters.institution !== 'all' && transaction.financialInstitution !== advancedFilters.institution) {
      return false;
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

  const handleClearFilter = () => {
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
  };

  const handleSetFilter = (newFilter: string) => {
    if (newFilter === 'all') {
      setSearchParams({});
      setFilter({});
    } else {
      setSearchParams({ filter: newFilter });
      setFilter({ type: newFilter as TransactionType });
    }
  };

  const handleAdvancedFilterChange = (field: string, value: string) => {
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
  };

  const hasActiveFilters = () => {
    return Boolean(filter.type) ||
      Boolean(searchTerm) ||
      Object.values(advancedFilters).some(value =>
        typeof value === 'string' ? Boolean(value) : Object.values(value).some(v => Boolean(v))
      );
  };

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