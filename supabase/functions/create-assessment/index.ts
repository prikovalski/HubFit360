
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { saveAssessment } from './assessmentService.ts';
import { calculateBodyFatPercentage, calculateLeanMass, calculateFatMass } from './deurenbergFormula.ts';
import { callOpenAI } from './openaiService.ts';
import { buildAssessmentPrompt } from './promptBuilder.ts';

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
  // Add circumference fields
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

    // Calculate body composition using Deurenberg formula
    const bodyFatPercentage = calculateBodyFatPercentage(
      data.weight,
      data.height,
      calculatedAge,
      data.sex.toLowerCase()
    );
    
    const leanMass = calculateLeanMass(data.weight, bodyFatPercentage);
    const fatMass = calculateFatMass(data.weight, bodyFatPercentage);
    
    // Calculate BMI
    const heightM = data.height / 100;
    const bmi = data.weight / (heightM * heightM);

    console.log('Cálculos realizados:', {
      bodyFatPercentage: bodyFatPercentage.toFixed(2),
      leanMass: leanMass.toFixed(2),
      fatMass: fatMass.toFixed(2),
      bmi: bmi.toFixed(2)
    });

    // Build assessment prompt for potential use
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

    // For basic assessments, save without detailed analysis
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
      null, // No assessment text for basic
      'basic',
      data.patientName || null,
      data.assessmentType,
      data.patientData,
      // Pass circumferences for all assessment types
      data.neckCircumference,
      data.waistCircumference,
      data.hipCircumference,
      // Pass height and weight for all assessment types
      data.height,
      data.weight,
      // Pass the prompt text
      assessmentPrompt,
      // Pass user data to copy physical activities for self assessments
      userData
    );

    console.log('Avaliação básica salva com ID:', savedAssessment.id);

    return new Response(JSON.stringify({
      success: true,
      assessment: {
        id: savedAssessment.id,
        tier: 'basic',
        bodyFatPercentage: bodyFatPercentage,
        leanMass: leanMass,
        fatMass: fatMass,
        bmi: bmi
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro ao processar avaliação:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
