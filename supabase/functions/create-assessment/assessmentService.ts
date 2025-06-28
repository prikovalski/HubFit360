
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
  patientName: string | null = null
) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: assessmentData, error } = await supabase
    .from('assessments')
    .insert([{
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
      patient_name: patientName
    }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar avaliação:', error);
    throw new Error(`Erro ao salvar avaliação: ${error.message}`);
  }

  console.log('Avaliação salva com sucesso:', assessmentData.id);
  return assessmentData;
}
