
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
    console.log('Creditando usuário 50 com 1 crédito');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuração do Supabase incompleta');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar usuário ID 50
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', 50)
      .single();

    if (userError || !user) {
      throw new Error(`Usuário ID 50 não encontrado: ${userError?.message}`);
    }

    console.log('Usuário encontrado:', user);

    // Buscar saldo atual
    const { data: currentCredits, error: fetchError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    let newBalance = 1;
    
    if (currentCredits && !fetchError) {
      // Atualizar saldo existente
      newBalance = currentCredits.balance + 1;
      
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
        amount: 1,
        source: 'manual',
        reference_id: `manual-user50-${Date.now()}`,
        description: 'Crédito manual para usuário 50 - correção hotmart webhook'
      });

    if (transactionError) throw transactionError;

    console.log('1 crédito adicionado com sucesso para usuário 50');

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      credits_added: 1,
      new_balance: newBalance,
      message: '1 crédito adicionado com sucesso para usuário 50'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro ao creditar usuário 50:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
