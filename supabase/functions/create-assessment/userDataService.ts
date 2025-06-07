
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { UserData } from './types.ts';

export async function fetchUserData(userId: string): Promise<UserData> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('Buscando dados do usuário ID:', userId);

  // Primeiro buscar dados do usuário
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('birth_date, gender')
    .eq('id', userId)
    .single();

  if (userError) {
    console.error('Erro ao buscar dados do usuário:', userError);
    throw new Error(`Erro ao buscar dados do usuário: ${userError.message}`);
  }

  console.log('Dados básicos do usuário encontrados:', JSON.stringify(userData, null, 2));

  // Depois buscar perfil do paciente separadamente
  const { data: patientProfile, error: profileError } = await supabase
    .from('patient_profiles')
    .select(`
      neck_circumference,
      waist_circumference,
      hip_circumference,
      physical_activity,
      chronic_disease,
      goal
    `)
    .eq('user_id', userId)
    .maybeSingle();

  if (profileError) {
    console.error('Erro ao buscar perfil do paciente:', profileError);
  }

  console.log('Perfil do paciente encontrado:', JSON.stringify(patientProfile, null, 2));

  // Combinar os dados
  const combinedData: UserData = {
    ...userData,
    patient_profiles: patientProfile ? [patientProfile] : []
  };

  console.log('Dados combinados finais:', JSON.stringify(combinedData, null, 2));

  return combinedData;
}

export function calculateAge(birthDate?: string): number {
  if (!birthDate) return 25;

  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}
