
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import type { AssessmentRequest, AssessmentResult } from './types.ts';
import { fetchUserData, calculateAge } from './userDataService.ts';
import { buildAssessmentPrompt } from './promptBuilder.ts';
import { callOpenAI } from './openaiService.ts';
import { extractAssessmentData } from './dataExtractor.ts';
import { saveAssessment } from './assessmentService.ts';
import { calculateBodyFatPercentage, calculateLeanMass, calculateFatMass } from './deurenbergFormula.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    
    // Construir o prompt
    const prompt = buildAssessmentPrompt(userData, calculatedAge, height, weight, sex);

    // Chamar API do OpenAI
    const assessment = await callOpenAI(prompt);

    // Usar os valores calculados pela fórmula de Deurenberg como base
    // Mas ainda extrair dados do texto da IA para comparação/validação
    const { estimatedBodyFat: aiBodyFat, leanMass: aiLeanMass, fatMass: aiFatMass } = extractAssessmentData(assessment);
    
    console.log('Comparação - IA vs Deurenberg:');
    console.log('Gordura corporal - IA:', aiBodyFat, '% / Deurenberg:', bodyFatPercentage.toFixed(2), '%');
    console.log('Massa magra - IA:', aiLeanMass, 'kg / Deurenberg:', leanMass.toFixed(2), 'kg');
    console.log('Massa gorda - IA:', aiFatMass, 'kg / Deurenberg:', fatMass.toFixed(2), 'kg');

    // Salvar avaliação no banco usando os valores calculados pela fórmula de Deurenberg
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
      assessment
    );

    const result: AssessmentResult = {
      success: true, 
      assessment: assessmentData,
      bodyFat: parseFloat(bodyFatPercentage.toFixed(2)),
      leanMass: parseFloat(leanMass.toFixed(2)),
      fatMass: parseFloat(fatMass.toFixed(2)),
      bmi: parseFloat(bmi.toFixed(2)),
      age: calculatedAge
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
