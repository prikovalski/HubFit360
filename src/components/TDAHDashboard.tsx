import { Brain, Plus, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TDAHDashboardProps {
  onNavigate: (page: string) => void;
}

const TDAHDashboard = ({ onNavigate }: TDAHDashboardProps) => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <Brain className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Avaliações de TDAH</h1>
            <p className="text-muted-foreground">Questionários baseados em escalas clínicas validadas</p>
          </div>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card className="border-2 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Brain className="h-5 w-5" />
            Funcionalidade em Desenvolvimento
          </CardTitle>
          <CardDescription>
            O dashboard de avaliações TDAH estará disponível em breve
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Em breve você poderá:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground ml-6">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Realizar avaliações TDAH para adultos e crianças
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Visualizar histórico de avaliações
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Acompanhar resultados e recomendações
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Gerar relatórios detalhados
            </li>
          </ul>

          <div className="pt-4 flex gap-3">
            <Button
              onClick={() => onNavigate('main-dashboard')}
              variant="outline"
            >
              Voltar ao Dashboard
            </Button>
            <Button
              disabled
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Avaliação TDAH (Em breve)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Sobre as Avaliações TDAH</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              As avaliações de TDAH do HubFit360 são baseadas em questionários validados cientificamente, 
              incluindo o ASRS-18 (Adult ADHD Self-Report Scale) para adultos.
            </p>
            <p>
              Essas ferramentas ajudam a identificar sinais de Transtorno de Déficit de Atenção e 
              Hiperatividade, fornecendo orientações sobre próximos passos.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Você responderá a um questionário com 18 perguntas sobre comportamentos e sintomas 
              relacionados ao TDAH.
            </p>
            <p>
              Com base nas suas respostas, será gerado um relatório com pontuação e classificação, 
              além de recomendações personalizadas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TDAHDashboard;