
import { Button } from "@/components/ui/button";

interface EmailExistsOptionsProps {
  email: string;
  loading: boolean;
  onLogin: () => void;
  onPasswordReset: () => void;
  onUseAnotherEmail: () => void;
}

export const EmailExistsOptions = ({ 
  email, 
  loading, 
  onLogin, 
  onPasswordReset, 
  onUseAnotherEmail 
}: EmailExistsOptionsProps) => {
  return (
    <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-semibold text-yellow-800">Email já cadastrado</h3>
      <p className="text-sm text-yellow-700">
        O email {email} já possui uma conta. O que você gostaria de fazer?
      </p>
      <div className="space-y-2">
        <Button 
          onClick={onLogin}
          className="w-full bg-[#019f80] hover:bg-[#017a63] text-white"
          disabled={loading}
        >
          Fazer Login
        </Button>
        <Button 
          onClick={onPasswordReset}
          variant="outline"
          className="w-full"
          disabled={loading}
        >
          Esqueci minha senha
        </Button>
        <Button 
          onClick={onUseAnotherEmail}
          variant="ghost"
          className="w-full text-gray-600"
          disabled={loading}
        >
          Usar outro email
        </Button>
      </div>
    </div>
  );
};
