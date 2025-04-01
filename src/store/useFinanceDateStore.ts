import { create } from 'zustand';
import { subMonths, addMonths, getMonth, getYear, startOfMonth, endOfMonth } from 'date-fns';

interface FinanceDateState {
  selectedMonth: number;
  selectedYear: number;
  currentDate: Date;
  navigateToPreviousMonth: () => void;
  navigateToNextMonth: () => void;
  setSelectedMonth: (month: number, year: number) => void;
  getMonthDateRange: () => { startDate: Date; endDate: Date };
  setCurrentDate: (date: Date) => void;
}

export const useFinanceDateStore = create<FinanceDateState>((set, get) => ({
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  currentDate: new Date(),

  navigateToPreviousMonth: () => {
    set((state) => {
      let newMonth = state.selectedMonth - 1;
      let newYear = state.selectedYear;

      if (newMonth <= 0) {
        newMonth = 12;
        newYear -= 1;
      }
      
      const newDate = new Date(state.currentDate);
      newDate.setMonth(newDate.getMonth() - 1);

      return {
        selectedMonth: newMonth,
        selectedYear: newYear,
        currentDate: newDate
      };
    });
  },
  
  navigateToNextMonth: () => {
    set((state) => {
      let newMonth = state.selectedMonth + 1;
      let newYear = state.selectedYear;

      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
      
      const newDate = new Date(state.currentDate);
      newDate.setMonth(newDate.getMonth() + 1);

      return {
        selectedMonth: newMonth,
        selectedYear: newYear,
        currentDate: newDate
      };
    });
  },

  setSelectedMonth: (month: number, year: number) => {
    const newDate = new Date(year, month - 1, 1);
    
    set({
      selectedMonth: month,
      selectedYear: year,
      currentDate: newDate
    });
  },

  getMonthDateRange: () => {
    const { selectedYear, selectedMonth } = get();
    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0);
    return { startDate, endDate };
  },
  
  setCurrentDate: (date: Date) => {
    set({
      currentDate: date,
      selectedMonth: date.getMonth() + 1,
      selectedYear: date.getFullYear()
    });
  }
}));
