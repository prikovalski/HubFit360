
import type { UserData, PatientProfile, PatientData } from './types.ts';

export function buildAssessmentPrompt(
  userData: UserData,
  calculatedAge: number,
  height: number,
  weight: number,
  sex: string,
  bodyFatPercentage: number,
  leanMass: number,
  fatMass: number,
  assessmentType: 'self' | 'patient' = 'self',
  patientData?: PatientData
): string {
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  const genderForPrompt = sex === 'male' ? 'Masculino' : 'Feminino';
  
  console.log('=== INÍCIO DA CONSTRUÇÃO DO PROMPT ===');
  console.log('Tipo de avaliação:', assessmentType);
  console.log('Dados do usuário recebidos:', JSON.stringify({
    hasPatientProfiles: !!(userData.patient_profiles && userData.patient_profiles.length > 0),
    patientProfilesLength: userData.patient_profiles?.length || 0,
    firstProfile: userData.patient_profiles?.[0] || null
  }, null, 2));
  
  // Definir qual fonte de dados usar baseado no tipo de avaliação
  let profileData: any = {};
  
  if (assessmentType === 'patient' && patientData) {
    // Para avaliação de paciente, usar EXCLUSIVAMENTE os dados do paciente
    console.log('=== USANDO DADOS DO PACIENTE ===');
    console.log('Dados do paciente:', JSON.stringify(patientData, null, 2));
    
    profileData = {
      neck_circumference: patientData.neckCircumference ? parseFloat(patientData.neckCircumference) : null,
      waist_circumference: patientData.waistCircumference ? parseFloat(patientData.waistCircumference) : null,
      hip_circumference: patientData.hipCircumference ? parseFloat(patientData.hipCircumference) : null,
      physical_activity: patientData.physicalActivity || null,
      physical_activities: patientData.physicalActivities || [],
      chronic_disease: patientData.chronicDisease || null,
      goal: patientData.goal || null
    };
  } else {
    // Para autoavaliação, usar dados do perfil do usuário
    console.log('=== USANDO DADOS DO PERFIL DO USUÁRIO ===');
    const userProfile = userData.patient_profiles?.[0] || {};
    console.log('Perfil do usuário encontrado:', JSON.stringify(userProfile, null, 2));
    
    profileData = {
      neck_circumference: userProfile.neck_circumference || null,
      waist_circumference: userProfile.waist_circumference || null,
      hip_circumference: userProfile.hip_circumference || null,
      physical_activity: userProfile.physical_activity || null,
      physical_activities: userProfile.physical_activities || [],
      chronic_disease: userProfile.chronic_disease || null,
      goal: userProfile.goal || null
    };
  }

  console.log('=== DADOS DO PERFIL SELECIONADO ===');
  console.log('Profile data final:', JSON.stringify(profileData, null, 2));

  // Função para formatar circunferências com valores seguros
  const formatCircumference = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined || value === '') {
      return 'Não informado';
    }
    return `${value} cm`;
  };

  // Get circumferences from the selected data source
  const neckCirc = formatCircumference(profileData.neck_circumference);
  const waistCirc = formatCircumference(profileData.waist_circumference);
  const hipCirc = formatCircumference(profileData.hip_circumference);

  // Formatar atividades físicas com logs detalhados
  const formatPhysicalActivities = (activities: any): string => {
    console.log('=== FORMATANDO ATIVIDADES FÍSICAS ===');
    console.log('Atividades recebidas:', JSON.stringify(activities, null, 2));
    console.log('Tipo das atividades:', typeof activities);
    console.log('É array?', Array.isArray(activities));
    
    if (!activities || (Array.isArray(activities) && activities.length === 0)) {
      console.log('Nenhuma atividade encontrada');
      return 'Nenhuma atividade informada';
    }
    
    if (Array.isArray(activities)) {
      console.log('Processando array de atividades, tamanho:', activities.length);
      const formattedActivities = activities.map((activity: any, index: number) => {
        console.log(`Atividade ${index}:`, JSON.stringify(activity, null, 2));
        
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
      
      console.log('Atividades formatadas:', formattedActivities);
      return formattedActivities.join(', ');
    }
    
    if (typeof activities === 'string') {
      console.log('Atividade é string:', activities);
      return activities;
    }
    
    console.log('Atividade em formato desconhecido, convertendo para JSON');
    return JSON.stringify(activities);
  };

  // Get data from the selected source
  const physicalActivities = formatPhysicalActivities(profileData.physical_activities);
  const physicalActivity = profileData.physical_activity || 'Não informado';
  const chronicDisease = profileData.chronic_disease || 'Nenhuma';
  const goal = profileData.goal || 'Não informado';

  console.log('=== DADOS FORMATADOS FINAIS ===');
  console.log('Dados formatados para o prompt:', {
    circumferencias: { pescoço: neckCirc, cintura: waistCirc, quadril: hipCirc },
    atividadesFisicas: physicalActivities,
    frequenciaAtividade: physicalActivity,
    doencaCronica: chronicDisease,
    objetivo: goal,
    tipoAvaliacao: assessmentType
  });

  console.log('Valores calculados pela fórmula de Deurenberg:', {
    bodyFatPercentage: bodyFatPercentage.toFixed(2) + '%',
    leanMass: leanMass.toFixed(2) + 'kg',
    fatMass: fatMass.toFixed(2) + 'kg'
  });

  const prompt = `Você é um avaliador físico profissional especializado em análise de composição corporal.

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
  * Pescoço: ${neckCirc}
  * Cintura: ${waistCirc}
  * Quadril: ${hipCirc}
- Atividades físicas praticadas: ${physicalActivities}
- Frequência de atividade física: ${physicalActivity}
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

  console.log('=== PROMPT CONSTRUÍDO COM SUCESSO ===');
  console.log('Tamanho do prompt:', prompt.length);
  console.log('Contém atividades físicas:', prompt.includes(physicalActivities));
  console.log('=== FIM DA CONSTRUÇÃO DO PROMPT ===');

  return prompt;
}
