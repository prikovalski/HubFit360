import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Copy, CheckCircle2 } from 'lucide-react';
import ReportHeader from './report/ReportHeader';
import PersonalInfoSection from './report/PersonalInfoSection';
import EstimatesSection from './report/EstimatesSection';
import BodyMeasurementsSection from './report/BodyMeasurementsSection';
import BasicAnalysisSection from './report/BasicAnalysisSection';
import PremiumSection from './report/PremiumSection';
import LoggedPageLayout from '@/components/layout/LoggedPageLayout';

interface Report {
  id: string;
  date: string;
  status: string;
  age: number;
  assessmentText: string;
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

  const userName = report.age ? `Usuário` : undefined;

  return (
    <LoggedPageLayout
      userName={userName}
      onLogoClick={onLogoClick}
      onProfileClick={onProfileClick}
      onLogout={onLogout}
    >
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <ReportHeader report={report} onBack={onBack} />
          
          {report.status === 'paid' ? (
            <div className="space-y-8">
              <PersonalInfoSection report={report} />
              <EstimatesSection report={report} />
              <BodyMeasurementsSection report={report} />

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Análise Completa
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {report.assessmentText}
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleCopyToClipboard(report.assessmentText)}
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
            </div>
          ) : (
            <div className="space-y-8">
              <BasicAnalysisSection report={report} />
              <PremiumSection />
            </div>
          )}
        </div>
      </div>
    </LoggedPageLayout>
  );
};

export default ReportViewer;
