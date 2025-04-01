
import { useNavigate } from 'react-router-dom';

/**
 * Hook for easy navigation to finance-related pages
 */
export function useFinanceNavigation() {
  const navigate = useNavigate();
  
  /**
   * Navigate to transactions page with optional filters
   */
  const navigateToTransactions = (period = 'all', categoryId?: string, cardId?: string) => {
    navigate('/transactions', { state: { period, categoryId, cardId } });
  };
  
  /**
   * Navigate to goal detail page
   */
  const navigateToGoalDetail = (id: string) => {
    navigate(id ? `/goals/${id}` : '/goals');
  };
  
  return { 
    navigateToTransactions, 
    navigateToGoalDetail 
  };
}

export default useFinanceNavigation;
