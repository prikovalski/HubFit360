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
    // Validate authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Missing authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuração do Supabase incompleta');
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Check if user has admin role
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !userRole) {
      console.error('Admin check failed:', roleError);
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    const body = await req.json();
    const { user_email, credits_amount, reason, transaction_id } = body;

    console.log('Admin user adding credits:', {
      admin_user_id: user.id,
      admin_email: user.email,
      target_email: user_email,
      credits: credits_amount
    });

    // Validate input
    if (!user_email || typeof user_email !== 'string' || user_email.length > 254) {
      throw new Error('Email inválido');
    }

    if (!credits_amount || typeof credits_amount !== 'number' || credits_amount <= 0 || credits_amount > 1000) {
      throw new Error('Quantidade de créditos inválida (deve ser entre 1 e 1000)');
    }

    if (reason && typeof reason === 'string' && reason.length > 500) {
      throw new Error('Motivo muito longo (máximo 500 caracteres)');
    }

    // Buscar usuário por email
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', user_email)
      .single();

    if (userError || !targetUser) {
      throw new Error(`Usuário não encontrado com email: ${user_email}`);
    }

    console.log('Target user found:', targetUser);

    // Buscar saldo atual
    const { data: currentCredits, error: fetchError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', targetUser.id)
      .single();

    let newBalance = credits_amount;
    
    if (currentCredits && !fetchError) {
      newBalance = currentCredits.balance + credits_amount;
      
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', targetUser.id);
        
      if (updateError) throw updateError;
      
      console.log('Balance updated from', currentCredits.balance, 'to', newBalance);
    } else {
      const { error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_id: targetUser.id,
          balance: newBalance
        });
        
      if (insertError) throw insertError;
      
      console.log('New credit record created with balance:', newBalance);
    }

    // Registrar transação
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: targetUser.id,
        type: 'bonus',
        amount: credits_amount,
        source: 'manual',
        reference_id: transaction_id || `manual-${Date.now()}`,
        description: reason || 'Créditos adicionados manualmente por admin'
      });

    if (transactionError) throw transactionError;

    console.log('Credits added successfully');

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email
      },
      credits_added: credits_amount,
      new_balance: newBalance,
      message: 'Créditos adicionados com sucesso'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error adding credits manually:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});