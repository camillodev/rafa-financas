
import { CreditCard, CreditCardResponse } from '@/types/finance';

// Define the base API URL
const API_URL = 'https://api.example.com';

// Fetch all credit cards
export const fetchCreditCards = async (): Promise<CreditCardResponse[]> => {
  // Mock data for development
  const mockCards: CreditCardResponse[] = [
    { 
      id: '1', 
      name: 'Nubank', 
      type: 'credit', 
      institution_id: '1', 
      limit: 5000, 
      due_date: 15, 
      closing_date: 10, 
      is_active: true, 
      created_at: '2021-01-01', 
      updated_at: '2021-01-01', 
      user_id: '1',
      institutions: { name: 'Nubank', logo: 'nubank.png' }
    },
    { 
      id: '2', 
      name: 'Itaú Platinum', 
      type: 'credit', 
      institution_id: '2', 
      limit: 10000, 
      due_date: 20, 
      closing_date: 15, 
      is_active: true, 
      created_at: '2021-01-01', 
      updated_at: '2021-01-01', 
      user_id: '1',
      institutions: { name: 'Itaú', logo: 'itau.png' }
    }
  ];

  return Promise.resolve(mockCards);
};

// Add a new credit card
export const addCreditCard = async (card: Omit<CreditCard, 'id'>): Promise<CreditCard> => {
  // Mock implementation
  const newCard: CreditCard = {
    id: Math.random().toString(36).substring(7),
    ...card
  };
  
  return Promise.resolve(newCard);
};

// Update an existing credit card
export const updateCreditCard = async (id: string, card: Partial<CreditCard>): Promise<void> => {
  // Mock implementation - in a real app this would make an API call
  return Promise.resolve();
};

// Delete a credit card
export const deleteCreditCard = async (id: string): Promise<void> => {
  // Mock implementation - in a real app this would make an API call
  return Promise.resolve();
};

// Archive a credit card
export const archiveCreditCard = async (id: string): Promise<void> => {
  // Mock implementation - in a real app this would make an API call
  return Promise.resolve();
};
