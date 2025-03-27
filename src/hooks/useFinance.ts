
import { useEffect } from 'react';
import { getMonth, getYear } from 'date-fns';
import { useCategoriesStore } from '@/store/useCategoriesStore';
import { useTransactionsStore } from '@/store/useTransactionsStore';
import { useBudgetsStore } from '@/store/useBudgetsStore';
import { useGoalsStore } from '@/store/useGoalsStore';
import { useInstitutionsStore } from '@/store/useInstitutionsStore';
import { useCardsStore } from '@/store/useCardsStore';
import { useFinanceNavigation } from '@/hooks/useFinanceNavigation';
import { useFinanceDateStore } from '@/store/useFinanceDateStore';
import { TransactionFilterType } from '@/types/transaction';

// Create a new date store to handle date-related state
<lov-write file_path="src/store/useFinanceDateStore.ts">
import { create } from 'zustand';
import { subMonths, addMonths, getMonth, getYear, startOfMonth, endOfMonth } from 'date-fns';

interface FinanceDateState {
  selectedMonth: Date;
  currentDate: Date;
  
  setSelectedMonth: (date: Date) => void;
  navigateToPreviousMonth: () => void;
  navigateToNextMonth: () => void;
  getMonthDateRange: () => { startDate: Date; endDate: Date };
}

export const useFinanceDateStore = create<FinanceDateState>((set, get) => ({
  selectedMonth: new Date(),
  currentDate: new Date(),
  
  setSelectedMonth: (date: Date) => {
    set({ selectedMonth: date });
  },
  
  navigateToPreviousMonth: () => {
    set(state => ({
      selectedMonth: subMonths(state.selectedMonth, 1)
    }));
  },
  
  navigateToNextMonth: () => {
    set(state => ({
      selectedMonth: addMonths(state.selectedMonth, 1)
    }));
  },
  
  getMonthDateRange: () => {
    const { selectedMonth } = get();
    const startDate = startOfMonth(selectedMonth);
    const endDate = endOfMonth(selectedMonth);
    return { startDate, endDate };
  }
}));
