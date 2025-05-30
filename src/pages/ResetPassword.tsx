
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { validatePassword } from '@/utils/inputValidation';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Check if we have the required parameters from the email link
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      toast({
        title: "Link inválido",
        description: "Este link de recuperação é inválido ou expirou.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    // Set the session with the tokens from the URL
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso."
      });

      // Redirect to home page after successful password reset
      navigate('/');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar sua senha.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
