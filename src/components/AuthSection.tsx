import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';

const AuthSection = ({ onBack, onLogin }) => {
  const { signUp, signIn } = useAuth();
  const { createOrUpdatePatientProfile } = useUserProfile();
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
        password: 'dummy-password' // Senha temporária para verificar se o email existe
      });
      
      // Se não houver erro específico de credenciais inválidas, significa que algo deu errado
      if (error) {
        // Se o erro for de credenciais inválidas, o email existe
        if (error.message.includes('Invalid login credentials')) {
          return true;
        }
        // Se for outro tipo de erro, assumimos que o email não existe
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
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
          // Validar se o email já existe antes de prosseguir
          const emailAlreadyExists = await checkEmailExists(formData.email);
          
          if (emailAlreadyExists) {
            setEmailExists(true);
            return;
          }
          
          setStep(step + 1);
        } else if (step < 4) {
          setStep(step + 1);
        } else {
          // Finalizar cadastro - sem confirmação de email
          const { data, error } = await signUp(formData.email, formData.password, {
            name: formData.name,
            gender: formData.gender,
            birth_date: formData.birthDate,
            email_confirm: false // Desabilitar confirmação de email
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
            
            // Usuário já está logado após o signup, redirecionar imediatamente
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

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-md">
        {/* Header */}
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
              {isLogin ? 'Bem-vindo de volta!' : 
               step === 1 ? 'Criar sua conta' :
               step === 2 ? 'Seus dados pessoais' : 
               step === 3 ? 'Seus dados físicos' : 'Informações adicionais'}
            </CardTitle>
            <CardDescription>
              {isLogin ? 'Entre para acessar suas avaliações' : 
               step === 1 ? 'Preencha seus dados básicos' :
               step === 2 ? 'Informações pessoais' :
               step === 3 ? 'Dados para sua avaliação' : 'Complete seu perfil'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Email já existe - Opções */}
            {emailExists && !isLogin && (
              <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800">Email já cadastrado</h3>
                <p className="text-sm text-yellow-700">
                  O email {formData.email} já possui uma conta. O que você gostaria de fazer?
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => {
                      setIsLogin(true);
                      setEmailExists(false);
                    }}
                    className="w-full bg-[#019f80] hover:bg-[#017a63] text-white"
                    disabled={loading}
                  >
                    Fazer Login
                  </Button>
                  <Button 
                    onClick={() => setShowPasswordReset(true)}
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                  >
                    Esqueci minha senha
                  </Button>
                  <Button 
                    onClick={() => {
                      setEmailExists(false);
                      setFormData(prev => ({...prev, email: ''}));
                    }}
                    variant="ghost"
                    className="w-full text-gray-600"
                    disabled={loading}
                  >
                    Usar outro email
                  </Button>
                </div>
              </div>
            )}

            {/* Recuperação de senha */}
            {showPasswordReset && (
              <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800">Recuperar Senha</h3>
                <p className="text-sm text-blue-700">
                  Enviaremos um link para redefinir sua senha para: {formData.email}
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={handlePasswordReset}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : 'Enviar Email de Recuperação'}
                  </Button>
                  <Button 
                    onClick={() => setShowPasswordReset(false)}
                    variant="ghost"
                    className="w-full text-gray-600"
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Formulários normais (quando não há email duplicado) */}
            {!emailExists && !showPasswordReset && (
              <>
                {isLogin ? (
                  <>
                    {/* Social Login Buttons */}
                    <div className="space-y-3">
                      <Button 
                        onClick={() => handleSocialLogin('Google')}
                        variant="outline" 
                        className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
                        disabled={loading}
                      >
                        <span className="text-lg mr-3">G</span>
                        Continuar com Google
                      </Button>
                      
                      <Button 
                        onClick={() => handleSocialLogin('Facebook')}
                        variant="outline" 
                        className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
                        disabled={loading}
                      >
                        <span className="text-lg mr-3 text-blue-600">f</span>
                        Continuar com Facebook
                      </Button>
                      
                      <Button 
                        onClick={() => handleSocialLogin('Apple')}
                        variant="outline" 
                        className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
                        disabled={loading}
                      >
                        <span className="text-lg mr-3">🍎</span>
                        Continuar com Apple
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">ou</span>
                      </div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                          placeholder="seu@email.com"
                          required
                          disabled={loading}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="password">Senha</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
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
                        {loading ? 'Entrando...' : 'Entrar'}
                      </Button>
                    </form>

                    <div className="text-center">
                      <button 
                        onClick={() => setIsLogin(false)}
                        className="text-[#019f80] hover:underline"
                        disabled={loading}
                      >
                        Não tem conta? Criar uma agora
                      </button>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {step === 1 && (
                      <>
                        <div>
                          <Label htmlFor="name">Nome Completo</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                            placeholder="Seu nome completo"
                            required
                            disabled={loading}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                            placeholder="seu@email.com"
                            required
                            disabled={loading}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="password">Senha</Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                            placeholder="••••••••"
                            required
                            disabled={loading}
                          />
                        </div>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <div>
                          <Label htmlFor="gender">Gênero</Label>
                          <select
                            id="gender"
                            value={formData.gender}
                            onChange={(e) => setFormData(prev => ({...prev, gender: e.target.value}))}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                            disabled={loading}
                          >
                            <option value="">Selecione</option>
                            <option value="MALE">Masculino</option>
                            <option value="FEMALE">Feminino</option>
                            <option value="OTHER">Outro</option>
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="birthDate">Data de Nascimento</Label>
                          <Input
                            id="birthDate"
                            type="date"
                            value={formData.birthDate}
                            onChange={(e) => setFormData(prev => ({...prev, birthDate: e.target.value}))}
                            required
                            disabled={loading}
                          />
                        </div>

                        <div>
                          <Label htmlFor="city">Cidade</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({...prev, city: e.target.value}))}
                            placeholder="Sua cidade"
                            disabled={loading}
                          />
                        </div>
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="weight">Peso (kg)</Label>
                            <Input
                              id="weight"
                              type="number"
                              step="0.1"
                              value={formData.weight}
                              onChange={(e) => setFormData(prev => ({...prev, weight: e.target.value}))}
                              placeholder="70.5"
                              disabled={loading}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="height">Altura (cm)</Label>
                            <Input
                              id="height"
                              type="number"
                              step="0.1"
                              value={formData.height}
                              onChange={(e) => setFormData(prev => ({...prev, height: e.target.value}))}
                              placeholder="175.0"
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="goal">Objetivo</Label>
                          <Input
                            id="goal"
                            value={formData.goal}
                            onChange={(e) => setFormData(prev => ({...prev, goal: e.target.value}))}
                            placeholder="Ex: Perder peso, ganhar massa muscular..."
                            disabled={loading}
                          />
                        </div>

                        <div>
                          <Label htmlFor="physicalActivity">Atividade Física</Label>
                          <Input
                            id="physicalActivity"
                            value={formData.physicalActivity}
                            onChange={(e) => setFormData(prev => ({...prev, physicalActivity: e.target.value}))}
                            placeholder="Que exercícios você pratica?"
                            disabled={loading}
                          />
                        </div>
                      </>
                    )}

                    {step === 4 && (
                      <>
                        <div>
                          <Label htmlFor="foodAllergy">Alergias Alimentares</Label>
                          <Input
                            id="foodAllergy"
                            value={formData.foodAllergy}
                            onChange={(e) => setFormData(prev => ({...prev, foodAllergy: e.target.value}))}
                            placeholder="Ex: Lactose, glúten..."
                            disabled={loading}
                          />
                        </div>

                        <div>
                          <Label htmlFor="chronicDisease">Doenças Crônicas</Label>
                          <Input
                            id="chronicDisease"
                            value={formData.chronicDisease}
                            onChange={(e) => setFormData(prev => ({...prev, chronicDisease: e.target.value}))}
                            placeholder="Ex: Diabetes, hipertensão..."
                            disabled={loading}
                          />
                        </div>

                        <div>
                          <Label htmlFor="medicalRestriction">Restrições Médicas</Label>
                          <Input
                            id="medicalRestriction"
                            value={formData.medicalRestriction}
                            onChange={(e) => setFormData(prev => ({...prev, medicalRestriction: e.target.value}))}
                            placeholder="Alguma restrição médica?"
                            disabled={loading}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label htmlFor="neckCircumference">Pescoço (cm)</Label>
                            <Input
                              id="neckCircumference"
                              type="number"
                              step="0.1"
                              value={formData.neckCircumference}
                              onChange={(e) => setFormData(prev => ({...prev, neckCircumference: e.target.value}))}
                              placeholder="35.0"
                              disabled={loading}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="waistCircumference">Cintura (cm)</Label>
                            <Input
                              id="waistCircumference"
                              type="number"
                              step="0.1"
                              value={formData.waistCircumference}
                              onChange={(e) => setFormData(prev => ({...prev, waistCircumference: e.target.value}))}
                              placeholder="80.0"
                              disabled={loading}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="hipCircumference">Quadril (cm)</Label>
                            <Input
                              id="hipCircumference"
                              type="number"
                              step="0.1"
                              value={formData.hipCircumference}
                              onChange={(e) => setFormData(prev => ({...prev, hipCircumference: e.target.value}))}
                              placeholder="95.0"
                              disabled={loading}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <Button 
                      type="submit"
                      className="w-full bg-[#019f80] hover:bg-[#017a63] text-white"
                      disabled={loading}
                    >
                      {loading ? 'Processando...' : step === 4 ? 'Finalizar Cadastro' : 'Próximo'}
                    </Button>

                    {step === 1 && (
                      <div className="text-center">
                        <button 
                          onClick={() => setIsLogin(true)}
                          className="text-[#019f80] hover:underline"
                          disabled={loading}
                        >
                          Já tem conta? Fazer login
                        </button>
                      </div>
                    )}

                    {step > 1 && (
                      <div className="text-center">
                        <button 
                          type="button"
                          onClick={() => setStep(step - 1)}
                          className="text-gray-500 hover:underline"
                          disabled={loading}
                        >
                          Voltar
                        </button>
                      </div>
                    )}
                  </form>
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
