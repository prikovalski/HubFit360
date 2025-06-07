
import { Report, UserProfile } from "@/types/report";

interface AIAnalysisSectionProps {
  report: Report;
  userProfile: UserProfile | null;
}

// Utility to redact personal info
function redactPersonalInfo(text: string): string {
  if (!text) return '';
  // Remove lines containing keywords (case-insensitive, Portuguese/English variants)
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
    // Remove markdown-style headers for personal info
    /^\s*\*\*Nome do Avaliado:?\*\*.*$/i,
    /^\s*\*\*Data da Avalia[cç][aã]o:?\*\*.*$/i,
    /^\s*\*\*Avaliador:?\*\*.*$/i,
    /^\s*\*\*Local da Avalia[cç][aã]o:?\*\*.*$/i
  ];
  // Remove lines with personal info patterns
  let filtered = text
    .split('\n')
    .filter(line => !patterns.some(pat => pat.test(line)))
    .join('\n');
  // Optionally, mask any remaining emails/phones
  filtered = filtered.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email oculto]');
  filtered = filtered.replace(/\b\d{2,4}[ .-]?\d{4,5}[ .-]?\d{4}\b/g, '[telefone oculto]');
  return filtered;
}

const AIAnalysisSection = ({ report, userProfile }: AIAnalysisSectionProps) => {
  const redactedText = report.assessmentText ? redactPersonalInfo(report.assessmentText) : '';
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Análise por IA:</h3>
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
        <div className="prose prose-gray max-w-none">
          {redactedText ? (
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {redactedText}
            </div>
          ) : (
            <div className="text-gray-500 italic">
              Análise detalhada não disponível para esta avaliação.
            </div>
          )}
        </div>
        {redactedText && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Nota:</strong> Esta análise foi gerada por inteligência artificial baseada nos seus dados físicos e perfil de saúde.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisSection;
