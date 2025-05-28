
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
      age, 
      height, 
      weight 
    } = await req.json();

    // Calcular estimativas baseadas em fórmulas padrão
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    
    // Estimativa simples de gordura corporal baseada em BMI, idade e sexo
    let estimatedBodyFat;
    if (sex === 'male') {
      estimatedBodyFat = (1.20 * bmi) + (0.23 * age) - 16.2;
    } else {
      estimatedBodyFat = (1.20 * bmi) + (0.23 * age) - 5.4;
    }
    
    // Garantir que a estimativa esteja em uma faixa realista
    estimatedBodyFat = Math.max(5, Math.min(50, estimatedBodyFat));
    
    const fatMass = (weight * estimatedBodyFat) / 100;
    const leanMass = weight - fatMass;
    
    const photoInfo = "Fotos frontais, laterais e posteriores analisadas";

    const prompt = `Você é um avaliador físico experiente. Com base nas seguintes informações:

- Sexo: ${sex}
- Idade: ${age} anos
- Altura: ${height} cm
- Peso: ${weight} kg
- Estimativa de gordura corporal: ${estimatedBodyFat.toFixed(1)}%
- Massa magra: ${leanMass.toFixed(1)} kg
- Massa gorda: ${fatMass.toFixed(1)} kg
- Fotos analisadas: ${photoInfo}

Escreva um laudo técnico realista, profissional e empático, como se você estivesse avaliando visualmente um paciente. Inclua observações sobre definição muscular, distribuição de gordura, proporções corporais, e uma breve recomendação.`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
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
      throw new Error('Erro na API do OpenAI');
    }

    const openAIData = await openAIResponse.json();
    const assessment = openAIData.choices[0].message.content;

    // Salvar no Supabase
    const supabaseUrl = "https://bqixlrinahtauahcnpoc.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxaXhscmluYWh0YXVhaGNucG9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NTAzMzYsImV4cCI6MjA2NDAyNjMzNn0.PA_HchPYznAUbSUrHtnoDZsVq337oRwvmEOvHPyTtFg";
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: assessmentData, error } = await supabase
      .from('assessments')
      .insert([{
        user_id: userId,
        front_photo: frontPhoto,
        side_photo: sidePhoto,
        back_photo: backPhoto,
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
      throw new Error('Erro ao salvar avaliação');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      assessment: assessmentData,
      bodyFat: estimatedBodyFat,
      leanMass,
      fatMass,
      bmi
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
