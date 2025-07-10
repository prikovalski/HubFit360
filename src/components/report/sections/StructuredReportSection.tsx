
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertTriangle } from 'lucide-react';

interface StructuredReportSectionProps {
  assessmentText: string;
}

const StructuredReportSection = ({ assessmentText }: StructuredReportSectionProps) => {
  console.log('=== TEXTO RECEBIDO PARA ESTRUTURAÇÃO ===');
  console.log(assessmentText);
  console.log('=== FIM DO TEXTO ===');

  function parseStructuredReport(text: string) {
    if (!text) return null;

    // Remover apenas as marcações de código
    const cleanText = text.replace(/```/g, '').trim();
    
    const sections = {
      avaliacaoCorporal: '',
      gastoEnergetico: '',
      planejamentoNutricional: '',
      projecaoResultados: '',
      metodosUtilizados: ''
    };

    // Dividir por seções principais
    const avaliacaoMatch = cleanText.match(/AVALIAÇÃO CORPORAL([\s\S]*?)(?=GASTO ENERGÉTICO|$)/i);
    if (avaliacaoMatch) sections.avaliacaoCorporal = avaliacaoMatch[1].trim();

    const gastoMatch = cleanText.match(/GASTO ENERGÉTICO([\s\S]*?)(?=PLANEJAMENTO NUTRICIONAL|$)/i);
    if (gastoMatch) sections.gastoEnergetico = gastoMatch[1].trim();

    const planejamentoMatch = cleanText.match(/PLANEJAMENTO NUTRICIONAL([\s\S]*?)(?=PROJEÇÃO DE RESULTADOS|$)/i);
    if (planejamentoMatch) sections.planejamentoNutricional = planejamentoMatch[1].trim();

    const projecaoMatch = cleanText.match(/PROJEÇÃO DE RESULTADOS([\s\S]*?)(?=MÉTODOS UTILIZADOS|$)/i);
    if (projecaoMatch) sections.projecaoResultados = projecaoMatch[1].trim();

    const metodosMatch = cleanText.match(/MÉTODOS UTILIZADOS([\s\S]*?)$/i);
    if (metodosMatch) sections.metodosUtilizados = metodosMatch[1].trim();

    return sections;
  }

  const sections = parseStructuredReport(assessmentText);

  if (!sections) {
    return (
      <div className="space-y-6 mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Relatório Detalhado</h3>
        
        <Card className="border-2 shadow-lg bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center text-gray-800">
              <FileText className="w-6 h-6 mr-3 text-[#019f80]" />
              Análise Completa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {assessmentText || 'Relatório não disponível.'}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
              <p className="text-xs text-gray-700">
                <strong>Nota:</strong> Esta análise foi gerada por inteligência artificial baseada nos seus dados físicos e perfil de saúde.
              </p>
              <p className="text-xs text-gray-700">
                <strong>Importante:</strong> Se as fotos não estiverem de acordo com o solicitado, a leitura será feita com base nos números informados no formulário.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Nota Técnica sobre Fórmula de Deurenberg */}
        <Card className="border-2 shadow-lg bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center text-amber-800">
              <AlertTriangle className="w-6 h-6 mr-3 text-amber-600" />
              Nota Técnica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-800 leading-relaxed">
              A fórmula de Deurenberg pode superestimar a % de gordura em pessoas com boa massa muscular, pois usa apenas IMC e idade, sem diferenciar entre peso de gordura e peso magro.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Relatório Detalhado</h3>
      
      {/* Avaliação Corporal */}
      {sections.avaliacaoCorporal && (
        <Card className="border-2 shadow-lg bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center text-gray-800">
              <FileText className="w-6 h-6 mr-3 text-[#019f80]" />
              Avaliação Corporal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {sections.avaliacaoCorporal}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gasto Energético */}
      {sections.gastoEnergetico && (
        <Card className="border-2 shadow-lg bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center text-gray-800">
              <FileText className="w-6 h-6 mr-3 text-[#019f80]" />
              Gasto Energético
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {sections.gastoEnergetico}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planejamento Nutricional */}
      {sections.planejamentoNutricional && (
        <Card className="border-2 shadow-lg bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center text-gray-800">
              <FileText className="w-6 h-6 mr-3 text-[#019f80]" />
              Planejamento Nutricional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {sections.planejamentoNutricional}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projeção de Resultados */}
      {sections.projecaoResultados && (
        <Card className="border-2 shadow-lg bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center text-gray-800">
              <FileText className="w-6 h-6 mr-3 text-[#019f80]" />
              Projeção de Resultados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {sections.projecaoResultados}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métodos Utilizados */}
      {sections.metodosUtilizados && (
        <Card className="border-2 shadow-lg bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center text-gray-800">
              <FileText className="w-6 h-6 mr-3 text-[#019f80]" />
              Métodos Utilizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {sections.metodosUtilizados}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nota Técnica sobre Fórmula de Deurenberg */}
      <Card className="border-2 shadow-lg bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center text-amber-800">
            <AlertTriangle className="w-6 h-6 mr-3 text-amber-600" />
            Nota Técnica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-800 leading-relaxed">
            A fórmula de Deurenberg pode superestimar a % de gordura em pessoas com boa massa muscular, pois usa apenas IMC e idade, sem diferenciar entre peso de gordura e peso magro.
          </p>
          
          <div className="mt-6 pt-4 border-t border-amber-200 space-y-2">
            <p className="text-xs text-amber-700">
              <strong>Nota:</strong> Esta análise foi gerada por inteligência artificial baseada nos seus dados físicos e perfil de saúde.
            </p>
            <p className="text-xs text-amber-700">
              <strong>Importante:</strong> Se as fotos não estiverem de acordo com o solicitado, a leitura será feita com base nos números informados no formulário.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StructuredReportSection;
