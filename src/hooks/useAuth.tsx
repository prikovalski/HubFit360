
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { validateEmail, validatePassword } from '@/utils/inputValidation';
import { useRateLimiter } from '@/hooks/useRateLimiter';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
  loginRateLimit: {
    isBlocked: boolean;
    remainingAttempts: number;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Rate limiting for login attempts
  const loginRateLimiter = useRateLimiter({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000 // 30 minutes block
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Set up auth state listener - fixed to remove async
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Use setTimeout for any async operations if needed
        setTimeout(() => {
          setLoading(false);
        }, 0);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata: any) => {
    // Validate inputs
    if (!validateEmail(email)) {
      return { 
        data: null, 
        error: { message: 'Email inválido' }
      };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { 
        data: null, 
        error: { message: passwordValidation.errors.join(', ') }
      };
    }

    // Create the auth user without email confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: undefined // Disable email confirmation completely
      }
    });

    if (authError) {
      return { data: authData, error: authError };
    }

    // If user was created successfully, wait for the trigger to create the user record and then update it
    if (authData.user) {
      try {
        console.log('Aguardando criação do usuário na tabela users...');
        
        // Aguardar um pouco para garantir que o trigger criou o usuário
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Buscar o usuário criado pelo trigger e atualizar com os dados completos
        let attempts = 0;
        const maxAttempts = 5;
        
        while (attempts < maxAttempts) {
          console.log(`Tentativa ${attempts + 1} de atualizar dados do usuário`);
          
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('auth_user_id', authData.user.id)
            .single();
          
          if (userData && !userError) {
            console.log('Usuário encontrado, atualizando dados:', userData);
            
            // Atualizar com os dados completos
            const updateData: any = {};
            
            if (metadata.birth_date) {
              updateData.birth_date = metadata.birth_date;
            }
            
            if (metadata.gender) {
              updateData.gender = metadata.gender;
            }
            
            if (metadata.name) {
              updateData.name = metadata.name;
            }
            
            if (metadata.profession) {
              updateData.profession = metadata.profession;
            }
            
            if (metadata.role) {
              updateData.role = metadata.role;
            }
            
            console.log('Dados para atualização:', updateData);
            
            const { error: updateError } = await supabase
              .from('users')
              .update(updateData)
              .eq('auth_user_id', authData.user.id);

            if (updateError) {
              console.error('Erro ao atualizar dados do usuário:', updateError);
            } else {
              console.log('Dados do usuário atualizados com sucesso');
              break;
            }
          } else {
            console.log('Usuário ainda não criado pelo trigger, aguardando...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
          }
        }
        
        if (attempts >= maxAttempts) {
          console.error('Não foi possível atualizar os dados do usuário após várias tentativas');
        }
        
      } catch (error) {
        console.error('Erro ao atualizar dados do usuário:', error);
      }
    }

    return { data: authData, error: authError };
  };

  const signIn = async (email: string, password: string) => {
    // Check rate limit
    if (!loginRateLimiter.checkRateLimit()) {
      return { 
        data: null, 
        error: { message: 'Muitas tentativas de login. Tente novamente em 30 minutos.' }
      };
    }

    // Validate inputs
    if (!validateEmail(email)) {
      return { 
        data: null, 
        error: { message: 'Email inválido' }
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    // Reset rate limiter on successful login
    if (data.user && !error) {
      loginRateLimiter.reset();
    }

    return { data, error };
  };

  const signOut = async () => {
    try {
      console.log('Executando signOut...');
      const { error } = await supabase.auth.signOut();
      
      // Tratar erros específicos do Supabase
      if (error) {
        // Se for erro de sessão não encontrada, não é crítico - apenas log
        if (error.message?.includes('Session not found') || 
            error.message?.includes('session_not_found') ||
            error.message?.includes('Auth session missing')) {
          console.log('Sessão já havia expirado, logout bem-sucedido');
        } else {
          console.error('Erro no signOut:', error);
          throw error;
        }
      }
      
      // Limpar estado local explicitamente
      setSession(null);
      setUser(null);
      
      console.log('SignOut executado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Limpar estado local mesmo com erro
      setSession(null);
      setUser(null);
      throw error;
    }
  };

  // Secure email existence check using edge function
  const checkEmailExists = async (email: string): Promise<boolean> => {
    if (!validateEmail(email)) {
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-email-exists', {
        body: { email }
      });

      if (error) {
        console.error('Error checking email:', error);
        return false;
      }

      return data?.exists || false;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      checkEmailExists,
      loginRateLimit: {
        isBlocked: loginRateLimiter.isBlocked,
        remainingAttempts: loginRateLimiter.remainingAttempts
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
