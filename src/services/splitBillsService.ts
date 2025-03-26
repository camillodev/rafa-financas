
import { supabase } from "@/integrations/supabase/client";
import { SplitBill, SplitBillGroup, SplitBillParticipant, SplitBillPayment } from "@/types/finance";

// Grupos de divisão de contas
export async function fetchSplitBillGroups() {
  const { data, error } = await supabase
    .from('split_bill_groups')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Erro ao buscar grupos de divisão:', error);
    throw error;
  }
  
  return data || [];
}

export async function getSplitBillGroup(id: string) {
  const { data, error } = await supabase
    .from('split_bill_groups')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Erro ao buscar grupo de divisão:', error);
    throw error;
  }
  
  return data;
}

export async function addSplitBillGroup(group: Omit<SplitBillGroup, 'id' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabase
    .from('split_bill_groups')
    .insert({
      name: group.name
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao criar grupo de divisão:', error);
    throw error;
  }
  
  return data;
}

export async function updateSplitBillGroup(id: string, group: Partial<SplitBillGroup>) {
  const { data, error } = await supabase
    .from('split_bill_groups')
    .update({
      name: group.name
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao atualizar grupo de divisão:', error);
    throw error;
  }
  
  return data;
}

export async function deleteSplitBillGroup(id: string) {
  const { error } = await supabase
    .from('split_bill_groups')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir grupo de divisão:', error);
    throw error;
  }
  
  return true;
}

// Participantes de divisão de contas
export async function fetchParticipants(groupId: string) {
  const { data, error } = await supabase
    .from('split_bill_participants')
    .select('*')
    .eq('group_id', groupId)
    .order('name');
  
  if (error) {
    console.error('Erro ao buscar participantes:', error);
    throw error;
  }
  
  return data || [];
}

export async function addParticipant(participant: Omit<SplitBillParticipant, 'id'>) {
  const { data, error } = await supabase
    .from('split_bill_participants')
    .insert({
      group_id: participant.groupId,
      name: participant.name,
      email: participant.email,
      phone: participant.phone
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao adicionar participante:', error);
    throw error;
  }
  
  return data;
}

export async function updateParticipant(id: string, participant: Partial<SplitBillParticipant>) {
  const updateData: any = {};
  
  if (participant.name) updateData.name = participant.name;
  if (participant.email !== undefined) updateData.email = participant.email;
  if (participant.phone !== undefined) updateData.phone = participant.phone;
  
  const { data, error } = await supabase
    .from('split_bill_participants')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao atualizar participante:', error);
    throw error;
  }
  
  return data;
}

export async function deleteParticipant(id: string) {
  const { error } = await supabase
    .from('split_bill_participants')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir participante:', error);
    throw error;
  }
  
  return true;
}

