
import { Button } from "@/components/ui/button";
import { User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";

interface LoggedHeaderProps {
  userName?: string;
  onLogoClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

const LoggedHeader = ({ userName, onLogoClick, onProfileClick, onLogout }: LoggedHeaderProps) => {
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      console.log('Iniciando logout...');
      await signOut();
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso!"
      });
      
      onLogout();
      
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao tentar sair. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="glass backdrop-blur-md border-b border-white/20 sticky top-0 z-50 grid-bg" role="banner">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between" role="navigation">
          {/* Logo Section */}
          <div 
            className="flex items-center space-x-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl p-3 -m-3 hover:bg-white/10 transition-all duration-300 group"
            onClick={onLogoClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onLogoClick();
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Ir para dashboard"
          >
            <div className="relative">
              <img 
                src="/lovable-uploads/942e9b47-7e87-4781-86f5-532558bb73f6.webp" 
                alt="HubFit360 - Logotipo da empresa" 
                className="w-12 h-12 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                width="48"
                height="48"
                loading="eager"
              />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-green-400 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              HubFit360
            </span>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <Button
              onClick={onProfileClick}
              className="glass border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:text-green-800 transition-all duration-300 hover:shadow-lg hover:scale-105 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium group"
              size="sm"
            >
              <User className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              <span className="hidden sm:inline">Meu Perfil</span>
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300 hover:shadow-lg hover:scale-105 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium group"
            >
              <LogOut className="w-4 h-4 group-hover:-rotate-12 transition-transform duration-300" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default LoggedHeader;
