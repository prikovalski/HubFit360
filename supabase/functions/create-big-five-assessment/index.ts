import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit, getRateLimitHeaders } from '../_shared/rateLimiter.ts';
import { createErrorResponse } from '../_shared/errorHandler.ts';
import { isValidAnalysis } from '../_shared/aiResponse.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
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

    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (userDataError || !userData) {
      throw new Error('User not found');
    }

    const requestData = await req.json();
    const {
      responses,
      assessment_type,
      patient_name,
      patient_gender,
      patient_age,
      patient_birth_date,
    } = requestData;

    if (!responses || !Array.isArray(responses) || responses.length !== 44) {
      throw new Error('Invalid responses');
    }

    // Calculate scores for each trait
    const traitQuestions: Record<string, number[]> = {
      extraversion: [0, 5, 10, 15, 20, 25, 30, 35],
      agreeableness: [1, 6, 11, 16, 21, 26, 31, 36, 41],
      conscientiousness: [2, 7, 12, 17, 22, 27, 32, 37, 42],
      neuroticism: [3, 8, 13, 18, 23, 28, 33, 38],
      openness: [4, 9, 14, 19, 24, 29, 34, 39, 40, 43]
    };

    const reversedItems = [0, 5, 8, 20, 23, 30, 33, 34, 1, 7, 11, 16, 26, 36, 2, 12, 17, 22, 42];

    const calculateTraitScore = (trait: string): number => {
      const questions = traitQuestions[trait];
      let score = 0;
      
      questions.forEach((qIndex) => {
        let value = responses[qIndex];
        if (reversedItems.includes(qIndex)) {
          value = 6 - value; // Reverse score (1->5, 2->4, 3->3, 4->2, 5->1)
        }
        score += value;
      });
      
      return score;
    };

    const scores = {
      openness: calculateTraitScore('openness'),
      conscientiousness: calculateTraitScore('conscientiousness'),
      extraversion: calculateTraitScore('extraversion'),
      agreeableness: calculateTraitScore('agreeableness'),
      neuroticism: calculateTraitScore('neuroticism'),
    };

    // Generate detailed AI analysis (only at creation time)
    let fullReport = '';

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (LOVABLE_API_KEY) {
      try {
        const prompt = `Como psicólogo especialista, analise este perfil de personalidade Big Five:

Abertura a Experiências: ${scores.openness}/50 (${((scores.openness / 50) * 100).toFixed(1)}%)
Conscienciosidade: ${scores.conscientiousness}/50 (${((scores.conscientiousness / 50) * 100).toFixed(1)}%)
Extroversão: ${scores.extraversion}/50 (${((scores.extraversion / 50) * 100).toFixed(1)}%)
Amabilidade: ${scores.agreeableness}/50 (${((scores.agreeableness / 50) * 100).toFixed(1)}%)
Neuroticismo: ${scores.neuroticism}/50 (${((scores.neuroticism / 50) * 100).toFixed(1)}%)

Forneça uma análise detalhada e profissional em português brasileiro, estruturada da seguinte forma:

# Perfil Geral de Personalidade

# Análise por Fator

## Abertura a Experiências
[Análise detalhada]

## Conscienciosidade
[Análise detalhada]

## Extroversão
[Análise detalhada]

## Amabilidade
[Análise detalhada]

## Neuroticismo
[Análise detalhada]

# Padrões e Insights

# Recomendações

Seja específico, empático e profissional.`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: 'Você é um psicólogo experiente especializado em análise de personalidade usando o modelo Big Five.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          fullReport = aiData.choices[0]?.message?.content || '';
        }
      } catch (aiError) {
        console.error('Error generating AI analysis:', aiError);
      }
    }

    const hasDetailedAnalysis = isValidAnalysis(fullReport);

    // Create assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('big_five_assessments')
      .insert({
        user_id: userData.id,
        assessment_type,
        patient_name: assessment_type === 'other' ? patient_name : null,
        patient_gender: assessment_type === 'other' ? patient_gender : null,
        patient_age: assessment_type === 'other' ? patient_age : null,
        patient_birth_date: assessment_type === 'other' ? patient_birth_date : null,
        responses,
        scores,
        classification: 'completed',
        full_report: hasDetailedAnalysis ? fullReport : '',
        has_detailed_analysis: hasDetailedAnalysis,
        status: 'completed',
      })
      .select()
      .single();

    if (assessmentError) {
      throw assessmentError;
    }

    return new Response(
      JSON.stringify({ success: true, assessment }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in create-big-five-assessment:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
