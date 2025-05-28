import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Lock, FileText, TrendingUp, Target, AlertCircle, Activity, Scale, Zap } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import PaymentModal from './PaymentModal';

const ReportViewer = ({ report, onBack }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    toast({
      title: "Pagamento aprovado!",
      description: "Laudo completo desbloqueado com sucesso",
    });
    // Recarregar a página para atualizar o status
    window.location.reload();
  };

  const generatePDF = () => {
    toast({
      title: "Gerando PDF...",
      description: "Seu laudo será baixado em instantes",
    });
  };

  const isPaid = report.status === 'paid';

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              onClick={onBack}
              variant="ghost" 
              className="mr-4 text-[#019f80] hover:bg-[#019f80]/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Laudo de Avaliação Física</h1>
              <p className="text-gray-600">
                {new Date(report.date).toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge 
              variant={isPaid ? 'default' : 'secondary'}
              className={isPaid ? 'bg-[#019f80] hover:bg-[#017a63]' : ''}
            >
              {isPaid ? 'Laudo Completo' : 'Versão Gratuita'}
            </Badge>
            
            {isPaid && (
              <Button 
                onClick={generatePDF}
                variant="outline" 
                className="border-[#019f80] text-[#019f80] hover:bg-[#019f80] hover:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
            )}
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Massa Magra</CardTitle>
                <Activity className="w-6 h-6 text-blue-200" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{report.preview.leanMass}</div>
              <p className="text-blue-100 text-sm">Músculos e ossos</p>
              <div className="mt-3 text-xs text-blue-200">
                Indica massa corporal livre de gordura
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Gordura Corporal</CardTitle>
                <Zap className="w-6 h-6 text-orange-200" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{report.preview.bodyFat}</div>
              <p className="text-orange-100 text-sm">Percentual de gordura</p>
              <div className="mt-3 text-xs text-orange-200">
                Medição precisa da composição corporal
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-[#019f80] to-[#4ade80] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">IMC</CardTitle>
                <Scale className="w-6 h-6 text-green-200" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{report.preview.bmi}</div>
              <p className="text-green-100 text-sm">Índice de massa corporal</p>
              <div className="mt-3 text-xs text-green-200">
                Classificação padrão internacional
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Laudo Técnico */}
        <Card className="border-0 shadow-lg bg-white mb-6">
          <CardHeader className="bg-gradient-to-r from-[#019f80]/5 to-green-50 border-b border-green-100">
            <CardTitle className="text-2xl text-gray-800 flex items-center font-bold">
              <FileText className="w-7 h-7 mr-3 text-[#019f80]" />
              Laudo Técnico
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            {/* Dados Pessoais */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                <div>
                  <span className="text-gray-600 font-medium">Nome:</span>
                  <div className="text-gray-800 font-semibold text-lg">João Silva Santos</div>
                </div>
                <div></div>
                <div>
                  <span className="text-gray-600 font-medium">Idade:</span>
                  <div className="text-gray-800 font-semibold text-lg">32 anos</div>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Gênero:</span>
                  <div className="text-gray-800 font-semibold text-lg">Masculino</div>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Altura:</span>
                  <div className="text-gray-800 font-semibold text-lg">1,78m</div>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Peso:</span>
                  <div className="text-gray-800 font-semibold text-lg">82kg</div>
                </div>
              </div>
            </div>

            {/* Estimativas */}
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

            {/* Ideais */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Ideais:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <span className="text-gray-600 font-medium">Massa Gorda Ideal:</span>
                  <div className="text-[#019f80] font-semibold text-lg">12-15%</div>
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

            {/* Análise Visual e Composição Corporal */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">Análise Visual e Composição Corporal</h3>
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed text-base">
                  A análise visual demonstra uma composição corporal equilibrada, com distribuição homogênea da massa muscular nos principais grupos musculares. O percentual de gordura corporal atual encontra-se dentro da faixa considerada saudável para homens da faixa etária, apresentando leve acúmulo na região abdominal inferior, padrão típico masculino. A definição muscular é visível especialmente na região do peitoral e braços, indicando bom condicionamento físico e prática regular de exercícios resistidos.
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

        {/* Premium Content */}
        <Card className={`border-0 shadow-lg ${isPaid ? 'bg-white' : 'bg-gray-50'} relative overflow-hidden`}>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
            <CardTitle className="text-2xl text-gray-800 flex items-center font-bold">
              <TrendingUp className="w-7 h-7 mr-3 text-[#019f80]" />
              Análise Detalhada
              {!isPaid && <Lock className="w-6 h-6 ml-3 text-gray-400" />}
            </CardTitle>
            <CardDescription className="text-gray-600 text-base mt-2">
              Avaliação completa com recomendações personalizadas
            </CardDescription>
          </CardHeader>
          
          <CardContent className={`pt-8 ${isPaid ? '' : 'filter blur-sm pointer-events-none'}`}>
            <div className="space-y-10">
              {/* Detailed Analysis */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-6 flex items-center text-xl">
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">💪</span>
                  </div>
                  Definição Muscular
                </h3>
                <p className="text-blue-700 leading-relaxed text-lg font-medium">
                  Apresenta boa definição muscular na região do abdômen e braços. 
                  Músculos do peitoral bem desenvolvidos. Recomenda-se manter o 
                  atual programa de treinos com foco em exercícios compostos.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-8 border border-orange-200">
                <h3 className="font-bold text-orange-800 mb-6 flex items-center text-xl">
                  <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  Distribuição de Gordura
                </h3>
                <p className="text-orange-700 leading-relaxed text-lg font-medium">
                  Distribuição homogênea da gordura corporal, com leve concentração 
                  na região abdominal inferior. Padrão típico masculino com 
                  acúmulo central moderado.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
                <h3 className="font-bold text-green-800 mb-6 flex items-center text-xl">
                  <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">⚖️</span>
                  </div>
                  Proporções Corporais
                </h3>
                <p className="text-green-700 leading-relaxed text-lg font-medium">
                  Proporções equilibradas entre membros superiores e inferiores. 
                  Ombros proporcionais ao quadril. Estrutura óssea média com 
                  bom potencial para ganho de massa muscular.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-8">
                <h3 className="font-bold text-indigo-800 mb-8 flex items-center text-2xl">
                  <Target className="w-8 h-8 mr-4" />
                  Recomendações Personalizadas
                </h3>
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                    <h4 className="font-bold text-blue-700 mb-6 flex items-center text-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-lg">🏋️</span>
                      </div>
                      Programa de Treino
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-blue-600 font-medium">4-5x por semana de musculação</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-blue-600 font-medium">Foco em exercícios compostos</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-blue-600 font-medium">2-3x cardio moderado</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-blue-600 font-medium">Ênfase em core e estabilização</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                    <h4 className="font-bold text-green-700 mb-6 flex items-center text-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-lg">🥗</span>
                      </div>
                      Plano Nutricional
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-green-600 font-medium">2200-2400 kcal/dia</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-green-600 font-medium">2.2g proteína/kg peso</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-green-600 font-medium">40% carbo, 30% prot, 30% gord</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-green-600 font-medium">6 refeições ao dia</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          
          {!isPaid && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
              <Card className="border-0 shadow-2xl bg-white max-w-md w-full">
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#019f80] to-[#4ade80] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-gray-800 mb-2">Laudo Completo</CardTitle>
                  <CardDescription className="text-gray-600">
                    Desbloqueie a análise detalhada e recomendações personalizadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                    <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Incluso no Laudo Completo:
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-amber-700 text-sm">Análise detalhada de definição muscular</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-amber-700 text-sm">Mapeamento da distribuição de gordura</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-amber-700 text-sm">Avaliação das proporções corporais</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-amber-700 text-sm">Recomendações personalizadas de treino</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-amber-700 text-sm">Plano nutricional específico</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-amber-700 text-sm">Relatório completo em PDF</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center bg-gradient-to-r from-[#019f80]/10 to-green-50 rounded-lg p-4">
                    <div className="text-4xl font-bold text-[#019f80] mb-1">R$ 29,90</div>
                    <p className="text-gray-600 text-sm">Pagamento único • Acesso imediato</p>
                  </div>
                  
                  <Button 
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full bg-gradient-to-r from-[#019f80] to-[#4ade80] hover:from-[#017a63] hover:to-[#3bc473] text-white py-3 text-lg font-semibold"
                  >
                    Desbloquear Laudo Completo
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </Card>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          reportId={report.id}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  );
};

export default ReportViewer;
