
import { supabase } from "@/integrations/supabase/client";
import { FinancialInstitution } from "@/types/finance";

export async function fetchInstitutions() {
  const { data, error } = await supabase
    .from('institutions')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Erro ao buscar instituições financeiras:', error);
    throw error;
  }
  
  return data || [];
}

export async function addInstitution(institution: Omit<FinancialInstitution, 'id'>) {
  const { data, error } = await supabase
    .from('institutions')
    .insert({
      name: institution.name,
      logo: institution.icon,
      type: 'bank',
      current_balance: institution.currentBalance || 0,
      is_active: institution.isActive !== false
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao criar instituição financeira:', error);
    throw error;
  }
  
  return data;
}

export async function updateInstitution(id: string, institution: Partial<FinancialInstitution>) {
  const updateData: any = {};
  
  if (institution.name) updateData.name = institution.name;
  if (institution.icon) updateData.logo = institution.icon;
  if (institution.currentBalance !== undefined) updateData.current_balance = institution.currentBalance;
  if (institution.isActive !== undefined) updateData.is_active = institution.isActive;
  
  const { data, error } = await supabase
    .from('institutions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao atualizar instituição financeira:', error);
    throw error;
  }
  
  return data;
}

export async function deleteInstitution(id: string) {
  const { error } = await supabase
    .from('institutions')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir instituição financeira:', error);
    throw error;
  }
  
  return true;
}

export async function updateInstitutionBalance(id: string, amount: number) {
  // Primeiro, obtemos o saldo atual
  const { data: currentInstitution, error: fetchError } = await supabase
    .from('institutions')
    .select('current_balance')
    .eq('id', id)
    .single();
  
  if (fetchError) {
    console.error('Erro ao buscar saldo atual:', fetchError);
    throw fetchError;
  }
  
  const newBalance = parseFloat(currentInstitution.current_balance) + amount;
  
  // Atualizar o saldo
  const { data, error } = await supabase
    .from('institutions')
    .update({ current_balance: newBalance })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao atualizar saldo:', error);
    throw error;
  }
  
  return data;
}
