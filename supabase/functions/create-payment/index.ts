
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
    const { reportId, userEmail, userName } = await req.json();

    if (!reportId) {
      throw new Error('Report ID é obrigatório');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Criando preferência de pagamento para report:', reportId);

    // Criar preferência no Mercado Pago
    const preferenceData = {
      items: [
        {
          title: "Laudo Completo - Avaliação Física",
          description: "Análise detalhada com recomendações personalizadas e relatório em PDF",
          quantity: 1,
          unit_price: 9.90,
          currency_id: "BRL"
        }
      ],
      payer: {
        name: userName,
        email: userEmail
      },
      back_urls: {
        success: `${req.headers.get('origin') || 'https://bqixlrinahtauahcnpoc.supabase.co'}/`,
        failure: `${req.headers.get('origin') || 'https://bqixlrinahtauahcnpoc.supabase.co'}/`,
        pending: `${req.headers.get('origin') || 'https://bqixlrinahtauahcnpoc.supabase.co'}/`
      },
      auto_return: "approved",
      external_reference: reportId,
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

    // Salvar a preferência no banco para rastreamento
    const { error: dbError } = await supabase
      .from('payment_preferences')
      .insert({
        report_id: reportId,
        preference_id: mpData.id,
        init_point: mpData.init_point,
        status: 'pending'
      });

    if (dbError) {
      console.error('Erro ao salvar preferência:', dbError);
      // Não falhar por causa disso, o pagamento pode prosseguir
    }

    return new Response(JSON.stringify({
      preference_id: mpData.id,
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point
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
