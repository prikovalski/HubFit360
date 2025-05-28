
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Lock, CreditCard, FileText, TrendingUp, Target, AlertCircle, Activity, Scale, Zap } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

const ReportViewer = ({ report, onBack }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePayment = () => {
    toast({
      title: "Processando pagamento...",
      description: "Redirecionando para o checkout",
    });
    // Simular pagamento
    setTimeout(() => {
      toast({
        title: "Pagamento realizado!",
        description: "Laudo completo desbloqueado com sucesso",
      });
      setShowPaymentModal(false);
    }, 2000);
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

        {/* Metrics Overview - Melhorado */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
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

        {/* Free Content - Melhorado */}
        <Card className="border-0 shadow-lg bg-white mb-6">
          <CardHeader className="bg-gradient-to-r from-[#019f80]/5 to-green-50 border-b border-green-100">
            <CardTitle className="text-xl text-gray-800 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-[#019f80]" />
              Resumo da Avaliação
            </CardTitle>
            <CardDescription className="text-gray-600">
              Análise inicial baseada na sua composição corporal
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed text-base mb-6">
                {report.preview.summary}
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
              <h4 className="font-semibold text-green-800 mb-4 flex items-center text-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  ✅
                </div>
                Análise Básica Incluída
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-green-700 text-sm">Percentual de massa magra e massa gorda</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-green-700 text-sm">Cálculo preciso do IMC</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-green-700 text-sm">Classificação da composição corporal</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-green-700 text-sm">Resumo com observações iniciais</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Content */}
        <Card className={`border-0 shadow-lg ${isPaid ? 'bg-white' : 'bg-gray-50'} relative overflow-hidden`}>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
            <CardTitle className="text-xl text-gray-800 flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-[#019f80]" />
              Análise Detalhada
              {!isPaid && <Lock className="w-5 h-5 ml-2 text-gray-400" />}
            </CardTitle>
            <CardDescription className="text-gray-600">
              Avaliação completa com recomendações personalizadas
            </CardDescription>
          </CardHeader>
          
          <CardContent className={`pt-6 ${isPaid ? '' : 'filter blur-sm pointer-events-none'}`}>
            <div className="space-y-8">
              {/* Detailed Analysis */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    💪
                  </div>
                  Definição Muscular
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Apresenta boa definição muscular na região do abdômen e braços. 
                  Músculos do peitoral bem desenvolvidos. Recomenda-se manter o 
                  atual programa de treinos com foco em exercícios compostos.
                </p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    📊
                  </div>
                  Distribuição de Gordura
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Distribuição homogênea da gordura corporal, com leve concentração 
                  na região abdominal inferior. Padrão típico masculino com 
                  acúmulo central moderado.
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    ⚖️
                  </div>
                  Proporções Corporais
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Proporções equilibradas entre membros superiores e inferiores. 
                  Ombros proporcionais ao quadril. Estrutura óssea média com 
                  bom potencial para ganho de massa muscular.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-800 mb-6 flex items-center text-lg">
                  <Target className="w-6 h-6 mr-3" />
                  Recomendações Personalizadas
                </h3>
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-lg p-5 shadow-sm">
                    <h4 className="font-semibold text-blue-700 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-xs">🏋️</div>
                      Programa de Treino
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-600 text-sm">4-5x por semana de musculação</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-600 text-sm">Foco em exercícios compostos</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-600 text-sm">2-3x cardio moderado</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-600 text-sm">Ênfase em core e estabilização</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-5 shadow-sm">
                    <h4 className="font-semibold text-green-700 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2 text-xs">🥗</div>
                      Plano Nutricional
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-600 text-sm">2200-2400 kcal/dia</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-600 text-sm">2.2g proteína/kg peso</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-600 text-sm">40% carbo, 30% prot, 30% gord</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-600 text-sm">6 refeições ao dia</span>
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
                    onClick={handlePayment}
                    className="w-full bg-gradient-to-r from-[#019f80] to-[#4ade80] hover:from-[#017a63] hover:to-[#3bc473] text-white py-3 text-lg font-semibold"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Desbloquear Laudo Completo
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ReportViewer;
