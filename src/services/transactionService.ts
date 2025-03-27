import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types/finance";

interface FilterOptions {
  startDate?: string;
  endDate?: string;
  type?: string;
  search?: string;
  limit?: number | string;
  offset?: number | string;
  category_id?: string;
  subcategory_id?: string;
  institution_id?: string;
  transaction_type?: string;
  status?: string;
  [key: string]: any;
}

export async function fetchTransactions(filters: FilterOptions = {}) {
  let query = supabase
    .from('transactions')
    .select(`
      *,
      categories:category_id (name, color, icon, type),
      subcategory:subcategory_id (name),
      institutions:institution_id (name, logo)
    `)
    .order('date', { ascending: false });
  
  // Aplicar filtros dinâmicos
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'startDate') {
          query = query.gte('date', value as string);
        } else if (key === 'endDate') {
          query = query.lte('date', value as string);
        } else if (key === 'type') {
          query = query.eq('transaction_type', value as string);
        } else if (key === 'search') {
          query = query.ilike('description', `%${String(value)}%`);
        } else if (key === 'limit' || key === 'offset') {
          // Esses filtros são aplicados depois
        } else {
          // Using any cast to avoid Type instantiation is excessively deep error
          (query as any) = (query as any).eq(key, String(value));
        }
      }
    });

    // Adicionar paginação se necessário
    if (filters.limit !== undefined) {
      query = query.limit(Number(filters.limit));
    }
    
    if (filters.offset !== undefined) {
      const offsetValue = Number(filters.offset);
      const limitValue = Number(filters.limit || 10);
      query = query.range(offsetValue, offsetValue + limitValue - 1);
    }
  }
  
  const { data, error, count } = await query;
  
  if (error) {
    console.error('Erro ao buscar transações:', error);
    throw error;
  }
  
  return { data: data || [], count: count || 0 };
}

export async function addTransaction(transaction: Omit<Transaction, 'id'>) {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      amount: transaction.amount,
      category_id: transaction.category,
      subcategory_id: transaction.subcategory,
      date: transaction.date instanceof Date ? transaction.date.toISOString().split('T')[0] : transaction.date,
      settlement_date: transaction.settlementDate instanceof Date ? transaction.settlementDate.toISOString().split('T')[0] : transaction.settlementDate,
      description: transaction.description,
      institution_id: transaction.financialInstitution,
      card_id: transaction.card,
      transaction_type: transaction.type === 'income' ? 'income' : 'expense',
      status: transaction.status || 'completed',
      notes: transaction.description
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao criar transação:', error);
    throw error;
  }
  
  return data;
}

export async function updateTransaction(id: string, transaction: Partial<Transaction>) {
  const updateData: any = {};
  
  if (transaction.amount !== undefined) updateData.amount = transaction.amount;
  if (transaction.category) updateData.category_id = transaction.category;
  if (transaction.subcategory) updateData.subcategory_id = transaction.subcategory;
  if (transaction.date) {
    updateData.date = transaction.date instanceof Date 
      ? transaction.date.toISOString().split('T')[0] 
      : transaction.date;
  }
  if (transaction.settlementDate) {
    updateData.settlement_date = transaction.settlementDate instanceof Date 
      ? transaction.settlementDate.toISOString().split('T')[0] 
      : transaction.settlementDate;
  }
  if (transaction.description) updateData.description = transaction.description;
  if (transaction.financialInstitution) updateData.institution_id = transaction.financialInstitution;
  if (transaction.card) updateData.card_id = transaction.card;
  if (transaction.type) updateData.transaction_type = transaction.type;
  if (transaction.status) updateData.status = transaction.status;
  
  const { data, error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao atualizar transação:', error);
    throw error;
  }
  
  return data;
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir transação:', error);
    throw error;
  }
  
  return true;
}

export async function getFinancialSummary(month: number, year: number) {
  // Obter o primeiro e último dia do mês
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];
  
  // Buscar todas as transações do mês
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, transaction_type')
    .gte('date', startDate)
    .lte('date', endDate);
  
  if (error) {
    console.error('Erro ao buscar resumo financeiro:', error);
    throw error;
  }
  
  // Calcular totais
  const summary = {
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0
  };
  
  data?.forEach(transaction => {
    if (transaction.transaction_type === 'income') {
      summary.totalIncome += parseFloat(String(transaction.amount));
    } else {
      summary.totalExpenses += parseFloat(String(transaction.amount));
    }
  });
  
  summary.netBalance = summary.totalIncome - summary.totalExpenses;
  
  return summary;
}

// Aliasing para compatibilidade com os hooks existentes
export const createTransaction = addTransaction;
