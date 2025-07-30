
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
  resendConfirmation: (email: string) => Promise<any>;
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
    // Mobile debug logs
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('🔧 useAuth: Inicializando autenticação', { isMobile, userAgent: navigator.userAgent });

    // Set up auth state listener FIRST to catch all events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔧 Auth state changed:', { 
          event, 
          hasSession: !!session, 
          hasUser: !!session?.user, 
          email: session?.user?.email,
          isMobile 
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Para mobile, adicionar delay extra para garantir estabilidade
        const delay = isMobile ? 100 : 0;
        setTimeout(() => {
          setLoading(false);
        }, delay);
      }
    );

    // THEN get initial session with retry for mobile
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('🔧 Initial session check:', { 
          hasSession: !!session, 
          hasUser: !!session?.user, 
          email: session?.user?.email,
          error: error?.message,
          isMobile 
        });
        
        if (error) {
          console.error('🔧 Error getting session:', error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Para mobile, aguardar um pouco mais antes de marcar como carregado
        setTimeout(() => {
          setLoading(false);
        }, isMobile ? 200 : 50);
        
      } catch (error) {
        console.error('🔧 Error in getInitialSession:', error);
        setLoading(false);
      }
    };

    getInitialSession();

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

    // Configure redirect URL for email confirmation
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: redirectUrl // Email confirmation enabled
      }
    });

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    console.log('🔧 signIn: Iniciando login', { email, isMobile });
    
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

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('🔧 signIn: Resultado do login', { 
        hasData: !!data, 
        hasUser: !!data?.user, 
        hasSession: !!data?.session,
        error: error?.message,
        isMobile 
      });

      // Reset rate limiter on successful login
      if (data.user && !error) {
        loginRateLimiter.reset();
        
        // Para mobile, verificar se a sessão foi estabelecida corretamente
        if (isMobile && data.session) {
          console.log('🔧 signIn: Login mobile bem-sucedido, aguardando estabilização da sessão');
          
          // Aguardar um pouco para garantir que a sessão seja processada
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Verificar novamente a sessão
          const { data: sessionCheck } = await supabase.auth.getSession();
          console.log('🔧 signIn: Verificação de sessão pós-login', { 
            hasSession: !!sessionCheck.session,
            hasUser: !!sessionCheck.session?.user 
          });
        }
      }

      return { data, error };
    } catch (error) {
      console.error('🔧 signIn: Erro no login:', error);
      return { data: null, error };
    }
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

  const resendConfirmation = async (email: string) => {
    if (!validateEmail(email)) {
      return { 
        data: null, 
        error: { message: 'Email inválido' }
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
      resendConfirmation,
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
