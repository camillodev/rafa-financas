
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/finance";

export async function fetchCategories(includeInactive = false) {
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
}

export async function addCategory(category: Omit<Category, 'id'>) {
  const { data, error } = await supabase
    .from('categories')
    .insert({ 
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      is_active: true
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

// Modificando para usar a tabela subcategories diretamente em vez de usar relações
export async function fetchSubcategories(categoryId: string) {
  // Como não temos uma tabela subcategories no schema, vamos criar uma solução alternativa
  // Por exemplo, podemos filtrar categorias que têm um "parent_id" ou outro campo
  // Neste caso, retornaremos um array vazio por enquanto
  
  console.warn('A tabela subcategories não existe no schema. Implementação pendente.');
  return [];
  
  /* Quando tivermos uma tabela subcategories:
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
  */
}
