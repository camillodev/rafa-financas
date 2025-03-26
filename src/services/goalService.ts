
import { supabase } from "@/integrations/supabase/client";
import { GoalModification } from "@/types/finance";

export async function fetchGoals() {
  const { data, error } = await supabase
    .from('goals')
    .select(`
      *,
      categories:category_id (name, color, icon)
    `)
    .order('target_date');
  
  if (error) {
    console.error('Erro ao buscar metas:', error);
    throw error;
  }
  
  return data || [];
}

export async function getGoalById(id: string) {
  const { data, error } = await supabase
    .from('goals')
    .select(`
      *,
      categories:category_id (name, color, icon)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Erro ao buscar meta:', error);
    throw error;
  }
  
  return data;
}

export async function addGoal(goal) {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      title: goal.title,
      description: goal.description,
      category_id: goal.categoryId,
      target_amount: goal.target_amount || goal.targetAmount,
      current_amount: goal.current_amount || goal.currentAmount || 0,
      start_date: goal.start_date instanceof Date ? goal.start_date.toISOString().split('T')[0] : goal.start_date,
      target_date: goal.target_date instanceof Date ? goal.target_date.toISOString().split('T')[0] : goal.target_date,
      is_completed: goal.is_completed || false
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao criar meta:', error);
    throw error;
  }
  
  return data;
}

export async function updateGoal(id: string, goal) {
  const updateData: any = {};
  
  if (goal.title) updateData.title = goal.title;
  if (goal.description !== undefined) updateData.description = goal.description;
  if (goal.categoryId) updateData.category_id = goal.categoryId;
  if (goal.targetAmount) updateData.target_amount = goal.targetAmount;
  if (goal.currentAmount !== undefined) updateData.current_amount = goal.currentAmount;
  if (goal.startDate) {
    updateData.start_date = goal.startDate instanceof Date 
      ? goal.startDate.toISOString().split('T')[0] 
      : goal.startDate;
  }
  if (goal.targetDate) {
    updateData.target_date = goal.targetDate instanceof Date 
      ? goal.targetDate.toISOString().split('T')[0] 
      : goal.targetDate;
  }
  if (goal.isCompleted !== undefined) updateData.is_completed = goal.isCompleted;
  
  const { data, error } = await supabase
    .from('goals')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao atualizar meta:', error);
    throw error;
  }
  
  // Registrar modificação da meta se necessário
  if (Object.keys(updateData).length > 0) {
    await addGoalModification(id, {
      type: 'target_change',
      description: 'Meta atualizada',
      previousValue: '',
      newValue: ''
    });
  }
  
  return data;
}

export async function deleteGoal(id: string) {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir meta:', error);
    throw error;
  }
  
  return true;
}

export async function addContribution(goalId: string, amount: number, date: Date, description: string) {
  // Adicionar a contribuição
  const { data: contribution, error: contributionError } = await supabase
    .from('goal_contributions')
    .insert({
      goal_id: goalId,
      amount: amount,
      date: date instanceof Date ? date.toISOString().split('T')[0] : date,
      description: description
    })
    .select()
    .single();
  
  if (contributionError) {
    console.error('Erro ao adicionar contribuição:', contributionError);
    throw contributionError;
  }
  
  // Atualizar o valor atual da meta
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .select('current_amount')
    .eq('id', goalId)
    .single();
  
  if (goalError) {
    console.error('Erro ao buscar meta para atualização:', goalError);
    throw goalError;
  }
  
  const newAmount = parseFloat(goal.current_amount) + amount;
  
  const { error: updateError } = await supabase
    .from('goals')
    .update({ current_amount: newAmount })
    .eq('id', goalId);
  
  if (updateError) {
    console.error('Erro ao atualizar valor da meta:', updateError);
    throw updateError;
  }
  
  // Registrar modificação da meta
  await addGoalModification(goalId, {
    type: 'contribution',
    description: description || 'Contribuição adicionada',
    amount: amount
  });
  
  return contribution;
}

export async function getContributions(goalId: string) {
  const { data, error } = await supabase
    .from('goal_contributions')
    .select('*')
    .eq('goal_id', goalId)
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Erro ao buscar contribuições:', error);
    throw error;
  }
  
  return data || [];
}

export async function removeContribution(contributionId: string, goalId: string) {
  // Obter o valor da contribuição antes de excluí-la
  const { data: contribution, error: fetchError } = await supabase
    .from('goal_contributions')
    .select('amount')
    .eq('id', contributionId)
    .single();
  
  if (fetchError) {
    console.error('Erro ao buscar contribuição:', fetchError);
    throw fetchError;
  }
  
  // Excluir a contribuição
  const { error: deleteError } = await supabase
    .from('goal_contributions')
    .delete()
    .eq('id', contributionId);
  
  if (deleteError) {
    console.error('Erro ao remover contribuição:', deleteError);
    throw deleteError;
  }
  
  // Atualizar o valor atual da meta
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .select('current_amount')
    .eq('id', goalId)
    .single();
  
  if (goalError) {
    console.error('Erro ao buscar meta para atualização:', goalError);
    throw goalError;
  }
  
  const newAmount = Math.max(0, parseFloat(goal.current_amount) - parseFloat(contribution.amount));
  
  const { error: updateError } = await supabase
    .from('goals')
    .update({ current_amount: newAmount })
    .eq('id', goalId);
  
  if (updateError) {
    console.error('Erro ao atualizar valor da meta:', updateError);
    throw updateError;
  }
  
  // Registrar modificação da meta
  await addGoalModification(goalId, {
    type: 'withdrawal',
    description: 'Contribuição removida',
    amount: -parseFloat(contribution.amount)
  });
  
  return true;
}

// Função auxiliar para registrar modificações de metas
export async function addGoalModification(goalId: string, modification: Partial<GoalModification>) {
  const { error } = await supabase
    .from('goal_modifications')
    .insert({
      goal_id: goalId,
      date: new Date().toISOString().split('T')[0],
      type: modification.type,
      description: modification.description,
      previous_value: modification.previousValue,
      new_value: modification.newValue,
      amount: modification.amount
    });
  
  if (error) {
    console.error('Erro ao registrar modificação da meta:', error);
    // Não lançar erro para não interromper o fluxo principal
  }
  
  return true;
}
