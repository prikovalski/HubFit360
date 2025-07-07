
import { useState, useEffect, useCallback } from 'react';
import { useUserProfile } from './useUserProfile';
import { useUserCredits } from './useUserCredits';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

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
}

interface DashboardData {
  assessments: Assessment[];
  assessmentsLoading: boolean;
  assessmentsError: string | null;
  refetchAssessments: () => Promise<void>;
}

export const useDashboardData = (): DashboardData => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assessmentsLoading, setAssessmentsLoading] = useState(true);
  const [assessmentsError, setAssessmentsError] = useState<string | null>(null);
  const { userProfile } = useUserProfile();
  const { toast } = useToast();

  const fetchAssessments = useCallback(async () => {
    if (!userProfile?.id) return;

    try {
      setAssessmentsLoading(true);
      setAssessmentsError(null);

      // Buscar avaliações com informações de pagamento e transações de crédito
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          id,
          created_at,
          age,
          body_fat_percentage,
          lean_mass,
          bmi,
          fat_mass,
          status,
          assessment_text,
          tier,
          patient_name,
          patient_goal,
          payments!left (
            id,
            status,
            paid_at
          ),
          credit_transactions!left (
            id,
            type,
            amount,
            description
          )
        `)
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erro ao buscar avaliações:', error);
        setAssessmentsError('Falha ao carregar avaliações');
        toast({
          title: "Erro",
          description: "Falha ao carregar avaliações. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // Transformar dados com verificação correta de status
      const transformedAssessments = (data || []).map(assessment => {
        // Para avaliações premium, verificar se foi paga ou feita via créditos
        let isPaid = false;
        let upgradeViaCredits = false;

        if (assessment.tier === 'premium') {
          // Verificar se tem pagamento confirmado
          const hasPaidPayment = assessment.payments && 
            assessment.payments.some((p: any) => p.status === 'paid');
          
          // Verificar se foi feita via créditos (transação de débito/uso)
          const hasUsageCredit = assessment.credit_transactions && 
            assessment.credit_transactions.some((t: any) => 
              (t.type === 'debit' || t.type === 'usage') && t.amount > 0
            );

          isPaid = hasPaidPayment || hasUsageCredit;
          upgradeViaCredits = hasUsageCredit && !hasPaidPayment;
        }

        // Para avaliações básicas, sempre são consideradas "pagas" (não precisam de pagamento)
        if (assessment.tier === 'basic') {
          isPaid = true;
        }

        return {
          ...assessment,
          assessmentText: assessment.assessment_text,
          payment_status: isPaid ? 'paid' : 'pending',
          upgrade_via_credits: upgradeViaCredits,
          preview: {
            leanMass: assessment.lean_mass ? `${assessment.lean_mass.toFixed(1)}kg` : 'N/A',
            bodyFat: assessment.body_fat_percentage ? `${assessment.body_fat_percentage.toFixed(1)}%` : 'N/A',
            bmi: assessment.bmi ? assessment.bmi.toFixed(1) : 'N/A',
            fatMass: assessment.fat_mass ? `${assessment.fat_mass.toFixed(1)}kg` : 'N/A',
            summary: assessment.assessment_text || ''
          }
        };
      });
      
      console.log('Avaliações processadas:', transformedAssessments);
      setAssessments(transformedAssessments);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      setAssessmentsError('Erro inesperado ao carregar avaliações');
    } finally {
      setAssessmentsLoading(false);
    }
  }, [userProfile?.id, toast]);

  useEffect(() => {
    if (userProfile?.id) {
      fetchAssessments();
    }
  }, [userProfile?.id, fetchAssessments]);

  return {
    assessments,
    assessmentsLoading,
    assessmentsError,
    refetchAssessments: fetchAssessments
  };
};
