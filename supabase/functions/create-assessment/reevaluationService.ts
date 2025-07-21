
import { callOpenAI } from './openaiService.ts';

export interface ReevaluationResult {
  newBodyFatPercentage: number;
  justification: string;
  wasReevaluated: boolean;
}

export async function reevaluateBodyComposition(
  bodyFatPercentage: number,
  waistCirc: number,
  height: number,
  weight: number,
  bmi: number,
  sex: string,
  calculatedAge: number,
  frontPhoto: string,
  sidePhoto: string,
  backPhoto: string
): Promise<ReevaluationResult> {
  console.log('=== INICIANDO REAVALIAÇÃO DE COMPOSIÇÃO CORPORAL ===');
  console.log('Dados para reavaliação:', {
    bodyFatPercentage: bodyFatPercentage.toFixed(1),
    waistCirc,
    height,
    cinturaAlturaRatio: (waistCirc / height).toFixed(2),
    weight,
    bmi: bmi.toFixed(1)
  });

  const reevaluationPrompt = `Você é um avaliador físico profissional.

A fórmula de Deurenberg retornou ${bodyFatPercentage.toFixed(1)}% de gordura corporal para uma pessoa com ${waistCirc}cm de cintura e ${height}cm de altura (${(waistCirc / height).toFixed(2)} de relação cintura/altura), além de um peso de ${weight}kg e IMC de ${bmi.toFixed(1)}.

DADOS ADICIONAIS:
- Gênero: ${sex === 'male' ? 'Masculino' : 'Feminino'}
- Idade: ${calculatedAge} anos
- Relação cintura/altura: ${(waistCirc / height).toFixed(2)} (considerada baixa para o percentual estimado)

Baseando-se nas medidas corporais fornecidas (que indicam um corpo aparentemente magro/atlético devido à baixa relação cintura/altura), avalie se o valor de gordura corporal está superestimado.

IMPORTANTE: 
- NÃO use a fórmula de Deurenberg nesta nova estimativa
- Use análise baseada em: distribuição de gordura + padrão fenotípico + relação cintura/altura
- A relação cintura/altura de ${(waistCirc / height).toFixed(2)} sugere um corpo mais magro do que o indicado pelos ${bodyFatPercentage.toFixed(1)}%

RESPOSTA OBRIGATÓRIA:
Forneça sua resposta EXATAMENTE no formato abaixo:

NOVA_ESTIMATIVA: X.X%
JUSTIFICATIVA: [Sua justificativa detalhada da correção]

Onde X.X é o novo percentual de gordura corporal estimado.`;

  console.log('Enviando prompt para reavaliação:', reevaluationPrompt);

  try {
    const response = await callOpenAI(reevaluationPrompt);
    console.log('Resposta da reavaliação recebida:', response);

    // Extrair nova estimativa da resposta
    const estimativaMatch = response.match(/NOVA_ESTIMATIVA:\s*(\d+\.?\d*)%/i);
    const justificativaMatch = response.match(/JUSTIFICATIVA:\s*(.*?)$/mi);

    if (estimativaMatch && justificativaMatch) {
      const newBodyFatPercentage = parseFloat(estimativaMatch[1]);
      const justification = justificativaMatch[1].trim();

      console.log('Extração bem-sucedida:', {
        newBodyFatPercentage,
        originalPercentage: bodyFatPercentage,
        justification: justification.substring(0, 100) + '...'
      });

      // Validar se a nova estimativa é razoável (entre 5% e 35%)
      if (newBodyFatPercentage >= 5 && newBodyFatPercentage <= 35) {
        return {
          newBodyFatPercentage,
          justification,
          wasReevaluated: true
        };
      } else {
        console.warn('Nova estimativa fora da faixa válida:', newBodyFatPercentage);
      }
    } else {
      console.warn('Não foi possível extrair nova estimativa da resposta');
    }
  } catch (error) {
    console.error('Erro na reavaliação:', error);
  }

  // Se houve erro ou valor inválido, retornar valor original
  return {
    newBodyFatPercentage: bodyFatPercentage,
    justification: 'Reavaliação não aplicada devido a erro ou valor inválido',
    wasReevaluated: false
  };
}

export function shouldTriggerReevaluation(
  bodyFatPercentage: number,
  waistCircumference: number,
  height: number
): boolean {
  if (!waistCircumference || !height) {
    return false;
  }

  const cinturaAltura = waistCircumference / height;
  const shouldTrigger = bodyFatPercentage > 30 && cinturaAltura < 0.45;

  console.log('Verificação de reavaliação:', {
    bodyFatPercentage: bodyFatPercentage.toFixed(1),
    cinturaAltura: cinturaAltura.toFixed(2),
    shouldTrigger
  });

  return shouldTrigger;
}
