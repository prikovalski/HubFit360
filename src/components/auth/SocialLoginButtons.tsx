
import { Button } from "@/components/ui/button";

interface SocialLoginButtonsProps {
  loading: boolean;
  onSocialLogin: (provider: string) => void;
}

export const SocialLoginButtons = ({ loading, onSocialLogin }: SocialLoginButtonsProps) => {
  return (
    <div className="space-y-3">
      <Button 
        onClick={() => onSocialLogin('Google')}
        variant="outline" 
        className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
        disabled={loading}
      >
        <span className="text-lg mr-3">G</span>
        Continuar com Google
      </Button>
      
      <Button 
        onClick={() => onSocialLogin('Facebook')}
        variant="outline" 
        className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
        disabled={loading}
      >
        <span className="text-lg mr-3 text-blue-600">f</span>
        Continuar com Facebook
      </Button>
      
      <Button 
        onClick={() => onSocialLogin('Apple')}
        variant="outline" 
        className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
        disabled={loading}
      >
        <span className="text-lg mr-3">🍎</span>
        Continuar com Apple
      </Button>
    </div>
  );
};
