
import type { UserData, PatientProfile } from './types.ts';

export function buildAssessmentPrompt(
  userData: UserData,
  calculatedAge: number,
  height: number,
  weight: number,
  sex: string,
  bodyFatPercentage: number,
  leanMass: number,
  fatMass: number
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

  console.log('Valores calculados pela fórmula de Deurenberg:', {
    bodyFatPercentage: bodyFatPercentage.toFixed(2) + '%',
    leanMass: leanMass.toFixed(2) + 'kg',
    fatMass: fatMass.toFixed(2) + 'kg'
  });

  return `Você é um avaliador físico profissional especializado em análise de composição corporal.

Analise os dados fornecidos, gere um laudo completo incluindo:

1. AVALIAÇÃO CORPORAL
- Análise da distribuição de gordura corporal
- Use como referência os valores já calculados: ${bodyFatPercentage.toFixed(1)}% de gordura corporal

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
- Composição Corporal (Fórmula de Deurenberg):
  * Gordura Corporal: ${bodyFatPercentage.toFixed(1)}%
  * Massa Magra: ${leanMass.toFixed(1)} kg
  * Massa Gorda: ${fatMass.toFixed(1)} kg
- Circunferências: 
  * Pescoço: ${neckCirc} cm
  * Cintura: ${waistCirc} cm
  * Quadril: ${hipCirc} cm
- Atividade física: ${patientProfile.physical_activity || 'Não informado'}
- Doenças crônicas: ${patientProfile.chronic_disease || 'Nenhuma'}
- Objetivo: ${patientProfile.goal || 'Não informado'}

IMPORTANTE: Forneça o laudo em formato CSV estruturado exatamente como o exemplo abaixo. Use aspas duplas para valores que contenham vírgulas e mantenha a estrutura rigorosa:

\`\`\`
SEÇÃO,TÓPICO,DESCRIÇÃO,VALOR/OBSERVAÇÃO
AVALIAÇÃO CORPORAL
 - Distribuição de Gordura,"Descrição detalhada","Valores específicos"
GASTO ENERGÉTICO
 - Taxa Metabólica Basal (TMB): XXXX kcal/dia - "Descrição detalhada"
 - Gasto Energético Total (GET),XXXX kcal/dia - "Descrição detalhada"
PLANEJAMENTO NUTRICIONAL
 - Manutenção com foco em definição: XXXX kcal/dia, "Descrição detalhada"
 - Emagrecimento saudável (cutting): XXXX kcal/dia, "Descrição detalhada"
 - Ganho de massa muscular (bulking): XXXX kcal/dia, "Descrição detalhada"
 Divisão de Macronutrientes para Manutenção:
    Proteínas: XXXg
    Carboidratos: XXXg
    Gorduras: XXXg
 Divisão de Macronutrientes para Cutting:
    Proteínas: "XXXg"
    Carboidratos: "XXXg" 
    Gorduras: "XXXg"
 Divisão de Macronutrientes para Bulking:
   Proteínas: "XXXg" 
   Carboidratos: "XXXg" 
   Gorduras: "XXXg"
PROJEÇÃO DE RESULTADOS,
  Emagrecimento saudável,"Descrição das expectativas em 30 dias","Valor esperado"
  Manutenção com definição,"Descrição das expectativas em 30 dias","Valor esperado"
  Bulking,"Descrição das expectativas em 30 dias","Valor esperado"
MÉTODOS UTILIZADOS,
  Composição Corporal:"Fórmula de Deurenberg para estimar percentual de gordura e massa magra",-
  Gasto Energético:"Equação utilizada para TMB e GET",-
  Planejamento Nutricional: "Metodologia para divisão de macronutrientes",-
\`\`\`

Forneça um laudo técnico realista e profissional utilizando uma linguagem de fácil entendimento. Inclua valores numéricos específicos nas estimativas, mas não detalhe os cálculos. Use o formato CSV rigorosamente como mostrado no exemplo.`;
}
