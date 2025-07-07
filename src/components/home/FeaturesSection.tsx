
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileText, Users, Shield, Zap, TrendingUp, Eye, Award } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "IA Revolucionária",
      description: "Algoritmos de deep learning para análise precisa da composição corporal com tecnologia de última geração",
      gradient: "from-purple-500 to-indigo-600",
      bgGradient: "from-purple-50 to-indigo-50"
    },
    {
      icon: Eye,
      title: "Visão Computacional",
      description: "Análise visual avançada que identifica padrões invisíveis ao olho humano para avaliação completa",
      gradient: "from-cyan-500 to-blue-600", 
      bgGradient: "from-cyan-50 to-blue-50"
    },
    {
      icon: TrendingUp,
      title: "Resultados Instantâneos",
      description: "Processamento em tempo real com relatórios detalhados disponíveis em menos de 3 minutos",
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50"
    },
    {
      icon: Award,
      title: "Precisão Científica",
      description: "Validado por profissionais da saúde com +99% de precisão em análises corporais",
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-50 to-red-50"
    },
    {
      icon: Zap,
      title: "Plano Personalizado",
      description: "IA cria estratégias únicas de treino e nutrição baseadas no seu perfil e objetivos específicos",
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-50 to-purple-50"
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Criptografia militar e conformidade LGPD garantem máxima proteção dos seus dados pessoais",
      gradient: "from-teal-500 to-cyan-600",
      bgGradient: "from-teal-50 to-cyan-50"
    }
  ];

  return (
    <section 
      className="py-20 px-4 bg-gradient-to-br from-gray-50 via-white to-indigo-50 relative overflow-hidden" 
      aria-labelledby="features-title"
      role="region"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 grid-bg opacity-30"></div>
      <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-indigo-200 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">Tecnologia Avançada</span>
          </div>
          
          <h2 
            id="features-title"
            className="text-4xl md:text-5xl font-black text-gray-900 mb-6"
          >
            Por que escolher a
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              HubFit360?
            </span>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Nossa <span className="font-bold text-indigo-600">inteligência artificial revolucionária</span> oferece 
            uma análise completa e precisa do seu corpo como nunca antes
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`card-modern border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm focus-within:ring-2 focus-within:ring-indigo-500 group overflow-hidden relative`}
              role="listitem"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <CardHeader className="text-center relative z-10">
                <div 
                  className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 animate-pulse-glow`}
                  aria-hidden="true"
                >
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-gray-900 text-xl font-bold group-hover:text-indigo-700 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-700 leading-relaxed text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
              
              {/* Decorative corner */}
              <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-bl-full`}></div>
            </Card>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <div className="flex -space-x-2">
              {[1,2,3,4].map((i) => (
                <div key={i} className={`w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full border-2 border-white animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }}></div>
              ))}
            </div>
            <span className="font-medium">+10.000 pessoas já transformaram seus resultados</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
