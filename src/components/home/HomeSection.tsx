
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Brain, TrendingUp } from 'lucide-react';

interface HomeSectionProps {
  setCurrentSection: (section: string) => void;
}

const HomeSection = ({ setCurrentSection }: HomeSectionProps) => {
  return (
    <main className="relative overflow-hidden">
      {/* Floating shapes background */}
      <div className="floating-shape-green"></div>
      <div className="floating-shape-green"></div>
      <div className="floating-shape-green"></div>
      <div className="floating-shape-green"></div>
      
      {/* Hero Section */}
      <section className="py-20 px-4 relative bg-gradient-to-br from-green-50 via-white to-emerald-50 grid-bg" aria-labelledby="hero-title">
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Badge animado */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-200 rounded-full px-4 py-2 mb-8 animate-fade-in-scale">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Tecnologia de Ponta em IA</span>
            </div>
            
            <h1 
              id="hero-title"
              className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <span className="block mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Compreender</span> o corpo.
              </span>
              <span className="block mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Equilibrar</span> a mente.
              </span>
              <span className="block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">Evoluir</span> por inteiro.
              </span>
            </h1>
            
            <p 
              className="text-lg md:text-xl text-gray-600 mb-12 leading-relaxed max-w-4xl mx-auto animate-slide-up font-light"
              style={{ animationDelay: '0.4s' }}
            >
              Avaliações <span className="font-semibold text-green-600">físicas</span>, <span className="font-semibold text-orange-600">nutricionais</span> e <span className="font-semibold text-purple-600">psicológicas</span> conectadas em um <span className="font-medium text-gray-900">ecossistema inteligente</span> que entende você de forma completa.
            </p>
            
            {/* Stats animados */}
            <div 
              className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 mb-12 animate-slide-up"
              style={{ animationDelay: '0.6s' }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse"></div>
                <span className="text-gray-600 font-medium">Visão Holística</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span className="text-gray-600 font-medium">Análise Integrada</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <span className="text-gray-600 font-medium">Resultados em 3min</span>
              </div>
            </div>
            
            <div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up"
              style={{ animationDelay: '0.8s' }}
            >
              <Button 
                onClick={() => setCurrentSection('auth')}
                className="btn-modern-green text-white px-10 py-4 text-xl rounded-full transition-all duration-300 hover:shadow-2xl hover:scale-105 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-bold group neon-accent-green"
                aria-label="Começar sua jornada de evolução completa"
              >
                <Zap className="mr-3 w-6 h-6 group-hover:animate-spin" />
                Começar Minha Jornada
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                onClick={() => setCurrentSection('about')}
                variant="outline" 
                className="glass border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:text-green-800 px-10 py-4 text-xl rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-semibold group"
                aria-label="Saber mais sobre nossos serviços"
              >
                Descubra Mais
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-teal-400/20 to-emerald-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '-3s' }}></div>
      </section>
    </main>
  );
};

export default HomeSection;
