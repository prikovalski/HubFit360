
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileJson, Activity, Zap, Target, TrendingUp } from 'lucide-react';

interface StructuredReportSectionProps {
  assessmentText: string;
}

interface ReportSection {
  title: string;
  items: Array<{
    topic: string;
    description: string;
    value: string;
  }>;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const StructuredReportSection = ({ assessmentText }: StructuredReportSectionProps) => {
  console.log('=== TEXTO RECEBIDO PARA ESTRUTURAÇÃO ===');
  console.log(assessmentText);
  console.log('=== FIM DO TEXTO ===');

  // Função para redatar informações pessoais
  function redactPersonalInfo(text: string): string {
    if (!text) return '';
    const patterns = [
      /nome\s*[:：]/i,
      /profissional/i,
      /assinatura/i,
      /contato/i,
      /telefone/i,
      /e[- ]?mail/i,
      /cref/i,
      /crm/i,
      /cpf/i,
      /rg/i,
      /\bwhatsapp\b/i,
      /^\s*\*\*Nome do Avaliado:?\*\*.*$/i,
      /^\s*\*\*Data da Avalia[cç][aã]o:?\*\*.*$/i,
      /^\s*\*\*Avaliador:?\*\*.*$/i,
      /^\s*\*\*Local da Avalia[cç][aã]o:?\*\*.*$/i
    ];
    let filtered = text
      .split('\n')
      .filter(line => !patterns.some(pat => pat.test(line)))
      .join('\n');
    filtered = filtered.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email oculto]');
    filtered = filtered.replace(/\b\d{2,4}[ .-]?\d{4,5}[ .-]?\d{4}\b/g, '[telefone oculto]');
    return filtered;
  }

  const parseCSVReport = (text: string): ReportSection[] => {
    if (!text) return [];

    // Remove blocos de código se existirem
    let cleanText = text.replace(/```csv\n?/g, '').replace(/```\n?/g, '');
    
    const lines = cleanText.split('\n').filter(line => line.trim());
    const sections: Record<string, ReportSection> = {};

    // Configuração das seções com cores e ícones
    const sectionConfigs = {
      'AVALIAÇÃO CORPORAL': {
        icon: <Activity className="w-5 h-5" />,
        color: 'text-blue-700',
        bgColor: 'bg-blue-50 border-blue-200'
      },
      'GASTO ENERGÉTICO': {
        icon: <Zap className="w-5 h-5" />,
        color: 'text-orange-700',
        bgColor: 'bg-orange-50 border-orange-200'
      },
      'PLANEJAMENTO NUTRICIONAL': {
        icon: <Target className="w-5 h-5" />,
        color: 'text-green-700',
        bgColor: 'bg-green-50 border-green-200'
      },
      'PROJEÇÃO DE RESULTADOS': {
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'text-purple-700',
        bgColor: 'bg-purple-50 border-purple-200'
      },
      'MÉTODOS UTILIZADOS': {
        icon: <FileJson className="w-5 h-5" />,
        color: 'text-gray-700',
        bgColor: 'bg-gray-50 border-gray-200'
      }
    };

    lines.forEach((line, index) => {
      if (index === 0) return; // Pular cabeçalho

      const parts = line.split(',');
      if (parts.length >= 4) {
        const sectionName = parts[0].replace(/"/g, '').trim();
        const topic = parts[1].replace(/"/g, '').trim();
        const description = parts[2].replace(/"/g, '').trim();
        const value = parts[3].replace(/"/g, '').trim();

        if (!sections[sectionName]) {
          const config = sectionConfigs[sectionName] || sectionConfigs['MÉTODOS UTILIZADOS'];
          sections[sectionName] = {
            title: sectionName,
            items: [],
            ...config
          };
        }

        sections[sectionName].items.push({
          topic,
          description,
          value
        });
      }
    });

    return Object.values(sections);
  };

  const sections = parseCSVReport(assessmentText);
  const redactedText = assessmentText ? redactPersonalInfo(assessmentText) : '';

  if (sections.length === 0) {
    return (
      <div className="space-y-6 mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Relatório Detalhado</h3>
        <Card className="border-2 shadow-lg bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center text-gray-700">
              <FileJson className="w-6 h-6 mr-3 text-gray-600" />
              Relatório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 italic mb-4">
              Relatório não disponível em formato estruturado. Exibindo análise completa:
            </div>
            {redactedText && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                  {redactedText}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Relatório Detalhado</h3>
      
      {sections.map((section, index) => (
        <Card key={index} className={`border-2 shadow-lg ${section.bgColor}`}>
          <CardHeader className="pb-4">
            <CardTitle className={`text-lg font-bold flex items-center ${section.color}`}>
              {section.icon}
              <span className="ml-2">{section.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="border-l-4 border-gray-300 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-1">{item.topic}</h4>
                  <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                  {item.value !== '-' && (
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${section.color} ${section.bgColor}`}>
                      {item.value}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Análise da IA integrada no card */}
            {redactedText && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className={`font-semibold mb-3 flex items-center ${section.color}`}>
                  <span className="text-sm">💡 Análise Detalhada por IA</span>
                </h4>
                <div className="bg-white/70 rounded-lg p-4 border border-gray-200">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                    {/* Extrair apenas a parte relevante da análise para cada seção */}
                    {redactedText.split('\n').filter(line => 
                      line.toLowerCase().includes(section.title.toLowerCase()) ||
                      (section.title === 'AVALIAÇÃO CORPORAL' && (line.includes('gordura') || line.includes('massa') || line.includes('IMC'))) ||
                      (section.title === 'GASTO ENERGÉTICO' && (line.includes('metabol') || line.includes('energia') || line.includes('calor'))) ||
                      (section.title === 'PLANEJAMENTO NUTRICIONAL' && (line.includes('nutri') || line.includes('caloria') || line.includes('macro'))) ||
                      (section.title === 'PROJEÇÃO DE RESULTADOS' && (line.includes('resultado') || line.includes('expectativa') || line.includes('30 dias'))) ||
                      (section.title === 'MÉTODOS UTILIZADOS' && (line.includes('método') || line.includes('fórmula') || line.includes('equação')))
                    ).join('\n') || 'Análise detalhada disponível no contexto geral do relatório.'}
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    <strong>Nota:</strong> Esta análise foi gerada por inteligência artificial baseada nos seus dados físicos e perfil de saúde.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StructuredReportSection;
