export interface FinanceDateState {
  selectedMonth: Date;
  currentDate: Date;
  setSelectedMonth: (date: Date) => void;
  navigateToPreviousMonth: () => void;
  navigateToNextMonth: () => void;
  getMonthDateRange: () => { startDate: Date; endDate: Date };
} 