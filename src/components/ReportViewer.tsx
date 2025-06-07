import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { Report } from '@/types/report';
import ReportHeader from './report/ReportHeader';
import MetricsOverview from './report/MetricsOverview';
import BasicAnalysisSection from './report/BasicAnalysisSection';
import PremiumSection from './report/PremiumSection';

const ReportViewer = ({ report, onBack }) => {
  const { userProfile, patientProfile } = useUserProfile();
  const [currentReport, setCurrentReport] = useState(report);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

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

  const handleManualPaymentCheck = async () => {
    if (!report.id) return;
    
    setIsCheckingPayment(true);
    
    try {
      console.log('Verificando pagamento manualmente para assessment:', report.id);
      
      const { data, error } = await supabase.functions.invoke('check-payment-status', {
        body: { assessmentId: report.id }
      });

      if (error) {
        console.error('Erro ao verificar pagamento:', error);
        toast({
          title: "Erro",
          description: "Erro ao verificar status do pagamento. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      console.log('Resultado da verificação:', data);
      
      if (data.status === 'paid') {
        setCurrentReport({ ...currentReport, status: 'paid' });
        toast({
          title: "Pagamento aprovado!",
          description: "Laudo completo desbloqueado com sucesso",
        });
      } else if (data.status === 'failed') {
        toast({
          title: "Pagamento rejeitado",
          description: "Seu pagamento foi rejeitado ou cancelado. Tente novamente.",
          variant: "destructive"
        });
      } else if (data.status === 'pending') {
        toast({
          title: "Pagamento em processamento",
          description: "Seu pagamento ainda está sendo processado. Aguarde alguns minutos.",
        });
      } else if (data.status === 'no_payment') {
        toast({
          title: "Nenhum pagamento encontrado",
          description: "Nenhum pagamento pendente foi encontrado para esta avaliação.",
        });
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar status do pagamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCheckingPayment(false);
    }
  };

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
          userProfile={userProfile}
          patientProfile={patientProfile}
          onBack={onBack} 
          isPaid={isPaid}
          onManualPaymentCheck={handleManualPaymentCheck}
          isCheckingPayment={isCheckingPayment}
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
