
import { supabase } from '@/integrations/supabase/client';
import { type Transaction } from '@/types/finance';

// Fetch transactions with optional filters
export async function fetchTransactions(filters?: {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  institution?: string;
  type?: string;
  minAmount?: number;
  maxAmount?: number;
  status?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  try {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        category:category_id(id, name, color, icon),
        subcategory:subcategory_id(id, name, color, icon),
        institution:institution_id(id, name, logo),
        card:card_id(id, name)
      `);

    // Apply filters
    if (filters) {
      if (filters.startDate) {
        query = query.gte('date', filters.startDate.toISOString().split('T')[0]);
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate.toISOString().split('T')[0]);
      }
      if (filters.category) {
        query = query.eq('category_id', filters.category);
      }
      if (filters.institution) {
        query = query.eq('institution_id', filters.institution);
      }
      if (filters.type) {
        query = query.eq('transaction_type', filters.type);
      }
      if (filters.minAmount !== undefined) {
        query = query.gte('amount', filters.minAmount);
      }
      if (filters.maxAmount !== undefined) {
        query = query.lte('amount', filters.maxAmount);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      // Sorting
      if (filters.sortBy) {
        query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
      } else {
        query = query.order('date', { ascending: false });
      }

      // Pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }
    } else {
      // Default sorting by date descending
      query = query.order('date', { ascending: false });
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return { data, count };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

// Create a new transaction
export async function createTransaction(transaction: Omit<Transaction, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        amount: transaction.amount,
        date: transaction.date.toISOString().split('T')[0],
        settlement_date: transaction.settlementDate ? transaction.settlementDate.toISOString().split('T')[0] : null,
        description: transaction.description,
        category_id: transaction.category,
        subcategory_id: transaction.subcategory,
        institution_id: transaction.financialInstitution,
        card_id: transaction.card,
        transaction_type: transaction.type,
        status: transaction.status,
        notes: transaction.description
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

// Update an existing transaction
export async function updateTransaction(id: string, transaction: Partial<Transaction>) {
  try {
    const updateData: any = {};
    
    if (transaction.amount !== undefined) updateData.amount = transaction.amount;
    if (transaction.date !== undefined) updateData.date = transaction.date.toISOString().split('T')[0];
    if (transaction.settlementDate !== undefined) {
      updateData.settlement_date = transaction.settlementDate ? 
        transaction.settlementDate.toISOString().split('T')[0] : null;
    }
    if (transaction.description !== undefined) updateData.description = transaction.description;
    if (transaction.category !== undefined) updateData.category_id = transaction.category;
    if (transaction.subcategory !== undefined) updateData.subcategory_id = transaction.subcategory;
    if (transaction.financialInstitution !== undefined) updateData.institution_id = transaction.financialInstitution;
    if (transaction.card !== undefined) updateData.card_id = transaction.card;
    if (transaction.type !== undefined) updateData.transaction_type = transaction.type;
    if (transaction.status !== undefined) updateData.status = transaction.status;
    if (transaction.description !== undefined) updateData.notes = transaction.description;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
}

// Delete a transaction
export async function deleteTransaction(id: string) {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}
