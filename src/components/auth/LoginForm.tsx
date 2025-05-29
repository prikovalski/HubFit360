
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialLoginButtons } from "./SocialLoginButtons";

interface LoginFormProps {
  formData: {
    email: string;
    password: string;
  };
  loading: boolean;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSocialLogin: (provider: string) => void;
  onSwitchToSignup: () => void;
}

export const LoginForm = ({ 
  formData, 
  loading, 
  onInputChange, 
  onSubmit, 
  onSocialLogin, 
  onSwitchToSignup 
}: LoginFormProps) => {
  return (
    <>
      <SocialLoginButtons loading={loading} onSocialLogin={onSocialLogin} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">ou</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
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
            onChange={(e) => onInputChange('password', e.target.value)}
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
          onClick={onSwitchToSignup}
          className="text-[#019f80] hover:underline"
          disabled={loading}
        >
          Não tem conta? Criar uma agora
        </button>
      </div>
    </>
  );
};
