import { CheckCircle, Crown, TrendingUp, Brain, FileText, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserProfile } from '@/hooks/useUserProfile';

interface PremiumSectionProps {
  report: any;
  isPaid: boolean;
  onPaymentSuccess: () => void;
}

const PremiumSection = ({ report, isPaid, onPaymentSuccess }: PremiumSectionProps) => {
  const { userProfile, patientProfile } = useUserProfile();

  // Gerar conteúdo premium baseado nos dados reais do usuário
  const generatePersonalizedContent = () => {
    if (!userProfile || !patientProfile) {
      return null;
    }

    const isMale = userProfile.gender === 'Masculino';
    const hasGoal = patientProfile.goal;
    const hasAllergies = patientProfile.food_allergy;
    const hasRestrictions = patientProfile.medical_restriction;

    return {
      muscleAnalysis: [
        { group: 'Peitoral', level: isMale ? 'Bem desenvolvido' : 'Moderadamente desenvolvido', color: 'green' },
        { group: 'Dorsais', level: 'Moderadamente desenvolvido', color: 'yellow' },
        { group: 'Deltoides', level: 'Bem desenvolvido', color: 'green' },
        { group: 'Quadríceps', level: isMale ? 'Pouco desenvolvido' : 'Moderadamente desenvolvido', color: isMale ? 'red' : 'yellow' }
      ],
      nutritionPlan: {
        protein: patientProfile.weight ? (patientProfile.weight * 1.8).toFixed(1) : 'N/A',
        carbs: patientProfile.weight ? (patientProfile.weight * 4).toFixed(1) : 'N/A',
        fat: patientProfile.weight ? (patientProfile.weight * 1).toFixed(1) : 'N/A',
        restrictions: hasAllergies ? patientProfile.food_allergy : 'Nenhuma restrição específica',
        supplements: isMale ? 
          ['Whey Protein: 30g pós-treino', 'Creatina: 3g diariamente', 'Vitamina D3: 2000 UI', 'Ômega 3: 1g diariamente'] :
          ['Whey Protein: 25g pós-treino', 'Colágeno: 10g diariamente', 'Vitamina D3: 2000 UI', 'Ferro: conforme necessidade']
      },
      trainingPlan: hasGoal && hasGoal.toLowerCase().includes('perda') ? 
        'Foco em treinos metabólicos e cardio' : 
        'Foco em hipertrofia e força'
    };
  };

  const personalizedContent = generatePersonalizedContent();

  // Só renderizar se estiver pago (a lógica de upgrade agora fica no ReportViewer)
  if (!isPaid) {
    return null;
  }

  return (
    <div className="space-y-8">
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-green-800 flex items-center">
              <Crown className="w-6 h-6 mr-2 text-yellow-500" />
              Análise Premium Desbloqueada
            </CardTitle>
            <Badge className="bg-green-600 text-white">
              <CheckCircle className="w-4 h-4 mr-1" />
              Ativo
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Análise de Definição Muscular */}
          <div className="bg-white rounded-lg p-6 border border-green-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Análise de Definição Muscular
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Grupos Musculares Desenvolvidos</h4>
                <ul className="space-y-2 text-gray-600">
                  {personalizedContent?.muscleAnalysis.map((muscle, index) => (
                    <li key={index} className="flex items-center">
                      <span className={`w-2 h-2 ${
                        muscle.color === 'green' ? 'bg-green-500' : 
                        muscle.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                      } rounded-full mr-2`}></span>
                      {muscle.group}: {muscle.level}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Recomendações</h4>
                <div className="space-y-2 text-gray-600">
                  <p>• {personalizedContent?.trainingPlan}</p>
                  <p>• Exercícios unilaterais para simetria</p>
                  <p>• Monitoramento de postura</p>
                  {patientProfile?.physical_activity && (
                    <p>• Atual: {patientProfile.physical_activity}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Distribuição de Gordura */}
          <div className="bg-white rounded-lg p-6 border border-green-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-blue-600" />
              Mapeamento de Distribuição de Gordura
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {userProfile?.gender === 'Masculino' ? 'Androide' : 'Ginóide'}
                </div>
                <p className="text-sm text-gray-600">
                  {userProfile?.gender === 'Masculino' ? 'Concentração abdominal' : 'Concentração nos quadris'}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">Visceral</div>
                <p className="text-sm text-gray-600">
                  {report.preview.bodyFat && parseFloat(report.preview.bodyFat) < 15 ? 'Baixo risco' : 'Monitorar'}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Subcutânea</div>
                <p className="text-sm text-gray-600">Distribuição normal</p>
              </div>
            </div>
          </div>

          {/* Programa de Treino */}
          <div className="bg-white rounded-lg p-6 border border-green-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-orange-600" />
              Programa de Treino Personalizado
            </h3>
            <div className="space-y-4">
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-gray-700">Semana 1-4: Adaptação</h4>
                <p className="text-gray-600">
                  {personalizedContent?.trainingPlan} - Movimento correto e ativação muscular
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-700">Semana 5-8: Progressão</h4>
                <p className="text-gray-600">
                  {patientProfile?.goal?.toLowerCase().includes('perda') ? 
                    'Intensidade metabólica e queima de gordura' : 
                    'Aumento de volume e intensidade progressiva'}
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-700">Semana 9-12: Refinamento</h4>
                <p className="text-gray-600">
                  Treinos específicos para seu objetivo atual: {patientProfile?.goal || 'Melhoria geral'}
                </p>
              </div>
            </div>
          </div>

          {/* Plano Nutricional */}
          <div className="bg-white rounded-lg p-6 border border-green-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600" />
              Plano Nutricional Específico
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Macronutrientes Diários</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Proteínas:</span>
                    <span className="font-semibold">{personalizedContent?.nutritionPlan.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carboidratos:</span>
                    <span className="font-semibold">{personalizedContent?.nutritionPlan.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gorduras:</span>
                    <span className="font-semibold">{personalizedContent?.nutritionPlan.fat}g</span>
                  </div>
                </div>
                {patientProfile?.food_allergy && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Restrições:</strong> {patientProfile.food_allergy}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Suplementação Recomendada</h4>
                <ul className="space-y-1 text-gray-600">
                  {personalizedContent?.nutritionPlan.supplements.map((supplement, index) => (
                    <li key={index} className="text-sm">• {supplement}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumSection;