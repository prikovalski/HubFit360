
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validatePassword } from "@/utils/inputValidation";
import { Check, X } from "lucide-react";
import { useMemo } from "react";

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
  onForgotPassword: () => void;
}

export const LoginForm = ({ 
  formData, 
  loading, 
  onInputChange, 
  onSubmit, 
  onSocialLogin, 
  onSwitchToSignup,
  onForgotPassword
}: LoginFormProps) => {
  const passwordValidation = useMemo(() => {
    if (!formData.password) return null;
    return validatePassword(formData.password);
  }, [formData.password]);

  return (
    <div className="space-y-4">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(e); }} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-[#019f80] hover:underline"
              disabled={loading}
            >
              Esqueci minha senha
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => onInputChange('password', e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className={passwordValidation && formData.password ? 
                (passwordValidation.isValid ? 'border-green-500' : 'border-red-500') : ''
              }
            />
            {passwordValidation && formData.password && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {passwordValidation.isValid ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
              </div>
            )}
          </div>
          {passwordValidation && !passwordValidation.isValid && formData.password && (
            <div className="mt-2 space-y-1">
              {passwordValidation.errors.map((error, index) => (
                <p key={index} className="text-xs text-red-500 flex items-center">
                  <X className="w-3 h-3 mr-1" />
                  {error}
                </p>
              ))}
            </div>
          )}
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
    </div>
  );
};
