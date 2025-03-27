
import { useState, useCallback } from 'react';
import { TransactionFilterType } from '@/types/transaction';

export function useTransactionFilters(initialFilters: TransactionFilterType = {}) {
  const [filters, setFilters] = useState<TransactionFilterType>(initialFilters);

  const updateFilter = useCallback((key: keyof TransactionFilterType, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = useCallback(() => {
    return Object.values(filters).some(value => 
      value !== undefined && 
      (Array.isArray(value) ? value.length > 0 : true)
    );
  }, [filters]);

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters
  };
}
