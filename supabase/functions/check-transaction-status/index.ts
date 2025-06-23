
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const user_email = url.searchParams.get('user_email');
    const transaction_id = url.searchParams.get('transaction_id');

    console.log('Verificando status da transação:', { user_email, transaction_id });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuração do Supabase incompleta');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from('hotmart_transactions')
      .select(`
        *,
        users!inner(id, name, email)
      `);

    // Filtrar por email do usuário ou transaction_id
    if (user_email) {
      query = query.eq('users.email', user_email);
    } else if (transaction_id) {
      query = query.eq('transaction_id', transaction_id);
    } else {
      // Retornar últimas 10 transações se não especificar filtros
      query = query.order('created_at', { ascending: false }).limit(10);
    }

    const { data: transactions, error } = await query;

    if (error) {
      throw error;
    }

    // Para cada transação, buscar os créditos do usuário
    const enrichedTransactions = await Promise.all(
      (transactions || []).map(async (transaction) => {
        const { data: credits } = await supabase
          .from('user_credits')
          .select('balance')
          .eq('user_id', transaction.users.id)
          .single();

        const { data: creditTransactions } = await supabase
          .from('credit_transactions')
          .select('*')
          .eq('reference_id', transaction.transaction_id)
          .order('created_at', { ascending: false });

        return {
          ...transaction,
          current_credits: credits?.balance || 0,
          credit_transactions: creditTransactions || []
        };
      })
    );

    return new Response(JSON.stringify({
      transactions: enrichedTransactions,
      total: enrichedTransactions.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro ao verificar status da transação:', error);
    
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
