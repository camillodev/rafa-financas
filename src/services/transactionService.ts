
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Fetch transactions with pagination
export async function fetchTransactions(
  page = 1,
  pageSize = 20,
  filters: any = {},
  orderBy = { column: 'date', ascending: false }
) {
  try {
    // Get the current session to ensure we're authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      throw new Error('User not authenticated');
    }
    
    // Start building the query
    let query = supabase
      .from('transactions')
      .select(`
        *,
        categories(*),
        institutions(*)
      `, { count: 'exact' });
    
    // Add user_id filter
    query = query.eq('user_id', sessionData.session.user.id);
    
    // Add filters
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.type) query = query.eq('transaction_type', filters.type);
    if (filters.category) query = query.eq('category_id', filters.category);
    if (filters.institution) query = query.eq('institution_id', filters.institution);
    if (filters.card) query = query.eq('card_id', filters.card);
    
    // Add date range filter if provided
    if (filters.startDate && filters.endDate) {
      const startDate = format(new Date(filters.startDate), 'yyyy-MM-dd');
      const endDate = format(new Date(filters.endDate), 'yyyy-MM-dd');
      query = query.gte('date', startDate).lte('date', endDate);
    }
    
    // Add sorting
    query = query.order(orderBy.column, { ascending: orderBy.ascending });
    
    // Add pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
    
    return { 
      data: data || [], 
      count: count || 0,
      page,
      pageSize 
    };
  } catch (error) {
    console.error('Error in fetchTransactions:', error);
    return { data: [], count: 0, page, pageSize };
  }
}

// Add new transaction
export async function addTransaction(transaction: any) {
  try {
    // Get the current session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      throw new Error('User not authenticated');
    }
    
    // Add user_id to transaction data
    transaction.user_id = sessionData.session.user.id;
    
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in addTransaction:', error);
    throw error;
  }
}

// Update existing transaction
export async function updateTransaction(id: string, transaction: any) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update(transaction)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateTransaction:', error);
    throw error;
  }
}

// Delete transaction
export async function deleteTransaction(id: string) {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteTransaction:', error);
    throw error;
  }
}

// Get financial summary for specific month/year
export async function getFinancialSummary(month: number, year: number) {
  try {
    // Get the current session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      throw new Error('User not authenticated');
    }
    
    const startDate = format(new Date(year, month - 1, 1), 'yyyy-MM-dd');
    const endDate = format(new Date(year, month, 0), 'yyyy-MM-dd');
    
    // Query for income
    const { data: incomeData, error: incomeError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', sessionData.session.user.id)
      .eq('transaction_type', 'income')
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (incomeError) {
      console.error('Error fetching income data:', incomeError);
      throw incomeError;
    }
    
    // Query for expenses
    const { data: expenseData, error: expenseError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', sessionData.session.user.id)
      .eq('transaction_type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (expenseError) {
      console.error('Error fetching expense data:', expenseError);
      throw expenseError;
    }
    
    // Calculate totals
    const totalIncome = incomeData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
    const totalExpenses = expenseData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
    const netBalance = totalIncome - totalExpenses;
    
    return {
      totalIncome,
      totalExpenses,
      netBalance
    };
  } catch (error) {
    console.error('Error in getFinancialSummary:', error);
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0
    };
  }
}
