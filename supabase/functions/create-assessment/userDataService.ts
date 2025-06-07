
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { UserData } from './types.ts';

export async function fetchUserData(userId: string): Promise<UserData> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('Buscando dados do usuário ID:', userId);

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select(`
      birth_date,
      gender,
      patient_profiles (
        neck_circumference,
        waist_circumference,
        hip_circumference,
        physical_activity,
        chronic_disease,
        goal
      )
    `)
    .eq('id', userId)
    .single();

  if (userError) {
    console.error('Erro ao buscar dados do usuário:', userError);
    throw new Error(`Erro ao buscar dados do usuário: ${userError.message}`);
  }

  console.log('Dados do usuário encontrados:', JSON.stringify(userData, null, 2));
  
  if (userData.patient_profiles && userData.patient_profiles.length > 0) {
    console.log('Perfil do paciente encontrado:', JSON.stringify(userData.patient_profiles[0], null, 2));
  } else {
    console.log('Nenhum perfil de paciente encontrado');
  }

  return userData;
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
