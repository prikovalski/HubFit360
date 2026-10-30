
import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReportHeader from './report/ReportHeader';
import BasicAnalysisSection from './report/BasicAnalysisSection';
import StructuredReportSection from './report/sections/StructuredReportSection';
import GenerateAnalysisCard from './report/GenerateAnalysisCard';
import ProfessionalDisclaimer from './report/ProfessionalDisclaimer';
import LoggedPageLayout from '@/components/layout/LoggedPageLayout';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';

interface Report {
  id: string;
  date: string;
  status: string;
  tier: 'basic' | 'detailed';
  age: number;
  assessmentText: string;
  patient_height?: number;
  patient_weight?: number;
  patient_name?: string;
  patient_gender?: string;
  patient_goal?: string;
  bodyFatPercentage?: number;
  leanMass?: number;
  fatMass?: number;
  bmi?: number;
  preview: {
    leanMass: string;
    bodyFat: string;
    bmi: string;
    fatMass: string;
    summary: string;
  };
}

interface ReportViewerProps {
  report: Report;
  onBack: () => void;
  onLogoClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const ReportViewer = ({
  report,
  onBack,
  onLogoClick,
  onProfileClick,
  onLogout,
  currentPage,
  onNavigate
}: ReportViewerProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [currentReport, setCurrentReport] = useState(report);
  const { userProfile, patientProfile } = useUserProfile();

  // Safety check - if report is null or undefined, show error
  if (!currentReport) {
    return (
      <LoggedPageLayout
        userName={userProfile?.name || ''}
        currentPage={currentPage}
        onLogoClick={onLogoClick}
        onProfileClick={onProfileClick}
        onLogout={onLogout}
        onNavigate={onNavigate}
      >
        <div className="container mx-auto p-6">
          <Button onClick={onBack} variant="ghost" className="gap-2 mb-4">
            Voltar
          </Button>
          <div className="text-center p-8">
            <p className="text-muted-foreground">Erro ao carregar relatório. Por favor, tente novamente.</p>
          </div>
        </div>
      </LoggedPageLayout>
    );
  }

  console.log('ReportViewer: Dados do report recebidos:', {
    id: currentReport.id,
    patient_height: currentReport.patient_height,
    patient_weight: currentReport.patient_weight,
    patient_name: currentReport.patient_name,
    patient_gender: currentReport.patient_gender,
    patient_goal: currentReport.patient_goal,
    hasPreview: !!currentReport.preview,
    tier: currentReport.tier
  });

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copiado!",
        description: "O texto foi copiado para a área de transferência."
      });
    } catch (err) {
      console.error('Falha ao copiar: ', err);
      toast({
        title: "Erro",
        description: "Falha ao copiar o texto para a área de transferência.",
        variant: "destructive"
      });
    }
  };

  const refetchAssessmentData = async () => {
    try {
      const { data: assessmentData, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', currentReport.id)
        .single();

      if (error) {
        console.error('Erro ao buscar dados da avaliação:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a análise detalhada. Tente recarregar a página.",
          variant: "destructive"
        });
        return;
      }

      if (assessmentData) {
        // Atualizar o report com todos os dados atualizados
        setCurrentReport(prev => ({
          ...prev,
          ...assessmentData,
          tier: assessmentData.tier as Report['tier'],
          assessmentText: assessmentData.assessment_text || prev.assessmentText
        }));
      }
    } catch (error) {
      console.error('Erro ao refazer busca da avaliação:', error);
      toast({
        title: "Erro",
        description: "Erro interno. Tente recarregar a página.",
        variant: "destructive"
      });
    }
  };

  const userName = userProfile?.name || 'Usuário';

  const hasDetailedAnalysis = currentReport.tier === 'detailed';

  return (
    <LoggedPageLayout 
      userName={userName}
      currentPage={currentPage}
      onLogoClick={onLogoClick} 
      onProfileClick={onProfileClick} 
      onLogout={onLogout}
      onNavigate={onNavigate}
    >
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <ReportHeader 
            report={currentReport} 
            userProfile={userProfile} 
            patientProfile={patientProfile} 
            onBack={onBack} 
          />
          
          <div className="space-y-8">
            <BasicAnalysisSection 
              report={currentReport} 
              userProfile={userProfile} 
              patientProfile={patientProfile} 
            />

            {hasDetailedAnalysis ? (
              <>
                {currentReport.assessmentText && (
                  <StructuredReportSection assessmentText={currentReport.assessmentText} />
                )}
                <ProfessionalDisclaimer />
              </>
            ) : (
              <GenerateAnalysisCard
                functionName="generate-body-analysis"
                assessmentId={currentReport.id}
                description="Gere uma análise completa com distribuição de gordura e massa muscular, recomendações nutricionais personalizadas e projeção de resultados."
                onGenerated={refetchAssessmentData}
              />
            )}
          </div>
        </div>
      </div>

    </LoggedPageLayout>
  );
};

export default ReportViewer;
