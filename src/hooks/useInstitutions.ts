
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchInstitutions, fetchInstitutionById, createInstitution, updateInstitution, deleteInstitution } from '@/services/institutionService';
import { type FinancialInstitution } from '@/types/finance';
import { toast } from 'sonner';

export function useInstitutions(includeInactive = false) {
  const queryClient = useQueryClient();
  
  const {
    data: institutions,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['institutions', includeInactive],
    queryFn: () => fetchInstitutions(includeInactive),
    enabled: true
  });

  const createMutation = useMutation({
    mutationFn: (institution: Omit<FinancialInstitution, 'id'>) => createInstitution(institution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      toast.success('Instituição criada com sucesso');
    },
    onError: (error) => {
      console.error('Error creating institution:', error);
      toast.error('Erro ao criar instituição');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, institution }: { id: string; institution: Partial<FinancialInstitution> }) => 
      updateInstitution(id, institution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      toast.success('Instituição atualizada com sucesso');
    },
    onError: (error) => {
      console.error('Error updating institution:', error);
      toast.error('Erro ao atualizar instituição');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInstitution(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      toast.success('Instituição excluída com sucesso');
    },
    onError: (error) => {
      console.error('Error deleting institution:', error);
      toast.error('Erro ao excluir instituição');
    }
  });

  return {
    institutions: institutions || [],
    isLoading,
    error,
    refetch,
    createInstitution: createMutation.mutate,
    updateInstitution: updateMutation.mutate,
    deleteInstitution: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}

export function useInstitution(id: string) {
  return useQuery({
    queryKey: ['institution', id],
    queryFn: () => fetchInstitutionById(id),
    enabled: !!id
  });
}
