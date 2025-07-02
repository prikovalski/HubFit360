
import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Copy, CheckCircle2 } from 'lucide-react';
import ReportHeader from './report/ReportHeader';
import BasicAnalysisSection from './report/BasicAnalysisSection';
import PremiumSection from './report/PremiumSection';
import UpgradeModal from './report/UpgradeModal';
import LoggedPageLayout from '@/components/layout/LoggedPageLayout';
import { useUserProfile } from '@/hooks/useUserProfile';

interface Report {
  id: string;
  date: string;
  status: string;
  tier: string;
  age: number;
  assessmentText: string;
  payment_status?: string;
  upgrade_via_credits?: boolean;
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
}

const ReportViewer = ({ report, onBack, onLogoClick, onProfileClick, onLogout }: ReportViewerProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [currentReport, setCurrentReport] = useState(report);
  const { userProfile, patientProfile } = useUserProfile();

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
        description: "O texto foi copiado para a área de transferência.",
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

  const handleUpgradeSuccess = () => {
    // Atualizar o report para premium
    setCurrentReport({
      ...currentReport,
      tier: 'premium',
      payment_status: 'paid'
    });
    
    // Recarregar a página para buscar os novos dados
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const userName = userProfile?.name || 'Usuário';
  
  // Verificar se o relatório está pago - considerando tanto pagamento quanto upgrade via créditos
  const isPaid = (currentReport.tier === 'premium') && 
    (currentReport.payment_status === 'paid' || currentReport.upgrade_via_credits === true);
  
  const isBasic = currentReport.tier === 'basic';

  return (
    <LoggedPageLayout
      userName={userName}
      onLogoClick={onLogoClick}
      onProfileClick={onProfileClick}
      onLogout={onLogout}
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

            {isPaid ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Análise Completa
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {currentReport.assessmentText}
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleCopyToClipboard(currentReport.assessmentText)}
                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                    disabled={copied}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>
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
            ) : (
              <PremiumSection 
                report={currentReport}
                isPaid={isPaid}
                onPaymentSuccess={() => window.location.reload()}
              />
            )}
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
