
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
      weight,
      patientName,
      assessmentType = 'self',
      patientData
    }: AssessmentRequest = await req.json();

    console.log('Recebendo dados para avaliação:', { 
      userId, 
      sex, 
      height, 
      weight, 
      patientName, 
      assessmentType,
      hasPatientData: !!patientData,
      patientDataActivities: patientData?.physicalActivities,
      patientGoal: patientData?.goal
    });

    let userData;
    let calculatedAge;

    if (assessmentType === 'patient' && patientData) {
      // For patient assessments, use patient data directly
      const birth = new Date(patientData.birthDate);
      const today = new Date();
      calculatedAge = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--;
      }
      
      // Create a mock userData structure for patient
      userData = {
        id: userId,
        gender: patientData.gender,
        birth_date: patientData.birthDate,
        patient_profiles: [] // Não usar para avaliação de paciente
      };

      console.log('Dados estruturados do paciente:', JSON.stringify(patientData, null, 2));
    } else {
      // For self assessments, fetch user data as before
      userData = await fetchUserData(userId);
      calculatedAge = calculateAge(userData?.birth_date);
    }

    console.log('Idade calculada:', calculatedAge);

    // Calculate BMI
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    
    // Calculate body fat percentage using Deurenberg formula
    const bodyFatPercentage = calculateBodyFatPercentage(weight, height, calculatedAge, sex);
    console.log('Percentual de gordura calculado (Deurenberg):', bodyFatPercentage.toFixed(2) + '%');
    
    // Calculate lean mass and fat mass
    const leanMass = calculateLeanMass(weight, bodyFatPercentage);
    const fatMass = calculateFatMass(weight, bodyFatPercentage);
    
    console.log('Massa magra calculada:', leanMass.toFixed(2) + 'kg');
    console.log('Massa gorda calculada:', fatMass.toFixed(2) + 'kg');
    
    // VALIDAR CRÉDITOS ANTES DE CHAMAR O GPT-4
    const { hasCredits } = await checkUserCredits(parseInt(userId));
    console.log('Usuário tem créditos:', hasCredits);

    let assessment = null;
    let tier = 'basic';

    if (hasCredits) {
      try {
        console.log('Usuário tem créditos, gerando análise premium...');
        
        // Build prompt and call OpenAI for premium analysis - now passing assessmentType
        const prompt = buildAssessmentPrompt(
          userData, 
          calculatedAge, 
          height, 
          weight, 
          sex, 
          bodyFatPercentage, 
          leanMass, 
          fatMass, 
          assessmentType,
          patientData
        );
        console.log('Prompt enviado para GPT-4:', prompt.substring(0, 500) + '...');
        
        // CHAMAR OPENAI APENAS APÓS CONFIRMAR QUE TEM CRÉDITOS
        assessment = await callOpenAI(prompt);
        tier = 'premium';
        console.log('Análise premium gerada com sucesso');
      } catch (error) {
        console.error('Erro ao gerar análise premium:', error);
        // If it fails, continue with basic version
        tier = 'basic';
      }
    } else {
      console.log('Usuário sem créditos, gerando avaliação básica');
    }

    // Save assessment in database
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
      tier,
      patientName,
      assessmentType,
      patientData
    );

    // CONSUMIR CRÉDITO APENAS APÓS SUCESSO DA ANÁLISE PREMIUM
    if (tier === 'premium' && hasCredits) {
      try {
        await consumeCredit(parseInt(userId), assessmentData.id);
        console.log('Crédito consumido com sucesso');
      } catch (error) {
        console.error('Erro ao consumir crédito:', error);
        // Even if credit consumption fails, return the assessment
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
