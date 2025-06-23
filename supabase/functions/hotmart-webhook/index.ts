
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== INÍCIO DO WEBHOOK HOTMART ===');
    
    const body = await req.json();
    console.log('Webhook body recebido:', JSON.stringify(body, null, 2));

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuração do Supabase incompleta');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extrair dados do webhook da Hotmart
    const { event, data } = body;
    
    if (!event || !data) {
      throw new Error('Estrutura do webhook inválida');
    }

    console.log('Evento:', event);
    console.log('Dados da transação:', data);

    // Processar apenas eventos de compra aprovada
    if (event !== 'PURCHASE_APPROVED') {
      console.log('Evento ignorado:', event);
      return new Response(JSON.stringify({ status: 'ignored', event }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const {
      transaction,
      product,
      buyer
    } = data;

    if (!transaction || !product || !buyer) {
      throw new Error('Dados obrigatórios não encontrados no webhook');
    }

    const transactionId = transaction.transaction;
    const productId = product.id;
    const buyerEmail = buyer.email;
    const buyerName = buyer.name;

    console.log('Processando compra:', {
      transactionId,
      productId,
      buyerEmail,
      buyerName
    });

    // Verificar se a transação já foi processada
    const { data: existingTransaction, error: txError } = await supabase
      .from('hotmart_transactions')
      .select('id')
      .eq('transaction_id', transactionId)
      .single();

    if (existingTransaction) {
      console.log('Transação já processada:', transactionId);
      return new Response(JSON.stringify({ status: 'already_processed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Buscar produto Hotmart no banco
    const { data: hotmartProduct, error: productError } = await supabase
      .from('hotmart_products')
      .select('*')
      .eq('hotmart_product_id', productId)
      .single();

    if (productError || !hotmartProduct) {
      console.error('Produto não encontrado:', productId);
      throw new Error(`Produto Hotmart não configurado: ${productId}`);
    }

    console.log('Produto encontrado:', hotmartProduct);

    // Buscar ou criar usuário
    let user;
    const { data: existingUser, error: userSearchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', buyerEmail)
      .single();

    if (existingUser) {
      user = existingUser;
      console.log('Usuário existente encontrado:', user.id);
    } else {
      // Criar novo usuário
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert({
          email: buyerEmail,
          name: buyerName,
          auth_user_id: crypto.randomUUID() // Usuário criado via webhook, sem auth
        })
        .select()
        .single();

      if (createUserError) {
        console.error('Erro ao criar usuário:', createUserError);
        throw createUserError;
      }

      user = newUser;
      console.log('Novo usuário criado:', user.id);
    }

    // Registrar transação Hotmart
    const { error: logError } = await supabase
      .from('hotmart_transactions')
      .insert({
        transaction_id: transactionId,
        user_id: user.id,
        hotmart_product_id: productId,
        status: 'approved',
        webhook_data: body,
        processed_at: new Date().toISOString()
      });

    if (logError) {
      console.error('Erro ao registrar transação:', logError);
      throw logError;
    }

    // Processar baseado no tipo de produto
    if (hotmartProduct.type === 'credits') {
      // Adicionar créditos
      await processCredits(supabase, user.id, hotmartProduct, transactionId);
    } else if (hotmartProduct.type === 'direct_access') {
      // Criar assessment diretamente
      await processDirectAssessment(supabase, user.id, hotmartProduct, transactionId);
    }

    console.log('Webhook processado com sucesso');

    return new Response(JSON.stringify({ 
      status: 'success',
      user_id: user.id,
      product_type: hotmartProduct.type
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('ERRO no webhook Hotmart:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      details: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function processCredits(supabase: any, userId: number, product: any, transactionId: string) {
  console.log('Processando créditos para usuário:', userId);
  
  const creditsToAdd = product.credits_amount;
  
  // Buscar saldo atual
  const { data: currentCredits, error: fetchError } = await supabase
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .single();

  let newBalance = creditsToAdd;
  
  if (currentCredits) {
    // Atualizar saldo existente
    newBalance = currentCredits.balance + creditsToAdd;
    
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({ balance: newBalance })
      .eq('user_id', userId);
      
    if (updateError) throw updateError;
  } else {
    // Criar novo registro de créditos
    const { error: insertError } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        balance: newBalance
      });
      
    if (insertError) throw insertError;
  }

  // Registrar transação de crédito
  const { error: transactionError } = await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      type: 'purchase',
      amount: creditsToAdd,
      source: 'hotmart',
      reference_id: transactionId,
      description: `Compra Hotmart: ${product.product_name}`
    });

  if (transactionError) throw transactionError;

  console.log(`${creditsToAdd} créditos adicionados. Novo saldo: ${newBalance}`);
}

async function processDirectAssessment(supabase: any, userId: number, product: any, transactionId: string) {
  console.log('Processando acesso direto para usuário:', userId);
  
  // Criar assessment pré-pago
  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .insert({
      user_id: userId,
      status: 'payment_approved',
      front_photo: '',
      side_photo: '',
      back_photo: ''
    })
    .select()
    .single();

  if (assessmentError) throw assessmentError;

  // Registrar transação para rastreamento
  const { error: transactionError } = await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      type: 'purchase',
      amount: 0, // Acesso direto não consome créditos
      source: 'hotmart',
      reference_id: transactionId,
      description: `Acesso direto Hotmart: ${product.product_name}`,
      assessment_id: assessment.id
    });

  if (transactionError) throw transactionError;

  console.log('Assessment criado com acesso direto:', assessment.id);
}
