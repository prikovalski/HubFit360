
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
    console.log('=== INÍCIO DA FUNÇÃO CHECK-PAYMENT-STATUS ===');
    
    const body = await req.json();
    console.log('Body recebido:', JSON.stringify(body, null, 2));
    
    const { assessmentId } = body;

    if (!assessmentId) {
      console.error('Assessment ID não fornecido');
      throw new Error('Assessment ID é obrigatório');
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

    console.log('Buscando pagamento para assessment:', assessmentId);

    // Buscar o pagamento relacionado à avaliação
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, products(*)')
      .eq('assessment_id', assessmentId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (paymentError) {
      console.error('Erro ao buscar pagamento:', paymentError);
      throw new Error(`Erro ao buscar pagamento: ${paymentError.message}`);
    }

    if (!payment) {
      console.log('Nenhum pagamento pendente encontrado para esta avaliação');
      return new Response(JSON.stringify({ 
        status: 'no_payment',
        message: 'Nenhum pagamento pendente encontrado'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log('Pagamento encontrado:', payment.id);

    // Buscar a preferência do Mercado Pago
    const { data: preference, error: prefError } = await supabase
      .from('payment_preferences')
      .select('*')
      .eq('payment_id', payment.id)
      .single();

    if (prefError || !preference) {
      console.error('Erro ao buscar preferência:', prefError);
      throw new Error('Preferência de pagamento não encontrada');
    }

    console.log('Preferência encontrada:', preference.preference_id);

    // Buscar pagamentos no Mercado Pago para esta preferência
    console.log('Consultando pagamentos no Mercado Pago...');
    const searchResponse = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=${payment.id}`, {
      headers: {
        'Authorization': `Bearer ${mercadoPagoToken}`
      }
    });

    if (!searchResponse.ok) {
      console.error('Erro ao buscar pagamentos no MP:', searchResponse.status);
      const errorText = await searchResponse.text();
      console.error('Detalhes do erro:', errorText);
      throw new Error(`Erro ao consultar Mercado Pago: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    console.log('Resultado da busca:', JSON.stringify(searchData, null, 2));

    if (!searchData.results || searchData.results.length === 0) {
      console.log('Nenhum pagamento encontrado no MP para esta referência');
      return new Response(JSON.stringify({ 
        status: 'pending',
        message: 'Pagamento ainda não processado'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Verificar se algum pagamento foi aprovado
    const approvedPayment = searchData.results.find(p => p.status === 'approved');
    
    if (approvedPayment) {
      console.log('Pagamento aprovado encontrado:', approvedPayment.id);
      
      // Atualizar status do pagamento
      const { error: updatePaymentError } = await supabase
        .from('payments')
        .update({ 
          status: 'paid',
          payment_method: approvedPayment.payment_method_id,
          external_id: approvedPayment.id.toString(),
          paid_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      if (updatePaymentError) {
        console.error('Erro ao atualizar pagamento:', updatePaymentError);
      } else {
        console.log('Pagamento atualizado para paid');
      }

      // Atualizar status da avaliação
      const { error: updateAssessmentError } = await supabase
        .from('assessments')
        .update({ status: 'paid' })
        .eq('id', assessmentId);

      if (updateAssessmentError) {
        console.error('Erro ao atualizar assessment:', updateAssessmentError);
      } else {
        console.log('Assessment atualizada para paid');
      }

      return new Response(JSON.stringify({ 
        status: 'paid',
        message: 'Pagamento aprovado!',
        payment_id: approvedPayment.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Verificar se algum pagamento foi rejeitado
    const rejectedPayment = searchData.results.find(p => p.status === 'rejected' || p.status === 'cancelled');
    
    if (rejectedPayment) {
      console.log('Pagamento rejeitado/cancelado encontrado:', rejectedPayment.id);
      
      // Atualizar status do pagamento
      const { error: updateError } = await supabase
        .from('payments')
        .update({ 
          status: 'failed',
          external_id: rejectedPayment.id.toString()
        })
        .eq('id', payment.id);

      if (updateError) {
        console.error('Erro ao atualizar pagamento failed:', updateError);
      }

      return new Response(JSON.stringify({ 
        status: 'failed',
        message: 'Pagamento rejeitado ou cancelado'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log('Pagamento ainda pendente no MP');
    return new Response(JSON.stringify({ 
      status: 'pending',
      message: 'Pagamento ainda sendo processado'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('ERRO na função check-payment-status:', error);
    
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
