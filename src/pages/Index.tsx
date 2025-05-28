import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Brain, FileText, Shield, Users, ArrowRight } from 'lucide-react';
import AuthSection from '@/components/AuthSection';
import AboutSection from '@/components/AboutSection';
import UserDashboard from '@/components/UserDashboard';

const Index = () => {
  const [currentSection, setCurrentSection] = useState('home');
  const [user, setUser] = useState(null);

  const renderSection = () => {
    if (user) {
      return <UserDashboard user={user} onLogout={() => setUser(null)} />;
    }

    switch (currentSection) {
      case 'about':
        return <AboutSection onBack={() => setCurrentSection('home')} />;
      case 'auth':
        return <AuthSection onBack={() => setCurrentSection('home')} onLogin={setUser} />;
      default:
        return <HomeSection setCurrentSection={setCurrentSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => {
                setCurrentSection('home');
                setUser(null);
              }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#019f80] to-[#017a63] rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">fitHub360</span>
            </div>
            
            {!user && (
              <div className="hidden md:flex items-center space-x-6">
                <button 
                  onClick={() => setCurrentSection('about')}
                  className="text-gray-600 hover:text-[#019f80] transition-colors font-medium"
                >
                  Sobre
                </button>
                <Button 
                  onClick={() => setCurrentSection('auth')}
                  className="bg-[#019f80] hover:bg-[#017a63] text-white px-6 py-2 rounded-full transition-all duration-300 hover:shadow-lg"
                >
                  Faça Sua Avaliação
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {renderSection()}
      </main>
    </div>
  );
};

const HomeSection = ({ setCurrentSection }) => {
  const features = [
    {
      icon: Brain,
      title: "IA Avançada",
      description: "Análise precisa usando inteligência artificial de última geração"
    },
    {
      icon: FileText,
      title: "Laudo Completo",
      description: "Relatório detalhado com % de massa magra, gordura e IMC"
    },
    {
      icon: Users,
      title: "Orientação Personalizada",
      description: "Recomendações específicas para sua dieta e treinos"
    },
    {
      icon: Shield,
      title: "Dados Seguros",
      description: "Suas informações protegidas com máxima segurança"
    }
  ];

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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Por que escolher a fitHub360?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nossa tecnologia de ponta oferece uma análise completa e precisa do seu corpo
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#019f80] to-[#4ade80] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-gray-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
    </div>
  );
};

export default Index;
