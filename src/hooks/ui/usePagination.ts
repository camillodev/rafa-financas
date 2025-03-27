import { useState, useMemo } from 'react';

export interface UsePaginationConfig<T> {
  defaultPageSize?: number;
  defaultPage?: number;
  pageSizeOptions?: number[];
  data: T[];
}

export interface UsePaginationReturn<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  paginatedItems: T[];
  pageSizeOptions: number[];
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
}

/**
 * A generic pagination hook that can be used with any array of items.
 * 
 * @param config Configuration options for pagination
 * @returns Pagination state and handlers
 */
export function usePagination<T>({
  data,
  defaultPageSize = 10,
  defaultPage = 1,
  pageSizeOptions = [10, 25, 50, 100]
}: UsePaginationConfig<T>): UsePaginationReturn<T> {
  // State for current page and page size
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(data.length / pageSize));
  }, [data.length, pageSize]);

  // Reset to page 1 if current page is out of bounds
  useMemo(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Get items for current page
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, data.length);
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);

  // Navigation functions
  const handlePageChange = (page: number) => {
    // Ensure the page is within valid range
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const handlePageSizeChange = (size: number) => {
    // Calculate the first item index on the current page
    const firstItemIndex = (currentPage - 1) * pageSize;

    // Change the page size
    setPageSize(size);

    // Adjust the current page to preserve the first visible item
    const newPage = Math.floor(firstItemIndex / size) + 1;
    setCurrentPage(Math.max(1, Math.min(newPage, Math.ceil(data.length / size))));
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const firstPage = () => {
    setCurrentPage(1);
  };

  const lastPage = () => {
    setCurrentPage(totalPages);
  };

  return {
    currentPage,
    pageSize,
    totalPages,
    paginatedItems,
    pageSizeOptions,
    handlePageChange,
    handlePageSizeChange,
    nextPage,
    previousPage,
    firstPage,
    lastPage
  };
} 