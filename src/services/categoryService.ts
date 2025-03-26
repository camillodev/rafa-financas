
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/finance";

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
  
  return data || [];
}

export async function addCategory(category: Omit<Category, 'id'>) {
  const { data, error } = await supabase
    .from('categories')
    .insert({ 
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type 
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao criar categoria:', error);
    throw error;
  }
  
  return data;
}

export async function updateCategory(id: string, category: Partial<Category>) {
  const { data, error } = await supabase
    .from('categories')
    .update({ 
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type 
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw error;
  }
  
  return data;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir categoria:', error);
    throw error;
  }
  
  return true;
}

export async function fetchSubcategories(categoryId: string) {
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
}
