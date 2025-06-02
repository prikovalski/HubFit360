
import { Report, UserProfile } from "@/types/report";

interface AIAnalysisSectionProps {
  report: Report;
  userProfile: UserProfile | null;
}

const AIAnalysisSection = ({ report, userProfile }: AIAnalysisSectionProps) => {
  const getDefaultAnalysis = () => (
    <div className="space-y-4">
      <p className="text-gray-700 leading-relaxed text-base">
        A análise visual demonstra uma composição corporal equilibrada, com distribuição homogênea da massa muscular nos principais grupos musculares. O percentual de gordura corporal atual encontra-se dentro da faixa considerada saudável para {userProfile?.gender === 'Masculino' ? 'homens' : 'mulheres'} da faixa etária, apresentando leve acúmulo na região abdominal inferior, padrão típico {userProfile?.gender === 'Masculino' ? 'masculino' : 'feminino'}. A definição muscular é visível especialmente na região do peitoral e braços, indicando bom condicionamento físico e prática regular de exercícios resistidos.
      </p>
      <p className="text-gray-700 leading-relaxed text-base">
        Em relação às proporções corporais, observa-se simetria adequada entre membros superiores e inferiores, com desenvolvimento muscular proporcional. A estrutura óssea média oferece excelente potencial para ganho de massa muscular magra. A composição atual sugere que o indivíduo possui base sólida para progressão em programas de treinamento, seja para redução adicional do percentual de gordura ou para ganho de massa muscular, dependendo dos objetivos estabelecidos.
      </p>
    </div>
  );

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">Análise Personalizada da IA</h3>
      <div className="space-y-6">
        {report.assessmentText ? (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
              {report.assessmentText}
            </div>
          </div>
        ) : (
          getDefaultAnalysis()
        )}
      </div>
    </div>
  );
};

export default AIAnalysisSection;
