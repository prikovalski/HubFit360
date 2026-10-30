
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { checkRateLimit, getRateLimitHeaders } from '../_shared/rateLimiter.ts';
import { createErrorResponse } from '../_shared/errorHandler.ts';
import { isValidAnalysis } from '../_shared/aiResponse.ts';

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
  const neckCirc = assessment.neck_circumference || assessment.patient_neck_circumference || null;
  const waistCirc = assessment.waist_circumference || assessment.patient_waist_circumference || null;
  const hipCirc = assessment.hip_circumference || assessment.patient_hip_circumference || null;


  // Get patient profile data for additional context
  const patientProfile = userData.patient_profiles?.[0] || {};

  // Função para formatar circunferências
  const formatCircumference = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined || value === '') {
      return 'Não informado';
    }
    return `${value} cm`;
  };

  const formattedNeck = formatCircumference(neckCirc);
  const formattedWaist = formatCircumference(waistCirc);
  const formattedHip = formatCircumference(hipCirc);

  // Formatação das atividades físicas
  const formatPhysicalActivities = (activities: any): string => {
    if (!activities || (Array.isArray(activities) && activities.length === 0)) {
      return 'Nenhuma atividade informada';
    }
    
    if (Array.isArray(activities)) {
      const formattedActivities = activities.map((activity: any) => {
        if (typeof activity === 'string') {
          return activity;
        }
        if (activity && activity.name) {
          const frequency = activity.frequency ? ` (${activity.frequency})` : '';
          return `${activity.name}${frequency}`;
        }
        if (activity && activity.type) {
          const frequency = activity.frequency ? ` (${activity.frequency})` : '';
          return `${activity.type}${frequency}`;
        }
        return JSON.stringify(activity);
      });
      
      return formattedActivities.join(', ');
    }
    
    if (typeof activities === 'string') {
      return activities;
    }
    
    return JSON.stringify(activities);
  };

  // Get data for the prompt
  const physicalActivities = formatPhysicalActivities(
    assessment.patient_physical_activities || patientProfile.physical_activities || []
  );
  const goal = assessment.patient_goal || patientProfile.goal || 'Não informado';

  return `Você é um avaliador físico profissional especializado em análise de composição corporal.

Analise os dados e as fotos fornecidas, gere um laudo completo incluindo:

1. AVALIAÇÃO CORPORAL
- Com base nas fotos faça uma análise da distribuição de gordura corporal
- Com base nas fotos faça uma análise da distribuição muscular
- Use como referência os valores já calculados: ${bodyFatPercentage.toFixed(1)}% de gordura corporal

2. GASTO ENERGÉTICO
- Estimativa do Gasto Energético Total (GET). IMPORTANTE: NÃO DETALHE O CALCULO REALIZADO APENAS INFORME O RESULTADO.

3. PLANEJAMENTO NUTRICIONAL
Considerando as atividades fisicas informadas abaixo, forneça recomendações de calorias diarias para:
- Manutenção com foco em definição
- Emagrecimento saudável (cutting)
- Ganho de massa muscular (bulking)

Divisão de macronutrientes em cada refeição para cada cenário (proteínas, carboidratos, gorduras). Deixe claro que a divisão apresentada é POR REFEIÇÃO.

4. PROJEÇÃO DE RESULTADOS
Explique o que pode acontecer seguindo as recomendações por 30 dias

5. RESUMO
Faça uma avaliação detalhada das fotos, cruze com os valores calculados e apresente um resumo enfatizando os RISCOS e/ou o que já está bom. Apresente também um rápido resumo da avaliação.  

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
  * Pescoço: ${formattedNeck}
  * Cintura: ${formattedWaist}
  * Quadril: ${formattedHip}
- Atividades físicas praticadas: ${physicalActivities}
- Frequência de atividade física: ${patientProfile.physical_activity || 'Não informado'}
- Objetivo: ${goal}

IMPORTANTE: Forneça o laudo em formato CSV estruturado exatamente como o exemplo abaixo. O laudo deve ser realista e profissional, utilize uma linguagem de facil entendimento para que um adolescente seja capaz de entender. Inclua valores numéricos específicos nas estimativas, mas não detalhe os cálculos. 
Use aspas duplas para valores que contenham vírgulas e mantenha a estrutura rigorosa:

\`\`\`
AVALIAÇÃO CORPORAL
 - Distribuição de Gordura,"Descrição detalhada",
 "Valores específicos"
 
GASTO ENERGÉTICO
 - Gasto Energético Total (GET): "XXXX kcal/dia"
 
PLANEJAMENTO NUTRICIONAL
 - Manutenção com foco em definição: XXXX kcal/dia - "Descrição detalhada"
 - Emagrecimento saudável (cutting): "XXXX kcal/dia" - "Descrição detalhada"
 - Ganho de massa muscular (bulking): XXXX kcal/dia, "Descrição detalhada"
 
 Divisão de Macronutrientes por refeição para MANUTENÇÃO:
    Proteínas: XXXg
    Carboidratos: XXXg
    Gorduras: XXXg
    
 Divisão de Macronutrientes por refeição para EMAGRECIMENTO:
    Proteínas: "XXXg"
    Carboidratos: "XXXg" 
    Gorduras: "XXXg"

    
 Divisão de Macronutrientes por refeição para GANHO DE MASSA MUSCULAR:
   Proteínas: "XXXg" 
   Carboidratos: "XXXg" 
   Gorduras: "XXXg"

   
PROJEÇÃO DE RESULTADOS
  EMAGRECIMENTO SAUDÁVEL: "Descrição das expectativas em 30 dias", "Valor esperado"
  
  MANUTENÇÃO COM DEFINIÇÃO: "Descrição das expectativas em 30 dias", "Valor esperado"
  
  GANHO DE MASSA MUSCULAR: "Descrição das expectativas em 30 dias", "Valor esperado"

RESUMO
"Descrição detalhada"
  
MÉTODOS UTILIZADOS
  Composição Corporal:"Fórmula de Deurenberg para estimar percentual de gordura e massa magra"
  Gasto Energético:"Equação utilizada para TMB e GET"
  Planejamento Nutricional: "Metodologia para divisão de macronutrientes"
  
\`\`\`

Forneça um laudo técnico realista e profissional utilizando uma linguagem informal de fácil entendimento. Inclua valores numéricos específicos nas estimativas e não detalhe os cálculos. Use o formato CSV rigorosamente como mostrado no exemplo.`;
}

