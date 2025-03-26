
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, addDays, subDays, subMonths } from 'date-fns';

/**
 * Generates mock data for the application
 * @param userId The user ID to associate with the mock data
 */
export async function generateMockData(userId: string) {
  try {
    console.log('Generating mock data for user:', userId);
    
    // Create categories if they don't exist
    await createMockCategories(userId);
    
    // Create financial institutions
    await createMockInstitutions(userId);
    
    // Create credit cards
    await createMockCreditCards(userId);
    
    // Create transactions
    await createMockTransactions(userId);
    
    // Create budgets
    await createMockBudgets(userId);
    
    // Create goals
    await createMockGoals(userId);
    
    // Create bills
    await createMockBills(userId);
    
    console.log('Mock data generation completed');
    return true;
  } catch (error) {
    console.error('Error generating mock data:', error);
    throw error;
  }
}

/**
 * Clears all mock data for a user
 * @param userId The user ID whose data should be cleared
 */
export async function clearMockData(userId: string) {
  try {
    console.log('Clearing mock data for user:', userId);
    
    // Remove data in the correct order to avoid foreign key constraints
    
    // First, remove bill payments
    const { error: billPaymentsError } = await supabase
      .from('bill_payments')
      .delete()
      .eq('user_id', userId);
      
    if (billPaymentsError) {
      console.error('Error deleting bill payments:', billPaymentsError);
    }
    
    // Remove transactions
    const { error: transactionsError } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId);
      
    if (transactionsError) {
      console.error('Error deleting transactions:', transactionsError);
    }
    
    // Remove bills
    const { error: billsError } = await supabase
      .from('bills')
      .delete()
      .eq('user_id', userId);
      
    if (billsError) {
      console.error('Error deleting bills:', billsError);
    }
    
    // Remove goal contributions
    const { error: goalContributionsError } = await supabase
      .from('goal_contributions')
      .delete()
      .eq('user_id', userId);
      
    if (goalContributionsError) {
      console.error('Error deleting goal contributions:', goalContributionsError);
    }
    
    // Remove goals
    const { error: goalsError } = await supabase
      .from('goals')
      .delete()
      .eq('user_id', userId);
      
    if (goalsError) {
      console.error('Error deleting goals:', goalsError);
    }
    
    // Remove budgets
    const { error: budgetsError } = await supabase
      .from('budgets')
      .delete()
      .eq('user_id', userId);
      
    if (budgetsError) {
      console.error('Error deleting budgets:', budgetsError);
    }
    
    // Remove credit cards
    const { error: creditCardsError } = await supabase
      .from('credit_cards')
      .delete()
      .eq('user_id', userId);
      
    if (creditCardsError) {
      console.error('Error deleting credit cards:', creditCardsError);
    }
    
    // Remove institutions
    const { error: institutionsError } = await supabase
      .from('institutions')
      .delete()
      .eq('user_id', userId);
      
    if (institutionsError) {
      console.error('Error deleting institutions:', institutionsError);
    }
    
    console.log('Mock data clearing completed');
    return true;
  } catch (error) {
    console.error('Error clearing mock data:', error);
    throw error;
  }
}

// Helper functions for creating different types of mock data

