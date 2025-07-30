
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { validateAuthEmail, validateAuthPassword } from '@/utils/authValidation';
import { useRateLimiter } from '@/hooks/useRateLimiter';
import { getDeviceInfo } from '@/utils/deviceDetection';
import { hybridStorage } from '@/utils/hybridStorage';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authLoading: boolean;
  signUp: (email: string, password: string, metadata: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
  resendConfirmation: (email: string) => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
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
  const [authLoading, setAuthLoading] = useState(false);

  // Rate limiting for login attempts
  const loginRateLimiter = useRateLimiter({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000 // 30 minutes block
  });

  useEffect(() => {
    const deviceInfo = getDeviceInfo();
    console.log('AuthProvider initialized for device:', deviceInfo);

    // Função para verificar sessão com retry para iOS
    const getSessionWithRetry = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          console.log(`Tentativa ${i + 1} de obter sessão`);
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.warn(`Erro na tentativa ${i + 1}:`, error);
            if (i === retries - 1) throw error;
            continue;
          }

          // Verificar se a sessão é válida
          if (session?.access_token) {
            console.log('Sessão válida encontrada:', session.user?.email);
            setSession(session);
            setUser(session.user);
          } else {
            console.log('Nenhuma sessão válida encontrada');
            
            // Para iOS, tentar verificar storage alternativo
            if (deviceInfo.isIOS) {
              const storedToken = hybridStorage.getItem('sb-access-token');
              if (storedToken) {
                console.log('Token encontrado no storage alternativo, tentando restaurar sessão');
                // Aguardar um pouco para o Supabase processar
                await new Promise(resolve => setTimeout(resolve, 500));
                continue;
              }
            }
            
            setSession(null);
            setUser(null);
          }
          
          setLoading(false);
          return;
        } catch (error) {
          console.error(`Erro na tentativa ${i + 1} de obter sessão:`, error);
          if (i === retries - 1) {
            console.error('Falha em todas as tentativas de obter sessão');
            setSession(null);
            setUser(null);
            setLoading(false);
          } else {
            // Aguardar antes da próxima tentativa
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      }
    };

    // Set up auth state listener primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Validação adicional para iOS
        if (deviceInfo.isIOS && session && !session.access_token) {
          console.warn('Sessão inválida detectada no iOS, ignorando');
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Use setTimeout for any async operations if needed
        setTimeout(() => {
          setLoading(false);
        }, 0);
      }
    );

    // Depois tentar obter sessão inicial
    getSessionWithRetry();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata: any) => {
    setAuthLoading(true);
    
    try {
      // Validate inputs
      const emailValidation = validateAuthEmail(email);
      if (!emailValidation.isValid) {
        return { 
          data: null, 
          error: { message: emailValidation.error }
        };
      }

      const passwordValidation = validateAuthPassword(password);
      if (!passwordValidation.isValid) {
        return { 
          data: null, 
          error: { message: passwordValidation.errors.join(', ') }
        };
      }

      // Configure redirect URL for email confirmation
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: redirectUrl
        }
      });

      return { data, error };
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthLoading(true);
    const deviceInfo = getDeviceInfo();
    
    try {
      // Check rate limit
      if (!loginRateLimiter.checkRateLimit()) {
        return { 
          data: null, 
          error: { message: 'Muitas tentativas de login. Tente novamente em 30 minutos.' }
        };
      }

      // Validate inputs
      const emailValidation = validateAuthEmail(email);
      if (!emailValidation.isValid) {
        return { 
          data: null, 
          error: { message: emailValidation.error }
        };
      }

      if (!password) {
        return { 
          data: null, 
          error: { message: 'Senha é obrigatória' }
        };
      }

      console.log('Tentando login para dispositivo:', deviceInfo);

      // Retry logic específico para iOS com timeout maior
      const maxRetries = deviceInfo.isIOS ? 5 : 1;
      let lastError = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Tentativa de login ${attempt}/${maxRetries}`);
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
          });

          if (error) {
            lastError = error;
            console.warn(`Tentativa ${attempt} falhou:`, error.message);
            
            // Para iOS, aguardar mais tempo antes de tentar novamente
            if (deviceInfo.isIOS && attempt < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 3000 + (attempt * 1000)));
              continue;
            }
            
            return { data, error };
          }

          // Sucesso
          console.log(`Login bem-sucedido na tentativa ${attempt}`);
          
          // Reset rate limiter on successful login
          if (data.user) {
            loginRateLimiter.reset();
            
            // Para iOS, aguardar mais tempo para garantir persistência
            if (deviceInfo.isIOS) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }

          return { data, error };
        } catch (networkError) {
          lastError = networkError;
          console.error(`Erro de rede na tentativa ${attempt}:`, networkError);
          
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 4000 + (attempt * 2000)));
            continue;
          }
        }
      }

      // Se chegou aqui, todas as tentativas falharam
      return { 
        data: null, 
        error: lastError || { message: 'Falha ao conectar após múltiplas tentativas' }
      };
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    const deviceInfo = getDeviceInfo();
    
    try {
      console.log('Executando logout completo para dispositivo:', deviceInfo);
      
      // 1. Fazer logout no Supabase com scope global
      const { error } = await supabase.auth.signOut({
        scope: 'global'
      });
      
      // Tratar erros específicos do Supabase
      if (error) {
        if (error.message?.includes('Session not found') || 
            error.message?.includes('session_not_found') ||
            error.message?.includes('Auth session missing')) {
          console.log('Sessão já havia expirado, prosseguindo com limpeza local');
        } else {
          console.error('Erro no signOut:', error);
          // Continuar com limpeza local mesmo com erro
        }
      }
      
      // 2. Limpeza com hybrid storage para iOS
      if (deviceInfo.isIOS || !deviceInfo.storageAvailable) {
        hybridStorage.clear();
      } else {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // 3. Limpar cookies específicos do Supabase de forma mais abrangente
      const cookiesToClear = [
        'sb-access-token',
        'sb-refresh-token',
        'supabase-auth-token',
        'supabase.auth.token',
        'sb-auth-token' // iOS específico
      ];
      
      cookiesToClear.forEach(cookieName => {
        // Múltiplas tentativas de limpeza de cookies
        const domains = [window.location.hostname, `.${window.location.hostname}`, ''];
        const paths = ['/', '', '/auth'];
        
        domains.forEach(domain => {
          paths.forEach(path => {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}; SameSite=Lax;`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}; SameSite=None; Secure;`;
          });
        });
      });
      
      // 4. Limpar estado local explicitamente
      setSession(null);
      setUser(null);
      
      // 5. Para iOS, aguardar mais tempo antes do redirecionamento
      const redirectDelay = deviceInfo.isIOS ? 300 : 100;
      
      setTimeout(() => {
        window.location.href = '/';
      }, redirectDelay);
      
      console.log('Logout completo executado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      
      // Limpeza de emergência mesmo com erro
      if (deviceInfo.isIOS || !deviceInfo.storageAvailable) {
        hybridStorage.clear();
      } else {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      setSession(null);
      setUser(null);
      
      // Forçar redirecionamento mesmo com erro
      setTimeout(() => {
        window.location.href = '/';
      }, deviceInfo.isIOS ? 300 : 100);
    }
  };

  const resendConfirmation = async (email: string) => {
    const emailValidation = validateAuthEmail(email);
    if (!emailValidation.isValid) {
      return { 
        data: null, 
        error: { message: emailValidation.error }
      };
    }

    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    return { data, error };
  };

  // Add password reset functionality
  const resetPassword = async (email: string) => {
    const emailValidation = validateAuthEmail(email);
    if (!emailValidation.isValid) {
      return { 
        data: null, 
        error: { message: emailValidation.error }
      };
    }

    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    
    return { data, error };
  };

  // Secure email existence check using edge function
  const checkEmailExists = async (email: string): Promise<boolean> => {
    const emailValidation = validateAuthEmail(email);
    if (!emailValidation.isValid) {
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
      authLoading,
      signUp,
      signIn,
      signOut,
      checkEmailExists,
      resendConfirmation,
      resetPassword,
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
