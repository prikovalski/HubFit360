
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
    
    // SEMPRE RETORNA AVALIAÇÃO BÁSICA PRIMEIRO
    // O upgrade será feito através da função upgrade-assessment
    console.log('Gerando avaliação básica (sem consumir créditos)');
    const tier = 'basic';
    const assessment = null; // Avaliação básica não tem análise de texto

    // Save assessment in database (always as basic)
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
      assessment, // null para avaliação básica
      tier, // sempre 'basic'
      patientName,
      assessmentType,
      patientData
    );

    console.log('Avaliação básica salva com sucesso:', assessmentData.id);

    const result: AssessmentResult = {
      success: true, 
      assessment: assessmentData,
      bodyFat: parseFloat(bodyFatPercentage.toFixed(2)),
      leanMass: parseFloat(leanMass.toFixed(2)),
      fatMass: parseFloat(fatMass.toFixed(2)),
      bmi: parseFloat(bmi.toFixed(2)),
      age: calculatedAge,
      tier: tier // sempre 'basic'
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
