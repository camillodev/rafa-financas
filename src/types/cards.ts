import { CreditCard } from '@/types/finance';

export interface CardsState {
  cards: any[];
  creditCards: CreditCard[];
  isLoading: boolean;
  error: string | null;

  // Fetch operations
  fetchCards: () => Promise<void>;

  // CRUD operations
  addCreditCard: (card: Omit<CreditCard, 'id'>) => Promise<void>;
  updateCreditCard: (id: string, card: Partial<CreditCard>) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;
  archiveCreditCard: (id: string, archived: boolean) => Promise<void>;
} 