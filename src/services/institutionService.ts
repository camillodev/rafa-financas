
import { FinancialInstitution, FinancialInstitutionResponse } from '@/types/finance';

// Define the base API URL
const API_URL = 'https://api.example.com';

// Fetch all financial institutions
export const fetchInstitutions = async (): Promise<FinancialInstitutionResponse[]> => {
  // Mock data for development
  const mockInstitutions: FinancialInstitutionResponse[] = [
    { 
      id: '1', 
      name: 'Nubank', 
      type: 'bank', 
      logo: 'nubank.png', 
      current_balance: 5000, 
      is_active: true, 
      created_at: '2021-01-01', 
      updated_at: '2021-01-01', 
      user_id: '1'
    },
    { 
      id: '2', 
      name: 'Itaú', 
      type: 'bank', 
      logo: 'itau.png', 
      current_balance: 10000, 
      is_active: true, 
      created_at: '2021-01-01', 
      updated_at: '2021-01-01', 
      user_id: '1'
    }
  ];

  return Promise.resolve(mockInstitutions);
};

// Add a new financial institution
export const addInstitution = async (institution: Omit<FinancialInstitution, 'id'>): Promise<FinancialInstitution> => {
  // Mock implementation
  const newInstitution: FinancialInstitution = {
    id: Math.random().toString(36).substring(7),
    ...institution
  };
  
  return Promise.resolve(newInstitution);
};

// Update an existing financial institution
export const updateInstitution = async (id: string, institution: Partial<FinancialInstitution>): Promise<void> => {
  // Mock implementation - in a real app this would make an API call
  return Promise.resolve();
};

// Delete a financial institution
export const deleteInstitution = async (id: string): Promise<void> => {
  // Mock implementation - in a real app this would make an API call
  return Promise.resolve();
};

// Archive a financial institution
export const archiveInstitution = async (id: string): Promise<void> => {
  // Mock implementation - in a real app this would make an API call
  return Promise.resolve();
};
