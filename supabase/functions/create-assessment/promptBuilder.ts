
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
  
  // Definir qual fonte de dados usar baseado no tipo de avaliação
  let profileData: any = {};
  
  if (assessmentType === 'patient' && patientData) {
    // Para avaliação de paciente, usar EXCLUSIVAMENTE os dados do paciente
    console.log('Usando dados exclusivos do paciente para o prompt');
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
    console.log('Usando dados do perfil do usuário para o prompt');
    profileData = userData.patient_profiles?.[0] || {};
  }

  console.log('Dados do perfil para o prompt:', JSON.stringify(profileData, null, 2));

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

  // Formatar atividades físicas
  const formatPhysicalActivities = (activities: any): string => {
    if (!activities || (Array.isArray(activities) && activities.length === 0)) {
      return 'Nenhuma atividade informada';
    }
    
    if (Array.isArray(activities)) {
      return activities.map((activity: any) => {
        if (typeof activity === 'string') {
          return activity;
        }
        if (activity && activity.name) {
          const frequency = activity.frequency ? ` (${activity.frequency})` : '';
          return `${activity.name}${frequency}`;
        }
        return JSON.stringify(activity);
      }).join(', ');
    }
    
    if (typeof activities === 'string') {
      return activities;
    }
    
    return JSON.stringify(activities);
  };

  // Get data from the selected source
  const physicalActivities = formatPhysicalActivities(profileData.physical_activities);
  const physicalActivity = profileData.physical_activity || 'Não informado';
  const chronicDisease = profileData.chronic_disease || 'Nenhuma';
  const goal = profileData.goal || 'Não informado';

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

  return `Você é um avaliador físico profissional especializado em análise de composição corporal.

Analise os dados e as fotos fornecidas, gere um laudo completo incluindo:

1. AVALIAÇÃO CORPORAL
- Com base nas fotos faça uma análise da distribuição de gordura corporal
- Use como referência os valores já calculados: ${bodyFatPercentage.toFixed(1)}% de gordura corporal

2. GASTO ENERGÉTICO
- Estimativa do Gasto Energético Total (GET)

3. PLANEJAMENTO NUTRICIONAL
Considerando as doenças crônicas e as atividades fisicas informadas abaixo, forneça recomendações de calorias diarias para:
- Manutenção com foco em definição
- Emagrecimento saudável (cutting)
- Ganho de massa muscular (bulking)

Divisão de macronutrientes em cada refeição para cada cenário (proteínas, carboidratos, gorduras)

4. PROJEÇÃO DE RESULTADOS
Explique o que pode acontecer seguindo as recomendações por 30 dias

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
 - Gasto Energético Total (GET): "XXXX kcal/dia" - "Descrição detalhada"
 
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

   
PROJEÇÃO DE RESULTADOS,
  EMAGRECIMENTO SAUDÁVEL: "Descrição das expectativas em 30 dias","Valor esperado"
  
  MANUTENÇÃO COM DEFINIÇÃO: "Descrição das expectativas em 30 dias","Valor esperado"
  
  GANHO DE MASSA MUSCULAR: "Descrição das expectativas em 30 dias","Valor esperado"
  
MÉTODOS UTILIZADOS,
  Composição Corporal:"Fórmula de Deurenberg para estimar percentual de gordura e massa magra"
  Gasto Energético:"Equação utilizada para TMB e GET"
  Planejamento Nutricional: "Metodologia para divisão de macronutrientes"
  
\`\`\`

Forneça um laudo técnico realista e profissional utilizando uma linguagem de fácil entendimento. Inclua valores numéricos específicos nas estimativas, mas não detalhe os cálculos. Use o formato CSV rigorosamente como mostrado no exemplo.`;
}
