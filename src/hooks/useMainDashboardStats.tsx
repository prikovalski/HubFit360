import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';

interface MainDashboardStats {
  physicalCount: number;
  tdahCount: number;
  totalCount: number;
  recentAssessments: Array<{
    id: string;
    type: 'physical' | 'tdah';
    created_at: string;
    status: string;
  }>;
}

export const useMainDashboardStats = () => {
  const [stats, setStats] = useState<MainDashboardStats>({
    physicalCount: 0,
    tdahCount: 0,
    totalCount: 0,
    recentAssessments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useUserProfile();

  const fetchStats = async () => {
    if (!userProfile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar avaliações físicas
      const { data: physicalAssessments, error: physicalError } = await supabase
        .from('assessments')
        .select('id, created_at, status')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (physicalError) throw physicalError;

      // Buscar avaliações TDAH
      const { data: tdahAssessments, error: tdahError } = await supabase
        .from('tdah_assessments')
        .select('id, created_at, status')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (tdahError) throw tdahError;

      const physicalCount = physicalAssessments?.length || 0;
      const tdahCount = tdahAssessments?.length || 0;

      // Combinar e ordenar avaliações recentes (últimas 5)
      const recentPhysical = (physicalAssessments || []).slice(0, 3).map(a => ({
        ...a,
        type: 'physical' as const
      }));

      const recentTdah = (tdahAssessments || []).slice(0, 3).map(a => ({
        ...a,
        type: 'tdah' as const
      }));

      const combined = [...recentPhysical, ...recentTdah]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      setStats({
        physicalCount,
        tdahCount,
        totalCount: physicalCount + tdahCount,
        recentAssessments: combined
      });
    } catch (err: any) {
      console.error('Erro ao buscar estatísticas:', err);
      setError(err.message || 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.id) {
      fetchStats();
    }
  }, [userProfile?.id]);

  return {
    stats,
    loading,
    error,
    refetchStats: fetchStats
  };
};