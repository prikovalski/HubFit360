
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
    const { productId, assessmentId, userEmail, userName } = await req.json();

    if (!productId) {
      throw new Error('Product ID é obrigatório');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')!;

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

    if (productError || !product) {
      throw new Error('Produto não encontrado');
    }

    // Buscar o usuário
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      throw new Error('Usuário não encontrado');
    }

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

    if (paymentError || !payment) {
      console.error('Erro ao criar pagamento:', paymentError);
      throw new Error('Erro ao criar registro de pagamento');
    }

    console.log('Pagamento criado:', payment.id);

    // Obter a URL base correta
    const origin = req.headers.get('origin') || req.headers.get('referer') || 'https://bqixlrinahtauahcnpoc.supabase.co';
    const baseUrl = new URL(origin).origin;

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
        success: `${baseUrl}/`,
        failure: `${baseUrl}/`,
        pending: `${baseUrl}/`
      },
      auto_return: "approved",
      external_reference: payment.id,
      notification_url: `${supabaseUrl}/functions/v1/mercadopago-webhook`,
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

    const mpData = await mpResponse.json();
    console.log('Resposta do Mercado Pago:', JSON.stringify(mpData, null, 2));

    if (!mpResponse.ok) {
      console.error('Erro na API do Mercado Pago:', mpData);
      throw new Error(`Erro do Mercado Pago: ${mpData.message || 'Erro desconhecido'}`);
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
    }

    return new Response(JSON.stringify({
      preference_id: mpData.id,
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point,
      payment_id: payment.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro na função create-payment:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
