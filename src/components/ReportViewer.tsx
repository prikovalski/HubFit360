
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import ReportHeader from './report/ReportHeader';
import MetricsOverview from './report/MetricsOverview';
import BasicAnalysisSection from './report/BasicAnalysisSection';
import PremiumSection from './report/PremiumSection';

const ReportViewer = ({ report, onBack }) => {
  const { userProfile, patientProfile } = useUserProfile();
  const [currentReport, setCurrentReport] = useState(report);

  // Verificar o status atual da avaliação ao carregar o componente
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!userProfile?.id || !report.id) return;
      
      try {
        console.log('Verificando status da avaliação:', report.id);
        const { data, error } = await supabase
          .from('assessments')
          .select('status')
          .eq('id', report.id)
          .eq('user_id', userProfile.id)
          .single();

        if (error) {
          console.error('Erro ao verificar status do pagamento:', error);
          return;
        }

        if (data && data.status !== currentReport.status) {
          console.log('Status atualizado de', currentReport.status, 'para', data.status);
          setCurrentReport({ ...currentReport, status: data.status });
          
          if (data.status === 'paid') {
            toast({
              title: "Pagamento confirmado!",
              description: "Seu laudo completo foi desbloqueado",
            });
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    };

    checkPaymentStatus();
    
    // Verificar o status a cada 10 segundos por 2 minutos após carregar a página
    const interval = setInterval(checkPaymentStatus, 10000);
    const timeout = setTimeout(() => clearInterval(interval), 120000); // 2 minutos
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [userProfile?.id, report.id, currentReport.status]);

  const handlePaymentSuccess = async () => {
    toast({
      title: "Pagamento aprovado!",
      description: "Laudo completo desbloqueado com sucesso",
    });
    
    // Verificar o status atualizado da avaliação
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('status')
        .eq('id', report.id)
        .eq('user_id', userProfile.id)
        .single();

      if (!error && data) {
        setCurrentReport({ ...currentReport, status: data.status });
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const isPaid = currentReport.status === 'paid';

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <ReportHeader 
          report={currentReport} 
          onBack={onBack} 
          isPaid={isPaid} 
        />

        <MetricsOverview report={currentReport} />

        <BasicAnalysisSection 
          report={currentReport} 
          userProfile={userProfile}
          patientProfile={patientProfile}
        />

        <PremiumSection 
          report={currentReport} 
          isPaid={isPaid} 
          onPaymentSuccess={handlePaymentSuccess} 
        />
      </div>
    </div>
  );
};

export default ReportViewer;
