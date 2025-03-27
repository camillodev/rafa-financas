import { create } from 'zustand';
import * as cardService from '@/services/cardService';
import { CreditCard, CreditCardResponse } from '@/types/finance';
import { CardsState } from '@/types/cards';

// Convert API card responses to our app's card format
const convertApiCards = (apiCards: CreditCardResponse[]): CreditCard[] => {
  return apiCards.map(card => ({
    id: card.id,
    name: card.name,
    type: card.type,
    institution: card.institutions?.name || '',
    institutionId: card.institution_id,
    limit: card.limit,
    dueDate: card.due_date,
    closingDate: card.closing_date,
    isActive: card.is_active
  }));
};

export const useCardsStore = create<CardsState>((set) => ({
  cards: [],
  creditCards: [], // Added to match interface
  isLoading: false,
  error: null,
  
  fetchCards: async () => {
    set({ isLoading: true, error: null });
    try {
      const cardsData = await cardService.fetchCreditCards();
      const cards = convertApiCards(cardsData);
      set({
        cards,
        creditCards: cards,  // Set both properties
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching cards:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  },
  
  // Rename methods to match interface
  addCreditCard: async (card: Omit<CreditCard, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const newCard = await cardService.addCreditCard(card);
      set(state => ({
        cards: [...state.cards, newCard],
        creditCards: [...state.creditCards, newCard],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding card:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  
  updateCreditCard: async (card: CreditCard) => {
    set({ isLoading: true, error: null });
    try {
      await cardService.updateCreditCard(card.id, card);
      set(state => ({
        cards: state.cards.map(c => c.id === card.id ? card : c),
        creditCards: state.creditCards.map(c => c.id === card.id ? card : c),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating card:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  
  deleteCreditCard: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await cardService.deleteCreditCard(id);
      set(state => ({
        cards: state.cards.filter(c => c.id !== id),
        creditCards: state.creditCards.filter(c => c.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting card:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  },
  
  archiveCreditCard: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await cardService.archiveCreditCard(id);
      set(state => {
        const updatedCards = state.cards.map(c =>
          c.id === id ? { ...c, isActive: false } : c
        );
        return {
          cards: updatedCards,
          creditCards: updatedCards,
          isLoading: false
        };
      });
    } catch (error) {
      console.error('Error archiving card:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}));
