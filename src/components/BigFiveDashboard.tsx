import { useState } from 'react';
import { Sparkles, Download, Trash2, ArrowLeft, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useBigFiveAssessments } from '@/hooks/useBigFiveAssessments';
import { generateBigFivePDF } from '@/utils/bigFivePdfGenerator';
import BigFiveReportViewer from './BigFiveReportViewer';

interface BigFiveDashboardProps {
  onBack: () => void;
  onNewAssessment?: () => void;
}

const BigFiveDashboard = ({ onBack, onNewAssessment }: BigFiveDashboardProps) => {
  const { toast } = useToast();
  const { assessments, loading, deleteAssessment } = useBigFiveAssessments();
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);

  const handleDownloadPDF = (assessment: any) => {
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

  const handleDelete = async (assessmentId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;

    const result = await deleteAssessment(assessmentId);
    
    if (result.success) {
      toast({
        title: "Avaliação excluída",
        description: "A avaliação foi removida com sucesso.",
      });
    } else {
      toast({
        title: "Erro ao excluir",
        description: result.error || "Não foi possível excluir a avaliação.",
        variant: "destructive",
      });
    }
  };

  if (selectedAssessment) {
    return (
      <BigFiveReportViewer
        assessment={selectedAssessment}
        onBack={() => setSelectedAssessment(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Avaliações Big Five</h1>
                <p className="text-sm text-muted-foreground">
                  Histórico de testes de personalidade
                </p>
              </div>
            </div>
          </div>
          {onNewAssessment && (
            <Button 
              onClick={onNewAssessment}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Nova Avaliação
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando avaliações...</p>
          </div>
        ) : assessments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Sparkles className="h-12 w-12 text-purple-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma avaliação encontrada</h3>
              <p className="text-muted-foreground">
                Você ainda não realizou nenhuma avaliação Big Five.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {assessments.map((assessment) => (
              <Card key={assessment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {assessment.patient_name || 'Autoavaliação'}
                        {assessment.is_premium && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                            Premium
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(assessment.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAssessment(assessment)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Relatório
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(assessment)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(assessment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {assessment.scores?.openness || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Abertura</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {assessment.scores?.conscientiousness || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Conscienciosidade</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {assessment.scores?.extraversion || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Extroversão</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {assessment.scores?.agreeableness || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Amabilidade</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {assessment.scores?.neuroticism || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Neuroticismo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BigFiveDashboard;
