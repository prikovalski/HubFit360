
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { validatePassword } from '@/utils/inputValidation';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    const validateResetToken = async () => {
      console.log('=== Starting token validation ===');
      console.log('Current URL:', window.location.href);
      console.log('Search params:', searchParams.toString());
      
      // Extract URL parameters
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const error = searchParams.get('error');
      const errorCode = searchParams.get('error_code');
      const errorDescription = searchParams.get('error_description');
      
      console.log('URL parameters extracted:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken, 
        hasTokenHash: !!tokenHash,
        type,
        error,
        errorCode,
        errorDescription
      });

      // Check for errors in URL
      if (error || errorCode) {
        console.log('❌ Error found in URL parameters:', { error, errorCode, errorDescription });
        setTokenValid(false);
        return;
      }

      // Validate type
      if (type !== 'recovery') {
        console.log('❌ Invalid type, expected "recovery", got:', type);
        setTokenValid(false);
        return;
      }

      // Check required tokens
      if (!accessToken || !refreshToken) {
        console.log('❌ Missing required tokens');
        setTokenValid(false);
        return;
      }

      try {
        console.log('🔍 Attempting to validate tokens...');
        
        // Create a temporary client to test the tokens without affecting the main session
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        console.log('Session validation response:', {
          hasData: !!sessionData,
          hasSession: !!sessionData?.session,
          hasUser: !!sessionData?.user,
          sessionError: sessionError?.message
        });

        if (sessionError) {
          console.error('❌ Session validation error:', sessionError);
          setTokenValid(false);
          return;
        }

        if (sessionData?.session && sessionData?.user) {
          console.log('✅ Tokens are valid for password reset');
          
          // Important: Sign out immediately after validation
          // This prevents the user from being automatically logged in
          await supabase.auth.signOut();
          console.log('🚪 Signed out to prevent auto-login');
          
          setTokenValid(true);
        } else {
          console.log('❌ No valid session created from tokens');
          setTokenValid(false);
        }
      } catch (error) {
        console.error('❌ Unexpected error during token validation:', error);
        setTokenValid(false);
      }
    };

    validateResetToken();
  }, [searchParams]);

  const handleRequestNewLink = () => {
    console.log('Redirecting to request new password reset link');
    toast({
      title: "Solicitar novo link",
      description: "Redirecionando para a página de login...",
    });
    navigate('/?forgot-password=true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== Starting password update ===');
    
    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "Por favor, confirme sua senha corretamente.",
        variant: "destructive"
      });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast({
        title: "Senha inválida",
        description: passwordValidation.errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Re-establish session for password update
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      
      if (!accessToken || !refreshToken) {
        throw new Error('Tokens de autenticação não encontrados na URL');
      }

      console.log('🔐 Re-establishing session for password update...');
      
      // Set session for password update
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (sessionError) {
        console.error('❌ Error re-establishing session:', sessionError);
        throw sessionError;
      }

      console.log('✅ Session re-established, updating password...');

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('❌ Error updating password:', updateError);
        toast({
          title: "Erro",
          description: updateError.message,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Password updated successfully');
      
      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso."
      });

      // Sign out and redirect
      await supabase.auth.signOut();
      console.log('🚪 Signed out after password update');
      
      navigate('/');
    } catch (error: any) {
      console.error('❌ Error in password update process:', error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao alterar sua senha.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#019f80] to-[#017a63] py-12 px-4">
        <div className="container mx-auto max-w-md">
          <div className="flex items-center mb-8">
            <Button 
              onClick={() => navigate('/')}
              variant="ghost" 
              className="mr-4 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-white">
              Redefinir Senha
            </h1>
          </div>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Verificando link de recuperação...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#019f80] to-[#017a63] py-12 px-4">
        <div className="container mx-auto max-w-md">
          <div className="flex items-center mb-8">
            <Button 
              onClick={() => navigate('/')}
              variant="ghost" 
              className="mr-4 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-white">
              Link Inválido
            </h1>
          </div>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl text-gray-800">
                Link Inválido ou Expirado
              </CardTitle>
              <CardDescription className="text-gray-600">
                Este link de recuperação de senha é inválido ou já expirou.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 mb-3">
                  <strong>Possíveis motivos:</strong>
                </p>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>O link já foi usado anteriormente</li>
                  <li>O link expirou (válido por 24 horas)</li>
                  <li>O link foi corrompido ao ser copiado</li>
                  <li>Parâmetros de autenticação inválidos</li>
                </ul>
              </div>

              <Button 
                onClick={handleRequestNewLink}
                className="w-full bg-[#019f80] hover:bg-[#017a63] text-white"
              >
                Solicitar Novo Link de Recuperação
              </Button>

              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                Voltar ao Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Valid token - show password reset form
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#019f80] to-[#017a63] py-12 px-4">
      <div className="container mx-auto max-w-md">
        <div className="flex items-center mb-8">
          <Button 
            onClick={() => navigate('/')}
            variant="ghost" 
            className="mr-4 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-white">
            Redefinir Senha
          </h1>
        </div>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-800">
              Nova Senha
            </CardTitle>
            <CardDescription>
              Digite sua nova senha abaixo
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <Button 
                type="submit"
                className="w-full bg-[#019f80] hover:bg-[#017a63] text-white"
                disabled={loading}
              >
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
