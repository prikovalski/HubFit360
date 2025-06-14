
import { Button } from "@/components/ui/button";
import InstallPWAButton from '@/components/pwa/InstallPWAButton';

interface HeaderProps {
  setCurrentSection: (section: string) => void;
}

const Header = ({ setCurrentSection }: HeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => {
              setCurrentSection('home');
            }}
          >
            <img 
              src="/lovable-uploads/942e9b47-7e87-4781-86f5-532558bb73f6.png" 
              alt="HubFit360 Logo" 
              className="w-16 h-16"
            />
            <span className="text-2xl font-bold text-gray-800">HubFit360</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setCurrentSection('about')}
              className="text-gray-600 hover:text-[#019f80] transition-colors font-medium"
            >
              Sobre
            </button>
            <InstallPWAButton />
            <Button 
              onClick={() => setCurrentSection('auth')}
              className="bg-[#019f80] hover:bg-[#017a63] text-white px-6 py-2 rounded-full transition-all duration-300 hover:shadow-lg"
            >
              Faça Sua Avaliação
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
