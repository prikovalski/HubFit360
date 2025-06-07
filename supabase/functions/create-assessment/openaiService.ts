
export async function callOpenAI(prompt: string): Promise<string> {
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
  return openAIData.choices[0].message.content;
}
