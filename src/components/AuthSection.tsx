import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { EmailExistsOptions } from './auth/EmailExistsOptions';
import { PasswordResetForm } from './auth/PasswordResetForm';
import { LoginForm } from './auth/LoginForm';
import { SignupFormSteps } from './auth/SignupFormSteps';

const AuthSection = ({ onBack, onLogin }) => {
  const { signUp, signIn } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    gender: '',
    birthDate: '',
    weight: '',
    height: '',
    city: '',
    goal: '',
    chronicDisease: '',
    medicalRestriction: '',
    foodAllergy: '',
    avoidFood: '',
    physicalActivity: '',
    activityFrequency: '',
    fixedMealTimes: '',
    mustHaveFood: '',
    neckCircumference: '',
    waistCircumference: '',
    hipCircumference: ''
  });

  const handleSocialLogin = (provider) => {
    toast({
      title: `Login com ${provider}`,
      description: "Funcionalidade em desenvolvimento",
    });
  };

  const checkEmailExists = async (email) => {
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

  const handleForgotPassword = () => {
    if (!formData.email) {
      toast({
        title: "Email necessário",
        description: "Por favor, insira seu email primeiro",
        variant: "destructive"
      });
      return;
    }
    setShowPasswordReset(true);
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`
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
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha."
      });
      
      setShowPasswordReset(false);
      setEmailExists(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o email de recuperação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await signIn(formData.email, formData.password);
        
        if (error) {
          toast({
            title: "Erro no login",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        if (data.user) {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo de volta!"
          });
          onLogin(data.user);
        }
      } else {
        if (step === 1) {
          const emailAlreadyExists = await checkEmailExists(formData.email);
          
          if (emailAlreadyExists) {
            setEmailExists(true);
            return;
          }
          
          setStep(step + 1);
        } else if (step < 4) {
          setStep(step + 1);
        } else {
          const { data, error } = await signUp(formData.email, formData.password, {
            name: formData.name,
            gender: formData.gender,
            birth_date: formData.birthDate,
            email_confirm: false
          });

          if (error) {
            toast({
              title: "Erro no cadastro",
              description: error.message,
              variant: "destructive"
            });
            return;
          }

          if (data.user) {
            toast({
              title: "Cadastro realizado com sucesso!",
              description: "Bem-vindo ao HubFit360!"
            });
            
            onLogin(data.user);
          }
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (isLogin) return 'Bem-vindo de volta!';
    if (step === 1) return 'Criar sua conta';
    if (step === 2) return 'Seus dados pessoais';
    if (step === 3) return 'Seus dados físicos';
    return 'Informações adicionais';
  };

  const getDescription = () => {
    if (isLogin) return 'Entre para acessar suas avaliações';
    if (step === 1) return 'Preencha seus dados básicos';
    if (step === 2) return 'Informações pessoais';
    if (step === 3) return 'Dados para sua avaliação';
    return 'Complete seu perfil';
  };

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-md">
        <div className="flex items-center mb-8">
          <Button 
            onClick={onBack}
            variant="ghost" 
            className="mr-4 text-[#019f80] hover:bg-[#019f80]/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </h1>
        </div>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-800">
              {getTitle()}
            </CardTitle>
            <CardDescription>
              {getDescription()}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {emailExists && !isLogin && (
              <EmailExistsOptions
                email={formData.email}
                loading={loading}
                onLogin={() => {
                  setIsLogin(true);
                  setEmailExists(false);
                }}
                onPasswordReset={() => setShowPasswordReset(true)}
                onUseAnotherEmail={() => {
                  setEmailExists(false);
                  setFormData(prev => ({...prev, email: ''}));
                }}
              />
            )}

            {showPasswordReset && (
              <PasswordResetForm
                email={formData.email}
                loading={loading}
                onSendReset={handlePasswordReset}
                onCancel={() => setShowPasswordReset(false)}
              />
            )}

            {!emailExists && !showPasswordReset && (
              <>
                {isLogin ? (
                  <LoginForm
                    formData={formData}
                    loading={loading}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onSocialLogin={handleSocialLogin}
                    onSwitchToSignup={() => setIsLogin(false)}
                    onForgotPassword={handleForgotPassword}
                  />
                ) : (
                  <SignupFormSteps
                    step={step}
                    formData={formData}
                    loading={loading}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onPrevStep={() => setStep(step - 1)}
                    onSwitchToLogin={() => setIsLogin(true)}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthSection;