async function createMockCategories(userId: string) {
  console.log('Creating mock categories');
  
  // Check if categories already exist
  const { data: existingCategories, error: checkError } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', userId)
    .limit(1);
  
  if (checkError) {
    console.error('Error checking existing categories:', checkError);
    throw checkError;
  }
  
  if (existingCategories && existingCategories.length > 0) {
    console.log('Categories already exist, skipping creation');
    return;
  }
  
  // Income categories
  const incomeCategories = [
    { name: 'Salário', type: 'income', color: '#4CAF50', icon: 'Wallet', user_id: userId },
    { name: 'Investimentos', type: 'income', color: '#2196F3', icon: 'TrendingUp', user_id: userId },
    { name: 'Bônus', type: 'income', color: '#9C27B0', icon: 'Gift', user_id: userId },
    { name: 'Outros', type: 'income', color: '#607D8B', icon: 'Plus', user_id: userId }
  ];
  
  // Expense categories
  const expenseCategories = [
    { name: 'Moradia', type: 'expense', color: '#F44336', icon: 'Home', user_id: userId },
    { name: 'Alimentação', type: 'expense', color: '#FF9800', icon: 'Utensils', user_id: userId },
    { name: 'Transporte', type: 'expense', color: '#795548', icon: 'Car', user_id: userId },
    { name: 'Lazer', type: 'expense', color: '#673AB7', icon: 'Music', user_id: userId },
    { name: 'Saúde', type: 'expense', color: '#E91E63', icon: 'Heart', user_id: userId },
    { name: 'Educação', type: 'expense', color: '#00BCD4', icon: 'BookOpen', user_id: userId },
    { name: 'Compras', type: 'expense', color: '#8BC34A', icon: 'ShoppingBag', user_id: userId },
    { name: 'Serviços', type: 'expense', color: '#FF5722', icon: 'Tool', user_id: userId },
    { name: 'Outros', type: 'expense', color: '#9E9E9E', icon: 'MoreHorizontal', user_id: userId }
  ];
  
  // Goal categories
  const goalCategories = [
    { name: 'Viagem', type: 'goal', color: '#3F51B5', icon: 'Plane', user_id: userId },
    { name: 'Reserva de Emergência', type: 'goal', color: '#F44336', icon: 'Shield', user_id: userId },
    { name: 'Aposentadoria', type: 'goal', color: '#4CAF50', icon: 'Calendar', user_id: userId },
    { name: 'Veículo', type: 'goal', color: '#607D8B', icon: 'Car', user_id: userId },
    { name: 'Imóvel', type: 'goal', color: '#FF9800', icon: 'Home', user_id: userId }
  ];
  
  // Insert all categories
  const { error: insertError } = await supabase
    .from('categories')
    .insert([...incomeCategories, ...expenseCategories, ...goalCategories]);
    
  if (insertError) {
    console.error('Error inserting categories:', insertError);
    throw insertError;
  }
}

async function createMockInstitutions(userId: string) {
  console.log('Creating mock institutions');
  
  const institutions = [
    { name: 'Banco do Brasil', type: 'bank', logo: 'bank-bb', current_balance: 5000, user_id: userId },
    { name: 'Nubank', type: 'bank', logo: 'bank-nubank', current_balance: 3500, user_id: userId },
    { name: 'Itaú', type: 'bank', logo: 'bank-itau', current_balance: 7200, user_id: userId },
    { name: 'Caixa', type: 'bank', logo: 'bank-caixa', current_balance: 1800, user_id: userId }
  ];
  
  const { error } = await supabase
    .from('institutions')
    .upsert(institutions, { onConflict: 'name,user_id' });
    
  if (error) {
    console.error('Error inserting institutions:', error);
    throw error;
  }
  
  return await supabase
    .from('institutions')
    .select('*')
    .eq('user_id', userId);
}

async function createMockCreditCards(userId: string) {
  console.log('Creating mock credit cards');
  
  // Get institutions
  const { data: institutions, error: fetchError } = await supabase
    .from('institutions')
    .select('id')
    .eq('user_id', userId);
  
  if (fetchError) {
    console.error('Error fetching institutions:', fetchError);
    throw fetchError;
  }
  
  if (!institutions || institutions.length === 0) {
    throw new Error('No institutions found for user');
  }
  
  const nubank = institutions[1]?.id;
  const itau = institutions[2]?.id;
  
  const creditCards = [
    { 
      name: 'Nubank Mastercard', 
      institution_id: nubank, 
      limit_amount: 5000, 
      closing_day: 20, 
      due_day: 5, 
      user_id: userId 
    },
    { 
      name: 'Itaú Visa', 
      institution_id: itau, 
      limit_amount: 8000, 
      closing_day: 28, 
      due_day: 10, 
      user_id: userId 
    }
  ];
  
  const { error } = await supabase
    .from('credit_cards')
    .upsert(creditCards, { onConflict: 'name,user_id' });
    
  if (error) {
    console.error('Error inserting credit cards:', error);
    throw error;
  }
}

