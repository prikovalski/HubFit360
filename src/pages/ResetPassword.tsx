
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, Info } from 'lucide-react';
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
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const validateResetToken = async () => {
      console.log('=== Password Reset Page Debug ===');
      console.log('Current URL:', window.location.href);
      console.log('Search params string:', searchParams.toString());
      
      // Extract all URL parameters for debugging
      const allParams: Record<string, string | null> = {};
      const paramNames = ['access_token', 'refresh_token', 'token_hash', 'type', 'error', 'error_code', 'error_description'];
      
      paramNames.forEach(param => {
        allParams[param] = searchParams.get(param);
      });
      
      console.log('All URL parameters:', allParams);
      
      // Store debug info for display
      setDebugInfo({
        url: window.location.href,
        params: allParams,
        hasParams: searchParams.toString().length > 0
      });

      // Check for errors in URL
      if (allParams.error || allParams.error_code) {
        console.log('❌ Error found in URL:', {
          error: allParams.error,
          errorCode: allParams.error_code,
          errorDescription: allParams.error_description
        });
        setTokenValid(false);
        return;
      }

      // Check if we have any parameters at all
      if (!searchParams.toString()) {
        console.log('❌ No URL parameters found - user may have accessed page directly');
        setTokenValid(false);
        return;
      }

      // Validate type parameter
      if (allParams.type !== 'recovery') {
        console.log('❌ Invalid or missing type parameter. Expected "recovery", got:', allParams.type);
        setTokenValid(false);
        return;
      }

      // Check for required tokens
      if (!allParams.access_token || !allParams.refresh_token) {
        console.log('❌ Missing required tokens:', {
          hasAccessToken: !!allParams.access_token,
          hasRefreshToken: !!allParams.refresh_token
        });
        setTokenValid(false);
        return;
      }

      try {
        console.log('✅ All validations passed, tokens appear valid');
        setTokenValid(true);
      } catch (error) {
        console.error('❌ Unexpected error during validation:', error);
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
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      
      if (!accessToken || !refreshToken) {
        throw new Error('Tokens de autenticação não encontrados na URL');
      }

      console.log('🔐 Setting session for password update...');
      
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (sessionError) {
        console.error('❌ Error setting session:', sessionError);
        throw sessionError;
      }

      console.log('✅ Session established, updating password...');

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
              {/* Debug Information */}
              {debugInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Informações de Debug</span>
                  </div>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p><strong>URL atual:</strong> {debugInfo.url}</p>
                    <p><strong>Tem parâmetros:</strong> {debugInfo.hasParams ? 'Sim' : 'Não'}</p>
                    <p><strong>Parâmetros encontrados:</strong></p>
                    <ul className="list-disc list-inside ml-2">
                      {Object.entries(debugInfo.params).map(([key, value]) => (
                        <li key={key}>{key}: {String(value || 'null')}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 mb-3">
                  <strong>Possíveis motivos:</strong>
                </p>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>O link não foi acessado através do email</li>
                  <li>O link foi corrompido ao ser copiado</li>
                  <li>O link expirou (válido por 1 hora)</li>
                  <li>URL de redirecionamento incorreta no Supabase</li>
                  <li>Configuração de Auth incorreta</li>
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
