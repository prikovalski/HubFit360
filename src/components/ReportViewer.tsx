
import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReportHeader from './report/ReportHeader';
import BasicAnalysisSection from './report/BasicAnalysisSection';
import PremiumSection from './report/PremiumSection';
import UpgradeModal from './report/UpgradeModal';
import LoggedPageLayout from '@/components/layout/LoggedPageLayout';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';

interface Report {
  id: string;
  date: string;
  status: string;
  tier: string;
  age: number;
  assessmentText: string;
  payment_status?: string;
  upgrade_via_credits?: boolean;
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [currentReport, setCurrentReport] = useState(report);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
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

  // Verificar se a avaliação foi paga via transação de crédito
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (currentReport.tier === 'basic') {
        setIsPaid(true);
        setLoading(false);
        return;
      }

      try {
        const { data: creditTransaction, error } = await supabase
          .from('credit_transactions')
          .select('*')
          .eq('assessment_id', currentReport.id)
          .eq('type', 'usage')
          .single();

        if (error || !creditTransaction) {
          setIsPaid(false);
        } else {
          setIsPaid(true);
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
        setIsPaid(false);
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [currentReport.id, currentReport.tier]);

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
      setLoading(true);
      
      const { data: assessmentData, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', currentReport.id)
        .single();

      if (error) {
        console.error('Erro ao buscar dados da avaliação:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados premium. Tente recarregar a página.",
          variant: "destructive"
        });
        return;
      }

      if (assessmentData) {
        // Atualizar o report com todos os dados atualizados
        setCurrentReport(prev => ({
          ...prev,
          ...assessmentData,
          tier: assessmentData.tier,
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
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeSuccess = async () => {
    // Após upgrade bem-sucedido, marcar como pago
    setIsPaid(true);

    // Atualizar o report para premium
    setCurrentReport({
      ...currentReport,
      tier: 'premium'
    });

    // Buscar os dados atualizados da avaliação premium
    await refetchAssessmentData();
  };

  const userName = userProfile?.name || 'Usuário';

  // Lógica simplificada de verificação
  const isBasic = currentReport.tier === 'basic';
  const isPremium = currentReport.tier === 'premium';

  if (loading) {
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
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          </div>
        </div>
      </LoggedPageLayout>
    );
  }

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
            isPaid={isPaid} 
            onBack={onBack} 
          />
          
          <div className="space-y-8">
            <BasicAnalysisSection 
              report={currentReport} 
              userProfile={userProfile} 
              patientProfile={patientProfile} 
            />

            {isPremium && isPaid ? (
              <>
                <PremiumSection 
                  report={currentReport} 
                  isPaid={isPaid} 
                  onPaymentSuccess={() => {}} 
                />
              </>
            ) : isBasic ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  🎉 Análise Básica Completa!
                </h3>
                <p className="text-gray-700 mb-4">
                  Sua avaliação básica foi processada com sucesso. Para desbloquear análises 
                  avançadas, recomendações nutricionais personalizadas e projeção de resultados, 
                  faça o upgrade para a versão premium.
                </p>
                <button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
                >
                  Fazer Upgrade para Premium
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        assessmentId={currentReport.id} 
        onUpgradeSuccess={handleUpgradeSuccess} 
      />
    </LoggedPageLayout>
  );
};

export default ReportViewer;
