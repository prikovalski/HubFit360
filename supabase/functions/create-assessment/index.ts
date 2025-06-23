
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import type { AssessmentRequest, AssessmentResult } from './types.ts';
import { fetchUserData, calculateAge } from './userDataService.ts';
import { buildAssessmentPrompt } from './promptBuilder.ts';
import { callOpenAI } from './openaiService.ts';
import { saveAssessment } from './assessmentService.ts';
import { calculateBodyFatPercentage, calculateLeanMass, calculateFatMass } from './deurenbergFormula.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function checkUserCredits(userId: number) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    return { hasCredits: false, balance: 0 };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: credits } = await supabase
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .single();

  const balance = credits?.balance || 0;
  return { hasCredits: balance > 0, balance };
}

async function consumeCredit(userId: number, assessmentId: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Configuração do Supabase incompleta');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Buscar créditos atuais
  const { data: credits } = await supabase
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .single();

  const currentBalance = credits?.balance || 0;

  if (currentBalance < 1) {
    throw new Error('Créditos insuficientes');
  }

  // Consumir 1 crédito
  const newBalance = currentBalance - 1;
  
  await supabase
    .from('user_credits')
    .update({ balance: newBalance })
    .eq('user_id', userId);

  // Registrar transação
  await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      type: 'usage',
      amount: -1,
      source: 'system',
      description: 'Crédito usado para análise premium',
      assessment_id: assessmentId
    });

  return newBalance;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      userId, 
      frontPhoto, 
      sidePhoto, 
      backPhoto, 
      sex, 
      height, 
      weight 
    }: AssessmentRequest = await req.json();

    console.log('Recebendo dados para avaliação:', { userId, sex, height, weight });

    // Buscar dados do usuário
    const userData = await fetchUserData(userId);

    // Calcular a idade
    const calculatedAge = calculateAge(userData?.birth_date);
    console.log('Idade calculada:', calculatedAge);

    // Calcular IMC
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    
    // Calcular percentual de gordura corporal usando a fórmula de Deurenberg
    const bodyFatPercentage = calculateBodyFatPercentage(weight, height, calculatedAge, sex);
    console.log('Percentual de gordura calculado (Deurenberg):', bodyFatPercentage.toFixed(2) + '%');
    
    // Calcular massa magra e massa gorda
    const leanMass = calculateLeanMass(weight, bodyFatPercentage);
    const fatMass = calculateFatMass(weight, bodyFatPercentage);
    
    console.log('Massa magra calculada:', leanMass.toFixed(2) + 'kg');
    console.log('Massa gorda calculada:', fatMass.toFixed(2) + 'kg');
    
    // Verificar se o usuário tem créditos para análise premium
    const { hasCredits } = await checkUserCredits(userData.id);
    console.log('Usuário tem créditos:', hasCredits);

    let assessment = null;
    let tier = 'basic';

    if (hasCredits) {
      try {
        // Construir o prompt e chamar OpenAI para análise premium
        const prompt = buildAssessmentPrompt(userData, calculatedAge, height, weight, sex, bodyFatPercentage, leanMass, fatMass);
        assessment = await callOpenAI(prompt);
        tier = 'premium';
        console.log('Análise premium gerada com sucesso');
      } catch (error) {
        console.error('Erro ao gerar análise premium:', error);
        // Se falhar, continua com versão básica
        tier = 'basic';
      }
    } else {
      console.log('Usuário sem créditos, gerando avaliação básica');
    }

    // Salvar avaliação no banco
    const assessmentData = await saveAssessment(
      userId,
      frontPhoto,
      sidePhoto,
      backPhoto,
      calculatedAge,
      bodyFatPercentage,
      leanMass,
      fatMass,
      bmi,
      assessment,
      tier
    );

    // Se foi uma análise premium, consumir o crédito
    if (tier === 'premium' && hasCredits) {
      try {
        await consumeCredit(userData.id, assessmentData.id);
        console.log('Crédito consumido com sucesso');
      } catch (error) {
        console.error('Erro ao consumir crédito:', error);
        // Mesmo se falhar ao consumir o crédito, retorna a avaliação
      }
    }

    const result: AssessmentResult = {
      success: true, 
      assessment: assessmentData,
      bodyFat: parseFloat(bodyFatPercentage.toFixed(2)),
      leanMass: parseFloat(leanMass.toFixed(2)),
      fatMass: parseFloat(fatMass.toFixed(2)),
      bmi: parseFloat(bmi.toFixed(2)),
      age: calculatedAge,
      tier: tier
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
