
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from 'lucide-react';

interface StructuredReportSectionProps {
  assessmentText: string;
}

const StructuredReportSection = ({ assessmentText }: StructuredReportSectionProps) => {
  console.log('=== TEXTO RECEBIDO PARA ESTRUTURAÇÃO ===');
  console.log(assessmentText);
  console.log('=== FIM DO TEXTO ===');

  // Função para redatar informações pessoais
  function redactPersonalInfo(text: string): string {
    if (!text) return '';
    const patterns = [
      /nome\s*[:：]/i,
      /profissional/i,
      /assinatura/i,
      /contato/i,
      /telefone/i,
      /e[- ]?mail/i,
      /cref/i,
      /crm/i,
      /cpf/i,
      /rg/i,
      /\bwhatsapp\b/i,
      /^\s*\*\*Nome do Avaliado:?\*\*.*$/i,
      /^\s*\*\*Data da Avalia[cç][aã]o:?\*\*.*$/i,
      /^\s*\*\*Avaliador:?\*\*.*$/i,
      /^\s*\*\*Local da Avalia[cç][aã]o:?\*\*.*$/i
    ];
    let filtered = text
      .split('\n')
      .filter(line => !patterns.some(pat => pat.test(line)))
      .join('\n');
    filtered = filtered.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email oculto]');
    filtered = filtered.replace(/\b\d{2,4}[ .-]?\d{4,5}[ .-]?\d{4}\b/g, '[telefone oculto]');
    return filtered;
  }

  const redactedText = assessmentText ? redactPersonalInfo(assessmentText) : '';

  return (
    <div className="space-y-6 mb-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Relatório Detalhado</h3>
      
      <Card className="border-2 shadow-lg bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center text-gray-700">
            <FileText className="w-6 h-6 mr-3 text-[#019f80]" />
            Análise Completa
          </CardTitle>
        </CardHeader>
        <CardContent>
          {redactedText ? (
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {redactedText}
            </div>
          ) : (
            <div className="text-gray-600 italic">
              Relatório não disponível.
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>Nota:</strong> Esta análise foi gerada por inteligência artificial baseada nos seus dados físicos e perfil de saúde.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StructuredReportSection;
