import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';

export interface TDAHAssessment {
  id: string;
  user_id: number;
  patient_name?: string;
  patient_gender?: string;
  patient_age?: number;
  patient_birth_date?: string;
  assessment_type: string;
  assessment_method?: string;
  responses: any;
  score: number;
  classification: string;
  recommendations?: string;
  full_report?: string;
  has_detailed_analysis: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useTDAHAssessments = () => {
  const [assessments, setAssessments] = useState<TDAHAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useUserProfile();

  const fetchAssessments = async () => {
    if (!userProfile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('tdah_assessments')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setAssessments(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar avaliações TDAH:', err);
      setError(err.message || 'Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.id) {
      fetchAssessments();
    }
  }, [userProfile?.id]);

  const deleteAssessment = async (assessmentId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('tdah_assessments')
        .delete()
        .eq('id', assessmentId);

      if (deleteError) throw deleteError;

      setAssessments(prev => prev.filter(a => a.id !== assessmentId));
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao deletar avaliação:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    assessments,
    loading,
    error,
    fetchAssessments,
    deleteAssessment,
    totalAssessments: assessments.length,
  };
};
