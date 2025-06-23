
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildAssessmentPrompt } from '../create-assessment/promptBuilder.ts';
import { callOpenAI } from '../create-assessment/openaiService.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessment_id } = await req.json();

    if (!assessment_id) {
      throw new Error('ID da avaliação é obrigatório');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuração do Supabase incompleta');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token de autorização necessário');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Usuário não autenticado');
    }

    // Buscar usuário no banco
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !dbUser) {
      throw new Error('Usuário não encontrado');
    }

    // Buscar avaliação
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessment_id)
      .eq('user_id', dbUser.id)
      .single();

    if (assessmentError || !assessment) {
      throw new Error('Avaliação não encontrada');
    }

    if (assessment.tier === 'premium') {
      throw new Error('Esta avaliação já é premium');
    }

    // Verificar créditos
    const { data: credits } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', dbUser.id)
      .single();

    const currentBalance = credits?.balance || 0;

    if (currentBalance < 1) {
      throw new Error('Créditos insuficientes');
    }

    // Buscar dados do usuário para gerar análise
    const { data: userData } = await supabase
      .from('users')
      .select('*, patient_profiles(*)')
      .eq('id', dbUser.id)
      .single();

    // Gerar análise premium
    const prompt = buildAssessmentPrompt(
      userData,
      assessment.age,
      userData.patient_profiles?.height || 170,
      userData.patient_profiles?.weight || 70,
      userData.gender || 'masculino',
      assessment.body_fat_percentage,
      assessment.lean_mass,
      assessment.fat_mass
    );

    const assessmentText = await callOpenAI(prompt);

    // Atualizar avaliação para premium
    const { error: updateError } = await supabase
      .from('assessments')
      .update({
        assessment_text: assessmentText,
        tier: 'premium'
      })
      .eq('id', assessment_id);

    if (updateError) throw updateError;

    // Consumir crédito
    const newBalance = currentBalance - 1;
    
    await supabase
      .from('user_credits')
      .update({ balance: newBalance })
      .eq('user_id', dbUser.id);

    // Registrar transação
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: dbUser.id,
        type: 'usage',
        amount: -1,
        source: 'system',
        description: 'Upgrade para análise premium',
        assessment_id: assessment_id
      });

    return new Response(JSON.stringify({
      success: true,
      new_balance: newBalance,
      message: 'Avaliação atualizada para premium com sucesso'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro ao fazer upgrade:', error);
    
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
