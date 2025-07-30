
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { validateAuthEmail, validateAuthPassword } from '@/utils/authValidation';
import { useRateLimiter } from '@/hooks/useRateLimiter';

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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      // Reset rate limiter on successful login
      if (data.user && !error) {
        loginRateLimiter.reset();
      }

      return { data, error };
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Executando logout completo...');
      
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
      
      // 2. Limpar todo o localStorage
      localStorage.clear();
      
      // 3. Limpar todo o sessionStorage
      sessionStorage.clear();
      
      // 4. Limpar cookies específicos do Supabase
      const cookiesToClear = [
        'sb-access-token',
        'sb-refresh-token',
        'supabase-auth-token',
        'supabase.auth.token'
      ];
      
      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
      // 5. Limpar estado local explicitamente
      setSession(null);
      setUser(null);
      
      // 6. Forçar reload da página para garantir limpeza total
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
      console.log('Logout completo executado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      
      // Limpeza de emergência mesmo com erro
      localStorage.clear();
      sessionStorage.clear();
      setSession(null);
      setUser(null);
      
      // Forçar redirecionamento mesmo com erro
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
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