async function createMockTransactions(userId: string) {
  console.log('Creating mock transactions');
  
  // Get categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, type')
    .eq('user_id', userId);
  
  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
    throw categoriesError;
  }
  
  if (!categories || categories.length === 0) {
    throw new Error('No categories found');
  }
  
  // Get institutions
  const { data: institutions, error: institutionsError } = await supabase
    .from('institutions')
    .select('id, name')
    .eq('user_id', userId);
  
  if (institutionsError) {
    console.error('Error fetching institutions:', institutionsError);
    throw institutionsError;
  }
  
  if (!institutions || institutions.length === 0) {
    throw new Error('No institutions found');
  }
  
  // Get credit cards
  const { data: creditCards, error: cardsError } = await supabase
    .from('credit_cards')
    .select('id, name')
    .eq('user_id', userId);
    
  if (cardsError) {
    console.error('Error fetching credit cards:', cardsError);
  }
  
  // Filter categories by type
  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');
  
  const currentDate = new Date();
  const transactions = [];
  
  // Generate transactions for current month and previous two months
  for (let i = 0; i < 3; i++) {
    const month = subMonths(currentDate, i);
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    // Generate 1 salary income for each month
    transactions.push({
      amount: 5000,
      date: format(new Date(month.getFullYear(), month.getMonth(), 5), 'yyyy-MM-dd'),
      description: 'Salário',
      category_id: incomeCategories.find(c => c.name === 'Salário')?.id,
      institution_id: institutions[0].id,
      transaction_type: 'income',
      status: 'completed',
      user_id: userId
    });
    
    // Generate random expenses for each month
    const numExpenses = 15 + Math.floor(Math.random() * 10); // 15-25 expenses per month
    
    for (let j = 0; j < numExpenses; j++) {
      // Random date in the month
      const day = Math.floor(Math.random() * (endDate.getDate() - 1)) + 1;
      const transactionDate = new Date(month.getFullYear(), month.getMonth(), day);
      
      // Random amount between 10 and 500
      const amount = parseFloat((10 + Math.random() * 490).toFixed(2));
      
      // Random category
      const categoryIndex = Math.floor(Math.random() * expenseCategories.length);
      const category = expenseCategories[categoryIndex];
      
      // Random institution
      const institutionIndex = Math.floor(Math.random() * institutions.length);
      const institution = institutions[institutionIndex];
      
      // Determine if it's a credit card transaction
      const isCredit = Math.random() > 0.5 && creditCards && creditCards.length > 0;
      
      let cardId = null;
      if (isCredit && creditCards) {
        const cardIndex = Math.floor(Math.random() * creditCards.length);
        cardId = creditCards[cardIndex].id;
      }
      
      // Generate expense descriptions based on category
      let description = 'Despesa';
      switch(category.name) {
        case 'Alimentação':
          description = ['Supermercado', 'Restaurante', 'Delivery', 'Lanche'][Math.floor(Math.random() * 4)];
          break;
        case 'Transporte':
          description = ['Combustível', 'Uber', 'Estacionamento', 'Transporte público'][Math.floor(Math.random() * 4)];
          break;
        case 'Moradia':
          description = ['Aluguel', 'Condomínio', 'Luz', 'Água', 'Internet'][Math.floor(Math.random() * 5)];
          break;
        case 'Lazer':
          description = ['Cinema', 'Netflix', 'Spotify', 'Viagem', 'Show'][Math.floor(Math.random() * 5)];
          break;
        case 'Saúde':
          description = ['Farmácia', 'Consulta médica', 'Plano de saúde'][Math.floor(Math.random() * 3)];
          break;
        case 'Educação':
          description = ['Curso online', 'Material escolar', 'Mensalidade'][Math.floor(Math.random() * 3)];
          break;
        case 'Compras':
          description = ['Shopping', 'Vestuário', 'Eletrônicos', 'Livros'][Math.floor(Math.random() * 4)];
          break;
        case 'Serviços':
          description = ['Assinatura', 'Serviço doméstico', 'Manutenção'][Math.floor(Math.random() * 3)];
          break;
      }
      
      transactions.push({
        amount,
        date: format(transactionDate, 'yyyy-MM-dd'),
        description: description,
        category_id: category.id,
        institution_id: institution.id,
        card_id: cardId,
        transaction_type: 'expense',
        status: 'completed',
        user_id: userId
      });
    }
    
    // Add one investment income
    if (Math.random() > 0.5) {
      transactions.push({
        amount: parseFloat((50 + Math.random() * 200).toFixed(2)),
        date: format(new Date(month.getFullYear(), month.getMonth(), 20), 'yyyy-MM-dd'),
        description: 'Rendimento investimentos',
        category_id: incomeCategories.find(c => c.name === 'Investimentos')?.id,
        institution_id: institutions[1].id,
        transaction_type: 'income',
        status: 'completed',
        user_id: userId
      });
    }
  }
  
  // Insert all transactions in batches to avoid query size limits
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    const { error } = await supabase
      .from('transactions')
      .insert(batch);
      
    if (error) {
      console.error(`Error inserting batch ${i}-${i+batchSize}:`, error);
      throw error;
    }
  }
}

