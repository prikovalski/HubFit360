
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { PatientData } from './types.ts';

export async function saveAssessment(
  userId: string,
  frontPhoto: string,
  sidePhoto: string,
  backPhoto: string,
  calculatedAge: number,
  estimatedBodyFat: number,
  leanMass: number,
  fatMass: number,
  bmi: number,
  assessment: string | null,
  tier: string = 'basic',
  patientName: string | null = null,
  assessmentType: 'self' | 'patient' = 'self',
  patientData?: PatientData,
  // Add circumference parameters for all assessment types
  neckCircumference?: number,
  waistCircumference?: number,
  hipCircumference?: number,
  // Add height and weight parameters for all assessment types
  height?: number,
  weight?: number,
  // Add prompt parameter
  promptText?: string,
  // Add userData parameter to access user profile data
  userData?: any,
  // Add reevaluation parameters
  wasReevaluated?: boolean,
  reevaluationInfo?: string
) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('Salvando avaliação com dados completos:', {
    assessmentType,
    neckCircumference,
    waistCircumference,
    hipCircumference,
    hasUserData: !!userData,
    hasPatientProfile: !!(userData?.patient_profiles?.[0]),
    wasReevaluated: !!wasReevaluated
  });

  const assessmentRecord: any = {
    user_id: userId,
    front_photo: frontPhoto,
    side_photo: sidePhoto,
    back_photo: backPhoto,
    age: calculatedAge,
    body_fat_percentage: estimatedBodyFat,
    lean_mass: leanMass,
    fat_mass: fatMass,
    bmi: parseFloat(bmi.toFixed(2)),
    assessment_text: assessment,
    status: 'completed',
    tier: tier,
    patient_name: patientName,
    assessment_type: assessmentType,
    // Add circumferences and physical data for all assessment types
    neck_circumference: neckCircumference || null,
    waist_circumference: waistCircumference || null,
    hip_circumference: hipCircumference || null,
    // Use patient_height and patient_weight for all assessment types
    patient_height: height || null,
    patient_weight: weight || null,
    // Add prompt text
    prompt_text: promptText || null
  };

  // Add reevaluation information if available
  if (wasReevaluated && reevaluationInfo) {
    assessmentRecord.reevaluation_applied = true;
    assessmentRecord.reevaluation_notes = reevaluationInfo;
  }

  // If it's a patient assessment, add all patient data
  if (assessmentType === 'patient' && patientData) {
    console.log('Adicionando dados do paciente à avaliação');
    assessmentRecord.patient_gender = patientData.gender;
    assessmentRecord.patient_birth_date = patientData.birthDate;
    assessmentRecord.patient_height = patientData.height;
    assessmentRecord.patient_weight = patientData.weight;
    assessmentRecord.patient_neck_circumference = patientData.neckCircumference;
    assessmentRecord.patient_waist_circumference = patientData.waistCircumference;
    assessmentRecord.patient_hip_circumference = patientData.hipCircumference;
    assessmentRecord.patient_goal = patientData.goal;
    assessmentRecord.patient_chronic_disease = patientData.chronicDisease;
    assessmentRecord.patient_medical_restriction = patientData.medicalRestriction;
    assessmentRecord.patient_food_allergy = patientData.foodAllergy;
    assessmentRecord.patient_avoid_food = patientData.avoidFood;
    assessmentRecord.patient_fixed_meal_times = patientData.fixedMealTimes;
    assessmentRecord.patient_must_have_food = patientData.mustHaveFood;
    assessmentRecord.patient_physical_activity = patientData.physicalActivity;
    assessmentRecord.patient_physical_activities = patientData.physicalActivities || [];
  } 
  // If it's a self assessment, add data from form and user profile
  else if (assessmentType === 'self') {
    console.log('Adicionando dados de autoavaliação');
    
    // Add gender from user data
    if (userData?.gender) {
      assessmentRecord.patient_gender = userData.gender;
    }
    
    // Add goal from patientData if provided (from new PhysicalActivityGoalSection)
    if (patientData?.goal) {
      assessmentRecord.patient_goal = patientData.goal;
    }
    
    // Copy data from user profile if available
    if (userData?.patient_profiles?.[0]) {
      const profile = userData.patient_profiles[0];
      console.log('Copiando dados do perfil do usuário para autoavaliação:', {
        hasPhysicalActivity: !!profile.physical_activity,
        hasPhysicalActivities: !!profile.physical_activities,
        physicalActivity: profile.physical_activity,
        physicalActivitiesCount: Array.isArray(profile.physical_activities) ? profile.physical_activities.length : 0
      });
      
      // Copy physical activity data from user profile to patient fields for consistency
      assessmentRecord.patient_physical_activity = profile.physical_activity;
      assessmentRecord.patient_physical_activities = profile.physical_activities || [];
      
      // Only use profile goal if no goal was provided in the form
      if (!patientData?.goal && profile.goal) {
        assessmentRecord.patient_goal = profile.goal;
      }
      
      assessmentRecord.patient_chronic_disease = profile.chronic_disease;
      
      // Also copy other profile data if available
      if (profile.neck_circumference) assessmentRecord.patient_neck_circumference = profile.neck_circumference;
      if (profile.waist_circumference) assessmentRecord.patient_waist_circumference = profile.waist_circumference;
      if (profile.hip_circumference) assessmentRecord.patient_hip_circumference = profile.hip_circumference;
    }
    
    // Add physical activities from form if provided
    if (patientData?.physicalActivities) {
      assessmentRecord.patient_physical_activities = patientData.physicalActivities;
    }
  }

  console.log('Registro de avaliação final a ser salvo:', {
    ...assessmentRecord,
    // Log only relevant fields for debugging
    patient_physical_activity: assessmentRecord.patient_physical_activity,
    patient_physical_activities: assessmentRecord.patient_physical_activities,
    assessment_type: assessmentRecord.assessment_type,
    reevaluation_applied: assessmentRecord.reevaluation_applied
  });

  const { data: assessmentData, error } = await supabase
    .from('assessments')
    .insert([assessmentRecord])
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar avaliação:', error);
    throw new Error(`Erro ao salvar avaliação: ${error.message}`);
  }

  console.log('Avaliação salva com sucesso:', assessmentData.id);
  return assessmentData;
}
