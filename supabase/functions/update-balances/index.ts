
// Edge Function para atualizar saldos de contas automaticamente

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
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    // Criar um cliente Supabase com a service role key para ignorar RLS
    const supabase = createClient(supabaseUrl, serviceKey)

    // Extrair os dados do request
    const { userId, institutionId, amount, date, description } = await req.json()

    if (!userId || !institutionId || amount === undefined) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros obrigatórios: userId, institutionId, amount' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Obter o saldo atual da instituição
    const { data: institution, error: fetchError } = await supabase
      .from('institutions')
      .select('current_balance')
      .eq('id', institutionId)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar instituição financeira', details: fetchError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Calcular novo saldo
    const newBalance = parseFloat(institution.current_balance) + parseFloat(amount.toString())

    // Atualizar o saldo
    const { data, error } = await supabase
      .from('institutions')
      .update({ current_balance: newBalance })
      .eq('id', institutionId)
      .eq('user_id', userId)

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar saldo', details: error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Retornar sucesso
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Saldo atualizado com sucesso',
        oldBalance: institution.current_balance,
        newBalance: newBalance,
        difference: amount
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
