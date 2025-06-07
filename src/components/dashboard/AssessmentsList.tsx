
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Download, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { generateAssessmentPDF } from '@/utils/pdfGenerator';

interface Assessment {
  id: string;
  created_at: string;
  body_fat_percentage: number;
  lean_mass: number;
  bmi: number;
  status: string;
  assessment_text: string;
}

interface AssessmentsListProps {
  assessments: Assessment[];
  loading: boolean;
  onReportClick: (assessment: Assessment) => void;
  onNewAssessment: () => void;
}

const AssessmentsList = ({ assessments, loading, onReportClick, onNewAssessment }: AssessmentsListProps) => {
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-[#019f80] hover:bg-[#017a63]">Completo</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processando</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const handleDownloadPDF = (assessment: Assessment, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const adaptedReport = {
        id: assessment.id,
        date: assessment.created_at,
        status: 'completed',
        preview: {
          leanMass: `${assessment.lean_mass?.toFixed(1) || 'N/A'}kg`,
          bodyFat: `${assessment.body_fat_percentage?.toFixed(1) || 'N/A'}%`,
          bmi: assessment.bmi?.toFixed(1) || 'N/A'
        }
      };
      
      const doc = generateAssessmentPDF(adaptedReport);
      const fileName = `avaliacao-hubfit360-${new Date(assessment.created_at).toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "PDF gerado com sucesso!",
        description: "Seu laudo foi baixado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o arquivo. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-gray-800 flex items-center">
          <FileText className="w-6 h-6 mr-3 text-[#019f80]" />
          Histórico de Avaliações
        </CardTitle>
        <CardDescription>
          Acesse suas avaliações físicas e acompanhe seu progresso
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#019f80]" />
            <span className="ml-2 text-gray-600">Carregando avaliações...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div 
                key={assessment.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-[#019f80]/30"
                onClick={() => onReportClick(assessment)}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Avaliação de {new Date(assessment.created_at).toLocaleDateString('pt-BR')}
                      </h3>
                      {getStatusBadge(assessment.status)}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Gordura Corporal:</span>
                        <div className="font-semibold text-[#019f80]">
                          {assessment.body_fat_percentage?.toFixed(1) || 'N/A'}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Massa Magra:</span>
                        <div className="font-semibold text-[#019f80]">
                          {assessment.lean_mass?.toFixed(1) || 'N/A'}kg
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">IMC:</span>
                        <div className="font-semibold text-[#019f80]">
                          {assessment.bmi?.toFixed(1) || 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    {assessment.assessment_text && (
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                        {assessment.assessment_text.substring(0, 150)}...
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {assessment.status === 'completed' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-[#019f80] text-[#019f80] hover:bg-[#019f80] hover:text-white"
                        onClick={(e) => handleDownloadPDF(assessment, e)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                    )}
                    
                    <Button 
                      size="sm"
                      className="bg-[#019f80] hover:bg-[#017a63] text-white"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {assessments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nenhuma avaliação encontrada
                </h3>
                <p className="text-gray-500 mb-6">
                  Faça sua primeira avaliação física para começar
                </p>
                <Button 
                  onClick={onNewAssessment}
                  className="bg-[#019f80] hover:bg-[#017a63] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Fazer Primeira Avaliação
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssessmentsList;
