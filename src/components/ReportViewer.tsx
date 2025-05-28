
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Lock, CreditCard, FileText, TrendingUp, Target, AlertCircle } from 'lucide-react';
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
      <div className="container mx-auto max-w-4xl">
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
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Massa Magra</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{report.preview.leanMass}</div>
              <p className="text-blue-100 text-sm">Músculos e ossos</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Massa Gorda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{report.preview.bodyFat}</div>
              <p className="text-orange-100 text-sm">Gordura corporal</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-[#019f80] to-[#4ade80] text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">IMC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{report.preview.bmi}</div>
              <p className="text-green-100 text-sm">Índice de massa corporal</p>
            </CardContent>
          </Card>
        </div>

        {/* Free Content */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 flex items-center">
              <FileText className="w-5 h-5 mr-3 text-[#019f80]" />
              Resumo da Avaliação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {report.preview.summary}
            </p>
            
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">✅ Análise Básica Incluída:</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Percentual de massa magra e massa gorda</li>
                <li>• Cálculo do IMC</li>
                <li>• Classificação geral da composição corporal</li>
                <li>• Resumo básico com observações iniciais</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Premium Content */}
        <Card className={`border-0 shadow-lg ${isPaid ? 'bg-white/90' : 'bg-gray-50/90'} backdrop-blur-sm relative overflow-hidden`}>
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-3 text-[#019f80]" />
              Análise Detalhada
              {!isPaid && <Lock className="w-5 h-5 ml-2 text-gray-400" />}
            </CardTitle>
          </CardHeader>
          
          <CardContent className={isPaid ? '' : 'filter blur-sm pointer-events-none'}>
            <div className="space-y-6">
              {/* Detailed Analysis */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Definição Muscular</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Apresenta boa definição muscular na região do abdômen e braços. 
                  Músculos do peitoral bem desenvolvidos. Recomenda-se manter o 
                  atual programa de treinos com foco em exercícios compostos.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Distribuição de Gordura</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Distribuição homogênea da gordura corporal, com leve concentração 
                  na região abdominal inferior. Padrão típico masculino com 
                  acúmulo central moderado.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Proporções Corporais</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Proporções equilibradas entre membros superiores e inferiores. 
                  Ombros proporcionais ao quadril. Estrutura óssea média com 
                  bom potencial para ganho de massa muscular.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Recomendações Personalizadas
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">Treino:</h4>
                    <ul className="text-blue-600 space-y-1">
                      <li>• 4-5x por semana de musculação</li>
                      <li>• Foco em exercícios compostos</li>
                      <li>• 2-3x cardio moderado</li>
                      <li>• Ênfase em core e estabilização</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">Dieta:</h4>
                    <ul className="text-blue-600 space-y-1">
                      <li>• 2200-2400 kcal/dia</li>
                      <li>• 2.2g proteína/kg peso</li>
                      <li>• 40% carbo, 30% prot, 30% gord</li>
                      <li>• 6 refeições ao dia</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          
          {!isPaid && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <Card className="border-0 shadow-xl bg-white max-w-md mx-4">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#019f80] to-[#4ade80] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">Laudo Completo</CardTitle>
                  <CardDescription>
                    Desbloqueie a análise detalhada e recomendações personalizadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <h4 className="font-semibold text-amber-800 mb-2 flex items-center text-sm">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Incluso no Laudo Completo:
                    </h4>
                    <ul className="text-amber-700 text-xs space-y-1">
                      <li>• Análise detalhada de definição muscular</li>
                      <li>• Mapeamento da distribuição de gordura</li>
                      <li>• Avaliação das proporções corporais</li>
                      <li>• Recomendações personalizadas de treino</li>
                      <li>• Plano nutricional específico</li>
                      <li>• Relatório completo em PDF</li>
                    </ul>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#019f80] mb-1">R$ 29,90</div>
                    <p className="text-gray-500 text-sm">Pagamento único</p>
                  </div>
                  
                  <Button 
                    onClick={handlePayment}
                    className="w-full bg-[#019f80] hover:bg-[#017a63] text-white"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
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
