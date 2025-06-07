
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://deno.land/x/supabase@2.34.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      userId, 
      frontPhoto, 
      sidePhoto, 
      backPhoto, 
      sex, 
      height, 
      weight 
    } = await req.json();

    console.log('Recebendo dados para avaliação:', { userId, sex, height, weight });

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar dados do usuário e perfil do paciente em uma única query
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

    // Calcular a idade
    let calculatedAge = 25;
    if (userData?.birth_date) {
      const birthDate = new Date(userData.birth_date);
      const today = new Date();
      calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
    }

    console.log('Idade calculada:', calculatedAge);

    // Calcular IMC
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    
    // Mapear o gênero
    const genderForPrompt = sex === 'male' ? 'Masculino' : 'Feminino';
    
    // Extrair dados do perfil do paciente
    const patientProfile = userData.patient_profiles?.[0] || {};
    
    // Construir o prompt
    const prompt = `Você é um avaliador físico profissional especializado em análise de composição corporal.

Analise os dados fornecidos e gere um laudo técnico completo incluindo:

1. AVALIAÇÃO CORPORAL
- Estimativa do percentual de gordura corporal baseada nos dados antropométricos
- Massa magra e massa gorda estimadas
- Análise da distribuição de gordura corporal

2. GASTO ENERGÉTICO
- Cálculo da Taxa Metabólica Basal (TMB)
- Estimativa do Gasto Energético Total (GET)

3. PLANEJAMENTO NUTRICIONAL
Forneça recomendações de calorias para:
- Manutenção com foco em definição
- Emagrecimento saudável (cutting)
- Ganho de massa muscular (bulking)

Divisão de macronutrientes para cada cenário (proteínas, carboidratos, gorduras)

4. PROJEÇÃO DE RESULTADOS
Explique o que pode acontecer seguindo as recomendações por 30 dias

DADOS PESSOAIS:
- Gênero: ${genderForPrompt}
- Idade: ${calculatedAge} anos
- Altura: ${height} cm
- Peso: ${weight} kg
- IMC: ${bmi.toFixed(1)}
- Circunferências: 
  * Pescoço: ${patientProfile.neck_circumference || 'N/A'} cm
  * Cintura: ${patientProfile.waist_circumference || 'N/A'} cm
  * Quadril: ${patientProfile.hip_circumference || 'N/A'} cm
- Atividade física: ${patientProfile.physical_activity || 'Não informado'}
- Doenças crônicas: ${patientProfile.chronic_disease || 'Nenhuma'}
- Objetivo: ${patientProfile.goal || 'Não informado'}

Forneça um laudo técnico, realista e profissional. Inclua valores numéricos específicos nas estimativas.`;

    console.log('Enviando prompt para OpenAI...');

    // Chamar API do OpenAI
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
    const assessment = openAIData.choices[0].message.content;

    // Extrair dados numéricos do texto da avaliação
    const extractNumericValue = (text: string, pattern: RegExp): number | null => {
      const match = text.match(pattern);
      return match ? parseFloat(match[1].replace(',', '.')) : null;
    };

    const estimatedBodyFat = extractNumericValue(assessment, /(?:gordura corporal|body fat).*?(\d+(?:[.,]\d+)?)\s*%/i);
    const leanMass = extractNumericValue(assessment, /massa magra.*?(\d+(?:[.,]\d+)?)\s*kg/i);
    const fatMass = extractNumericValue(assessment, /massa gorda.*?(\d+(?:[.,]\d+)?)\s*kg/i);

    console.log('Valores extraídos:', { estimatedBodyFat, leanMass, fatMass });

    // Salvar avaliação no banco
    const { data: assessmentData, error } = await supabase
      .from('assessments')
      .insert([{
        user_id: userId,
        front_photo: frontPhoto,
        side_photo: sidePhoto,
        back_photo: backPhoto,
        age: calculatedAge,
        body_fat_percentage: estimatedBodyFat,
        lean_mass: leanMass,
        fat_mass: fatMass,
        bmi: parseFloat(bmi.toFixed(2)),
        assessment_text: assessment,
        status: 'completed'
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar avaliação:', error);
      throw new Error(`Erro ao salvar avaliação: ${error.message}`);
    }

    console.log('Avaliação salva com sucesso:', assessmentData.id);

    return new Response(JSON.stringify({ 
      success: true, 
      assessment: assessmentData,
      bodyFat: estimatedBodyFat,
      leanMass,
      fatMass,
      bmi: parseFloat(bmi.toFixed(2)),
      age: calculatedAge
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