async function callOpenAI(prompt: string): Promise<string> {
  console.log('Enviando prompt para OpenAI, tamanho:', prompt.length);

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
    console.error('Erro na API do OpenAI, status:', openAIResponse.status);
    throw new Error('Erro na API do OpenAI');
  }

  const openAIData = await openAIResponse.json();
  const responseContent = openAIData.choices[0].message.content;
  
  console.log('Resposta do OpenAI recebida, tamanho:', responseContent?.length ?? 0);
  
  return responseContent;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessment_id } = await req.json();

    // Validate UUID format
    if (!assessment_id || typeof assessment_id !== 'string') {
      return new Response(JSON.stringify({ error: 'ID da avaliação é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(assessment_id)) {
      return new Response(JSON.stringify({ error: 'Formato de ID inválido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
      return createErrorResponse(authError, 'UNAUTHORIZED', 401, corsHeaders);
    }

    // Rate limiting: 10 requests per minute per user
    if (!checkRateLimit(user.id, { maxRequests: 10, windowMs: 60000 })) {
      return createErrorResponse(
        new Error('Rate limit exceeded'),
        'RATE_LIMIT_EXCEEDED',
        429,
        { ...corsHeaders, ...getRateLimitHeaders(user.id) }
      );
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
      return createErrorResponse(assessmentError, 'NOT_FOUND', 404, corsHeaders);
    }

    if (assessment.tier === 'detailed') {
      return new Response(JSON.stringify({ success: true, already_generated: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Buscar dados do usuário para gerar análise
    const { data: userData } = await supabase
      .from('users')
      .select('*, patient_profiles(*)')
      .eq('id', dbUser.id)
      .single();

    console.log('Gerando análise detalhada:', {
      assessment_id: assessment.id,
      assessment_type: assessment.assessment_type,
      has_circumferences: {
        neck: !!(assessment.neck_circumference || assessment.patient_neck_circumference),
        waist: !!(assessment.waist_circumference || assessment.patient_waist_circumference),
        hip: !!(assessment.hip_circumference || assessment.patient_hip_circumference)
      }
    });

    // Use data from the assessment itself (already saved during creation)
    const height = assessment.patient_height || userData.patient_profiles?.[0]?.height;
    const weight = assessment.patient_weight || userData.patient_profiles?.[0]?.weight;

    if (!height || !weight) {
      throw new Error('Dados de altura e peso não encontrados para gerar a análise');
    }

    const gender = assessment.assessment_type === 'patient' ? 
                  (assessment.patient_gender || 'masculino') : 
                  (userData.gender || 'masculino');

    // Gerar análise detalhada
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

    if (!isValidAnalysis(assessmentText)) {
      console.error('Resposta da IA inválida para assessment:', assessment_id);
      return createErrorResponse(new Error('Invalid AI response'), 'DEFAULT', 502, corsHeaders);
    }

    // Atualizar avaliação com a análise detalhada
    const { error: updateError } = await supabase
      .from('assessments')
      .update({
        assessment_text: assessmentText,
        tier: 'detailed',
        prompt_text: prompt
      })
      .eq('id', assessment_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, already_generated: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro ao gerar análise detalhada:', error);
    return createErrorResponse(error, 'DEFAULT', 500, corsHeaders);
  }
});
