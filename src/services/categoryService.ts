
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/finance";

export async function fetchCategories(includeInactive = false) {
  try {
    let query = supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
}

export async function addCategory(category: Omit<Category, 'id'>) {
  try {
    // Get the current session to ensure we're authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      console.error('No active session found. User must be authenticated.');
      throw new Error('User not authenticated');
    }
    
    // Add the user_id to the category data
    const categoryData = { 
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      is_active: true,
      user_id: sessionData.session.user.id
    };
    
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
}

export async function updateCategory(id: string, category: Partial<Category>) {
  try {
    const updateData: any = {};
    
    if (category.name) updateData.name = category.name;
    if (category.icon) updateData.icon = category.icon;
    if (category.color) updateData.color = category.color;
    if (category.type) updateData.type = category.type;
    if (category.isActive !== undefined) updateData.is_active = category.isActive;
    
    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

export async function deleteCategory(id: string) {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao excluir categoria:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

// Subcategory functions
export async function fetchSubcategories(categoryId: string) {
  try {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', categoryId)
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar subcategorias:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return [];
  }
}

export async function addSubcategory(subcategory: any) {
  try {
    // Get the current session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      throw new Error('User not authenticated');
    }
    
    // Create the subcategory with user_id
    const { data, error } = await supabase
      .from('subcategories')
      .insert({
        name: subcategory.name,
        category_id: subcategory.categoryId,
        color: subcategory.color || null,
        user_id: sessionData.session.user.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao adicionar subcategoria:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error adding subcategory:', error);
    throw error;
  }
}

export async function updateSubcategory(id: string, subcategory: any) {
  try {
    const { data, error } = await supabase
      .from('subcategories')
      .update({
        name: subcategory.name,
        category_id: subcategory.categoryId,
        color: subcategory.color || null
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar subcategoria:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating subcategory:', error);
    throw error;
  }
}

export async function deleteSubcategory(id: string) {
  try {
    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao excluir subcategoria:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    throw error;
  }
}
