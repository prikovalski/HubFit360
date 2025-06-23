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

    // If user was created successfully, update the users table with birth_date and gender
    if (authData.user) {
      try {
        console.log('Updating user profile with metadata:', metadata);
        const { error: updateError } = await supabase
          .from('users')
          .update({
            birth_date: metadata.birth_date,
            gender: metadata.gender
          })
          .eq('auth_user_id', authData.user.id);

        if (updateError) {
          console.error('Error updating user profile:', updateError);
        } else {
          console.log('User profile updated successfully');
        }
      } catch (error) {
        console.error('Error updating user profile:', error);
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
      
      if (error) {
        console.error('Erro no signOut:', error);
        throw error;
      }
      
      // Limpar estado local explicitamente
      setSession(null);
      setUser(null);
      
      console.log('SignOut executado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
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
