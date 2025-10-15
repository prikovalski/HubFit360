import { ArrowLeft, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { generateBigFivePDF } from '@/utils/bigFivePdfGenerator';

interface BigFiveReportViewerProps {
  assessment: any;
  onBack: () => void;
}

const BigFiveReportViewer = ({ assessment, onBack }: BigFiveReportViewerProps) => {
  const { toast } = useToast();

  const handleDownloadPDF = () => {
    try {
      const pdf = generateBigFivePDF({ assessment });
      const fileName = `big-five-${assessment.patient_name || 'avaliacao'}-${new Date(assessment.created_at).toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "PDF gerado com sucesso!",
        description: "O download do relatório foi iniciado.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive",
      });
    }
  };

  const scores = assessment.scores || {};

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {assessment.patient_name || 'Autoavaliação'}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Realizada em {new Date(assessment.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              {assessment.is_premium && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  Premium
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Resultados dos Cinco Grandes Fatores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Abertura a Experiências</span>
                <span className="text-purple-600 font-bold">{scores.openness || 0}/50</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-600 h-3 rounded-full"
                  style={{ width: `${((scores.openness || 0) / 50) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Conscienciosidade</span>
                <span className="text-blue-600 font-bold">{scores.conscientiousness || 0}/50</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${((scores.conscientiousness || 0) / 50) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Extroversão</span>
                <span className="text-green-600 font-bold">{scores.extraversion || 0}/50</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full"
                  style={{ width: `${((scores.extraversion || 0) / 50) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Amabilidade</span>
                <span className="text-yellow-600 font-bold">{scores.agreeableness || 0}/50</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-600 h-3 rounded-full"
                  style={{ width: `${((scores.agreeableness || 0) / 50) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Neuroticismo</span>
                <span className="text-red-600 font-bold">{scores.neuroticism || 0}/50</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-600 h-3 rounded-full"
                  style={{ width: `${((scores.neuroticism || 0) / 50) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {assessment.is_premium && assessment.full_report && (
          <Card>
            <CardHeader>
              <CardTitle>Análise Detalhada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{assessment.full_report}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!assessment.is_premium && (
          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Análise Premium Disponível</h3>
              <p className="text-muted-foreground mb-4">
                Desbloqueie uma análise detalhada e personalizada da sua personalidade.
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Fazer Upgrade
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BigFiveReportViewer;
