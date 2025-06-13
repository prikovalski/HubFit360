
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeleteProfile = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const deleteProfile = async (): Promise<boolean> => {
    setLoading(true);
    
    try {
      console.log('Iniciando exclusão do perfil...');
      
      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      // Call the edge function to delete all user data
      const { data, error } = await supabase.functions.invoke('delete-user-profile', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Erro na edge function:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao excluir perfil');
      }

      console.log('Perfil excluído com sucesso');
      
      toast({
        title: "Perfil excluído",
        description: "Sua conta foi excluída permanentemente.",
      });

      return true;

    } catch (error) {
      console.error('Erro ao excluir perfil:', error);
      
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao excluir perfil. Tente novamente.",
        variant: "destructive"
      });

      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteProfile,
    loading
  };
};
