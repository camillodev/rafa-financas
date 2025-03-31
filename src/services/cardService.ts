
import { CreditCard } from '@/types/finance';
import { supabase } from '@/integrations/supabase/client';

export const fetchCards = async (includeInactive = false) => {
  let query = supabase
    .from('credit_cards')
    .select(`
      *,
      institutions:institution_id (
        name,
        icon
      )
    `);
  
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching cards:', error);
    throw error;
  }
  
  // Transform data to match CreditCard type
  return data.map((card: any) => ({
    id: card.id,
    name: card.name,
    type: card.type,
    institution: card.institutions?.name || '',
    institutionId: card.institution_id,
    limit: card.limit,
    dueDate: card.due_date,
    closingDate: card.closing_date,
    isActive: card.is_active,
    // Campos adicionais
    number: card.number,
    brand: card.brand,
    color: card.color,
    used: card.used,
    dueDay: card.due_date,
    closingDay: card.closing_date,
    archived: !card.is_active
  }));
};

export const fetchCardById = async (id: string) => {
  const { data, error } = await supabase
    .from('credit_cards')
    .select(`
      *,
      institutions:institution_id (
        name,
        icon
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching card with ID ${id}:`, error);
    throw error;
  }
  
  // Transform data to match CreditCard type
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    institution: data.institutions?.name || '',
    institutionId: data.institution_id,
    limit: data.limit,
    dueDate: data.due_date,
    closingDate: data.closing_date,
    isActive: data.is_active,
    // Campos adicionais
    number: data.number,
    brand: data.brand,
    color: data.color,
    used: data.used,
    dueDay: data.due_date,
    closingDay: data.closing_date,
    archived: !data.is_active
  };
};

export const addCard = async (card: Omit<CreditCard, 'id'>) => {
  // Transformar os campos para o formato esperado pelo Supabase
  const cardData = {
    name: card.name,
    type: card.type || 'credit',
    institution_id: card.institutionId,
    limit: card.limit,
    due_date: card.dueDate,
    closing_date: card.closingDate,
    is_active: card.isActive,
    // Campos adicionais
    number: card.number,
    brand: card.brand,
    color: card.color
  };
  
  const { data, error } = await supabase
    .from('credit_cards')
    .insert(cardData)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding card:', error);
    throw error;
  }
  
  return data;
};

export const updateCard = async (id: string, card: Partial<CreditCard>) => {
  // Transformar os campos para o formato esperado pelo Supabase
  const cardData: any = {};
  
  if (card.name !== undefined) cardData.name = card.name;
  if (card.type !== undefined) cardData.type = card.type;
  if (card.institutionId !== undefined) cardData.institution_id = card.institutionId;
  if (card.limit !== undefined) cardData.limit = card.limit;
  if (card.dueDate !== undefined) cardData.due_date = card.dueDate;
  if (card.closingDate !== undefined) cardData.closing_date = card.closingDate;
  if (card.isActive !== undefined) cardData.is_active = card.isActive;
  if (card.number !== undefined) cardData.number = card.number;
  if (card.brand !== undefined) cardData.brand = card.brand;
  if (card.color !== undefined) cardData.color = card.color;
  
  const { data, error } = await supabase
    .from('credit_cards')
    .update(cardData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating card with ID ${id}:`, error);
    throw error;
  }
  
  return data;
};

export const deleteCard = async (id: string) => {
  const { error } = await supabase
    .from('credit_cards')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error deleting card with ID ${id}:`, error);
    throw error;
  }
  
  return true;
};
