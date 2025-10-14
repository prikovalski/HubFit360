import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { checkRateLimit, getRateLimitHeaders } from '../_shared/rateLimiter.ts';
import { createErrorResponse } from '../_shared/errorHandler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TDAHAssessmentRequest {
  responses: number[];
  assessment_type?: 'self' | 'other';
  patient_name?: string;
  patient_gender?: string;
  patient_age?: number;
  patient_birth_date?: string;
}

function calculateScore(responses: number[]): number {
  return responses.reduce((sum, r) => sum + r, 0);
}

function getClassification(score: number): string {
  if (score < 17) return 'Improvável';
  if (score < 24) return 'Possível';
  if (score < 36) return 'Provável';
  return 'Altamente Provável';
}

function generateRecommendations(score: number, classification: string): string {
  if (score < 17) {
    return `Com base na sua pontuação de ${score} pontos, os sintomas de TDAH são improváveis. No entanto, se você continua tendo dificuldades em sua vida diária, considere consultar um profissional de saúde mental para uma avaliação mais completa.`;
  } else if (score < 24) {
    return `Sua pontuação de ${score} pontos sugere que alguns sintomas de TDAH podem estar presentes. Recomendamos:\n\n1. Agendar uma consulta com um psiquiatra ou psicólogo especializado em TDAH para uma avaliação diagnóstica completa\n2. Manter um diário de sintomas para discussão com o profissional\n3. Implementar estratégias de organização e gerenciamento de tempo\n4. Considerar técnicas de mindfulness e exercícios regulares`;
  } else if (score < 36) {
    return `Sua pontuação de ${score} pontos indica uma probabilidade considerável de TDAH. Recomendamos fortemente:\n\n1. Consultar um psiquiatra especializado em TDAH o mais breve possível\n2. Trazer este relatório para a consulta\n3. Preparar exemplos específicos de como os sintomas afetam sua vida diária\n4. Considerar avaliação neuropsicológica completa\n5. Discutir opções de tratamento, incluindo terapia cognitivo-comportamental e, se apropriado, medicação`;
  } else {
    return `Sua pontuação de ${score} pontos sugere uma alta probabilidade de TDAH. É muito importante:\n\n1. URGENTE: Agendar consulta com psiquiatra especializado em TDAH\n2. Levar este relatório e exemplos detalhados de sintomas\n3. Solicitar avaliação neuropsicológica completa\n4. Discutir plano de tratamento abrangente (terapia + possível medicação)\n5. Considerar impactos no trabalho/estudos e possíveis adaptações necessárias\n6. Envolver família/parceiro no processo de tratamento, se apropriado`;
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
      console.error('Auth error:', authError);
      return createErrorResponse(authError, 'UNAUTHORIZED', 401, corsHeaders);
    }

    // Rate limiting: 10 assessments per minute per user
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
      console.error('User not found:', userError);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = userData.id;

    // Check user credits
    const { data: creditsData, error: creditsError } = await supabaseClient
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (creditsError || !creditsData || creditsData.balance < 1) {
      console.error('Insufficient credits:', creditsError);
      return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const {
      responses,
      assessment_type = 'self',
      patient_name,
      patient_gender,
      patient_age,
      patient_birth_date,
    }: TDAHAssessmentRequest = await req.json();

    // Validate responses array
    if (!responses || responses.length !== 18) {
      return new Response(
        JSON.stringify({ error: 'Invalid responses. Expected 18 answers.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate each response is in range 0-4
    const invalidResponses = responses.filter(r => typeof r !== 'number' || r < 0 || r > 4);
    if (invalidResponses.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid response values. Each answer must be between 0 and 4.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate optional fields
    if (patient_name && patient_name.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Patient name too long (max 100 characters)' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (patient_age && (patient_age < 13 || patient_age > 120)) {
      return new Response(
        JSON.stringify({ error: 'Invalid patient age (must be between 13 and 120)' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Calculate results
    const totalScore = calculateScore(responses);
    const classification = getClassification(totalScore);
    const recommendations = generateRecommendations(totalScore, classification);

    // Insert assessment into database
    const { data: assessment, error: insertError } = await supabaseClient
      .from('tdah_assessments')
      .insert({
        user_id: userId,
        patient_name: patient_name || null,
        patient_gender: patient_gender || null,
        patient_age: patient_age || null,
        patient_birth_date: patient_birth_date || null,
        assessment_type: assessment_type,
        responses,
        score: totalScore,
        classification,
        recommendations,
        full_report: '',
        is_premium: false,
        status: 'completed',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting assessment:', insertError);
      throw insertError;
    }

    console.log('Assessment created:', assessment.id);

    // Consume 1 credit
    const { error: creditError } = await supabaseClient
      .from('user_credits')
      .update({ balance: creditsData.balance - 1 })
      .eq('user_id', userId);

    if (creditError) {
      console.error('Error consuming credit:', creditError);
    }

    // Record transaction
    await supabaseClient.from('credit_transactions').insert({
      user_id: userId,
      type: 'debit',
      amount: -1,
      source: 'assessment',
      reference_id: assessment.id,
      description: 'Criação de avaliação TDAH',
      assessment_id: assessment.id,
      assessment_type: 'tdah',
    });

    console.log('TDAH assessment completed successfully');

    return new Response(JSON.stringify(assessment), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in create-tdah-assessment:', error);
    return createErrorResponse(error, 'DEFAULT', 500, corsHeaders);
  }
});
