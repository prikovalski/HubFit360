
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
    console.log('=== INÍCIO DO WEBHOOK MERCADOPAGO ===');
    
    const webhook = await req.json();
    console.log('Webhook recebido:', JSON.stringify(webhook, null, 2));

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const mercadoPagoToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');

    console.log('Verificando variáveis de ambiente...');
    console.log('SUPABASE_URL:', supabaseUrl ? 'OK' : 'MISSING');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'OK' : 'MISSING');
    console.log('MERCADO_PAGO_ACCESS_TOKEN:', mercadoPagoToken ? 'OK' : 'MISSING');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Configuração do Supabase incompleta');
      return new Response('Configuração incompleta', {
        headers: corsHeaders,
        status: 200,
      });
    }

    if (!mercadoPagoToken) {
      console.error('Token do Mercado Pago não configurado');
      return new Response('Token não configurado', {
        headers: corsHeaders,
        status: 200,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar se é um webhook de pagamento
    if (webhook.type === 'payment') {
      const paymentId = webhook.data.id;
      console.log('Processando pagamento MP:', paymentId);

      // Buscar detalhes do pagamento no Mercado Pago
      console.log('Buscando detalhes do pagamento no Mercado Pago...');
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${mercadoPagoToken}`
        }
      });

      if (!paymentResponse.ok) {
        console.error('Erro ao buscar pagamento no MP:', paymentResponse.status);
        const errorText = await paymentResponse.text();
        console.error('Detalhes do erro:', errorText);
        return new Response('Erro ao buscar pagamento', {
          headers: corsHeaders,
          status: 200,
        });
      }

      const paymentData = await paymentResponse.json();
      console.log('Dados do pagamento MP:', JSON.stringify(paymentData, null, 2));

      const internalPaymentId = paymentData.external_reference;
      console.log('Payment ID interno:', internalPaymentId);

      if (!internalPaymentId) {
        console.error('External reference não encontrado no pagamento MP');
        return new Response('External reference não encontrado', {
          headers: corsHeaders,
          status: 200,
        });
      }

      // Verificar se o pagamento existe no banco
      console.log('Buscando pagamento no banco de dados...');
      const { data: existingPayment, error: fetchError } = await supabase
        .from('payments')
        .select('*, products(*)')
        .eq('id', internalPaymentId)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar pagamento no banco:', fetchError);
        return new Response('Pagamento não encontrado', {
          headers: corsHeaders,
          status: 200,
        });
      }

      if (!existingPayment) {
        console.error('Pagamento não encontrado no banco com ID:', internalPaymentId);
        return new Response('Pagamento não encontrado', {
          headers: corsHeaders,
          status: 200,
        });
      }

      console.log('Pagamento encontrado no banco:', existingPayment);

      if (paymentData.status === 'approved') {
        console.log('Pagamento aprovado! Processando...');

        // Verificar se já foi processado
        if (existingPayment.status === 'paid') {
          console.log('Pagamento já processado anteriormente');
          return new Response('OK', {
            headers: corsHeaders,
            status: 200,
          });
        }

        // Atualizar status do pagamento
        const { data: updatedPayment, error: paymentError } = await supabase
          .from('payments')
          .update({ 
            status: 'paid',
            payment_method: paymentData.payment_method_id,
            external_id: paymentData.id.toString(),
            paid_at: new Date().toISOString()
          })
          .eq('id', internalPaymentId)
          .select('*, products(*)')
          .single();

        if (paymentError) {
          console.error('Erro ao atualizar pagamento:', paymentError);
          return new Response('Erro ao atualizar pagamento', {
            headers: corsHeaders,
            status: 200,
          });
        } else {
          console.log('Pagamento atualizado com sucesso:', updatedPayment);

          // Se for um pagamento de avaliação, atualizar status da avaliação
          if (updatedPayment.assessment_id && updatedPayment.products.type === 'assessment') {
            
            const { data: updatedAssessment, error: assessmentError } = await supabase
              .from('assessments')
              .update({ status: 'paid' })
              .eq('id', updatedPayment.assessment_id)
              .select()
              .single();

            if (assessmentError) {
              console.error('Erro ao atualizar assessment:', assessmentError);
            } else {
              console.log('Assessment atualizada com sucesso:', updatedAssessment);
            }
          } else {
            console.log('Não é um pagamento de assessment ou assessment_id não encontrado');
            console.log('assessment_id:', updatedPayment.assessment_id);
            console.log('product type:', updatedPayment.products?.type);
          }
        }
      } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
        console.log('Pagamento rejeitado/cancelado. Status:', paymentData.status);
        
        // Atualizar status do pagamento como failed
        const { error: updateError } = await supabase
          .from('payments')
          .update({ 
            status: 'failed',
            external_id: paymentData.id.toString()
          })
          .eq('id', internalPaymentId);

        if (updateError) {
          console.error('Erro ao atualizar pagamento failed:', updateError);
        } else {
          console.log('Pagamento marcado como failed');
        }
      } else {
        console.log('Pagamento em status:', paymentData.status, '- aguardando aprovação');
      }
    } else {
      console.log('Webhook não é do tipo payment:', webhook.type);
    }

    console.log('=== FIM DO WEBHOOK MERCADOPAGO ===');
    return new Response('OK', {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('ERRO no webhook:', error);
    console.error('Stack trace:', error.stack);
    return new Response('Error', {
      headers: corsHeaders,
      status: 200, // Sempre retornar 200 para webhooks
    });
  }
});
