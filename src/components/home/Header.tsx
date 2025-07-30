
import { Button } from "@/components/ui/button";
import { Sparkles } from 'lucide-react';

interface HeaderProps {
  setCurrentSection: (section: string) => void;
}

const Header = ({ setCurrentSection }: HeaderProps) => {
  return (
    <header className="glass backdrop-blur-md border-b border-white/20 sticky top-0 z-50 grid-bg" role="banner">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between" role="navigation" aria-label="Navegação principal">
          <div 
            className="flex items-center space-x-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 rounded-xl p-3 -m-3 hover:bg-white/10 transition-all duration-300 group"
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
            <div className="relative">
              <img 
                src="/lovable-uploads/942e9b47-7e87-4781-86f5-532558bb73f6.webp" 
                alt="HubFit360 - Logotipo da empresa" 
                className="w-16 h-16 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                width="64"
                height="64"
                loading="eager"
              />
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-green-400 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              HubFit360
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setCurrentSection('about')}
              className="text-gray-700 hover:text-green-600 transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg px-4 py-2 hover:bg-white/10 relative group"
              aria-label="Ir para página sobre a empresa"
            >
              Sobre
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 group-hover:w-full"></span>
            </button>
            <Button 
              onClick={() => setCurrentSection('auth')}
              className="btn-modern-green text-white px-6 py-2 rounded-full transition-all duration-300 hover:shadow-lg focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-semibold"
              aria-label="Fazer avaliação física gratuita"
            >
              Faça Sua Avaliação
            </Button>
          </div>

          {/* Menu mobile */}
          <div className="md:hidden flex items-center space-x-2">
            <Button 
              onClick={() => setCurrentSection('auth')}
              size="sm"
              className="btn-modern-green text-white rounded-full font-semibold"
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