async function createMockBudgets(userId: string) {
  console.log('Creating mock budgets');
  
  // Get expense categories
  const { data: categories, error: fetchError } = await supabase
    .from('categories')
    .select('id, name')
    .eq('type', 'expense')
    .eq('user_id', userId);
  
  if (fetchError) {
    console.error('Error fetching expense categories:', fetchError);
    throw fetchError;
  }
  
  if (!categories || categories.length === 0) {
    throw new Error('No expense categories found');
  }
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();
  
  const budgetAmounts = {
    'Moradia': 1500,
    'Alimentação': 800,
    'Transporte': 400,
    'Lazer': 300,
    'Saúde': 200,
    'Educação': 250,
    'Compras': 350,
    'Serviços': 200,
    'Outros': 100
  };
  
  const budgets = categories.map(category => ({
    category_id: category.id,
    amount: budgetAmounts[category.name as keyof typeof budgetAmounts] || 200,
    month: currentMonth,
    year: currentYear,
    user_id: userId
  }));
  
  const { error } = await supabase
    .from('budgets')
    .upsert(budgets, { onConflict: 'category_id,month,year,user_id' });
    
  if (error) {
    console.error('Error inserting budgets:', error);
    throw error;
  }
}

async function createMockGoals(userId: string) {
  console.log('Creating mock goals');
  
  // Get goal categories
  const { data: categories, error: fetchError } = await supabase
    .from('categories')
    .select('id, name')
    .eq('type', 'goal')
    .eq('user_id', userId);
  
  if (fetchError) {
    console.error('Error fetching goal categories:', fetchError);
    throw fetchError;
  }
  
  if (!categories || categories.length === 0) {
    console.log('No goal categories found, skipping goal creation');
    return; // Skip if no goal categories
  }
  
  const currentDate = new Date();
  
  const goals = [
    {
      title: 'Viagem para Europa',
      description: 'Férias na Europa em 2024',
      target_amount: 15000,
      current_amount: 3500,
      start_date: format(subMonths(currentDate, 3), 'yyyy-MM-dd'),
      target_date: format(addDays(currentDate, 180), 'yyyy-MM-dd'),
      category_id: categories.find(c => c.name === 'Viagem')?.id,
      user_id: userId
    },
    {
      title: 'Reserva de emergência',
      description: '6 meses de despesas',
      target_amount: 30000,
      current_amount: 12000,
      start_date: format(subMonths(currentDate, 6), 'yyyy-MM-dd'),
      target_date: format(addDays(currentDate, 365), 'yyyy-MM-dd'),
      category_id: categories.find(c => c.name === 'Reserva de Emergência')?.id,
      user_id: userId
    },
    {
      title: 'Novo notebook',
      description: 'MacBook Pro para trabalho',
      target_amount: 12000,
      current_amount: 4000,
      start_date: format(subMonths(currentDate, 2), 'yyyy-MM-dd'),
      target_date: format(addDays(currentDate, 120), 'yyyy-MM-dd'),
      category_id: categories.find(c => c.name === 'Outros')?.id || categories[0].id,
      user_id: userId
    }
  ];
  
  const { data: insertedGoals, error } = await supabase
    .from('goals')
    .upsert(goals, { onConflict: 'title,user_id' })
    .select();
  
  if (error) {
    console.error('Error creating goals:', error);
    return;
  }
  
  // Create some goal contributions
  if (insertedGoals && insertedGoals.length > 0) {
    const contributions = [];
    
    for (const goal of insertedGoals) {
      // Add 3-5 contributions per goal
      const numContributions = 3 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numContributions; i++) {
        const daysAgo = Math.floor(Math.random() * 60) + 1;
        contributions.push({
          goal_id: goal.id,
          amount: 500 + Math.floor(Math.random() * 1000),
          date: format(subDays(currentDate, daysAgo), 'yyyy-MM-dd'),
          description: 'Depósito mensal',
          user_id: userId
        });
      }
    }
    
    const { error: contributionsError } = await supabase
      .from('goal_contributions')
      .insert(contributions);
      
    if (contributionsError) {
      console.error('Error creating goal contributions:', contributionsError);
    }
  }
}

