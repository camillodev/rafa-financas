import { useTransactionsStore } from '@/store/useTransactionsStore';
import { useCategoriesStore } from '@/store/useCategoriesStore';
import { useBudgetsStore } from '@/store/useBudgetsStore';
import { useGoalsStore } from '@/store/useGoalsStore';
import { useInstitutionsStore } from '@/store/useInstitutionsStore';
import { useCardsStore } from '@/store/useCardsStore';
import { useFinanceDateStore } from '@/store/useFinanceDateStore';

/**
 * Fetches all finance data from various domain services
 */
export const fetchAllFinanceData = async (): Promise<void> => {
  try {
    const { getMonthDateRange, selectedMonth } = useFinanceDateStore.getState();
    const { startDate, endDate } = getMonthDateRange();
    const month = startDate.getMonth() + 1; // JavaScript months are 0-indexed
    const year = startDate.getFullYear();

    // Fetch data in parallel
    await Promise.all([
      useTransactionsStore.getState().fetchTransactions(),
      useCategoriesStore.getState().fetchCategories(),
      useBudgetsStore.getState().fetchBudgets(month, year),
      useGoalsStore.getState().fetchGoals(),
      useInstitutionsStore.getState().fetchInstitutions(),
      useCardsStore.getState().fetchCards()
    ]);

    console.log('All finance data fetched successfully');
  } catch (error) {
    console.error('Error fetching finance data:', error);
    throw error;
  }
}; 