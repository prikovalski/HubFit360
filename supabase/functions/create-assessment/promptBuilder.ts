
import type { UserData, PatientProfile } from './types.ts';

export function buildAssessmentPrompt(
  userData: UserData,
  calculatedAge: number,
  height: number,
  weight: number,
  sex: string
): string {
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  const genderForPrompt = sex === 'male' ? 'Masculino' : 'Feminino';
  const patientProfile = userData.patient_profiles?.[0] || {};

  return `Você é um avaliador físico profissional especializado em análise de composição corporal.

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
}
