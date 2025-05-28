
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, Target, Shield, Info } from 'lucide-react';

const AboutSection = ({ onBack }) => {
  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            onClick={onBack}
            variant="ghost" 
            className="mr-4 text-[#019f80] hover:bg-[#019f80]/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-4xl font-bold text-gray-800">Sobre a FitConnect</h1>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Importance Section */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#019f80] to-[#4ade80] rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800">
                  A Importância da Avaliação Física
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                Uma avaliação física precisa é fundamental para alcançar seus objetivos de forma eficiente e segura. 
                Conhecer sua composição corporal permite um direcionamento personalizado tanto para treinos quanto para dieta.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-[#019f80] text-lg">Benefícios para Treinos:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Definição de cargas adequadas</li>
                    <li>• Foco em áreas específicas</li>
                    <li>• Prevenção de lesões</li>
                    <li>• Monitoramento de progresso</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-[#019f80] text-lg">Benefícios para Dieta:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Cálculo preciso de calorias</li>
                    <li>• Distribuição de macronutrientes</li>
                    <li>• Estratégias personalizadas</li>
                    <li>• Resultados mais rápidos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Section */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#019f80] to-[#4ade80] rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800">
                  Como Nossa IA Avalia os Dados
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                Nossa inteligência artificial utiliza algoritmos avançados de análise de imagem e dados antropométricos 
                para fornecer uma avaliação completa da sua composição corporal.
              </p>
              
              <div className="bg-gradient-to-r from-[#019f80]/10 to-[#4ade80]/10 rounded-lg p-6 mt-6">
                <h3 className="font-semibold text-[#019f80] text-lg mb-4">Processo de Análise:</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#019f80] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                    <p>Análise das fotos (frente, lateral e costas) para identificar distribuição de massa</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#019f80] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                    <p>Cálculos baseados em peso, altura, idade e dados visuais</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#019f80] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                    <p>Comparação com banco de dados de composições corporais</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-[#019f80] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">4</div>
                    <p>Geração de relatório personalizado com recomendações</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer Section */}
          <Card className="border-0 shadow-lg bg-amber-50 border-amber-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-amber-800">
                  Informações Importantes
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-100 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 mb-2">⚠️ Aviso Importante</h3>
                <p className="text-amber-700 leading-relaxed">
                  Os resultados fornecidos pela FitConnect são <strong>estimativas aproximadas</strong> baseadas em 
                  análise de IA e não devem ser considerados como valores exatos. Para avaliações médicas precisas, 
                  consulte sempre um profissional qualificado.
                </p>
              </div>
              
              <div className="space-y-2 text-gray-600">
                <p>• Os dados são estimativas baseadas em algoritmos de IA</p>
                <p>• Recomendamos uso complementar a avaliações profissionais</p>
                <p>• Ideal para acompanhamento de progresso e direcionamento geral</p>
                <p>• Não substitui consultas médicas ou nutricionais especializadas</p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Section */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#019f80] to-[#4ade80] rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800">
                  Segurança e Privacidade
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                Seus dados e imagens são tratados com máxima segurança e confidencialidade:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-[#019f80]">Proteção de Dados:</h4>
                  <ul className="space-y-1 text-gray-600 text-sm">
                    <li>• Criptografia end-to-end</li>
                    <li>• Armazenamento seguro</li>
                    <li>• Acesso restrito</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-[#019f80]">Suas Imagens:</h4>
                  <ul className="space-y-1 text-gray-600 text-sm">
                    <li>• Processamento automatizado</li>
                    <li>• Não compartilhamento</li>
                    <li>• Exclusão sob demanda</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