// Divisões de contas
export async function fetchSplitBills(groupId?: string) {
  let query = supabase
    .from('split_bills')
    .select(`
      *,
      categories:category_id (name, color, icon),
      groups:group_id (name)
    `)
    .order('date', { ascending: false });
  
  if (groupId) {
    query = query.eq('group_id', groupId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Erro ao buscar divisões de contas:', error);
    throw error;
  }
  
  return data || [];
}

export async function getSplitBill(id: string) {
  const { data, error } = await supabase
    .from('split_bills')
    .select(`
      *,
      categories:category_id (name, color, icon),
      groups:group_id (name)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Erro ao buscar divisão de conta:', error);
    throw error;
  }
  
  // Buscar participantes desta divisão
  const { data: shares, error: sharesError } = await supabase
    .from('split_bill_shares')
    .select(`
      *,
      participants:participant_id (name, email, phone)
    `)
    .eq('split_bill_id', id);
  
  if (sharesError) {
    console.error('Erro ao buscar cotas dos participantes:', sharesError);
    throw sharesError;
  }
  
  // Buscar pagamentos desta divisão
  const { data: payments, error: paymentsError } = await supabase
    .from('split_bill_payments')
    .select(`
      *,
      participants:participant_id (name)
    `)
    .eq('split_bill_id', id)
    .order('date', { ascending: false });
  
  if (paymentsError) {
    console.error('Erro ao buscar pagamentos:', paymentsError);
    throw paymentsError;
  }
  
  return {
    ...data,
    shares: shares || [],
    payments: payments || []
  };
}

export async function addSplitBill(bill: Omit<SplitBill, 'id' | 'createdAt' | 'updatedAt'>, participants) {
  // Primeiro, inserir a divisão de conta
  const { data, error } = await supabase
    .from('split_bills')
    .insert({
      name: bill.name,
      total_amount: bill.totalAmount,
      category_id: bill.category,
      group_id: bill.groupId,
      date: bill.date instanceof Date ? bill.date.toISOString().split('T')[0] : bill.date,
      status: bill.status || 'active',
      division_method: bill.divisionMethod || 'equal',
      receipt_image_url: bill.receiptImageUrl
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao criar divisão de conta:', error);
    throw error;
  }
  
  // Depois, inserir as cotas dos participantes
  const billId = data.id;
  const shares = participants.map(participant => ({
    split_bill_id: billId,
    participant_id: participant.participantId,
    amount: participant.amount,
    percentage: participant.percentage,
    weight: participant.weight,
    is_included: participant.isIncluded !== false
  }));
  
  if (shares.length > 0) {
    const { error: sharesError } = await supabase
      .from('split_bill_shares')
      .insert(shares);
    
    if (sharesError) {
      console.error('Erro ao adicionar cotas dos participantes:', sharesError);
      // Excluir a divisão de conta se houver erro
      await supabase.from('split_bills').delete().eq('id', billId);
      throw sharesError;
    }
  }
  
  return data;
}

export async function updateSplitBill(id: string, bill: Partial<SplitBill>, participants?) {
  const updateData: any = {};
  
  if (bill.name) updateData.name = bill.name;
  if (bill.totalAmount !== undefined) updateData.total_amount = bill.totalAmount;
  if (bill.category) updateData.category_id = bill.category;
  if (bill.date) {
    updateData.date = bill.date instanceof Date 
      ? bill.date.toISOString().split('T')[0] 
      : bill.date;
  }
  if (bill.status) updateData.status = bill.status;
  if (bill.divisionMethod) updateData.division_method = bill.divisionMethod;
  if (bill.receiptImageUrl !== undefined) updateData.receipt_image_url = bill.receiptImageUrl;
  
  const { data, error } = await supabase
    .from('split_bills')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao atualizar divisão de conta:', error);
    throw error;
  }
  
  // Atualizar cotas dos participantes se fornecidas
  if (participants) {
    // Remover cotas existentes
    await supabase
      .from('split_bill_shares')
      .delete()
      .eq('split_bill_id', id);
    
    // Inserir novas cotas
    const shares = participants.map(participant => ({
      split_bill_id: id,
      participant_id: participant.participantId,
      amount: participant.amount,
      percentage: participant.percentage,
      weight: participant.weight,
      is_included: participant.isIncluded !== false
    }));
    
    if (shares.length > 0) {
      const { error: sharesError } = await supabase
        .from('split_bill_shares')
        .insert(shares);
      
      if (sharesError) {
        console.error('Erro ao atualizar cotas dos participantes:', sharesError);
        throw sharesError;
      }
    }
  }
  
  return data;
}

export async function deleteSplitBill(id: string) {
  const { error } = await supabase
    .from('split_bills')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir divisão de conta:', error);
    throw error;
  }
  
  return true;
}

// Pagamentos de divisão de contas
export async function addPayment(payment: Omit<SplitBillPayment, 'id'>) {
  const { data, error } = await supabase
    .from('split_bill_payments')
    .insert({
      split_bill_id: payment.splitBillId,
      participant_id: payment.participantId,
      amount: payment.amount,
      date: payment.date instanceof Date ? payment.date.toISOString().split('T')[0] : payment.date,
      notes: payment.notes
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao registrar pagamento:', error);
    throw error;
  }
  
  return data;
}

export async function updatePayment(id: string, payment: Partial<SplitBillPayment>) {
  const updateData: any = {};
  
  if (payment.amount !== undefined) updateData.amount = payment.amount;
  if (payment.date) {
    updateData.date = payment.date instanceof Date 
      ? payment.date.toISOString().split('T')[0] 
      : payment.date;
  }
  if (payment.notes !== undefined) updateData.notes = payment.notes;
  
  const { data, error } = await supabase
    .from('split_bill_payments')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao atualizar pagamento:', error);
    throw error;
  }
  
  return data;
}

export async function deletePayment(id: string) {
  const { error } = await supabase
    .from('split_bill_payments')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir pagamento:', error);
    throw error;
  }
  
  return true;
}

export async function getPaymentSummary(splitBillId: string) {
  // Buscar a divisão e seu valor total
  const { data: bill, error: billError } = await supabase
    .from('split_bills')
    .select('total_amount')
    .eq('id', splitBillId)
    .single();
  
  if (billError) {
    console.error('Erro ao buscar divisão de conta:', billError);
    throw billError;
  }
  
  // Buscar todos os pagamentos
  const { data: payments, error: paymentsError } = await supabase
    .from('split_bill_payments')
    .select('amount')
    .eq('split_bill_id', splitBillId);
  
  if (paymentsError) {
    console.error('Erro ao buscar pagamentos:', paymentsError);
    throw paymentsError;
  }
  
  // Calcular o total pago
  let totalPaid = 0;
  payments?.forEach(payment => {
    totalPaid += parseFloat(payment.amount);
  });
  
  return {
    totalAmount: parseFloat(bill.total_amount),
    totalPaid: totalPaid,
    remaining: parseFloat(bill.total_amount) - totalPaid
  };
}
