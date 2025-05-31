
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
    const webhook = await req.json();
    console.log('Webhook recebido:', JSON.stringify(webhook, null, 2));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar se é um webhook de pagamento
    if (webhook.type === 'payment') {
      const paymentId = webhook.data.id;
      console.log('Processando pagamento:', paymentId);

      // Buscar detalhes do pagamento no Mercado Pago
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${mercadoPagoToken}`
        }
      });

      const paymentData = await paymentResponse.json();
      console.log('Dados do pagamento:', JSON.stringify(paymentData, null, 2));

      if (paymentData.status === 'approved') {
        const reportId = paymentData.external_reference;
        console.log('Pagamento aprovado para report:', reportId);

        // Atualizar status do assessment para 'paid'
        const { data: updateData, error: updateError } = await supabase
          .from('assessments')
          .update({ status: 'paid' })
          .eq('id', reportId)
          .select();

        if (updateError) {
          console.error('Erro ao atualizar assessment:', updateError);
        } else {
          console.log('Assessment atualizado com sucesso:', updateData);
        }
      } else {
        console.log('Pagamento não aprovado. Status:', paymentData.status);
      }
    }

    return new Response('OK', {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response('Error', {
      headers: corsHeaders,
      status: 200, // Sempre retornar 200 para webhooks
    });
  }
});
