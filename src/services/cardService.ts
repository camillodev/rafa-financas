
import { supabase } from '@/integrations/supabase/client';
import { type CreditCard } from '@/types/finance';

// Fetch all credit cards
export async function fetchCards(includeInactive = false) {
  try {
    let query = supabase
      .from('credit_cards')
      .select(`
        *,
        institution:institution_id(id, name, logo)
      `);
    
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query.order('name');

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching credit cards:', error);
    throw error;
  }
}

// Fetch a single credit card by ID
export async function fetchCardById(id: string) {
  try {
    const { data, error } = await supabase
      .from('credit_cards')
      .select(`
        *,
        institution:institution_id(id, name, logo)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching credit card:', error);
    throw error;
  }
}

// Create a new credit card
export async function createCard(card: Omit<CreditCard, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('credit_cards')
      .insert({
        name: card.name,
        institution_id: card.institutionId,
        limit_amount: card.limit,
        closing_day: card.closingDay || card.dueDay,
        due_day: card.dueDay,
        is_active: card.archived !== undefined ? !card.archived : true
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating credit card:', error);
    throw error;
  }
}

// Update an existing credit card
export async function updateCard(id: string, card: Partial<CreditCard>) {
  try {
    const updateData: any = {};
    
    if (card.name !== undefined) updateData.name = card.name;
    if (card.institutionId !== undefined) updateData.institution_id = card.institutionId;
    if (card.limit !== undefined) updateData.limit_amount = card.limit;
    if (card.closingDay !== undefined) updateData.closing_day = card.closingDay;
    if (card.dueDay !== undefined) updateData.due_day = card.dueDay;
    if (card.archived !== undefined) updateData.is_active = !card.archived;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('credit_cards')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating credit card:', error);
    throw error;
  }
}

// Delete a credit card
export async function deleteCard(id: string) {
  try {
    const { error } = await supabase
      .from('credit_cards')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting credit card:', error);
    throw error;
  }
}
