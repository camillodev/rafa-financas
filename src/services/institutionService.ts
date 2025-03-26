
import { supabase } from '@/integrations/supabase/client';
import { type FinancialInstitution } from '@/types/finance';

// Fetch all institutions
export async function fetchInstitutions(includeInactive = false) {
  try {
    let query = supabase.from('institutions').select('*');
    
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query.order('name');

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching institutions:', error);
    throw error;
  }
}

// Fetch a single institution by ID
export async function fetchInstitutionById(id: string) {
  try {
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching institution:', error);
    throw error;
  }
}

// Create a new institution
export async function createInstitution(institution: Omit<FinancialInstitution, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('institutions')
      .insert({
        name: institution.name,
        type: institution.type || 'bank',
        logo: institution.icon,
        is_active: institution.isActive ?? true,
        current_balance: institution.currentBalance || 0
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating institution:', error);
    throw error;
  }
}

// Update an existing institution
export async function updateInstitution(id: string, institution: Partial<FinancialInstitution>) {
  try {
    const updateData: any = {};
    
    if (institution.name !== undefined) updateData.name = institution.name;
    if (institution.type !== undefined) updateData.type = institution.type;
    if (institution.icon !== undefined) updateData.logo = institution.icon;
    if (institution.isActive !== undefined) updateData.is_active = institution.isActive;
    if (institution.currentBalance !== undefined) updateData.current_balance = institution.currentBalance;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('institutions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating institution:', error);
    throw error;
  }
}

// Delete an institution
export async function deleteInstitution(id: string) {
  try {
    const { error } = await supabase
      .from('institutions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting institution:', error);
    throw error;
  }
}
