import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TDAHAssessmentRequest {
  userId: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  patientBirthDate?: string;
  assessmentType: 'adult' | 'child';
  responses: Array<{
    question: string;
    category: string;
    answer: number;
  }>;
}

function calculateScore(responses: Array<{ answer: number; category: string }>) {
  const totalScore = responses.reduce((sum, r) => sum + r.answer, 0);
  const maxScore = responses.length * 4;
  
  const categoriesScores = {
    inattention: 0,
    hyperactivity: 0,
    impulsivity: 0
  };
  
  responses.forEach(r => {
    if (r.category === 'inattention') categoriesScores.inattention += r.answer;
    if (r.category === 'hyperactivity') categoriesScores.hyperactivity += r.answer;
    if (r.category === 'impulsivity') categoriesScores.impulsivity += r.answer;
  });
  
  return { totalScore, maxScore, categoriesScores };
}

function getClassification(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  
  if (percentage < 25) return 'Sem sinais significativos';
  if (percentage < 50) return 'Sinais leves';
  if (percentage < 75) return 'Sinais moderados';
  return 'Sinais fortes';
}

function generateRecommendations(classification: string, assessmentType: string): string {
  const baseRecommendations = {
    'Sem sinais significativos': 'Os resultados não indicam sinais significativos de TDAH. Continue mantendo hábitos saudáveis e rotinas organizadas.',
    'Sinais leves': 'Foram identificados alguns sinais leves. Considere implementar estratégias de organização e planejamento no dia a dia.',
    'Sinais moderados': 'Os resultados indicam sinais moderados. Recomenda-se buscar avaliação profissional com psicólogo ou psiquiatra especializado em TDAH.',
    'Sinais fortes': 'Os resultados indicam sinais significativos. É altamente recomendado buscar avaliação completa com profissional especializado em TDAH para diagnóstico adequado.'
  };
  
  return baseRecommendations[classification] || baseRecommendations['Sem sinais significativos'];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Autorização necessária');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Erro de autenticação:', authError);
      throw new Error('Usuário não autenticado');
    }

    console.log('Usuário autenticado:', user.id);

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      console.error('Erro ao buscar usuário:', userError);
      throw new Error('Usuário não encontrado');
    }

    const requestData: TDAHAssessmentRequest = await req.json();
    console.log('Dados da requisição:', { ...requestData, responses: requestData.responses.length });

    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userData.id)
      .single();

    if (creditsError || !credits || credits.balance < 1) {
      console.error('Créditos insuficientes:', creditsError);
      throw new Error('Créditos insuficientes');
    }

    const { totalScore, maxScore, categoriesScores } = calculateScore(requestData.responses);
    const classification = getClassification(totalScore, maxScore);
    const recommendations = generateRecommendations(classification, requestData.assessmentType);

    console.log('Calculando avaliação:', { totalScore, maxScore, classification });

    const { data: assessment, error: assessmentError } = await supabase
      .from('tdah_assessments')
      .insert({
        user_id: userData.id,
        patient_name: requestData.patientName,
        patient_age: requestData.patientAge,
        patient_gender: requestData.patientGender,
        patient_birth_date: requestData.patientBirthDate,
        assessment_type: requestData.assessmentType,
        responses: requestData.responses,
        score: totalScore,
        classification: classification,
        recommendations: recommendations,
        full_report: JSON.stringify({
          totalScore,
          maxScore,
          percentage: (totalScore / maxScore) * 100,
          categoriesScores,
          classification,
          recommendations
        }),
        is_premium: false,
        status: 'completed'
      })
      .select()
      .single();

    if (assessmentError) {
      console.error('Erro ao criar avaliação:', assessmentError);
      throw new Error('Erro ao criar avaliação');
    }

    console.log('Avaliação criada:', assessment.id);

    const { error: consumeError } = await supabase.rpc('consume_credit', {
      p_user_id: userData.id,
      p_assessment_id: assessment.id,
      p_assessment_type: 'tdah'
    });

    if (consumeError) {
      console.error('Erro ao consumir crédito:', consumeError);
    }

    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userData.id,
        type: 'debit',
        amount: -1,
        source: 'assessment',
        reference_id: assessment.id,
        description: `Avaliação TDAH - ${requestData.assessmentType === 'adult' ? 'Adulto' : 'Criança'}`,
        assessment_type: 'tdah'
      });

    if (transactionError) {
      console.error('Erro ao registrar transação:', transactionError);
    }

    console.log('Avaliação TDAH concluída com sucesso');

    return new Response(
      JSON.stringify({
        success: true,
        assessment: assessment,
        score: totalScore,
        classification: classification
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Erro na função:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro ao processar avaliação TDAH'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});