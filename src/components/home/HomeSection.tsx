
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import InstallPWAButton from '@/components/pwa/InstallPWAButton';

interface HomeSectionProps {
  setCurrentSection: (section: string) => void;
}

const HomeSection = ({ setCurrentSection }: HomeSectionProps) => {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Descubra Seu
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#019f80] to-[#4ade80]"> Potencial </span>
              Físico
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Avaliação física completa com IA para direcionamento personalizado de treinos e dieta. 
              Conheça sua composição corporal e otimize seus resultados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => setCurrentSection('auth')}
                className="bg-[#019f80] hover:bg-[#017a63] text-white px-8 py-4 text-lg rounded-full transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                Começar Avaliação
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                onClick={() => setCurrentSection('about')}
                variant="outline" 
                className="border-[#019f80] text-[#019f80] hover:bg-[#019f80] hover:text-white px-8 py-4 text-lg rounded-full transition-all duration-300"
              >
                Saiba Mais
              </Button>
              <div className="sm:hidden">
                <InstallPWAButton />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeSection;
