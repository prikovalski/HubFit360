
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

interface AuthHeaderProps {
  onBack: () => void;
  isLogin: boolean;
}

export const AuthHeader = ({ onBack, isLogin }: AuthHeaderProps) => {
  return (
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
  );
};
