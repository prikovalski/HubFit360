
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

    // Criar cliente Supabase para buscar dados do usuário
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar a data de nascimento do usuário para calcular a idade
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        birth_date,
        patient_profiles.neck_circumference,
        patient_profiles.waist_circumference,
        patient_profiles.hip_circumference,
        patient_profiles.physical_activity,
        patient_profiles.chronic_disease,
        patient_profiles.goal
      `)
      .eq('id', userId)
      .join('patient_profiles', 'users.id', 'patient_profiles.user_id')
      .single();

    if (userError) {
      console.error('Erro ao buscar dados do usuário:', userError);
      throw new Error(`Erro ao buscar dados do usuário: ${userError.message}`);
    }

    // Calcular a idade com base na data de nascimento
    let calculatedAge = 25; // Idade padrão caso não tenha data de nascimento
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

    // Calcular estimativas baseadas em fórmulas padrão
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    
    // Mapear o gênero corretamente
    const genderForPrompt = sex === 'male' ? 'Masculino' : 'Feminino';
    
    const photoInfo = "Fotos frontais, laterais e posteriores analisadas";

    const prompt = `Você é um avaliador físico profissional especializado em análise de composição corporal. ${genderForPrompt}. 
    Quero que analise minhas fotos e dados pessoais atualizados e gere um laudo técnico e empático, incluindo:
1. Avaliação corporal
Estimativa do percentual de gordura corporal com base nas fotos e circunferências
Massa magra e massa gorda estimadas

2. Gasto energético
Cálculo da TMB (Katch-McArdle, se possível)
Estimativa do GET com base no meu nível de atividade física e estilo de vida

3. Planejamento nutricional completo
Quantas kcal devo ingerir para:

Manutenção com foco em definição ou performance
Emagrecimento com preservação de massa magra (cutting leve)
Ganho de massa muscular com mínimo de gordura (bulking leve)

Divisão ideal de macronutrientes (proteínas, carboidratos e gorduras) para cada cenário

🧠 4. Simulação
Explique o que deve acontecer com meu corpo se eu seguir a dieta sugerida por 30 dias, considerando meus dados.

Dados Pessoais
- Gênero: ${genderForPrompt}
- Idade: ${calculatedAge} anos
- Altura: ${height} cm
- Peso: ${weight} kg
- Circunferencias: pescoço: ${userData.neck_circumference}, cintura: ${userData.waist_circumference}, quadril: ${userData.hip_circumference}
- Atividade física: ${userData.physical_activity}
- Doenças crônicas: ${userData.chronic_disease}
- Objetivo: ${userData.goal}
- Fotos analisadas: ${photoInfo}

Escreva um laudo técnico realista, profissional e empático, como se você estivesse avaliando visualmente um paciente. Inclua observações sobre definição muscular, distribuição de gordura, proporções corporais, e uma breve recomendação.`;

    console.log('Chamando OpenAI APIs...');
    console.log('Passou!!');

    console.log('Prompt enviado ao GPT-4:', prompt);
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY') || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um avaliador físico profissional especializado em análise de composição corporal.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openAIResponse.ok) {
      console.error('Erro na API do OpenAI:', await openAIResponse.text());
      throw new Error('Erro na API do OpenAI');
    }

    const openAIData = await openAIResponse.json();
    const assessment = openAIData.choices[0].message.content;

    // Supondo que 'assessment' é o texto retornado pela API (openAIData.choices[0].message.content)
const bodyFatMatch = assessment.match(/Estimativa de Gordura Corporal:\s*([\d.,]+)/i);
const estimatedBodyFat = bodyFatMatch ? parseFloat(bodyFatMatch[1].replace(',', '.')) : null;

const leanMassMatch = assessment.match(/Massa magra estimada:\s*([\d.,]+)/i);
const leanMass = leanMassMatch ? parseFloat(leanMassMatch[1].replace(',', '.')) : null;

const fatMassMatch = assessment.match(/Massa gorda estimada:\s*([\d.,]+)/i);
const fatMass = fatMassMatch ? parseFloat(fatMassMatch[1].replace(',', '.')) : null;
    console.log('Avaliação gerada pelo OpenAI');

    console.log('Salvando avaliação no banco de dados...');

    const { data: assessmentData, error } = await supabase
      .from('assessments')
      .insert([{
        user_id: userId,
        front_photo: frontPhoto,
        side_photo: sidePhoto,
        back_photo: backPhoto,
        age: calculatedAge, // Salvando a idade calculada
        body_fat_percentage: estimatedBodyFat,
        lean_mass: leanMass,
        fat_mass: fatMass,
        bmi: bmi,
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
      bmi,
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
