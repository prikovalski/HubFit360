
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

const AuthSection = ({ onBack, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    birthDate: '',
    weight: '',
    height: '',
    photos: {
      front: null,
      side: null,
      back: null
    }
  });

  const handleSocialLogin = (provider) => {
    toast({
      title: `Login com ${provider}`,
      description: "Funcionalidade em desenvolvimento",
    });
    // Simular login
    onLogin({
      id: 1,
      name: "Usuário Demo",
      email: "demo@hubfit360.com"
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      // Simular login
      onLogin({
        id: 1,
        name: "Usuário Demo",
        email: formData.email
      });
    } else {
      if (step < 3) {
        setStep(step + 1);
      } else {
        // Finalizar cadastro
        onLogin({
          id: 1,
          name: formData.name,
          email: formData.email
        });
      }
    }
  };

  const handlePhotoUpload = (position, file) => {
    setFormData(prev => ({
      ...prev,
      photos: {
        ...prev.photos,
        [position]: file
      }
    }));
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
               step === 2 ? 'Seus dados físicos' : 'Suas fotos'}
            </CardTitle>
            <CardDescription>
              {isLogin ? 'Entre para acessar suas avaliações' : 
               step === 1 ? 'Preencha seus dados básicos' :
               step === 2 ? 'Informações para sua avaliação' : 'Upload das fotos para análise'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {isLogin ? (
              <>
                {/* Social Login Buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={() => handleSocialLogin('Google')}
                    variant="outline" 
                    className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
                  >
                    <span className="text-lg mr-3">G</span>
                    Continuar com Google
                  </Button>
                  
                  <Button 
                    onClick={() => handleSocialLogin('Facebook')}
                    variant="outline" 
                    className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
                  >
                    <span className="text-lg mr-3 text-blue-600">f</span>
                    Continuar com Facebook
                  </Button>
                  
                  <Button 
                    onClick={() => handleSocialLogin('Apple')}
                    variant="outline" 
                    className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
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
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-[#019f80] hover:bg-[#017a63] text-white"
                  >
                    Entrar
                  </Button>
                </form>

                <div className="text-center">
                  <button 
                    onClick={() => setIsLogin(false)}
                    className="text-[#019f80] hover:underline"
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
                      />
                    </div>

                    <div>
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData(prev => ({...prev, birthDate: e.target.value}))}
                        required
                      />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div>
                      <Label htmlFor="weight">Peso (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) => setFormData(prev => ({...prev, weight: e.target.value}))}
                        placeholder="70"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="height">Altura (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={formData.height}
                        onChange={(e) => setFormData(prev => ({...prev, height: e.target.value}))}
                        placeholder="175"
                        required
                      />
                    </div>
                  </>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 text-center">
                      Faça upload de 3 fotos para uma avaliação precisa:
                    </p>
                    
                    {['front', 'side', 'back'].map((position) => (
                      <div key={position}>
                        <Label htmlFor={position}>
                          Foto de {position === 'front' ? 'Frente' : position === 'side' ? 'Lado' : 'Costas'}
                        </Label>
                        <Input
                          id={position}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(position, e.target.files[0])}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#019f80] file:text-white hover:file:bg-[#017a63]"
                          required
                        />
                      </div>
                    ))}
                  </div>
                )}

                <Button 
                  type="submit"
                  className="w-full bg-[#019f80] hover:bg-[#017a63] text-white"
                >
                  {step === 3 ? 'Finalizar Cadastro' : 'Próximo'}
                </Button>

                {step === 1 && (
                  <div className="text-center">
                    <button 
                      onClick={() => setIsLogin(true)}
                      className="text-[#019f80] hover:underline"
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
                    >
                      Voltar
                    </button>
                  </div>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthSection;
