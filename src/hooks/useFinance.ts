import { useFinanceDateStore } from '../store/useFinanceDateStore';

export const useFinance = () => {
  const {
    selectedMonth,
    currentDate,
    setSelectedMonth,
    navigateToPreviousMonth,
    navigateToNextMonth,
    getMonthDateRange
  } = useFinanceDateStore();

  // Additional finance-related logic can be added here

  return {
    selectedMonth,
    currentDate,
    setSelectedMonth,
    navigateToPreviousMonth,
    navigateToNextMonth,
    getMonthDateRange
  };
};

