
import { Button } from "@/components/ui/button";
import { User, LogOut } from 'lucide-react';

interface LoggedHeaderProps {
  userName?: string;
  onLogoClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

const LoggedHeader = ({ userName, onLogoClick, onProfileClick, onLogout }: LoggedHeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo Section */}
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onLogoClick}
          >
            <img 
              src="/lovable-uploads/942e9b47-7e87-4781-86f5-532558bb73f6.png" 
              alt="HubFit360 Logo" 
              className="w-12 h-12"
            />
            <span className="text-xl font-bold text-gray-800">HubFit360</span>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {userName && (
              <span className="hidden sm:block text-sm text-gray-600 mr-2">
                Olá, {userName}
              </span>
            )}
            
            <Button
              onClick={onProfileClick}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 border-[#019f80] text-[#019f80] hover:bg-[#019f80] hover:text-white"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Meu Perfil</span>
            </Button>
            
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default LoggedHeader;
