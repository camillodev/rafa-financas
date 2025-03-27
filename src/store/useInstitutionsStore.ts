
import { create } from 'zustand';
import * as institutionService from '@/services/institutionService';
import { FinancialInstitution, FinancialInstitutionResponse } from '@/types/finance';

interface InstitutionsState {
  institutions: FinancialInstitution[];
  isLoading: boolean;
  error: string | null;
  
  // Fetch operations
  fetchInstitutions: () => Promise<void>;
  
  // CRUD operations
  addInstitution: (institution: Omit<FinancialInstitution, 'id'>) => Promise<void>;
  updateInstitution: (institution: FinancialInstitution) => Promise<void>;
  deleteInstitution: (id: string) => Promise<void>;
  archiveInstitution: (id: string) => Promise<void>;
}

// Convert API institution responses to our app's institution format
const convertApiInstitutions = (apiInstitutions: FinancialInstitutionResponse[]): FinancialInstitution[] => {
  return apiInstitutions.map(inst => ({
    id: inst.id,
    name: inst.name,
    type: inst.type,
    icon: inst.logo,
    currentBalance: inst.current_balance,
    isActive: inst.is_active
  }));
};

export const useInstitutionsStore = create<InstitutionsState>((set) => ({
  institutions: [],
  isLoading: false,
  error: null,
  
  fetchInstitutions: async () => {
    set({ isLoading: true, error: null });
    try {
      const institutionsData = await institutionService.fetchInstitutions();
      const institutions = convertApiInstitutions(institutionsData);
      set({ institutions, isLoading: false });
    } catch (error) {
      console.error('Error fetching institutions:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  },
  
  addInstitution: async (institution: Omit<FinancialInstitution, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const newInstitution = await institutionService.addInstitution(institution);
      set(state => ({
        institutions: [...state.institutions, newInstitution],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding institution:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  
  updateInstitution: async (institution: FinancialInstitution) => {
    set({ isLoading: true, error: null });
    try {
      await institutionService.updateInstitution(institution.id, institution);
      set(state => ({
        institutions: state.institutions.map(i => i.id === institution.id ? institution : i),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating institution:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  
  deleteInstitution: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await institutionService.deleteInstitution(id);
      set(state => ({
        institutions: state.institutions.filter(i => i.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting institution:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  
  archiveInstitution: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await institutionService.archiveInstitution(id);
      set(state => ({
        institutions: state.institutions.map(i => i.id === id ? { ...i, isActive: false } : i),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error archiving institution:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}));
