
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Star } from 'lucide-react';

interface CTASectionProps {
  setCurrentSection: (section: string) => void;
}

const CTASection = ({ setCurrentSection }: CTASectionProps) => {
  return (
    <section 
      className="py-24 px-4 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"
      aria-labelledby="cta-title"
      role="region"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '-2s' }}></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-xl animate-float" style={{ animationDelay: '-4s' }}></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 bg-gradient-to-br from-green-400/15 to-emerald-400/15 rounded-full blur-xl animate-float" style={{ animationDelay: '-6s' }}></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-bg opacity-20"></div>
      
      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto glass-dark rounded-3xl p-12 md:p-16 backdrop-blur-xl border border-white/20 shadow-2xl">
          {/* Floating icons */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-4">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" />
              <Star className="w-8 h-8 text-blue-400 animate-pulse" />
              <Sparkles className="w-6 h-6 text-pink-400 animate-spin" style={{ animationDelay: '1s' }} />
            </div>
          </div>
          
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-300/30 rounded-full px-4 py-2 mb-8">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-300">Transformação Garantida</span>
            </div>
          </div>
          
          <h2 
            id="cta-title"
            className="text-4xl md:text-6xl font-black mb-8 text-white leading-tight"
          >
            Pronto para 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 animate-gradient">
              Revolucionar
            </span>
            seus resultados?
          </h2>
          
          <p className="text-xl md:text-2xl mb-12 text-gray-200 leading-relaxed max-w-2xl mx-auto">
            Faça sua <span className="font-bold text-cyan-400">avaliação física completa</span> em apenas 
            <span className="font-bold text-yellow-400"> 3 minutos</span> e descubra seu 
            <span className="font-bold text-pink-400"> verdadeiro potencial</span>
          </p>
          
          {/* Stats row */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 mb-12 text-gray-300">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-medium">Gratuito para começar</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span className="font-medium">Sem instalação</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span className="font-medium">Resultados instantâneos</span>
            </div>
          </div>
          
          <Button 
            onClick={() => setCurrentSection('auth')}
            className="btn-modern text-white px-12 py-6 text-2xl rounded-full transition-all duration-300 hover:shadow-2xl hover:scale-110 focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-purple-900 font-bold group neon-accent relative overflow-hidden"
            aria-label="Iniciar avaliação física gratuita agora"
          >
            <div className="flex items-center">
              <Zap className="mr-3 w-7 h-7 group-hover:animate-spin" />
              Iniciar Avaliação Gratuita
              <ArrowRight className="ml-3 w-7 h-7 group-hover:translate-x-2 transition-transform" />
            </div>
          </Button>
          
          <p className="mt-6 text-sm text-gray-400">
            🔒 Seus dados estão 100% seguros e protegidos
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
