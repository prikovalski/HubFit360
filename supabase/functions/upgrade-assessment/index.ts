
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function buildAssessmentPrompt(
  assessment: any,
  userData: any,
  calculatedAge: number,
  height: number,
  weight: number,
  sex: string,
  bodyFatPercentage: number,
  leanMass: number,
  fatMass: number
): string {
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  const genderForPrompt = sex === 'male' ? 'Masculino' : 'Feminino';

  // Use circumferences from the assessment itself (prioritize direct fields over patient fields)
  const neckCirc = assessment.neck_circumference || assessment.patient_neck_circumference || 'N/A';
  const waistCirc = assessment.waist_circumference || assessment.patient_waist_circumference || 'N/A';
  const hipCirc = assessment.hip_circumference || assessment.patient_hip_circumference || 'N/A';

  console.log('Dados de circunferência para o prompt:', {
    neck_circumference: assessment.neck_circumference,
    waist_circumference: assessment.waist_circumference,
    hip_circumference: assessment.hip_circumference,
    patient_neck_circumference: assessment.patient_neck_circumference,
    patient_waist_circumference: assessment.patient_waist_circumference,
    patient_hip_circumference: assessment.patient_hip_circumference,
    valores_finais: { neckCirc, waistCirc, hipCirc }
  });

  // Get patient profile data for additional context
  const patientProfile = userData.patient_profiles?.[0] || {};

  const formatCircumference = (value: any): string => {
    if (value === null || value === undefined || value === 'N/A') {
      return 'Não informado';
    }
    return `${value} cm`;
  };

  const formattedNeck = formatCircumference(neckCirc);
  const formattedWaist = formatCircumference(waistCirc);
  const formattedHip = formatCircumference(hipCirc);

  console.log('Circunferências formatadas para o prompt:', {
    pescoço: formattedNeck,
    cintura: formattedWaist,
    quadril: formattedHip
  });

  return `Você é um avaliador físico profissional especializado em análise de composição corporal.

Com as medidas de circunferência fornecidas, analise os dados e gere um laudo completo incluindo:

1. AVALIAÇÃO CORPORAL
- Análise detalhada da distribuição de gordura corporal (central vs periférica)
- Interpretação das circunferências de pescoço, cintura e quadril
- Relação cintura-quadril (RCQ) e seus significados
- Use como referência os valores já calculados: ${bodyFatPercentage.toFixed(1)}% de gordura corporal

2. GASTO ENERGÉTICO
- Cálculo da Taxa Metabólica Basal (TMB)
- Estimativa do Gasto Energético Total (GET)

3. PLANEJAMENTO NUTRICIONAL
Forneça recomendações de calorias para:
- Manutenção com foco em definição
- Emagrecimento saudável (cutting)
- Ganho de massa muscular (bulking)

Divisão de macronutrientes em cada refeição para cada cenário (proteínas, carboidratos, gorduras)

4. PROJEÇÃO DE RESULTADOS
Explique o que pode acontecer seguindo as recomendações por 30 dias

DADOS PESSOAIS:
- Gênero: ${genderForPrompt}
- Idade: ${calculatedAge} anos
- Altura: ${height} cm
- Peso: ${weight} kg
- IMC: ${bmi.toFixed(1)}
- Composição Corporal (Fórmula de Deurenberg):
  * Gordura Corporal: ${bodyFatPercentage.toFixed(1)}%
  * Massa Magra: ${leanMass.toFixed(1)} kg
  * Massa Gorda: ${fatMass.toFixed(1)} kg
- Circunferências Medidas: 
  * Pescoço: ${formattedNeck}
  * Cintura: ${formattedWaist}
  * Quadril: ${formattedHip}
- Atividade física: ${patientProfile.physical_activity || 'Não informado'}
- Doenças crônicas: ${patientProfile.chronic_disease || 'Nenhuma'}
- Objetivo: ${patientProfile.goal || 'Não informado'}

IMPORTANTE: Com base nas circunferências fornecidas, faça uma análise detalhada da distribuição de gordura corporal e forneça recomendações específicas.

Forneça um laudo técnico realista e profissional utilizando uma linguagem de fácil entendimento. Inclua valores numéricos específicos nas estimativas e explore detalhadamente as implicações das medidas de circunferência para a saúde e composição corporal.`;
}

async function callOpenAI(prompt: string): Promise<string> {
  console.log('=== PROMPT ENVIADO PARA OPENAI ===');
  console.log(prompt);
  console.log('=== FIM DO PROMPT ===');
  
  console.log('Enviando prompt para OpenAI...');

  const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY') || ''}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'Você é um avaliador físico profissional especializado em análise de composição corporal. Forneça sempre valores numéricos específicos nas suas estimativas e análise detalhada das circunferências corporais.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!openAIResponse.ok) {
    const errorText = await openAIResponse.text();
    console.error('Erro na API do OpenAI:', errorText);
    throw new Error('Erro na API do OpenAI');
  }

  const openAIData = await openAIResponse.json();
  const responseContent = openAIData.choices[0].message.content;
  
  console.log('=== RESPOSTA COMPLETA DO OPENAI ===');
  console.log('Resposta bruta:', JSON.stringify(openAIData, null, 2));
  console.log('=== CONTEÚDO DA RESPOSTA ===');
  console.log(responseContent);
  console.log('=== FIM DA RESPOSTA ===');
  
  return responseContent;
}

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

    // Buscar avaliação com todos os dados necessários
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

    console.log('Dados da avaliação para upgrade:', {
      assessment_id: assessment.id,
      assessment_type: assessment.assessment_type,
      has_circumferences: {
        neck: !!assessment.neck_circumference,
        waist: !!assessment.waist_circumference,
        hip: !!assessment.hip_circumference
      },
      circumference_values: {
        neck: assessment.neck_circumference,
        waist: assessment.waist_circumference,
        hip: assessment.hip_circumference
      },
      patient_circumferences: {
        neck: assessment.patient_neck_circumference,
        waist: assessment.patient_waist_circumference,
        hip: assessment.patient_hip_circumference
      }
    });

    // Use data from the specific assessment instead of generic profile
    const height = assessment.assessment_type === 'patient' ? 
                  (assessment.patient_height || 170) : 
                  (userData.patient_profiles?.[0]?.height || 170);
    
    const weight = assessment.assessment_type === 'patient' ? 
                  (assessment.patient_weight || 70) : 
                  (userData.patient_profiles?.[0]?.weight || 70);

    const gender = assessment.assessment_type === 'patient' ? 
                  (assessment.patient_gender || 'masculino') : 
                  (userData.gender || 'masculino');

    // Gerar análise premium
    const prompt = buildAssessmentPrompt(
      assessment,
      userData,
      assessment.age,
      height,
      weight,
      gender,
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
        tier: 'premium',
        prompt_text: prompt
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
