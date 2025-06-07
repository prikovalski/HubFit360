
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import type { AssessmentRequest, AssessmentResult } from './types.ts';
import { fetchUserData, calculateAge } from './userDataService.ts';
import { buildAssessmentPrompt } from './promptBuilder.ts';
import { callOpenAI } from './openaiService.ts';
import { extractAssessmentData } from './dataExtractor.ts';
import { saveAssessment } from './assessmentService.ts';

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
    
    // Construir o prompt
    const prompt = buildAssessmentPrompt(userData, calculatedAge, height, weight, sex);

    // Chamar API do OpenAI
    const assessment = await callOpenAI(prompt);

    // Extrair dados numéricos do texto da avaliação
    const { estimatedBodyFat, leanMass, fatMass } = extractAssessmentData(assessment);

    // Salvar avaliação no banco
    const assessmentData = await saveAssessment(
      userId,
      frontPhoto,
      sidePhoto,
      backPhoto,
      calculatedAge,
      estimatedBodyFat,
      leanMass,
      fatMass,
      bmi,
      assessment
    );

    const result: AssessmentResult = {
      success: true, 
      assessment: assessmentData,
      bodyFat: estimatedBodyFat,
      leanMass,
      fatMass,
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
