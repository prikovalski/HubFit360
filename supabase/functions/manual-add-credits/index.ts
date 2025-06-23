
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
    const body = await req.json();
    const { user_email, credits_amount, reason, transaction_id } = body;

    console.log('Adicionando créditos manualmente:', {
      user_email,
      credits_amount,
      reason,
      transaction_id
    });

    if (!user_email || !credits_amount) {
      throw new Error('Email do usuário e quantidade de créditos são obrigatórios');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuração do Supabase incompleta');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar usuário por email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', user_email)
      .single();

    if (userError || !user) {
      throw new Error(`Usuário não encontrado com email: ${user_email}`);
    }

    console.log('Usuário encontrado:', user);

    // Buscar saldo atual
    const { data: currentCredits, error: fetchError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    let newBalance = credits_amount;
    
    if (currentCredits && !fetchError) {
      // Atualizar saldo existente
      newBalance = currentCredits.balance + credits_amount;
      
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
        
      if (updateError) throw updateError;
      
      console.log('Saldo atualizado de', currentCredits.balance, 'para', newBalance);
    } else {
      // Criar novo registro
      const { error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_id: user.id,
          balance: newBalance
        });
        
      if (insertError) throw insertError;
      
      console.log('Novo registro criado com saldo:', newBalance);
    }

    // Registrar transação
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        type: 'bonus',
        amount: credits_amount,
        source: 'manual',
        reference_id: transaction_id || `manual-${Date.now()}`,
        description: reason || 'Créditos adicionados manualmente'
      });

    if (transactionError) throw transactionError;

    console.log('Créditos adicionados com sucesso');

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      credits_added: credits_amount,
      new_balance: newBalance,
      message: 'Créditos adicionados com sucesso'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro ao adicionar créditos manualmente:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
