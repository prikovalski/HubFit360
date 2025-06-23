
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function buildAssessmentPrompt(
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
  const patientProfile = userData.patient_profiles?.[0] || {};

  console.log('Dados do perfil do paciente para o prompt:', JSON.stringify(patientProfile, null, 2));

  const formatCircumference = (value: number | null | undefined): string => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    return `${value}`;
  };

  const neckCirc = formatCircumference(patientProfile.neck_circumference);
  const waistCirc = formatCircumference(patientProfile.waist_circumference);
  const hipCirc = formatCircumference(patientProfile.hip_circumference);

  console.log('Circunferências formatadas:', {
    pescoço: neckCirc,
    cintura: waistCirc,
    quadril: hipCirc
  });

  console.log('Valores calculados pela fórmula de Deurenberg:', {
    bodyFatPercentage: bodyFatPercentage.toFixed(2) + '%',
    leanMass: leanMass.toFixed(2) + 'kg',
    fatMass: fatMass.toFixed(2) + 'kg'
  });

  return `Você é um avaliador físico profissional especializado em análise de composição corporal.

Analise os dados fornecidos, gere um laudo completo incluindo:

1. AVALIAÇÃO CORPORAL
- Análise da distribuição de gordura corporal
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
- Circunferências: 
  * Pescoço: ${neckCirc} cm
  * Cintura: ${waistCirc} cm
  * Quadril: ${hipCirc} cm
- Atividade física: ${patientProfile.physical_activity || 'Não informado'}
- Doenças crônicas: ${patientProfile.chronic_disease || 'Nenhuma'}
- Objetivo: ${patientProfile.goal || 'Não informado'}

IMPORTANTE: Forneça o laudo em formato CSV estruturado exatamente como o exemplo abaixo. Use aspas duplas para valores que contenham vírgulas e mantenha a estrutura rigorosa:

\`\`\`
AVALIAÇÃO CORPORAL
 - Distribuição de Gordura,"Descrição detalhada",
 "Valores específicos"
 
GASTO ENERGÉTICO
 - Taxa Metabólica Basal (TMB): "XXXX kcal/dia",  "Descrição detalhada"
 - Gasto Energético Total (GET): "XXXX kcal/dia" - "Descrição detalhada"
 
PLANEJAMENTO NUTRICIONAL
 - Manutenção com foco em definição: XXXX kcal/dia - "Descrição detalhada"
 - Emagrecimento saudável (cutting): "XXXX kcal/dia" - "Descrição detalhada"
 - Ganho de massa muscular (bulking): XXXX kcal/dia, "Descrição detalhada"
 
 Divisão de Macronutrientes para MANUTENÇÃO:
    Proteínas: XXXg
    Carboidratos: XXXg
    Gorduras: XXXg
    
 Divisão de Macronutrientes para EMAGRECIMENTO:
    Proteínas: "XXXg"
    Carboidratos: "XXXg" 
    Gorduras: "XXXg"

    
 Divisão de Macronutrientes para GANHO DE MASSA MUSCULAR:
   Proteínas: "XXXg" 
   Carboidratos: "XXXg" 
   Gorduras: "XXXg"

   
PROJEÇÃO DE RESULTADOS,
  EMAGRECIMENTO SAUDÁVEL: "Descrição das expectativas em 30 dias","Valor esperado"
  
  MANUTENÇÃO COM DEFINIÇÃO: "Descrição das expectativas em 30 dias","Valor esperado"
  
  GANHO DE MASSA MUSCULAR: "Descrição das expectativas em 30 dias","Valor esperado"
  
MÉTODOS UTILIZADOS,
  Composição Corporal:"Fórmula de Deurenberg para estimar percentual de gordura e massa magra"
  Gasto Energético:"Equação utilizada para TMB e GET"
  Planejamento Nutricional: "Metodologia para divisão de macronutrientes"
  
\`\`\`

Forneça um laudo técnico realista e profissional utilizando uma lingu

agem de fácil entendimento. Inclua valores numéricos específicos nas estimativas, mas não detalhe os cálculos. Use o formato CSV rigorosamente como mostrado no exemplo.`;
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
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { 
          role: 'system', 
          content: 'Você é um avaliador físico profissional especializado em análise de composição corporal. Forneça sempre valores numéricos específicos nas suas estimativas.' 
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
