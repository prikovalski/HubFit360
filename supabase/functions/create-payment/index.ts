
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
    console.log('=== INÍCIO DA FUNÇÃO CREATE-PAYMENT ===');
    
    const body = await req.json();
    console.log('Body recebido:', JSON.stringify(body, null, 2));
    
    const { productId, assessmentId, userEmail, userName } = body;

    if (!productId) {
      console.error('Product ID não fornecido');
      throw new Error('Product ID é obrigatório');
    }

    if (!userEmail) {
      console.error('Email do usuário não fornecido');
      throw new Error('Email do usuário é obrigatório');
    }

    if (!userName) {
      console.error('Nome do usuário não fornecido');
      throw new Error('Nome do usuário é obrigatório');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');

    console.log('Verificando variáveis de ambiente...');
    console.log('SUPABASE_URL:', supabaseUrl ? 'OK' : 'MISSING');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'OK' : 'MISSING');
    console.log('MERCADO_PAGO_ACCESS_TOKEN:', mercadoPagoToken ? 'OK' : 'MISSING');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuração do Supabase incompleta');
    }

    if (!mercadoPagoToken) {
      throw new Error('Token do Mercado Pago não configurado');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Buscando produto:', productId);

    // Buscar dados do produto
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError) {
      console.error('Erro ao buscar produto:', productError);
      throw new Error(`Produto não encontrado: ${productError.message}`);
    }

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    console.log('Produto encontrado:', product.name);

    // Buscar o usuário
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (userError) {
      console.error('Erro ao buscar usuário:', userError);
      throw new Error(`Usuário não encontrado: ${userError.message}`);
    }

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    console.log('Usuário encontrado, ID:', user.id);

    // Criar registro de pagamento
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        product_id: productId,
        assessment_id: assessmentId || null,
        amount: product.price,
        currency: 'BRL',
        status: 'pending'
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Erro ao criar pagamento:', paymentError);
      throw new Error(`Erro ao criar registro de pagamento: ${paymentError.message}`);
    }

    if (!payment) {
      throw new Error('Erro ao criar registro de pagamento');
    }

    console.log('Pagamento criado com ID:', payment.id);

    // Obter a URL base para os redirects
    const origin = req.headers.get('origin') || 'https://hubfit360.com';
    console.log('Origin para redirects:', origin);

    // Construir URL do webhook
    const webhookUrl = `${supabaseUrl}/functions/v1/mercadopago-webhook`;
    console.log('URL do webhook que será configurada:', webhookUrl);

    // Criar preferência no Mercado Pago
    const preferenceData = {
      items: [
        {
          title: product.name,
          description: product.description || '',
          quantity: 1,
          unit_price: Number(product.price),
          currency_id: "BRL"
        }
      ],
      payer: {
        name: userName,
        email: userEmail
      },
      back_urls: {
        success: `${origin}/`,
        failure: `${origin}/`,
        pending: `${origin}/`
      },
      auto_return: "approved",
      external_reference: payment.id,
      notification_url: webhookUrl,
      statement_descriptor: "HUBFIT360"
    };

    console.log('Enviando dados para Mercado Pago:', JSON.stringify(preferenceData, null, 2));

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mercadoPagoToken}`
      },
      body: JSON.stringify(preferenceData)
    });

    console.log('Status da resposta do Mercado Pago:', mpResponse.status);

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error('Erro na API do Mercado Pago:', errorText);
      throw new Error(`Erro do Mercado Pago (${mpResponse.status}): ${errorText}`);
    }

    const mpData = await mpResponse.json();
    console.log('Resposta do Mercado Pago:', JSON.stringify(mpData, null, 2));
    console.log('Webhook URL confirmada na resposta:', mpData.notification_url);

    if (!mpData.id || !mpData.init_point) {
      console.error('Resposta inválida do Mercado Pago:', mpData);
      throw new Error('Resposta inválida do Mercado Pago');
    }

    // Salvar a preferência no banco
    const { error: prefError } = await supabase
      .from('payment_preferences')
      .insert({
        payment_id: payment.id,
        preference_id: mpData.id,
        init_point: mpData.init_point,
        status: 'pending'
      });

    if (prefError) {
      console.error('Erro ao salvar preferência:', prefError);
      // Não falhar a operação por causa disso
    }

    const responseData = {
      preference_id: mpData.id,
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point,
      payment_id: payment.id
    };

    console.log('Retornando dados:', JSON.stringify(responseData, null, 2));
    console.log('=== FIM DA FUNÇÃO CREATE-PAYMENT ===');

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('ERRO na função create-payment:', error);
    
    const errorResponse = {
      error: error.message || 'Erro interno do servidor',
      details: error.stack || 'Stack trace não disponível'
    };

    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
