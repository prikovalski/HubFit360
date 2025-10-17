import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePollockDashboardData = () => {
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    avgBodyFat: 0,
    lastAssessment: null as string | null,
  });
  const [loading, setLoading] = useState(true);

  const fetchAssessments = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user's internal ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) {
        throw new Error('User data not found');
      }

      // Fetch Pollock assessments
      const { data: pollockData, error: pollockError } = await supabase
        .from('pollock_assessments')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      if (pollockError) throw pollockError;

      const allAssessments = pollockData || [];
      setAssessments(allAssessments);

      // Calculate stats
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const thisMonthAssessments = allAssessments.filter(
        (a: any) => new Date(a.created_at) >= firstDayOfMonth
      );

      const avgBodyFat = allAssessments.length > 0
        ? allAssessments.reduce((sum: number, a: any) => sum + (a.body_fat_percentage || 0), 0) / allAssessments.length
        : 0;

      const lastAssessmentDate = allAssessments.length > 0
        ? allAssessments[0].created_at
        : null;

      setStats({
        total: allAssessments.length,
        thisMonth: thisMonthAssessments.length,
        avgBodyFat: Math.round(avgBodyFat * 10) / 10,
        lastAssessment: lastAssessmentDate,
      });

    } catch (error: any) {
      console.error('Error fetching Pollock assessments:', error);
      toast({
        title: 'Erro ao carregar avaliações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  return {
    assessments,
    stats,
    loading,
    refetch: fetchAssessments,
  };
};
