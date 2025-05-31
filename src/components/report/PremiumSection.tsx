
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Crown, TrendingUp, Brain, FileText, Zap, CheckCircle } from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface PremiumSectionProps {
  report: any;
  isPaid: boolean;
  onPaymentSuccess: () => void;
}

const PremiumSection = ({ report, isPaid, onPaymentSuccess }: PremiumSectionProps) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [assessmentProduct, setAssessmentProduct] = useState<any>(null);

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

  if (isPaid) {
    return (
      <div className="space-y-8">
        {/* Análise Premium Desbloqueada */}
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
                    <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Peitoral: Bem desenvolvido</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>Dorsais: Moderadamente desenvolvido</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Deltoides: Bem desenvolvido</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>Quadríceps: Pouco desenvolvido</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Simetria Corporal</h4>
                  <div className="space-y-2 text-gray-600">
                    <p>• Assimetria leve entre membros superiores</p>
                    <p>• Postura ligeiramente anteriorizada</p>
                    <p>• Recomendação: exercícios unilaterais</p>
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
                  <div className="text-2xl font-bold text-blue-600">Androide</div>
                  <p className="text-sm text-gray-600">Concentração abdominal</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">Visceral</div>
                  <p className="text-sm text-gray-600">Baixo risco</p>
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
                  <p className="text-gray-600">Foco em movimento correto e ativação muscular</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-700">Semana 5-8: Hipertrofia</h4>
                  <p className="text-gray-600">Aumento de volume e intensidade progressiva</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-700">Semana 9-12: Definição</h4>
                  <p className="text-gray-600">Treinos metabólicos e refinamento muscular</p>
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
                      <span className="font-semibold">1.8g/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carboidratos:</span>
                      <span className="font-semibold">4g/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gorduras:</span>
                      <span className="font-semibold">1g/kg</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Suplementação</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Whey Protein: 30g pós-treino</li>
                    <li>• Creatina: 3g diariamente</li>
                    <li>• Vitamina D3: 2000 UI</li>
                    <li>• Ômega 3: 1g diariamente</li>
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
              Acesse análise detalhada de definição muscular, programa de treino personalizado, 
              plano nutricional e relatório completo em PDF.
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

          {/* Preview do que será desbloqueado */}
          <div className="grid md:grid-cols-2 gap-4 opacity-60">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Definição Muscular
              </h4>
              <p className="text-sm text-gray-600">Análise detalhada de cada grupo muscular e simetria corporal.</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                Distribuição de Gordura
              </h4>
              <p className="text-sm text-gray-600">Mapeamento completo da distribuição de gordura corporal.</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Programa de Treino
              </h4>
              <p className="text-sm text-gray-600">Treino personalizado baseado na sua composição corporal.</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Plano Nutricional
              </h4>
              <p className="text-sm text-gray-600">Dieta específica com macros e suplementação ideal.</p>
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
