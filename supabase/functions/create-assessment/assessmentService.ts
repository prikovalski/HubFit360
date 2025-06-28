
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { PatientData } from './types.ts';

export async function saveAssessment(
  userId: string,
  frontPhoto: string,
  sidePhoto: string,
  backPhoto: string,
  calculatedAge: number,
  estimatedBodyFat: number | null,
  leanMass: number | null,
  fatMass: number | null,
  bmi: number,
  assessment: string | null,
  tier: string = 'basic',
  patientName: string | null = null,
  assessmentType: 'self' | 'patient' = 'self',
  patientData?: PatientData
) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    assessment_type: assessmentType
  };

  // If it's a patient assessment, add all patient data
  if (assessmentType === 'patient' && patientData) {
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
