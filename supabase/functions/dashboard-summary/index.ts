
// Edge Function para obter resumo do dashboard

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configurar cabeçalhos CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Verificar se é uma requisição OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Obter as variáveis de ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    // Criar um cliente Supabase com a service role key para ignorar RLS
    const supabase = createClient(supabaseUrl, serviceKey)
    
    // Extrair os dados do request
    const { userId, month, year } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId é obrigatório' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Determinar o mês e ano atual se não for fornecido
    const currentDate = new Date()
    const currentMonth = month || currentDate.getMonth() + 1
    const currentYear = year || currentDate.getFullYear()

    // Calcular o início e fim do mês em formato ISO
    const startDate = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]

    // Buscar os saldos das instituições financeiras
    const { data: institutions, error: institutionsError } = await supabase
      .from('institutions')
      .select('current_balance, is_active')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (institutionsError) {
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar instituições', details: institutionsError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Calcular o saldo total
    let totalBalance = 0
    institutions?.forEach(inst => {
      totalBalance += parseFloat(inst.current_balance)
    })

    // Buscar as transações do mês atual
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('amount, transaction_type, category_id')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)

    if (transactionsError) {
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar transações', details: transactionsError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Calcular os totais de receitas e despesas
    let totalIncome = 0
    let totalExpenses = 0
    let categoryExpenses = {}

    transactions?.forEach(transaction => {
      if (transaction.transaction_type === 'income') {
        totalIncome += parseFloat(transaction.amount)
      } else {
        totalExpenses += parseFloat(transaction.amount)
        
        // Agrupar por categoria
        const categoryId = transaction.category_id
        if (categoryId) {
          if (!categoryExpenses[categoryId]) {
            categoryExpenses[categoryId] = 0
          }
          categoryExpenses[categoryId] += parseFloat(transaction.amount)
        }
      }
    })

    // Buscar os orçamentos do mês
    const { data: budgets, error: budgetsError } = await supabase
      .from('budgets')
      .select('amount, category_id')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .eq('year', currentYear)

    if (budgetsError) {
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar orçamentos', details: budgetsError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Calcular o progresso dos orçamentos
    const budgetProgress = {}
    budgets?.forEach(budget => {
      const categoryId = budget.category_id
      const spent = categoryExpenses[categoryId] || 0
      const amount = parseFloat(budget.amount)
      
      budgetProgress[categoryId] = {
        amount,
        spent,
        percentage: amount > 0 ? (spent / amount) * 100 : 0
      }
    })

    // Buscar as categorias para exibir seus nomes
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, color, icon, type')
      .eq('user_id', userId)

    if (categoriesError) {
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar categorias', details: categoriesError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Montar objeto com as informações das categorias
    const categoryMap = {}
    categories?.forEach(category => {
      categoryMap[category.id] = {
        name: category.name,
        color: category.color,
        icon: category.icon,
        type: category.type
      }
    })

    // Retornar todos os dados coletados
    return new Response(
      JSON.stringify({
        financialSummary: {
          totalBalance,
          totalIncome,
          totalExpenses,
          netBalance: totalIncome - totalExpenses
        },
        categoryExpenses: Object.keys(categoryExpenses).map(categoryId => ({
          categoryId,
          ...categoryMap[categoryId],
          value: categoryExpenses[categoryId]
        })),
        budgetProgress: Object.keys(budgetProgress).map(categoryId => ({
          categoryId,
          ...categoryMap[categoryId],
          ...budgetProgress[categoryId]
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Erro no servidor', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
