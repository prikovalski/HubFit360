import { Brain, Plus, Trash2, FileText, Calendar, Sparkles, BarChart3, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTDAHAssessments } from '@/hooks/useTDAHAssessments';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

interface TDAHDashboardProps {
  onNavigate: (page: string, data?: any) => void;
}

const TDAHDashboard = ({ onNavigate }: TDAHDashboardProps) => {
  const { toast } = useToast();
  const { assessments, loading, deleteAssessment } = useTDAHAssessments();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!assessmentToDelete) return;

    const result = await deleteAssessment(assessmentToDelete);
    
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

    setDeleteDialogOpen(false);
    setAssessmentToDelete(null);
  };

  const openDeleteDialog = (assessmentId: string) => {
    setAssessmentToDelete(assessmentId);
    setDeleteDialogOpen(true);
  };

  const getClassificationColor = (classification: string) => {
    switch (classification?.toLowerCase()) {
      case 'improvável':
        return 'bg-green-500/10 text-green-700';
      case 'possível':
        return 'bg-yellow-500/10 text-yellow-700';
      case 'provável':
        return 'bg-orange-500/10 text-orange-700';
      case 'altamente provável':
        return 'bg-red-500/10 text-red-700';
      default:
        return 'bg-gray-500/10 text-gray-700';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-foreground">Avaliações de TDAH</h1>
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 gap-1">
                  <Sparkles className="h-3 w-3" />
                  Novo
                </Badge>
              </div>
              <p className="text-muted-foreground">Questionários baseados em escalas clínicas validadas</p>
            </div>
          </div>
          <Button 
            onClick={() => onNavigate('tdah-assessment')} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover-scale"
            size="lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Avaliação
          </Button>
        </div>
      </div>

      {/* Stats Card */}
      <Card className="mb-8 animate-fade-in border-2 border-blue-500/20" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg hover-scale transition-all duration-300 hover:shadow-lg">
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {assessments.length}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Total de Avaliações</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessments List */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Carregando avaliações...</p>
          </CardContent>
        </Card>
      ) : assessments.length === 0 ? (
        <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-12 text-center">
            <div className="mb-6 inline-block p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full">
              <Brain className="h-16 w-16 text-blue-600" />
            </div>
            <p className="text-xl font-semibold text-foreground mb-2">
              Comece sua primeira avaliação TDAH
            </p>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              O questionário ASRS-18 é uma ferramenta validada cientificamente para triagem de TDAH em adultos.
              Leva apenas 5-10 minutos para completar.
            </p>
            <Button 
              onClick={() => onNavigate('tdah-assessment')} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover-scale"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Criar Primeira Avaliação
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {assessments.map((assessment, index) => (
            <Card 
              key={assessment.id} 
              className="hover:shadow-lg transition-all duration-300 hover-scale border-l-4 border-l-blue-500 animate-fade-in"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-lg">
                        {assessment.patient_name || 'Autoavaliação'}
                      </h3>
                      <Badge className={getClassificationColor(assessment.classification)}>
                        {assessment.classification}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Pontuação</p>
                        <p className="font-medium">
                          {assessment.score}/{assessment.assessment_method?.includes('DIVA') ? 18 : 72}
                        </p>
                      </div>
                      {assessment.patient_age && (
                        <div>
                          <p className="text-muted-foreground">Idade</p>
                          <p className="font-medium">{assessment.patient_age} anos</p>
                        </div>
                      )}
                      {assessment.patient_gender && (
                        <div>
                          <p className="text-muted-foreground">Gênero</p>
                          <p className="font-medium">
                            {assessment.patient_gender === 'MALE' ? 'Masculino' : 
                             assessment.patient_gender === 'FEMALE' ? 'Feminino' : 'Outro'}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Data</p>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(assessment.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => onNavigate('tdah-report', assessment)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover-scale"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Ver Relatório
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDeleteDialog(assessment.id)}
                      className="hover:bg-destructive/10 hover:border-destructive"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <Card className="border-blue-200/40 hover:border-blue-400/60 transition-all duration-300 hover-scale">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Sobre as Avaliações TDAH
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              As avaliações de TDAH do HubFit360 são baseadas em questionários validados cientificamente, 
              incluindo o ASRS-18 (Adult ADHD Self-Report Scale) para adultos.
            </p>
            <p>
              Essas ferramentas ajudam a identificar sinais de Transtorno de Déficit de Atenção e 
              Hiperatividade, fornecendo orientações sobre próximos passos.
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200/40 hover:border-purple-400/60 transition-all duration-300 hover-scale bg-gradient-to-br from-blue-50/30 to-purple-50/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Você responderá a um questionário com 18 perguntas sobre comportamentos e sintomas 
              relacionados ao TDAH.
            </p>
            <p>
              Com base nas suas respostas, será gerado um relatório com pontuação e classificação, 
              além de recomendações personalizadas. Gere também uma análise detalhada por IA.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TDAHDashboard;