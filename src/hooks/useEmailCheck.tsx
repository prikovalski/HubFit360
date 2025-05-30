
import { supabase } from '@/integrations/supabase/client';

export const useEmailCheck = () => {
  const checkEmailExists = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy-password'
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return true;
        }
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  };

  return { checkEmailExists };
};
