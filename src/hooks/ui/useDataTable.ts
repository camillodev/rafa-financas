import { useState, useMemo } from 'react';
import { usePagination } from './usePagination';
import { useSort, SortDirection } from './useSort';

export interface UseDataTableConfig<T> {
  data: T[];
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  defaultSortKey?: keyof T | null;
  defaultSortDirection?: SortDirection;
}

export interface UseDataTableReturn<T> {
  // Data
  filteredData: T[];

  // Pagination
  currentPage: number;
  pageSize: number;
  totalPages: number;
  paginatedItems: T[];
  pageSizeOptions: number[];
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;

  // Selection
  selectedItems: T[];
  isItemSelected: (item: T) => boolean;
  toggleItemSelection: (item: T) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleSelectAll: () => void;

  // Sorting
  sortedData: T[];
  sortKey: keyof T | null;
  sortDirection: SortDirection;
  handleSort: (key: keyof T) => void;
  resetSort: () => void;
}

export function useDataTable<T>({
  data,
  defaultPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  defaultSortKey = null,
  defaultSortDirection = 'asc'
}: UseDataTableConfig<T>): UseDataTableReturn<T> {
  // Set up sorting
  const {
    sortedData,
    sortConfig,
    handleSort,
    resetSort
  } = useSort({
    data,
    initialSortKey: defaultSortKey,
    initialSortDirection: defaultSortDirection
  });

  // Use sorted data for pagination
  const pagination = usePagination({
    data: sortedData,
    defaultPageSize,
    pageSizeOptions
  });

  // Selection state
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  // Clear selection when data changes
  useMemo(() => {
    setSelectedItems([]);
  }, [data]);

  // Selection helpers
  const isItemSelected = (item: T) => {
    return selectedItems.includes(item);
  };

  const toggleItemSelection = (item: T) => {
    if (isItemSelected(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const selectAll = () => {
    setSelectedItems([...sortedData]);
  };

  const deselectAll = () => {
    setSelectedItems([]);
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === sortedData.length) {
      deselectAll();
    } else {
      selectAll();
    }
  };

  return {
    // Data
    filteredData: sortedData,

    // Pagination
    ...pagination,

    // Selection
    selectedItems,
    isItemSelected,
    toggleItemSelection,
    selectAll,
    deselectAll,
    toggleSelectAll,

    // Sorting
    sortedData,
    sortKey: sortConfig.key,
    sortDirection: sortConfig.direction,
    handleSort,
    resetSort
  };
} 