
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  setCurrentSection: (section: string) => void;
}

const CTASection = ({ setCurrentSection }: CTASectionProps) => {
  return (
    <section 
      className="py-20 px-4"
      aria-labelledby="cta-title"
      role="region"
    >
      <div className="container mx-auto text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-[#019f80] to-[#4ade80] rounded-3xl p-12 text-white">
          <h2 
            id="cta-title"
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Pronto para transformar seus resultados?
          </h2>
          <p className="text-xl mb-8 opacity-95">
            Faça sua avaliação física completa em apenas alguns minutos e descubra seu verdadeiro potencial
          </p>
          <Button 
            onClick={() => setCurrentSection('auth')}
            className="bg-white text-[#019f80] hover:bg-gray-50 px-8 py-4 text-lg rounded-full transition-all duration-300 hover:shadow-xl hover:scale-105 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#019f80]"
            aria-label="Iniciar avaliação física gratuita agora"
          >
            Iniciar Avaliação Gratuita
            <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
