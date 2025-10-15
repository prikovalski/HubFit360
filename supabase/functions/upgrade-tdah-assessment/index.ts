import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { checkRateLimit, getRateLimitHeaders } from '../_shared/rateLimiter.ts';
import { createErrorResponse } from '../_shared/errorHandler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpgradeRequest {
  assessment_id: string;
}

async function generateAIAnalysis(
  score: number,
  classification: string,
  responses: any,
  patientData: any,
  assessmentMethod: string
): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY not configured');
  }

  // Check if it's DIVA 2.0 or ASRS-18
  const isDIVA = assessmentMethod === 'DIVA 2.0' || (typeof responses === 'object' && !Array.isArray(responses));
  
  let responsesText = '';
  let maxScore = 72;
  
  if (isDIVA) {
    // DIVA 2.0 format
    maxScore = 18;
    const scores = responses.scores || {};
    responsesText = `
Método de Avaliação: DIVA 2.0 (Diagnostic Interview for ADHD in Adults)

Pontuações por Critério:
- Desatenção (Infância): ${scores.inattentionChildhood || 0}/9 critérios
- Desatenção (Vida Adulta): ${scores.inattentionAdulthood || 0}/9 critérios
- Hiperatividade/Impulsividade (Infância): ${scores.hyperactivityChildhood || 0}/9 critérios
- Hiperatividade/Impulsividade (Vida Adulta): ${scores.hyperactivityAdulthood || 0}/9 critérios

Total de Critérios Atendidos (Vida Adulta): ${score}/18

O DIVA 2.0 avalia a presença de sintomas tanto na infância quanto na vida adulta, seguindo os critérios do DSM-5.
Um critério é considerado presente quando a frequência é "Frequentemente" ou "Muito Frequentemente".`;
  } else {
    // ASRS-18 format
    responsesText = `
Método de Avaliação: ASRS-18 (Adult ADHD Self-Report Scale)

Respostas do questionário (escala 0-4, onde 0=Nunca e 4=Muito Frequentemente):
${(responses as number[]).map((r, i) => `Questão ${i + 1}: ${r}`).join('\n')}`;
  }

  const prompt = `Você é um especialista em TDAH (Transtorno de Déficit de Atenção e Hiperatividade). Analise os seguintes resultados:

Pontuação total: ${score}/${maxScore}
Classificação: ${classification}
${patientData.patient_age ? `Idade do paciente: ${patientData.patient_age} anos` : ''}
${patientData.patient_gender ? `Gênero: ${patientData.patient_gender === 'MALE' ? 'Masculino' : patientData.patient_gender === 'FEMALE' ? 'Feminino' : 'Outro'}` : ''}

${responsesText}

Por favor, forneça uma análise detalhada e personalizada em português que inclua:

1. **Interpretação dos Sintomas**: Explique o que a pontuação indica sobre os sintomas de TDAH
2. **Padrões Observados**: Identifique padrões específicos nas respostas (desatenção vs hiperatividade/impulsividade)
3. **Impactos Potenciais**: Discuta como esses sintomas podem afetar a vida diária
4. **Próximos Passos Detalhados**: Recomendações específicas e práticas
5. **Estratégias de Manejo**: Técnicas e adaptações que podem ajudar no dia a dia
6. **Recursos e Apoio**: Sugestões de recursos, grupos de apoio e materiais educativos

Seja empático, informativo e clínico. Lembre que esta é uma triagem, não um diagnóstico definitivo. A análise deve ser abrangente e útil.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um especialista em TDAH e psicologia clínica. Forneça análises detalhadas, empáticas e clinicamente precisas.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return createErrorResponse(authError, 'UNAUTHORIZED', 401, corsHeaders);
    }

    // Rate limiting: 10 upgrades per minute per user
    if (!checkRateLimit(user.id, { maxRequests: 10, windowMs: 60000 })) {
      return createErrorResponse(
        new Error('Rate limit exceeded'),
        'RATE_LIMIT_EXCEEDED',
        429,
        { ...corsHeaders, ...getRateLimitHeaders(user.id) }
      );
    }

    // Get user_id from users table
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = userData.id;

    // Parse request body
    const { assessment_id }: UpgradeRequest = await req.json();

    // Validate UUID format
    if (!assessment_id || typeof assessment_id !== 'string') {
      return new Response(JSON.stringify({ error: 'Assessment ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(assessment_id)) {
      return new Response(JSON.stringify({ error: 'Invalid UUID format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the assessment
    const { data: assessment, error: assessmentError } = await supabaseClient
      .from('tdah_assessments')
      .select('*')
      .eq('id', assessment_id)
      .eq('user_id', userId)
      .single();

    if (assessmentError || !assessment) {
      return new Response(JSON.stringify({ error: 'Assessment not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if already premium
    if (assessment.is_premium) {
      return new Response(JSON.stringify({ error: 'Assessment is already premium' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check user credits
    const { data: creditsData, error: creditsError } = await supabaseClient
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (creditsError || !creditsData || creditsData.balance < 1) {
      return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate AI analysis
    console.log('Generating AI analysis for assessment:', assessment_id);
    const fullReport = await generateAIAnalysis(
      assessment.score,
      assessment.classification,
      assessment.responses,
      {
        patient_age: assessment.patient_age,
        patient_gender: assessment.patient_gender,
      },
      assessment.assessment_method || 'ASRS-18'
    );

    // Update assessment to premium with AI analysis
    const { error: updateError } = await supabaseClient
      .from('tdah_assessments')
      .update({
        is_premium: true,
        full_report: fullReport,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assessment_id);

    if (updateError) {
      console.error('Error updating assessment:', updateError);
      throw updateError;
    }

    // Consume 1 credit
    const { error: creditError } = await supabaseClient
      .from('user_credits')
      .update({ balance: creditsData.balance - 1 })
      .eq('user_id', userId);

    if (creditError) {
      console.error('Error consuming credit:', creditError);
      throw creditError;
    }

    // Record transaction
    await supabaseClient.from('credit_transactions').insert({
      user_id: userId,
      type: 'debit',
      amount: -1,
      source: 'upgrade',
      reference_id: assessment_id,
      description: 'Upgrade de avaliação TDAH para premium',
      assessment_id: assessment_id,
      assessment_type: 'tdah',
    });

    console.log('Assessment upgraded successfully:', assessment_id);

    return new Response(
      JSON.stringify({
        success: true,
        full_report: fullReport,
        new_balance: creditsData.balance - 1,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in upgrade-tdah-assessment:', error);
    return createErrorResponse(error, 'DEFAULT', 500, corsHeaders);
  }
});
