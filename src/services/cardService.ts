
import { supabase } from "@/integrations/supabase/client";
import { CreditCard } from "@/types/finance";

export async function fetchCards(includeInactive = false) {
  let query = supabase
    .from('credit_cards')
    .select(`
      *,
      institutions:institution_id (name, logo)
    `)
    .order('name');
  
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Erro ao buscar cartões de crédito:', error);
    throw error;
  }
  
  return data || [];
}

export async function fetchCardById(id: string) {
  const { data, error } = await supabase
    .from('credit_cards')
    .select(`
      *,
      institutions:institution_id (name, logo)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Erro ao buscar cartão de crédito:', error);
    throw error;
  }
  
  return data;
}

export async function addCard(card: Omit<CreditCard, 'id'>) {
  const { data, error } = await supabase
    .from('credit_cards')
    .insert({
      name: card.name,
      institution_id: card.institutionId,
      limit_amount: card.limit,
      closing_day: card.closingDay || card.dueDate - 7,
      due_day: card.dueDate,
      is_active: true
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao criar cartão de crédito:', error);
    throw error;
  }
  
  return data;
}

export async function updateCard(id: string, card: Partial<CreditCard>) {
  const updateData: any = {};
  
  if (card.name) updateData.name = card.name;
  if (card.institutionId) updateData.institution_id = card.institutionId;
  if (card.limit) updateData.limit_amount = card.limit;
  if (card.dueDate) {
    updateData.due_day = card.dueDate;
    // Se atualizar o dia de vencimento, também atualiza o dia de fechamento (7 dias antes por padrão)
    if (!card.closingDay) {
      updateData.closing_day = card.dueDate - 7;
    }
  }
  if (card.closingDay) updateData.closing_day = card.closingDay;
  if (card.isActive !== undefined) updateData.is_active = card.isActive;
  
  const { data, error } = await supabase
    .from('credit_cards')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao atualizar cartão de crédito:', error);
    throw error;
  }
  
  return data;
}

export async function deleteCard(id: string) {
  const { error } = await supabase
    .from('credit_cards')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir cartão de crédito:', error);
    throw error;
  }
  
  return true;
}

export async function getCardUsage(id: string, month: number, year: number) {
  // Obter o primeiro e último dia do mês
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];
  
  // Buscar todas as transações do cartão no mês
  const { data, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('card_id', id)
    .eq('transaction_type', 'expense')
    .gte('date', startDate)
    .lte('date', endDate);
  
  if (error) {
    console.error('Erro ao buscar uso do cartão:', error);
    throw error;
  }
  
  // Calcular o total gasto
  let totalUsed = 0;
  data?.forEach(transaction => {
    totalUsed += parseFloat(String(transaction.amount));
  });
  
  return totalUsed;
}

// Aliasing para compatibilidade com os hooks existentes
export const createCard = addCard;
