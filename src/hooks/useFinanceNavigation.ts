
import { useNavigate } from 'react-router-dom';
import { TransactionFilterType } from '@/types/transaction';

export function useFinanceNavigation() {
  const navigate = useNavigate();
  
  const navigateToTransactions = (filter?: TransactionFilterType | string) => {
    if (typeof filter === 'string') {
      // Handle legacy string-based filters (convert to type filter)
      navigate(`/transactions?type=${filter}`);
    } else if (filter) {
      // Convert filter object to URL params
      const params = new URLSearchParams();
      
      if (filter.type) params.append('type', filter.type);
      if (filter.startDate) params.append('startDate', filter.startDate.toISOString());
      if (filter.endDate) params.append('endDate', filter.endDate.toISOString());
      if (filter.categories?.length) params.append('categories', filter.categories.join(','));
      if (filter.status) params.append('status', filter.status);
      if (filter.institution) params.append('institution', filter.institution);
      if (filter.card) params.append('card', filter.card);
      if (filter.search) params.append('search', filter.search);
      
      navigate(`/transactions?${params.toString()}`);
    } else {
      navigate('/transactions');
    }
  };
  
  const navigateToGoalDetail = (id: string) => {
    navigate(`/goals/${id}`);
  };
  
  return {
    navigateToTransactions,
    navigateToGoalDetail
  };
}
