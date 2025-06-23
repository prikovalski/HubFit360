
import { useState, useEffect } from 'react';
import { useUserProfile } from './useUserProfile';
import { supabase } from '@/integrations/supabase/client';

interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  source: string;
  description: string;
  created_at: string;
}

interface UserCredits {
  balance: number;
  has_credits: boolean;
  transactions: CreditTransaction[];
}

export const useUserCredits = () => {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useUserProfile();

  const fetchCredits = async () => {
    if (!userProfile?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.functions.invoke('check-user-credits');

      if (fetchError) throw fetchError;

      setCredits(data);
    } catch (err: any) {
      console.error('Erro ao buscar créditos:', err);
      setError(err.message || 'Erro ao carregar créditos');
      setCredits({ balance: 0, has_credits: false, transactions: [] });
    } finally {
      setLoading(false);
    }
  };

  const consumeCredit = async (assessmentId: string) => {
    try {
      const { data, error: consumeError } = await supabase.functions.invoke('consume-credit', {
        body: { assessment_id: assessmentId }
      });

      if (consumeError) throw consumeError;

      // Atualizar créditos localmente
      if (credits) {
        setCredits({
          ...credits,
          balance: data.new_balance,
          has_credits: data.new_balance > 0
        });
      }

      return data;
    } catch (err: any) {
      console.error('Erro ao consumir crédito:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (userProfile?.id) {
      fetchCredits();
    }
  }, [userProfile?.id]);

  return {
    credits,
    loading,
    error,
    fetchCredits,
    consumeCredit,
    hasCredits: credits?.has_credits || false,
    balance: credits?.balance || 0
  };
};
