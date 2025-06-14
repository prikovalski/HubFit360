
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileText, Users, Shield } from 'lucide-react';

const FeaturesSection = () => {
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
    <section className="py-16 px-4 bg-white/50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Por que escolher a HubFit360?
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
  );
};

export default FeaturesSection;
