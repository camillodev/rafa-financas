import { supabase } from '@/lib/supabase';
import { CreditCard } from '@/types/finance';

// Tipo para representar como os cartões são armazenados no Supabase
interface CreditCardResponse {
  id: string;
  name: string;
  closing_day: number;
  due_day: number;
  institution_id: string;
  limit_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  institutions?: {
    name?: string;
  };
}

// Função para converter a resposta da API para o formato usado na aplicação
const convertApiResponseToCard = (card: CreditCardResponse): CreditCard => {
  return {
    id: card.id,
    name: card.name,
    type: 'credit', // Valor padrão
    institutionId: card.institution_id,
    institution: card.institutions?.name || '',
    limit: card.limit_amount,
    dueDate: card.due_day,
    dueDay: card.due_day,
    closingDate: card.closing_day,
    closingDay: card.closing_day,
    isActive: card.is_active,
    // Campos opcionais
    number: '',
    brand: 'Visa', // Valor padrão
    color: '#4F46E5', // Valor padrão
    used: 0,
    archived: !card.is_active
  };
};

// Função para converter o cartão do formato da aplicação para o formato da API
const convertCardToApiRequest = (card: Omit<CreditCard, 'id'> | CreditCard) => {
  return {
    name: card.name,
    institution_id: card.institutionId,
    limit_amount: card.limit,
    due_day: card.dueDay || card.dueDate,
    closing_day: card.closingDay || card.closingDate || 1,
    is_active: card.isActive !== false
  };
};

// Buscar todos os cartões
export const fetchCreditCards = async (): Promise<CreditCard[]> => {
  const { data, error } = await supabase
    .from('credit_cards')
    .select('*, institutions(name)')
    .order('name');

  if (error) {
    console.error('Error fetching credit cards:', error);
    throw error;
  }

  return (data || []).map(convertApiResponseToCard);
};

// Adicionar um novo cartão
export const addCreditCard = async (card: Omit<CreditCard, 'id'>): Promise<CreditCard> => {
  const apiCard = convertCardToApiRequest(card);
  
  const { data, error } = await supabase
    .from('credit_cards')
    .insert(apiCard)
    .select('*, institutions(name)')
    .single();

  if (error) {
    console.error('Error adding credit card:', error);
    throw error;
  }

  return convertApiResponseToCard(data);
};

// Atualizar um cartão existente
export const updateCreditCard = async (id: string, card: Partial<CreditCard>): Promise<void> => {
  const apiCard = convertCardToApiRequest({ ...card, id } as CreditCard);
  
  const { error } = await supabase
    .from('credit_cards')
    .update(apiCard)
    .eq('id', id);

  if (error) {
    console.error('Error updating credit card:', error);
    throw error;
  }
};

// Deletar um cartão
export const deleteCreditCard = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('credit_cards')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting credit card:', error);
    throw error;
  }
};

// Arquivar/desarquivar um cartão
export const archiveCreditCard = async (id: string, archived: boolean): Promise<void> => {
  const { error } = await supabase
    .from('credit_cards')
    .update({ is_active: !archived })
    .eq('id', id);

  if (error) {
    console.error('Error archiving credit card:', error);
    throw error;
  }
};

// Aliases to match imports in useCards.ts
export const fetchCards = fetchCreditCards;
export const fetchCardById = async (id: string): Promise<CreditCard | null> => {
  const { data, error } = await supabase
    .from('credit_cards')
    .select('*, institutions(name)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching credit card:', error);
    return null;
  }

  return convertApiResponseToCard(data);
};
export const addCard = addCreditCard;
export const updateCard = updateCreditCard;
export const deleteCard = deleteCreditCard;
