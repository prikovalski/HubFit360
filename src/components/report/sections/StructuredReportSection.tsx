
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

  if (sections.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white mb-6">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <CardTitle className="text-xl text-gray-800 flex items-center">
            <FileJson className="w-6 h-6 mr-3 text-gray-600" />
            Relatório Detalhado
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-gray-600 italic">
            Relatório não disponível em formato estruturado. Verifique os logs do console para mais detalhes.
          </div>
        </CardContent>
      </Card>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StructuredReportSection;
