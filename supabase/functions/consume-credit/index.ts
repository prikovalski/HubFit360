
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
    const body = await req.json();
    const { assessment_id } = body;

    // Validate UUID format
    if (!assessment_id || typeof assessment_id !== 'string') {
      return new Response(JSON.stringify({ error: 'ID da avaliação é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(assessment_id)) {
      return new Response(JSON.stringify({ error: 'Formato de ID inválido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
      return createErrorResponse(authError, 'UNAUTHORIZED', 401, corsHeaders);
    }

    // Rate limiting: 10 requests per minute per user
    if (!checkRateLimit(user.id, { maxRequests: 10, windowMs: 60000 })) {
      return createErrorResponse(
        new Error('Rate limit exceeded'),
        'RATE_LIMIT_EXCEEDED',
        429,
        { ...corsHeaders, ...getRateLimitHeaders(user.id) }
      );
    }

    // Buscar usuário no banco
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !dbUser) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar se a avaliação pertence ao usuário
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('user_id, status')
      .eq('id', assessment_id)
      .single();

    if (assessmentError || !assessment) {
      throw new Error('Avaliação não encontrada');
    }

    if (assessment.user_id !== dbUser.id) {
      throw new Error('Avaliação não pertence ao usuário');
    }

    // Buscar créditos atuais
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', dbUser.id)
      .single();

    const currentBalance = credits?.balance || 0;

    if (currentBalance < 1) {
      throw new Error('Créditos insuficientes');
    }

    // Consumir 1 crédito
    const newBalance = currentBalance - 1;
    
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({ balance: newBalance })
      .eq('user_id', dbUser.id);

    if (updateError) throw updateError;

    // Registrar transação de uso
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: dbUser.id,
        type: 'usage',
        amount: -1,
        source: 'system',
        description: 'Crédito usado para avaliação física',
        assessment_id: assessment_id
      });

    if (transactionError) throw transactionError;

    console.log(`Crédito consumido. Usuário ${dbUser.id}, novo saldo: ${newBalance}`);

    return new Response(JSON.stringify({
      success: true,
      new_balance: newBalance,
      message: 'Crédito consumido com sucesso'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro ao consumir crédito:', error);
    return createErrorResponse(error, 'DEFAULT', 500, corsHeaders);
  }
});
