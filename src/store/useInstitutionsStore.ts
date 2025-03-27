import { create } from 'zustand';
import * as institutionService from '@/services/institutionService';
import { FinancialInstitution, FinancialInstitutionResponse } from '@/types/finance';
import { InstitutionsState } from '@/types/institutions';

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
  financialInstitutions: [], // Added to match interface
  isLoading: false,
  error: null,
  
  fetchInstitutions: async () => {
    set({ isLoading: true, error: null });
    try {
      const institutionsData = await institutionService.fetchInstitutions();
      const institutions = convertApiInstitutions(institutionsData);
      set({
        institutions,
        financialInstitutions: institutions, // Set both properties
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching institutions:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  },
  
  // Rename methods to match interface
  addFinancialInstitution: async (institution: Omit<FinancialInstitution, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const newInstitution = await institutionService.addInstitution(institution);
      set(state => ({
        institutions: [...state.institutions, newInstitution],
        financialInstitutions: [...state.financialInstitutions, newInstitution],
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
  
  updateFinancialInstitution: async (institution: FinancialInstitution) => {
    set({ isLoading: true, error: null });
    try {
      await institutionService.updateInstitution(institution.id, institution);
      set(state => ({
        institutions: state.institutions.map(i => i.id === institution.id ? institution : i),
        financialInstitutions: state.financialInstitutions.map(i => i.id === institution.id ? institution : i),
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
  
  deleteFinancialInstitution: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await institutionService.deleteInstitution(id);
      set(state => ({
        institutions: state.institutions.filter(i => i.id !== id),
        financialInstitutions: state.financialInstitutions.filter(i => i.id !== id),
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
  
  archiveFinancialInstitution: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await institutionService.archiveInstitution(id);
      set(state => {
        const updatedInstitutions = state.institutions.map(i =>
          i.id === id ? { ...i, isActive: false } : i
        );
        return {
          institutions: updatedInstitutions,
          financialInstitutions: updatedInstitutions,
          isLoading: false
        };
      });
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
