
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTransactions, addTransaction as createTransaction, updateTransaction, deleteTransaction } from '@/services/transactionService';
import { type Transaction } from '@/types/finance';
import { toast } from 'sonner';

export function useTransactions(filters?: {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  institution?: string;
  type?: string;
  minAmount?: number;
  maxAmount?: number;
  status?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const queryClient = useQueryClient();
  
  const {
    data: transactionsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => {
      // Convert filters to compatible format for fetchTransactions
      const apiFilters: any = { ...filters };

      // Convert Date objects to ISO strings
      if (filters?.startDate) {
        apiFilters.startDate = filters.startDate.toISOString().split('T')[0];
      }

      if (filters?.endDate) {
        apiFilters.endDate = filters.endDate.toISOString().split('T')[0];
      }

      // Map institution to institution_id if needed
      if (filters?.institution) {
        apiFilters.institution_id = filters.institution;
        delete apiFilters.institution;
      }

      // Map category to category_id if needed
      if (filters?.category) {
        apiFilters.category_id = filters.category;
        delete apiFilters.category;
      }

      return fetchTransactions(apiFilters);
    },
    enabled: true
  });

  const createMutation = useMutation({
    mutationFn: (transaction: Omit<Transaction, 'id'>) => createTransaction(transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transação criada com sucesso');
    },
    onError: (error) => {
      console.error('Error creating transaction:', error);
      toast.error('Erro ao criar transação');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, transaction }: { id: string; transaction: Partial<Transaction> }) => 
      updateTransaction(id, transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transação atualizada com sucesso');
    },
    onError: (error) => {
      console.error('Error updating transaction:', error);
      toast.error('Erro ao atualizar transação');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transação excluída com sucesso');
    },
    onError: (error) => {
      console.error('Error deleting transaction:', error);
      toast.error('Erro ao excluir transação');
    }
  });

  return {
    transactions: transactionsData?.data || [],
    count: transactionsData?.count || 0,
    isLoading,
    error,
    refetch,
    createTransaction: createMutation.mutate,
    updateTransaction: updateMutation.mutate,
    deleteTransaction: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}
