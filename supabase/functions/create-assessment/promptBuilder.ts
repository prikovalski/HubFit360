
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

  console.log('Dados do perfil do paciente para o prompt:', JSON.stringify(patientProfile, null, 2));

  // Função para formatar circunferências com valores seguros
  const formatCircumference = (value: number | null | undefined): string => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    return `${value}`;
  };

  const neckCirc = formatCircumference(patientProfile.neck_circumference);
  const waistCirc = formatCircumference(patientProfile.waist_circumference);
  const hipCirc = formatCircumference(patientProfile.hip_circumference);

  console.log('Circunferências formatadas:', {
    pescoço: neckCirc,
    cintura: waistCirc,
    quadril: hipCirc
  });

  return `Você é um avaliador físico profissional especializado em análise de composição corporal.

Analise os dados fornecidos, gere um laudo técnico completo incluindo:

1. AVALIAÇÃO CORPORAL
- Estimativa do percentual de gordura corporal utilizando a fórmula de Deurenberg baseada nos dados antropométricos
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
  * Pescoço: ${neckCirc} cm
  * Cintura: ${waistCirc} cm
  * Quadril: ${hipCirc} cm
- Atividade física: ${patientProfile.physical_activity || 'Não informado'}
- Doenças crônicas: ${patientProfile.chronic_disease || 'Nenhuma'}
- Objetivo: ${patientProfile.goal || 'Não informado'}

Forneça um laudo técnico, realista e profissional. Inclua valores numéricos específicos nas estimativas.`;
}
