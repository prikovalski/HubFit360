
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

      // Optimized query: select only needed fields and limit results
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          id,
          created_at,
          body_fat_percentage,
          lean_mass,
          bmi,
          fat_mass,
          status,
          assessment_text
        `)
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(20); // Limit to 20 most recent assessments

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

      // Transform data efficiently
      const transformedAssessments = (data || []).map(assessment => ({
        ...assessment,
        assessmentText: assessment.assessment_text,
        preview: {
          leanMass: assessment.lean_mass ? `${assessment.lean_mass.toFixed(1)}kg` : 'N/A',
          bodyFat: assessment.body_fat_percentage ? `${assessment.body_fat_percentage.toFixed(1)}%` : 'N/A',
          bmi: assessment.bmi ? assessment.bmi.toFixed(1) : 'N/A',
          fatMass: assessment.fat_mass ? `${assessment.fat_mass.toFixed(1)}kg` : 'N/A',
          summary: assessment.assessment_text || ''
        }
      }));
      
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