async function createMockBills(userId: string) {
  console.log('Creating mock bills');
  
  // Get categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name')
    .eq('type', 'expense')
    .eq('user_id', userId);
  
  if (categoriesError) {
    console.error('Error fetching expense categories:', categoriesError);
    throw categoriesError;
  }
  
  if (!categories || categories.length === 0) {
    throw new Error('No expense categories found');
  }
  
  // Get institutions
  const { data: institutions, error: institutionsError } = await supabase
    .from('institutions')
    .select('id')
    .eq('user_id', userId);
  
  if (institutionsError) {
    console.error('Error fetching institutions:', institutionsError);
    throw institutionsError;
  }
  
  if (!institutions || institutions.length === 0) {
    throw new Error('No institutions found');
  }
  
  const bills = [
    {
      description: 'Aluguel',
      amount: 1200,
      due_day: 10,
      category_id: categories.find(c => c.name === 'Moradia')?.id,
      institution_id: institutions[0].id,
      is_recurring: true,
      user_id: userId
    },
    {
      description: 'Internet',
      amount: 120,
      due_day: 15,
      category_id: categories.find(c => c.name === 'Serviços')?.id,
      institution_id: institutions[1].id,
      is_recurring: true,
      user_id: userId
    },
    {
      description: 'Energia',
      amount: 180,
      due_day: 20,
      category_id: categories.find(c => c.name === 'Moradia')?.id,
      institution_id: institutions[2].id,
      is_recurring: true,
      user_id: userId
    },
    {
      description: 'Água',
      amount: 80,
      due_day: 22,
      category_id: categories.find(c => c.name === 'Moradia')?.id,
      institution_id: institutions[0].id,
      is_recurring: true,
      user_id: userId
    },
    {
      description: 'Academia',
      amount: 99,
      due_day: 5,
      category_id: categories.find(c => c.name === 'Saúde')?.id,
      institution_id: institutions[1].id,
      is_recurring: true,
      user_id: userId
    }
  ];
  
  const { error } = await supabase
    .from('bills')
    .upsert(bills, { onConflict: 'description,user_id' });
    
  if (error) {
    console.error('Error inserting bills:', error);
    throw error;
  }
  
  // Add some bill payments
  const { data: insertedBills, error: billsError } = await supabase
    .from('bills')
    .select('id, amount, due_day')
    .eq('user_id', userId);
  
  if (billsError) {
    console.error('Error fetching inserted bills:', billsError);
    return;
  }
  
  if (insertedBills && insertedBills.length > 0) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    const billPayments = [];
    
    // Create payments for previous month (all paid)
    for (const bill of insertedBills) {
      billPayments.push({
        bill_id: bill.id,
        amount: bill.amount,
        payment_date: `${previousYear}-${String(previousMonth).padStart(2, '0')}-${String(bill.due_day).padStart(2, '0')}`,
        status: 'paid',
        month: previousMonth,
        year: previousYear,
        user_id: userId
      });
    }
    
    // Create payments for current month (some paid, some pending)
    for (const bill of insertedBills) {
      const isPaid = bill.due_day < currentDate.getDate();
      
      billPayments.push({
        bill_id: bill.id,
        amount: bill.amount,
        payment_date: isPaid 
          ? `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(bill.due_day).padStart(2, '0')}`
          : null,
        status: isPaid ? 'paid' : 'pending',
        month: currentMonth,
        year: currentYear,
        user_id: userId
      });
    }
    
    const { error: paymentsError } = await supabase
      .from('bill_payments')
      .upsert(billPayments);
      
    if (paymentsError) {
      console.error('Error creating bill payments:', paymentsError);
    }
  }
}
