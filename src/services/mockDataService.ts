
import { supabase } from "@/integrations/supabase/client";
import { categories, subcategories, transactions, budgetGoals, financialInstitutions, creditCards } from '@/data/mockData';

// Função para gerar dados de exemplo
export async function generateMockData(userId: string, supabaseClient) {
  try {
    // 1. Inserir categorias
    const categoriesData = categories.map(category => ({
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      user_id: userId
    }));
    
    const { data: insertedCategories, error: categoriesError } = await supabaseClient
      .from('categories')
      .insert(categoriesData)
      .select();
    
    if (categoriesError) throw categoriesError;
    
    console.log(`Categorias inseridas: ${insertedCategories.length}`);
    
    // Criar um mapeamento de id antigos para novos
    const categoryMap = {};
    insertedCategories.forEach((newCat, index) => {
      categoryMap[categories[index].id] = newCat.id;
    });
    
    // 2. Inserir instituições financeiras
    const institutionsData = financialInstitutions.map(institution => ({
      name: institution.name,
      logo: institution.icon,
      current_balance: institution.currentBalance,
      is_active: institution.isActive,
      type: 'bank',
      user_id: userId
    }));
    
    const { data: insertedInstitutions, error: institutionsError } = await supabaseClient
      .from('institutions')
      .insert(institutionsData)
      .select();
    
    if (institutionsError) throw institutionsError;
    
    console.log(`Instituições inseridas: ${insertedInstitutions.length}`);
    
    // Criar um mapeamento de id antigos para novos (instituições)
    const institutionMap = {};
    insertedInstitutions.forEach((newInst, index) => {
      institutionMap[financialInstitutions[index].id] = newInst.id;
    });
    
    // 3. Inserir cartões de crédito
    const cardsData = creditCards.map(card => ({
      name: card.name,
      limit_amount: card.limit,
      due_day: card.dueDate,
      closing_day: card.dueDate - 5, // Estimativa para o dia de fechamento
      institution_id: institutionMap[card.institutionId],
      is_active: true,
      user_id: userId
    }));
    
    const { data: insertedCards, error: cardsError } = await supabaseClient
      .from('credit_cards')
      .insert(cardsData)
      .select();
    
    if (cardsError) throw cardsError;
    
    console.log(`Cartões inseridos: ${insertedCards.length}`);
    
    // 4. Inserir transações
    const transactionsData = transactions.map(transaction => {
      const categoryId = categoryMap[transaction.category] || null;
      
      let institutionId = null;
      if (transaction.financialInstitution) {
        const institution = financialInstitutions.find(i => i.name === transaction.financialInstitution);
        if (institution) {
          institutionId = institutionMap[institution.id];
        }
      }
      
      return {
        amount: transaction.amount,
        date: transaction.date.toISOString().split('T')[0],
        description: transaction.description,
        transaction_type: transaction.type,
        status: transaction.status,
        category_id: categoryId,
        institution_id: institutionId,
        user_id: userId
      };
    });
    
    // Inserir em lotes menores para evitar problemas
    const batchSize = 50;
    for (let i = 0; i < transactionsData.length; i += batchSize) {
      const batch = transactionsData.slice(i, i + batchSize);
      const { error: transactionsError } = await supabaseClient
        .from('transactions')
        .insert(batch);
      
      if (transactionsError) throw transactionsError;
    }
    
    console.log(`Transações inseridas: ${transactionsData.length}`);
    
    // 5. Inserir orçamentos
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    
    const budgetsData = budgetGoals.map(budget => {
      const category = categories.find(c => c.name === budget.category);
      const categoryId = category ? categoryMap[category.id] : null;
      
      return {
        amount: budget.amount,
        month: month,
        year: year,
        category_id: categoryId,
        user_id: userId
      };
    });
    
    const { error: budgetsError } = await supabaseClient
      .from('budgets')
      .insert(budgetsData);
    
    if (budgetsError) throw budgetsError;
    
    console.log(`Orçamentos inseridos: ${budgetsData.length}`);
    
    return { success: true, message: 'Dados de exemplo gerados com sucesso' };
  } catch (error) {
    console.error('Erro ao gerar dados de exemplo:', error);
    throw error;
  }
}

// Função para limpar todos os dados
export async function clearMockData(userId: string, supabaseClient) {
  try {
    // Deletar dados de todas as tabelas na ordem correta para evitar violações de chave estrangeira
    await supabaseClient.from('split_bill_payments').delete().eq('user_id', userId);
    await supabaseClient.from('split_bill_shares').delete().eq('user_id', userId);
    await supabaseClient.from('split_bills').delete().eq('user_id', userId);
    await supabaseClient.from('split_bill_participants').delete().eq('user_id', userId);
    await supabaseClient.from('split_bill_groups').delete().eq('user_id', userId);
    
    await supabaseClient.from('goal_contributions').delete().eq('user_id', userId);
    await supabaseClient.from('goals').delete().eq('user_id', userId);
    
    await supabaseClient.from('bill_payments').delete().eq('user_id', userId);
    await supabaseClient.from('bills').delete().eq('user_id', userId);
    
    await supabaseClient.from('budgets').delete().eq('user_id', userId);
    
    await supabaseClient.from('transactions').delete().eq('user_id', userId);
    
    await supabaseClient.from('credit_cards').delete().eq('user_id', userId);
    await supabaseClient.from('institutions').delete().eq('user_id', userId);
    await supabaseClient.from('categories').delete().eq('user_id', userId);
    
    return { success: true, message: 'Todos os dados foram limpos com sucesso' };
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    throw error;
  }
}
