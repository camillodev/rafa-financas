import { useState } from 'react';

interface UseDateReturn {
  currentDate: Date;
  navigateToPreviousMonth: () => void;
  navigateToNextMonth: () => void;
  navigateToToday: () => void;
  formatMonthYear: (date?: Date) => string;
}

/**
 * Hook for managing date navigation within the application
 */
export function useDate(): UseDateReturn {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  /**
   * Navigate to the previous month
   */
  const navigateToPreviousMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  /**
   * Navigate to the next month
   */
  const navigateToNextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  /**
   * Navigate to the current month
   */
  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  /**
   * Format date to localized month and year string
   */
  const formatMonthYear = (date: Date = currentDate) => {
    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  };

  return {
    currentDate,
    navigateToPreviousMonth,
    navigateToNextMonth,
    navigateToToday,
    formatMonthYear,
  };
} 