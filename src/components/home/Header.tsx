
import { Button } from "@/components/ui/button";
import InstallPWAButton from '@/components/pwa/InstallPWAButton';

interface HeaderProps {
  setCurrentSection: (section: string) => void;
}

const Header = ({ setCurrentSection }: HeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50" role="banner">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between" role="navigation" aria-label="Navegação principal">
          <div 
            className="flex items-center space-x-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#019f80] rounded-lg p-2 -m-2"
            onClick={() => setCurrentSection('home')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentSection('home');
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Ir para página inicial"
          >
            <img 
              src="/lovable-uploads/942e9b47-7e87-4781-86f5-532558bb73f6.webp" 
              alt="HubFit360 - Logotipo da empresa" 
              className="w-16 h-16"
              width="64"
              height="64"
              loading="eager"
            />
            <span className="text-2xl font-bold text-gray-800">HubFit360</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setCurrentSection('about')}
              className="text-gray-600 hover:text-[#019f80] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#019f80] rounded px-3 py-2"
              aria-label="Ir para página sobre a empresa"
            >
              Sobre
            </button>
            <InstallPWAButton />
            <Button 
              onClick={() => setCurrentSection('auth')}
              className="bg-[#019f80] hover:bg-[#017a63] text-white px-6 py-2 rounded-full transition-all duration-300 hover:shadow-lg focus:ring-2 focus:ring-[#019f80] focus:ring-offset-2"
              aria-label="Fazer avaliação física gratuita"
            >
              Faça Sua Avaliação
            </Button>
          </div>

          {/* Menu mobile */}
          <div className="md:hidden flex items-center space-x-2">
            <InstallPWAButton />
            <Button 
              onClick={() => setCurrentSection('auth')}
              size="sm"
              className="bg-[#019f80] hover:bg-[#017a63] text-white rounded-full"
              aria-label="Fazer avaliação física"
            >
              Avaliação
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
