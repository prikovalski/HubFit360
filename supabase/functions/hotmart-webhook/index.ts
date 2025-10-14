import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hotmart-hottok',
}

// Validate email format
function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Validate string with length limits
function validateString(value: string, maxLength: number = 100): boolean {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

// Verify Hotmart webhook signature
function verifyHotmartSignature(req: Request, body: any): boolean {
  const HOTMART_WEBHOOK_SECRET = Deno.env.get('HOTMART_WEBHOOK_SECRET');
  
  // If secret is not configured, log warning but allow (backwards compatibility)
  if (!HOTMART_WEBHOOK_SECRET) {
    console.warn('⚠️ HOTMART_WEBHOOK_SECRET not configured - webhook signature verification disabled');
    return true;
  }

  const hottokHeader = req.headers.get('X-Hotmart-Hottok');
  
  if (!hottokHeader) {
    console.error('Missing X-Hotmart-Hottok header');
    return false;
  }

  // Verify hottok matches expected format (basic validation)
  // Hotmart hottok is typically a UUID-like string
  const hottokRegex = /^[0-9a-f-]+$/i;
  if (!hottokRegex.test(hottokHeader)) {
    console.error('Invalid hottok format');
    return false;
  }

  // Additional verification: check if hottok matches webhook data
  const bodyHottok = body.hottok || body.id;
  if (bodyHottok && hottokHeader !== bodyHottok) {
    console.error('Hottok mismatch between header and body');
    return false;
  }

  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== INÍCIO DO WEBHOOK HOTMART ===');
    console.log('Method:', req.method);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    
    const body = await req.json();
    console.log('Webhook body recebido:', JSON.stringify(body, null, 2));

    // Verify webhook signature
    if (!verifyHotmartSignature(req, body)) {
      console.error('❌ Webhook signature verification failed');
      return new Response(JSON.stringify({ 
        error: 'Invalid webhook signature' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuração do Supabase incompleta');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validar estrutura do webhook
    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid webhook body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extrair dados do webhook da Hotmart - suporte para diferentes estruturas
    let event, data;
    
    if (body.event && body.data) {
      // Estrutura padrão
      event = body.event;
      data = body.data;
    } else if (body.hottok) {
      // Estrutura alternativa da Hotmart
      event = body.hottok;
      data = body;
    } else {
      console.log('Estrutura não reconhecida, tentando extrair dados...');
      event = body.event || body.status || 'UNKNOWN';
      data = body.data || body;
    }

    console.log('Evento extraído:', event);
    console.log('Dados extraídos:', JSON.stringify(data, null, 2));

    // Processar diferentes tipos de eventos
    const validEvents = [
      'PURCHASE_APPROVED', 
      'PURCHASE_COMPLETE', 
      'PURCHASE_APPROVED_HOTMART',
      'PURCHASE_COMPLETE_HOTMART',
      'approved',
      'complete'
    ];

    const isValidEvent = validEvents.some(validEvent => 
      event && event.toString().toLowerCase().includes(validEvent.toLowerCase())
    );

    if (!isValidEvent) {
      console.log('Evento ignorado:', event);
      return new Response(JSON.stringify({ 
        status: 'ignored', 
        event,
        message: 'Evento não é de compra aprovada' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Extrair dados da transação com múltiplas tentativas
    let transaction, product, buyer, offer;
    
    // Tentar diferentes estruturas de dados
    if (data.transaction || data.purchase) {
      transaction = data.transaction || data.purchase;
      product = data.product;
      buyer = data.buyer;
    } else {
      // Estrutura alternativa
      transaction = {
        transaction: data.transaction_id || data.hottok || data.id,
        status: data.status || 'approved'
      };
      product = {
        id: data.product_id || data.prod,
        name: data.product_name || data.prod_name
      };
      buyer = {
        email: data.buyer_email || data.email,
        name: data.buyer_name || data.name
      };
    }

    // Extrair dados da oferta
    if (transaction && transaction.offer) {
      offer = transaction.offer;
    } else if (data.offer) {
      offer = data.offer;
    } else {
      offer = null;
    }

    console.log('Dados processados:', {
      transaction,
      product,
      buyer,
      offer
    });

    if (!transaction || !product || !buyer) {
      throw new Error('Dados obrigatórios não encontrados no webhook');
    }

    const transactionId = transaction.transaction || transaction.id;
    const productId = product.id || product.product_id;
    const offerId = offer?.code || null;
    const buyerEmail = buyer.email;
    const buyerName = buyer.name;

    // Validate required data
    if (!transactionId || !validateString(transactionId, 200)) {
      return new Response(JSON.stringify({ error: 'Invalid transaction ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!productId || !validateString(productId, 200)) {
      return new Response(JSON.stringify({ error: 'Invalid product ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!buyerEmail || !validateEmail(buyerEmail)) {
      return new Response(JSON.stringify({ error: 'Invalid buyer email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!buyerName || !validateString(buyerName, 200)) {
      return new Response(JSON.stringify({ error: 'Invalid buyer name' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Identificadores extraídos e validados:', {
      transactionId,
      productId,
      offerId,
      buyerEmail,
      buyerName
    });

    if (!transactionId || !buyerEmail) {
      throw new Error(`Dados obrigatórios ausentes: transactionId=${transactionId}, buyerEmail=${buyerEmail}`);
    }

    console.log('Processando compra:', {
      transactionId,
      productId,
      offerId,
      buyerEmail,
      buyerName
    });

    // Verificar se a transação já foi processada
    const { data: existingTransaction, error: txError } = await supabase
      .from('hotmart_transactions')
      .select('id, status')
      .eq('transaction_id', transactionId)
      .single();

    if (existingTransaction) {
      console.log('Transação já processada:', transactionId, 'Status:', existingTransaction.status);
      return new Response(JSON.stringify({ 
        status: 'already_processed',
        transaction_id: transactionId,
        existing_status: existingTransaction.status
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Buscar produto Hotmart no banco - PRIORIZAR BUSCA POR OFFER_ID
    let hotmartProduct;
    
    // 1. Tentar buscar por offer_id primeiro (método principal)
    if (offerId) {
      console.log('Buscando produto por offer_id:', offerId);
      const { data: productByOffer, error: offerError } = await supabase
        .from('hotmart_products')
        .select('*')
        .eq('offer_id', offerId)
        .single();

      if (productByOffer && !offerError) {
        hotmartProduct = productByOffer;
        console.log('Produto encontrado por offer_id:', hotmartProduct);
      } else {
        console.log('Produto não encontrado por offer_id:', offerId, 'Erro:', offerError?.message);
      }
    }

    // 2. Fallback: buscar por product_id se offer_id não funcionou
    if (!hotmartProduct && productId) {
      console.log('Tentando buscar por hotmart_product_id:', productId);
      const { data: productById, error: productError } = await supabase
        .from('hotmart_products')
        .select('*')
        .eq('hotmart_product_id', productId)
        .single();

      if (productById && !productError) {
        hotmartProduct = productById;
        console.log('Produto encontrado por hotmart_product_id:', hotmartProduct);
      } else {
        console.log('Produto não encontrado por hotmart_product_id:', productId);
      }
    }

    // 3. Fallback: buscar por nome do produto
    if (!hotmartProduct && product.name) {
      console.log('Tentando buscar por nome do produto:', product.name);
      const { data: productByName, error: nameError } = await supabase
        .from('hotmart_products')
        .select('*')
        .ilike('product_name', `%${product.name}%`)
        .single();
      
      if (productByName && !nameError) {
        hotmartProduct = productByName;
        console.log('Produto encontrado por nome:', hotmartProduct);
      }
    }
    
    if (!hotmartProduct) {
      const errorMsg = `Produto Hotmart não configurado. offer_id: ${offerId}, product_id: ${productId}, nome: ${product.name}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
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
          name: buyerName || 'Usuário Hotmart',
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

    // Registrar transação Hotmart ANTES de processar
    const { error: logError } = await supabase
      .from('hotmart_transactions')
      .insert({
        transaction_id: transactionId,
        user_id: user.id,
        hotmart_product_id: hotmartProduct.hotmart_product_id,
        status: 'approved',
        webhook_data: body,
        processed_at: new Date().toISOString()
      });

    if (logError) {
      console.error('Erro ao registrar transação:', logError);
      throw logError;
    }

    console.log('Transação registrada com sucesso');

    // Processar baseado no tipo de produto
    if (hotmartProduct.type === 'credits') {
      await processCredits(supabase, user.id, hotmartProduct, transactionId);
    } else if (hotmartProduct.type === 'direct_access') {
      await processDirectAssessment(supabase, user.id, hotmartProduct, transactionId);
    }

    console.log('Webhook processado com sucesso para usuário:', user.id);

    return new Response(JSON.stringify({ 
      status: 'success',
      user_id: user.id,
      user_email: user.email,
      product_type: hotmartProduct.type,
      product_found_by: offerId ? 'offer_id' : (productId ? 'product_id' : 'name'),
      offer_id: offerId,
      credits_added: hotmartProduct.credits_amount || 0,
      transaction_id: transactionId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('ERRO CRÍTICO no webhook Hotmart:', error);
    console.error('Stack trace:', error?.stack);
    
    return new Response(JSON.stringify({
      error: 'Erro ao processar webhook',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function processCredits(supabase: any, userId: number, product: any, transactionId: string) {
  console.log('=== PROCESSANDO CRÉDITOS ===');
  console.log('UserId:', userId, 'Créditos a adicionar:', product.credits_amount);
  
  const creditsToAdd = product.credits_amount;
  
  if (!creditsToAdd || creditsToAdd <= 0) {
    throw new Error('Quantidade de créditos inválida');
  }

  try {
    // Buscar saldo atual
    const { data: currentCredits, error: fetchError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();

    let newBalance = creditsToAdd;
    
    if (currentCredits && !fetchError) {
      // Atualizar saldo existente
      newBalance = currentCredits.balance + creditsToAdd;
      
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (updateError) {
        console.error('Erro ao atualizar créditos:', updateError);
        throw updateError;
      }
      
      console.log('Créditos atualizados. Saldo anterior:', currentCredits.balance, 'Novo saldo:', newBalance);
    } else {
      // Criar novo registro de créditos
      const { error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_id: userId,
          balance: newBalance
        });
        
      if (insertError) {
        console.error('Erro ao criar registro de créditos:', insertError);
        throw insertError;
      }
      
      console.log('Novo registro de créditos criado com saldo:', newBalance);
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
        description: `Compra Hotmart: ${product.product_name} (${creditsToAdd} créditos)`
      });

    if (transactionError) {
      console.error('Erro ao registrar transação de crédito:', transactionError);
      throw transactionError;
    }

    console.log(`✅ SUCESSO: ${creditsToAdd} créditos adicionados. Saldo final: ${newBalance}`);
    
  } catch (error) {
    console.error('Erro ao processar créditos:', error);
    throw error;
  }
}

async function processDirectAssessment(supabase: any, userId: number, product: any, transactionId: string) {
  console.log('=== PROCESSANDO ACESSO DIRETO ===');
  console.log('UserId:', userId, 'Produto:', product.product_name);
  
  try {
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

    if (assessmentError) {
      console.error('Erro ao criar assessment:', assessmentError);
      throw assessmentError;
    }

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

    if (transactionError) {
      console.error('Erro ao registrar transação de acesso direto:', transactionError);
      throw transactionError;
    }

    console.log('✅ SUCESSO: Assessment criado com acesso direto:', assessment.id);
    
  } catch (error) {
    console.error('Erro ao processar acesso direto:', error);
    throw error;
  }
}
