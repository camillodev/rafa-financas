import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

export interface UseSortConfig<T> {
  initialSortKey?: keyof T | null;
  initialSortDirection?: SortDirection;
  data: T[];
}

export interface UseSortReturn<T> {
  sortedData: T[];
  sortConfig: SortConfig<T>;
  handleSort: (key: keyof T) => void;
  resetSort: () => void;
}

export function useSort<T>({
  initialSortKey = null,
  initialSortDirection = 'asc',
  data
}: UseSortConfig<T>): UseSortReturn<T> {
  // Sort configuration state
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: initialSortKey,
    direction: initialSortDirection
  });

  // Handle sorting
  const handleSort = (key: keyof T) => {
    let direction: SortDirection = 'asc';

    // If we're already sorting by this key, toggle the direction
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
  };

  // Reset sort to initial state
  const resetSort = () => {
    setSortConfig({
      key: initialSortKey,
      direction: initialSortDirection
    });
  };

  // Compute sorted data
  const sortedData = useMemo(() => {
    // If no sort key, return original data
    if (!sortConfig.key) {
      return [...data];
    }

    // Create a copy to avoid mutating the original
    const sortableData = [...data];

    sortableData.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle number comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      // Handle date comparison
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      // Handle date strings
      if (
        typeof aValue === 'string' &&
        typeof bValue === 'string' &&
        !isNaN(Date.parse(aValue)) &&
        !isNaN(Date.parse(bValue))
      ) {
        const dateA = new Date(aValue).getTime();
        const dateB = new Date(bValue).getTime();
        return sortConfig.direction === 'asc'
          ? dateA - dateB
          : dateB - dateA;
      }

      // Fallback for other types
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sortableData;
  }, [data, sortConfig.key, sortConfig.direction]);

  return {
    sortedData,
    sortConfig,
    handleSort,
    resetSort
  };
} 