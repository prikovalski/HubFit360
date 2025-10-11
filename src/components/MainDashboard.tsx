import { Activity, Brain, ArrowRight, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMainDashboardStats } from '@/hooks/useMainDashboardStats';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MainDashboardProps {
  onNavigateToPhysical: () => void;
  onNavigateToTDAH: () => void;
}

const MainDashboard = ({ 
  onNavigateToPhysical, 
  onNavigateToTDAH
}: MainDashboardProps) => {
  const { stats, loading } = useMainDashboardStats();

  const getAssessmentTypeLabel = (type: 'physical' | 'tdah') => {
    return type === 'physical' ? 'Avaliação Física' : 'Avaliação TDAH';
  };

  const getAssessmentTypeColor = (type: 'physical' | 'tdah') => {
    return type === 'physical' ? 'text-green-600' : 'text-blue-600';
  };
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Bem-vindo ao HubFit360
        </h1>
        <p className="text-muted-foreground text-lg">
          Escolha o tipo de avaliação que deseja realizar
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/40">
              <CardHeader className="pb-3">
                <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-border/40 hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-foreground">
                {loading ? '...' : stats.totalCount}
              </div>
              <TrendingUp className="h-8 w-8 text-primary/70" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 hover:border-green-500/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avaliações Físicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-foreground">
                {loading ? '...' : stats.physicalCount}
              </div>
              <Activity className="h-8 w-8 text-green-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 hover:border-blue-500/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avaliações TDAH
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-foreground">
                {loading ? '...' : stats.tdahCount}
              </div>
              <Brain className="h-8 w-8 text-blue-500/70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assessments */}
      {stats.recentAssessments.length > 0 && (
        <Card className="mb-8 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Avaliações Recentes
            </CardTitle>
            <CardDescription>Suas últimas avaliações realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentAssessments.map((assessment) => (
                <div 
                  key={assessment.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {assessment.type === 'physical' ? (
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <Activity className="h-4 w-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Brain className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <p className={`font-medium ${getAssessmentTypeColor(assessment.type)}`}>
                        {getAssessmentTypeLabel(assessment.type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(assessment.created_at), { 
                          addSuffix: true,
                          locale: ptBR 
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={assessment.status === 'completed' ? 'default' : 'secondary'}>
                    {assessment.status === 'completed' ? 'Concluída' : 'Processando'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
        </>
      )}

      {/* Assessment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Physical Assessment Card */}
        <Card className="border-2 border-green-500/20 hover:border-green-500/40 transition-all hover:shadow-lg group">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Activity className="h-8 w-8 text-green-500" />
              </div>
              <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                IA Avançada
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              Avaliação Física por IA
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Análise completa da composição corporal utilizando inteligência artificial. 
              Obtenha métricas precisas de percentual de gordura, massa magra e IMC através de fotos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Análise por fotos (frente, lado e costas)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Cálculo de percentual de gordura e massa magra
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Recomendações personalizadas de treino e nutrição
                </li>
              </ul>
              <Button 
                onClick={onNavigateToPhysical} 
                className="w-full bg-green-600 hover:bg-green-700 text-white group-hover:shadow-md transition-all"
                size="lg"
              >
                Acessar Avaliações Físicas
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* TDAH Assessment Card */}
        <Card className="border-2 border-blue-500/20 hover:border-blue-500/40 transition-all hover:shadow-lg group">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Brain className="h-8 w-8 text-blue-500" />
              </div>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
                Questionário
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Avaliação de TDAH
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Questionário baseado em escalas clínicas validadas (ASRS-18) para adultos e crianças. 
              Identifique sinais de TDAH e receba orientações especializadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Questionário ASRS-18 validado clinicamente
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Avaliação para adultos e crianças
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Análise de desatenção, hiperatividade e impulsividade
                </li>
              </ul>
              <Button 
                onClick={onNavigateToTDAH} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-md transition-all"
                size="lg"
              >
                Acessar Avaliações TDAH
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="mt-8 border-border/40 bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Como funciona?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            O HubFit360 oferece duas modalidades de avaliação para ajudá-lo a alcançar seus objetivos de saúde e bem-estar:
          </p>
          <ul className="space-y-1 ml-4">
            <li>• <strong>Avaliação Física:</strong> Análise corporal completa usando IA para identificar sua composição corporal</li>
            <li>• <strong>Avaliação TDAH:</strong> Questionário clínico para identificação de sinais de TDAH em adultos e crianças</li>
          </ul>
          <p className="mt-4 text-xs">
            Cada avaliação consome 1 crédito. Você pode adquirir mais créditos a qualquer momento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MainDashboard;