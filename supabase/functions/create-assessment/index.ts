
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { saveAssessment } from './assessmentService.ts';
import { calculateBodyFatPercentage, calculateLeanMass, calculateFatMass } from './deurenbergFormula.ts';
import { callOpenAI } from './openaiService.ts';
import { buildAssessmentPrompt } from './promptBuilder.ts';
import { shouldTriggerReevaluation, reevaluateBodyComposition } from './reevaluationService.ts';
import { checkRateLimit, getRateLimitHeaders } from '../_shared/rateLimiter.ts';
import { createErrorResponse } from '../_shared/errorHandler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssessmentData {
  userId: string;
  frontPhoto: string;
  sidePhoto: string;
  backPhoto: string;
  sex: string;
  height: number;
  weight: number;
  assessmentType: 'self' | 'patient';
  patientName?: string;
  patientData?: any;
  // Circumference fields for Navy method
  neckCircumference?: number;
  waistCircumference?: number;
  hipCircumference?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: AssessmentData = await req.json();
    
    // Rate limiting: 10 assessments per minute per user
    if (!checkRateLimit(data.userId, { maxRequests: 10, windowMs: 60000 })) {
      return createErrorResponse(
        new Error('Rate limit exceeded'),
        'RATE_LIMIT_EXCEEDED',
        429,
        { ...corsHeaders, ...getRateLimitHeaders(data.userId) }
      );
    }
    
    console.log('Dados recebidos na create-assessment:', {
      userId: data.userId,
      assessmentType: data.assessmentType,
      hasCircumferences: {
        neck: !!data.neckCircumference,
        waist: !!data.waistCircumference,
        hip: !!data.hipCircumference
      },
      circumferenceValues: {
        neck: data.neckCircumference,
        waist: data.waistCircumference,
        hip: data.hipCircumference
      }
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuração do Supabase incompleta');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user data with detailed patient profile information
    console.log('Buscando dados do usuário ID:', data.userId);
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        patient_profiles (
          neck_circumference,
          waist_circumference,
          hip_circumference,
          physical_activity,
          physical_activities,
          chronic_disease,
          goal,
          height,
          weight
        )
      `)
      .eq('id', data.userId)
      .single();

    if (userError || !userData) {
      console.error('Erro ao buscar usuário:', userError);
      throw new Error('Usuário não encontrado');
    }

    console.log('Dados do usuário carregados:', {
      userId: userData.id,
      hasPatientProfile: !!userData.patient_profiles?.[0],
      patientProfileData: userData.patient_profiles?.[0] ? {
        hasPhysicalActivity: !!userData.patient_profiles[0].physical_activity,
        hasPhysicalActivities: !!userData.patient_profiles[0].physical_activities,
        physicalActivity: userData.patient_profiles[0].physical_activity,
        physicalActivitiesCount: Array.isArray(userData.patient_profiles[0].physical_activities) 
          ? userData.patient_profiles[0].physical_activities.length 
          : 0,
        physicalActivities: userData.patient_profiles[0].physical_activities
      } : null
    });

    // Calculate age based on assessment type
    let calculatedAge: number;
    
    if (data.assessmentType === 'patient' && data.patientData?.birthDate) {
      const birthDate = new Date(data.patientData.birthDate);
      calculatedAge = new Date().getFullYear() - birthDate.getFullYear();
    } else if (userData.birth_date) {
      const birthDate = new Date(userData.birth_date);
      calculatedAge = new Date().getFullYear() - birthDate.getFullYear();
    } else {
      calculatedAge = 30; // Default age if not available
    }

    console.log('Idade calculada:', calculatedAge);

    // Calculate body composition using Navy method (Deurenberg formula)
    console.log('=== CÁLCULO INICIAL COM DEURENBERG (NAVY) ===');
    
    let bodyFatPercentage = calculateBodyFatPercentage(
      data.weight,
      data.height,
      calculatedAge,
      data.sex.toLowerCase()
    );
    
    console.log('Percentual de gordura inicial:', bodyFatPercentage.toFixed(1) + '%');

    // Check if reevaluation is needed
    let reevaluationInfo = '';
    let wasReevaluated = false;
    let leanMass: number;
    let fatMass: number;

    if (data.waistCircumference) {
      const needsReevaluation = shouldTriggerReevaluation(
        bodyFatPercentage,
        data.waistCircumference,
        data.height
      );

      if (needsReevaluation) {
      console.log('=== ACIONANDO REAVALIAÇÃO ===');
      console.log('Condições atendidas para reavaliação:', {
        bodyFatPercentage: bodyFatPercentage.toFixed(1),
        waistCircumference: data.waistCircumference,
        cinturaAlturaRatio: (data.waistCircumference / data.height).toFixed(2)
      });

      const reevaluationResult = await reevaluateBodyComposition(
        bodyFatPercentage,
        data.waistCircumference,
        data.height,
        data.weight,
        data.weight / Math.pow(data.height / 100, 2), // BMI
        data.sex,
        calculatedAge,
        data.frontPhoto,
        data.sidePhoto,
        data.backPhoto
      );

        if (reevaluationResult.wasReevaluated) {
          console.log('=== REAVALIAÇÃO APLICADA ===');
          console.log('Percentual original:', bodyFatPercentage.toFixed(1) + '%');
          console.log('Percentual reavaliado:', reevaluationResult.newBodyFatPercentage.toFixed(1) + '%');
          console.log('Justificativa:', reevaluationResult.justification);

          bodyFatPercentage = reevaluationResult.newBodyFatPercentage;
          reevaluationInfo = reevaluationResult.justification;
          wasReevaluated = true;

          // Recalculate lean and fat mass with new percentage
          leanMass = calculateLeanMass(data.weight, bodyFatPercentage);
          fatMass = calculateFatMass(data.weight, bodyFatPercentage);
        }
    }

    // Calculate lean and fat mass if not already calculated by reevaluation
    if (!wasReevaluated) {
      leanMass = calculateLeanMass(data.weight, bodyFatPercentage);
      fatMass = calculateFatMass(data.weight, bodyFatPercentage);
    }
    
    // Calculate BMI
    const heightM = data.height / 100;
    const bmi = data.weight / (heightM * heightM);

    console.log('Cálculos finais realizados:', {
      bodyFatPercentage: bodyFatPercentage.toFixed(2),
      leanMass: leanMass.toFixed(2),
      fatMass: fatMass.toFixed(2),
      bmi: bmi.toFixed(2),
      wasReevaluated
    });

    // Build assessment prompt for potential use
    console.log('=== DADOS ENVIADOS PARA CONSTRUÇÃO DO PROMPT ===');
    console.log('Altura (data.height):', data.height, 'cm');
    console.log('Peso (data.weight):', data.weight, 'kg');
    console.log('Tipo de avaliação:', data.assessmentType);
    console.log('Dados do paciente (patientData):', JSON.stringify(data.patientData, null, 2));
    
    const assessmentPrompt = buildAssessmentPrompt(
      userData,
      calculatedAge,
      data.height,
      data.weight,
      data.sex,
      bodyFatPercentage,
      leanMass,
      fatMass,
      data.assessmentType,
      data.patientData
    );

    console.log('Prompt construído com sucesso, tamanho:', assessmentPrompt.length);

    // Save the assessment and get the complete saved data
    const savedAssessment = await saveAssessment(
      data.userId,
      data.frontPhoto,
      data.sidePhoto,
      data.backPhoto,
      calculatedAge,
      bodyFatPercentage,
      leanMass,
      fatMass,
      bmi,
      null,
      'basic',
      data.patientName || null,
      data.assessmentType,
      data.patientData,
      data.neckCircumference,
      data.waistCircumference,
      data.hipCircumference,
      data.height,
      data.weight,
      assessmentPrompt,
      userData,
      wasReevaluated,
      reevaluationInfo
    );

    console.log('Avaliação básica salva com ID:', savedAssessment.id);

    // Fetch the complete assessment data that was just saved
    console.log('Buscando dados completos da avaliação criada...');
    const { data: completeAssessment, error: fetchError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', savedAssessment.id)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar avaliação completa:', fetchError);
      // If we can't fetch, return what we have with constructed data
      return new Response(JSON.stringify({
        success: true,
        assessment: {
          id: savedAssessment.id,
          tier: 'basic',
          bodyFatPercentage: bodyFatPercentage,
          leanMass: leanMass,
          fatMass: fatMass,
          bmi: bmi,
          wasReevaluated: wasReevaluated,
          reevaluationInfo: reevaluationInfo,
          // Add the essential data that should have been saved
          patient_height: data.height,
          patient_weight: data.weight,
          patient_name: data.patientName,
          patient_gender: data.assessmentType === 'self' ? userData.gender : data.patientData?.gender,
          patient_goal: data.patientData?.goal,
          created_at: new Date().toISOString(),
          status: 'completed',
          assessment_type: data.assessmentType
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log('Dados completos da avaliação recuperados:', {
      id: completeAssessment.id,
      patient_height: completeAssessment.patient_height,
      patient_weight: completeAssessment.patient_weight,
      patient_name: completeAssessment.patient_name,
      patient_gender: completeAssessment.patient_gender,
      patient_goal: completeAssessment.patient_goal
    });

    // Create preview data for immediate display
    const preview = {
      leanMass: `${leanMass.toFixed(1)}kg`,
      bodyFat: `${bodyFatPercentage.toFixed(1)}%`,
      bmi: bmi.toFixed(1),
      fatMass: `${fatMass.toFixed(1)}kg`,
      summary: completeAssessment.assessment_text || ''
    };

    // Return complete assessment data with all fields needed for immediate display
    return new Response(JSON.stringify({
      success: true,
      assessment: {
        id: completeAssessment.id,
        tier: completeAssessment.tier,
        bodyFatPercentage: bodyFatPercentage,
        leanMass: leanMass,
        fatMass: fatMass,
        bmi: bmi,
        wasReevaluated: wasReevaluated,
        reevaluationInfo: reevaluationInfo,
        // Include all the personal data
        patient_height: completeAssessment.patient_height,
        patient_weight: completeAssessment.patient_weight,
        patient_name: completeAssessment.patient_name,
        patient_gender: completeAssessment.patient_gender,
        patient_goal: completeAssessment.patient_goal,
        patient_neck_circumference: completeAssessment.patient_neck_circumference,
        patient_waist_circumference: completeAssessment.patient_waist_circumference,
        patient_hip_circumference: completeAssessment.patient_hip_circumference,
        // Include metadata
        created_at: completeAssessment.created_at,
        status: completeAssessment.status,
        assessment_type: completeAssessment.assessment_type,
        age: completeAssessment.age,
        assessmentText: completeAssessment.assessment_text,
        // Include preview for compatibility
        preview: preview,
        // Include display data for immediate use
        date: completeAssessment.created_at,
        payment_status: 'paid' // Basic assessments are always considered paid
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro ao processar avaliação:', error);
    return createErrorResponse(error, 'DEFAULT', 500, corsHeaders);
  }
});
