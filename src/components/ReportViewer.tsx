
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import ReportHeader from './report/ReportHeader';
import MetricsOverview from './report/MetricsOverview';
import BasicAnalysisSection from './report/BasicAnalysisSection';
import PremiumSection from './report/PremiumSection';

const ReportViewer = ({ report, onBack }) => {
  const handlePaymentSuccess = () => {
    toast({
      title: "Pagamento aprovado!",
      description: "Laudo completo desbloqueado com sucesso",
    });
    // Recarregar a página para atualizar o status
    window.location.reload();
  };

  const isPaid = report.status === 'paid';

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <ReportHeader 
          report={report} 
          onBack={onBack} 
          isPaid={isPaid} 
        />

        <MetricsOverview report={report} />

        <BasicAnalysisSection report={report} />

        <PremiumSection 
          report={report} 
          isPaid={isPaid} 
          onPaymentSuccess={handlePaymentSuccess} 
        />
      </div>
    </div>
  );
};

export default ReportViewer;
