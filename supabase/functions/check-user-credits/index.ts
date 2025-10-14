
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { checkRateLimit, getRateLimitHeaders } from '../_shared/rateLimiter.ts';
import { createErrorResponse } from '../_shared/errorHandler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuração do Supabase incompleta');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token de autorização necessário');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Usuário não autenticado');
    }

    // Optimized query: Get user and credits in a single query with JOIN
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        user_credits (
          balance
        )
      `)
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('Usuário não encontrado');
    }

    const balance = userData.user_credits?.balance || 0;

    // Get recent transactions with optimized query (limit to 10)
    const { data: transactions, error: transactionsError } = await supabase
      .from('credit_transactions')
      .select('id, type, amount, source, description, created_at')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })
      .limit(10);

    return new Response(JSON.stringify({
      balance,
      has_credits: balance > 0,
      transactions: transactions || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro ao verificar créditos:', error);
    return createErrorResponse(error, 'DEFAULT', 500, corsHeaders);
  }
});
