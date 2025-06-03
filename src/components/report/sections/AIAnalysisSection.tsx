
import { Report, UserProfile } from "@/types/report";

interface AIAnalysisSectionProps {
  report: Report;
  userProfile: UserProfile | null;
}

const AIAnalysisSection = ({ report, userProfile }: AIAnalysisSectionProps) => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Análise por IA:</h3>
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
        <div className="prose prose-gray max-w-none">
          {report.assessmentText ? (
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {report.assessmentText}
            </div>
          ) : (
            <div className="text-gray-500 italic">
              Análise detalhada não disponível para esta avaliação.
            </div>
          )}
        </div>
        
        {report.assessmentText && (
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
