
import { useEffect } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';

export const useFinance = () => {
  const finance = useFinanceStore();
  
  useEffect(() => {
    // Load data on first mount
    if (finance.categories.length === 0) {
      finance.fetchAllData();
    }
  }, [finance]);
  
  return finance;
};

export default useFinance;
