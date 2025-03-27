
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCards, fetchCardById, addCard as createCard, updateCard, deleteCard } from '@/services/cardService';
import { type CreditCard } from '@/types/finance';
import { toast } from 'sonner';

export function useCards(includeInactive = false) {
  const queryClient = useQueryClient();
  
  const {
    data: cards,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['cards', includeInactive],
    queryFn: () => fetchCards(includeInactive),
    enabled: true
  });

  const createMutation = useMutation({
    mutationFn: (card: Omit<CreditCard, 'id'>) => createCard(card),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast.success('Cartão criado com sucesso');
    },
    onError: (error) => {
      console.error('Error creating card:', error);
      toast.error('Erro ao criar cartão');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, card }: { id: string; card: Partial<CreditCard> }) => 
      updateCard(id, card),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast.success('Cartão atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Error updating card:', error);
      toast.error('Erro ao atualizar cartão');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast.success('Cartão excluído com sucesso');
    },
    onError: (error) => {
      console.error('Error deleting card:', error);
      toast.error('Erro ao excluir cartão');
    }
  });

  return {
    cards: cards || [],
    isLoading,
    error,
    refetch,
    createCard: createMutation.mutate,
    updateCard: updateMutation.mutate,
    deleteCard: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}

export function useCard(id: string) {
  return useQuery({
    queryKey: ['card', id],
    queryFn: () => fetchCardById(id),
    enabled: !!id
  });
}
