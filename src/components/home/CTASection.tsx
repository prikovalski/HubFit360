
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  setCurrentSection: (section: string) => void;
}

const CTASection = ({ setCurrentSection }: CTASectionProps) => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-[#019f80] to-[#4ade80] rounded-3xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para transformar seus resultados?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Faça sua avaliação física completa em apenas alguns minutos
          </p>
          <Button 
            onClick={() => setCurrentSection('auth')}
            className="bg-white text-[#019f80] hover:bg-gray-100 px-8 py-4 text-lg rounded-full transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            Iniciar Avaliação Gratuita
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
