
import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { generateAssessmentPDF } from '@/utils/pdfGenerator';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AssessmentsListSkeleton } from "@/components/ui/assessment-skeleton";

interface Assessment {
  id: string;
  created_at: string;
  body_fat_percentage: number;
  lean_mass: number;
  bmi: number;
  fat_mass: number;
  status: string;
  assessment_text: string;
  tier: string;
  payment_status?: string;
  upgrade_via_credits?: boolean;
  patient_name?: string;
  preview?: {
    leanMass: string;
    bodyFat: string;
    bmi: string;
    fatMass: string;
    summary: string;
  };
}

interface OptimizedAssessmentsListProps {
  assessments: Assessment[];
  loading: boolean;
  error: string | null;
  onReportClick: (assessment: Assessment) => void;
  onNewAssessment: () => void;
}

const OptimizedAssessmentsList = memo(({ 
  assessments, 
  loading, 
  error,
  onReportClick, 
  onNewAssessment 
}: OptimizedAssessmentsListProps) => {
  const { toast } = useToast();
  const { userProfile, patientProfile } = useUserProfile();

  const getDisplayName = (assessment: Assessment) => {
    return assessment.patient_name || userProfile?.name || 'Usuário';
  };

  const getStatusBadge = (assessment: Assessment) => {
    // Lógica simplificada de status
    if (assessment.tier === 'basic') {
      return <Badge className="bg-[#019f80] hover:bg-[#017a63]">Básica Completa</Badge>;
    }
    
    if (assessment.tier === 'premium') {
      const isPaid = assessment.payment_status === 'paid' || assessment.upgrade_via_credits === true;
      if (isPaid) {
        return <Badge className="bg-[#019f80] hover:bg-[#017a63]">Premium Completa</Badge>;
      } else {
        return <Badge variant="secondary">Premium Pendente</Badge>;
      }
    }
    
    return <Badge variant="outline">Processando</Badge>;
  };

  const handleDownloadPDF = (assessment: Assessment, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const adaptedReport = {
        id: assessment.id,
        date: assessment.created_at,
        status: 'completed',
        assessmentText: assessment.assessment_text,
        preview: assessment.preview || {
          leanMass: `${assessment.lean_mass?.toFixed(1) || 'N/A'}kg`,
          bodyFat: `${assessment.body_fat_percentage?.toFixed(1) || 'N/A'}%`,
          bmi: assessment.bmi?.toFixed(1) || 'N/A',
          fatMass: `${assessment.fat_mass?.toFixed(1) || 'N/A'}kg`
        }
      };
      
      const doc = generateAssessmentPDF({ 
        report: adaptedReport, 
        userProfile, 
        patientProfile 
      });
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

  if (error) {
    return (
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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
          <AssessmentsListSkeleton count={3} />
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
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {getDisplayName(assessment)}
                      </h3>
                      {getStatusBadge(assessment)}
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-3">
                      Avaliação realizada em {new Date(assessment.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-[#019f80] text-[#019f80] hover:bg-[#019f80] hover:text-white"
                      onClick={(e) => handleDownloadPDF(assessment, e)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    
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
});

OptimizedAssessmentsList.displayName = 'OptimizedAssessmentsList';

export default OptimizedAssessmentsList;
