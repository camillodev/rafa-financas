
import { supabase } from "@/integrations/supabase/client";
import { BudgetGoal } from "@/types/finance";

export async function fetchBudgets(month: number, year: number) {
  const { data, error } = await supabase
    .from('budgets')
    .select(`
      *,
      categories:category_id (name, color, icon, type)
    `)
    .eq('month', month)
    .eq('year', year);
  
  if (error) {
    console.error('Erro ao buscar orçamentos:', error);
    throw error;
  }
  
  return data || [];
}

export async function addBudget(budget: Omit<BudgetGoal, 'id' | 'spent'>) {
  const { data, error } = await supabase
    .from('budgets')
    .insert({
      category_id: budget.categoryId,
      amount: budget.amount,
      month: new Date(budget.date || new Date()).getMonth() + 1,
      year: new Date(budget.date || new Date()).getFullYear()
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao criar orçamento:', error);
    throw error;
  }
  
  return data;
}

export async function updateBudget(id: string, budget: Partial<BudgetGoal>) {
  const updateData: any = {};
  
  if (budget.amount) updateData.amount = budget.amount;
  if (budget.categoryId) updateData.category_id = budget.categoryId;
  
  const { data, error } = await supabase
    .from('budgets')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao atualizar orçamento:', error);
    throw error;
  }
  
  return data;
}

export async function deleteBudget(id: string) {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir orçamento:', error);
    throw error;
  }
  
  return true;
}

export async function copyBudget(fromMonth: number, fromYear: number, toMonth: number, toYear: number) {
  // Buscar os orçamentos do mês de origem
  const { data: sourceBudgets, error: fetchError } = await supabase
    .from('budgets')
    .select('*')
    .eq('month', fromMonth)
    .eq('year', fromYear);
  
  if (fetchError) {
    console.error('Erro ao buscar orçamentos de origem:', fetchError);
    throw fetchError;
  }
  
  if (!sourceBudgets || sourceBudgets.length === 0) {
    return { message: 'Nenhum orçamento encontrado para copiar' };
  }
  
  // Preparar os novos orçamentos para o mês de destino
  const newBudgets = sourceBudgets.map(budget => ({
    category_id: budget.category_id,
    amount: budget.amount,
    month: toMonth,
    year: toYear
  }));
  
  // Inserir os novos orçamentos
  const { data, error } = await supabase
    .from('budgets')
    .insert(newBudgets)
    .select();
  
  if (error) {
    console.error('Erro ao copiar orçamentos:', error);
    throw error;
  }
  
  return data;
}

export async function getAnnualBudget(year: number) {
  // Buscar todos os orçamentos do ano
  const { data: budgets, error: budgetsError } = await supabase
    .from('budgets')
    .select(`
      *,
      categories:category_id (name, type)
    `)
    .eq('year', year);
  
  if (budgetsError) {
    console.error('Erro ao buscar orçamentos anuais:', budgetsError);
    throw budgetsError;
  }
  
  // Buscar todas as transações do ano
  const startDate = new Date(year, 0, 1).toISOString().split('T')[0];
  const endDate = new Date(year, 11, 31).toISOString().split('T')[0];
  
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select(`
      amount, 
      date, 
      transaction_type,
      category_id
    `)
    .gte('date', startDate)
    .lte('date', endDate);
  
  if (transactionsError) {
    console.error('Erro ao buscar transações anuais:', transactionsError);
    throw transactionsError;
  }
  
  // Organizar os dados por mês e categoria
  const result = {
    budgets: budgets || [],
    transactions: transactions || [],
    summary: {}
  };
  
  return result;
}
