
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Calendar, User, ArrowLeft } from 'lucide-react';
import { generateAssessmentPDF } from '@/utils/pdfGenerator';
import { UserProfile, PatientProfile } from '@/types/report';

interface ReportHeaderProps {
  report: any;
  userProfile: UserProfile | null;
  patientProfile: PatientProfile | null;
  isPaid: boolean;
  onBack?: () => void;
  onManualPaymentCheck?: () => Promise<void>;
  isCheckingPayment?: boolean;
}

const ReportHeader = ({ 
  report, 
  userProfile, 
  patientProfile, 
  isPaid, 
  onBack,
  onManualPaymentCheck,
  isCheckingPayment 
}: ReportHeaderProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const doc = generateAssessmentPDF({ 
        report, 
        userProfile, 
        patientProfile 
      });
      
      const fileName = `laudo-avaliacao-${userProfile?.name?.replace(/\s+/g, '-').toLowerCase() || 'usuario'}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Criar preview a partir dos dados do report se não existir
  const preview = report?.preview || {
    leanMass: report?.leanMass ? `${report.leanMass.toFixed(1)}kg` : (report?.lean_mass ? `${report.lean_mass.toFixed(1)}kg` : 'N/A'),
    bodyFat: report?.bodyFatPercentage ? `${report.bodyFatPercentage.toFixed(1)}%` : (report?.body_fat_percentage ? `${report.body_fat_percentage.toFixed(1)}%` : 'N/A'),
    bmi: report?.bmi ? report.bmi.toFixed(1) : 'N/A'
  };

  const safeLeanMass = preview.leanMass || 'N/A';
  const safeBodyFat = preview.bodyFat || 'N/A';
  const safeBmi = preview.bmi || 'N/A';

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-r from-[#019f80] to-green-600 text-white mb-8">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 mr-3 p-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <CardTitle className="text-3xl font-bold flex items-center">
                <User className="w-8 h-8 mr-3" />
                Relatório de Avaliação
              </CardTitle>
            </div>
            <div className="flex items-center text-green-100 mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Gerado em {new Date(report.date || report.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            {userProfile?.name && (
              <p className="text-lg font-medium text-green-100">
                {userProfile.name}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            {onManualPaymentCheck && !isPaid && (
              <Button
                onClick={onManualPaymentCheck}
                disabled={isCheckingPayment}
                className="bg-white/20 text-white hover:bg-white/30 font-semibold px-4 py-2"
              >
                {isCheckingPayment ? 'Verificando...' : 'Verificar Pagamento'}
              </Button>
            )}
            
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="bg-white text-[#019f80] hover:bg-green-50 font-semibold px-6 py-3 text-lg"
            >
              <FileDown className="w-5 h-5 mr-2" />
              {isGeneratingPDF ? 'Gerando PDF...' : 'Baixar PDF'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{safeLeanMass}</div>
            <div className="text-green-100">Massa Magra</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{safeBodyFat}</div>
            <div className="text-green-100">Gordura Corporal</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{safeBmi}</div>
            <div className="text-green-100">IMC</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportHeader;
