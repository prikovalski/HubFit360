import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Crown, TrendingUp, Brain, FileText, Zap, CheckCircle } from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';

interface PremiumSectionProps {
  report: any;
  isPaid: boolean;
  onPaymentSuccess: () => void;
}

const PremiumSection = ({ report, isPaid, onPaymentSuccess }: PremiumSectionProps) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [assessmentProduct, setAssessmentProduct] = useState<any>(null);
  const { userProfile, patientProfile } = useUserProfile();

  // Buscar o produto de avaliação
  useEffect(() => {
    const fetchAssessmentProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('type', 'assessment')
          .eq('status', 'active')
          .single();

        if (!error && data) {
          setAssessmentProduct(data);
        }
      } catch (error) {
        console.error('Erro ao buscar produto de avaliação:', error);
      }
    };

    fetchAssessmentProduct();
  }, []);

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    onPaymentSuccess();
  };

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

  if (isPaid) {
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
  }

  return (
    <div className="space-y-8">
      {/* Seção Premium Bloqueada */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-amber-800 flex items-center">
              <Lock className="w-6 h-6 mr-2" />
              Análise Premium
            </CardTitle>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Bloqueado
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <Crown className="w-16 h-16 mx-auto text-amber-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Desbloqueie a Análise Completa
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Acesse análise detalhada personalizada baseada no seu perfil, programa de treino específico para seu objetivo 
              ({patientProfile?.goal || 'seus objetivos'}), plano nutricional considerando suas restrições 
              {patientProfile?.food_allergy && ` (${patientProfile.food_allergy})`} e relatório completo em PDF.
            </p>
            
            {assessmentProduct && (
              <Button 
                onClick={() => setShowPaymentModal(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 text-lg font-semibold"
              >
                <Crown className="w-5 h-5 mr-2" />
                Desbloquear por R$ {Number(assessmentProduct.price).toFixed(2).replace('.', ',')}
              </Button>
            )}
          </div>

          {/* Preview personalizado do que será desbloqueado */}
          <div className="grid md:grid-cols-2 gap-4 opacity-60">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Análise Muscular
              </h4>
              <p className="text-sm text-gray-600">
                Análise personalizada para {userProfile?.gender === 'Masculino' ? 'homens' : 'mulheres'} 
                considerando seu perfil físico atual.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                Distribuição de Gordura
              </h4>
              <p className="text-sm text-gray-600">
                Mapeamento específico para seu tipo corporal e estratégias direcionadas.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Treino para {patientProfile?.goal || 'Seus Objetivos'}
              </h4>
              <p className="text-sm text-gray-600">
                Programa personalizado baseado no seu objetivo específico e nível atual.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Nutrição Personalizada
              </h4>
              <p className="text-sm text-gray-600">
                Plano considerando suas restrições{patientProfile?.food_allergy && ' alimentares'} 
                e necessidades específicas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {assessmentProduct && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          productId={assessmentProduct.id}
          assessmentId={report.id}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default PremiumSection;
