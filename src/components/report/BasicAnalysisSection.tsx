import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from 'lucide-react';

interface BasicAnalysisSectionProps {
  report: any;
  userProfile: any;
  patientProfile: any;
}

const BasicAnalysisSection = ({ report, userProfile, patientProfile }: BasicAnalysisSectionProps) => {
  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatGender = (gender: string | null) => {
    if (!gender) return 'N/A';
    return gender === 'Masculino' ? 'Masculino' : 'Feminino';
  };

  const age = calculateAge(userProfile?.birth_date);

  return (
    <Card className="border-0 shadow-lg bg-white mb-6">
      <CardHeader className="bg-gradient-to-r from-[#019f80]/5 to-green-50 border-b border-green-100">
        <CardTitle className="text-2xl text-gray-800 flex items-center font-bold">
          <FileText className="w-7 h-7 mr-3 text-[#019f80]" />
          Laudo Técnico
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-8">
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
            <div>
              <span className="text-gray-600 font-medium">Nome:</span>
              <div className="text-gray-800 font-semibold text-lg">{userProfile?.name || 'N/A'}</div>
            </div>
            <div></div>
            <div>
              <span className="text-gray-600 font-medium">Idade:</span>
              <div className="text-gray-800 font-semibold text-lg">{age} anos</div>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Gênero:</span>
              <div className="text-gray-800 font-semibold text-lg">{formatGender(userProfile?.gender)}</div>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Altura:</span>
              <div className="text-gray-800 font-semibold text-lg">
                {patientProfile?.height ? `${(patientProfile.height / 100).toFixed(2)}m` : 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Peso:</span>
              <div className="text-gray-800 font-semibold text-lg">
                {patientProfile?.weight ? `${patientProfile.weight}kg` : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Estimativas:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <span className="text-gray-600 font-medium">Massa Gorda:</span>
              <div className="text-gray-800 font-semibold text-lg">{report.preview.bodyFat}</div>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Massa Magra:</span>
              <div className="text-gray-800 font-semibold text-lg">{report.preview.leanMass}</div>
            </div>
            <div>
              <span className="text-gray-600 font-medium">IMC:</span>
              <div className="text-gray-800 font-semibold text-lg">{report.preview.bmi}</div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Ideais:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <span className="text-gray-600 font-medium">Massa Gorda Ideal:</span>
              <div className="text-[#019f80] font-semibold text-lg">
                {userProfile?.gender === 'Masculino' ? '12-15%' : '16-24%'}
              </div>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Massa Magra Ideal:</span>
              <div className="text-[#019f80] font-semibold text-lg">68-72kg</div>
            </div>
            <div>
              <span className="text-gray-600 font-medium">IMC Ideal:</span>
              <div className="text-[#019f80] font-semibold text-lg">22-25</div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">Análise Visual e Composição Corporal</h3>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed text-base">
              A análise visual demonstra uma composição corporal equilibrada, com distribuição homogênea da massa muscular nos principais grupos musculares. O percentual de gordura corporal atual encontra-se dentro da faixa considerada saudável para {userProfile?.gender === 'Masculino' ? 'homens' : 'mulheres'} da faixa etária, apresentando leve acúmulo na região abdominal inferior, padrão típico {userProfile?.gender === 'Masculino' ? 'masculino' : 'feminino'}. A definição muscular é visível especialmente na região do peitoral e braços, indicando bom condicionamento físico e prática regular de exercícios resistidos.
            </p>
            <p className="text-gray-700 leading-relaxed text-base">
              Em relação às proporções corporais, observa-se simetria adequada entre membros superiores e inferiores, com desenvolvimento muscular proporcional. A estrutura óssea média oferece excelente potencial para ganho de massa muscular magra. A composição atual sugere que o indivíduo possui base sólida para progressão em programas de treinamento, seja para redução adicional do percentual de gordura ou para ganho de massa muscular, dependendo dos objetivos estabelecidos.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-2xl p-8">
          <h4 className="font-bold text-green-800 mb-6 flex items-center text-xl">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-green-600 text-lg">✅</span>
            </div>
            Análise Básica Incluída
          </h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-green-700 font-medium">Percentual de massa magra e massa gorda</span>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-green-700 font-medium">Cálculo preciso do IMC</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-green-700 font-medium">Classificação da composição corporal</span>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-green-700 font-medium">Análise visual detalhada</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicAnalysisSection;
