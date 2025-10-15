import { Activity, Brain, Plus, TrendingUp, Calendar, BarChart3, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMainDashboardStats } from '@/hooks/useMainDashboardStats';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
interface MainDashboardProps {
  onNavigateToPhysical: () => void;
  onNavigateToTDAH: () => void;
  onNavigateToBigFive?: () => void;
  onLogout: () => void;
  onViewPhysicalReport?: (report: any) => void;
  onViewTDAHReport?: (report: any) => void;
}
const MainDashboard = ({
  onNavigateToPhysical,
  onNavigateToTDAH,
  onNavigateToBigFive,
  onLogout,
  onViewPhysicalReport,
  onViewTDAHReport
}: MainDashboardProps) => {
  const {
    stats,
    loading
  } = useMainDashboardStats();
  return <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Dashboard Principal
            </h1>
            <p className="text-muted-foreground text-lg">
              Gerencie todas as suas avaliações em um só lugar
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardHeader>
            </Card>)}
        </div> : <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
          <Card className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover-scale">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Avaliações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{stats.totalCount}</span>
                <div className="p-3 bg-primary/10 rounded-full">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover-scale">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avaliações Físicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{stats.physicalCount}</span>
                <div className="p-3 bg-green-500/10 rounded-full">
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover-scale">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avaliações TDAH
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{stats.tdahCount}</span>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Brain className="h-8 w-8 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover-scale relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 gap-1">
                <Sparkles className="h-3 w-3" />
                Novo
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Testes Big Five
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">0</span>
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <Sparkles className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in" style={{
      animationDelay: '0.1s'
    }}>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 hover:shadow-xl transition-all duration-300 hover-scale group">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Avaliação Física</CardTitle>
            </div>
            <CardDescription>
              Análise corporal completa com composição corporal, IMC e recomendações personalizadas por IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onNavigateToPhysical} className="w-full bg-green-600 hover:bg-green-700 group-hover:scale-105 transition-transform" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Acessar Avaliações Físicas
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 border-blue-200/50 hover:shadow-xl transition-all duration-300 hover-scale group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl -mr-16 -mt-16" />
          <CardHeader className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-2">
                <CardTitle>Avaliação TDAH</CardTitle>
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 gap-1 animate-pulse">
                  <Sparkles className="h-3 w-3" />
                  Novo
                </Badge>
              </div>
            </div>
            <CardDescription>
              Questionário ASRS-18 validado cientificamente com análise detalhada e recomendações especializadas
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <Button onClick={onNavigateToTDAH} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group-hover:scale-105 transition-transform" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Acessar Avaliações TDAH
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-purple-200/50 hover:shadow-xl transition-all duration-300 hover-scale group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl -mr-16 -mt-16" />
          <CardHeader className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex items-center gap-2">
                <CardTitle>Teste Big Five</CardTitle>
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 gap-1 animate-pulse">
                  <Sparkles className="h-3 w-3" />
                  Novo
                </Badge>
              </div>
            </div>
            <CardDescription>
              Avaliação completa de personalidade pelos cinco grandes fatores (OCEAN)
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <Button 
              onClick={onNavigateToBigFive} 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 group-hover:scale-105 transition-transform" 
              size="lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Acessar Testes Big Five
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assessments */}
      {!loading && stats.recentAssessments.length > 0 && <Card className="animate-fade-in" style={{
      animationDelay: '0.2s'
    }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Avaliações Recentes</CardTitle>
              </div>
              <Badge variant="secondary">{stats.recentAssessments.length}</Badge>
            </div>
            <CardDescription>
              Suas últimas avaliações realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentAssessments.map((assessment, index) => <div key={assessment.id} onClick={() => {
            if (assessment.type === 'physical' && onViewPhysicalReport) {
              onViewPhysicalReport(assessment);
            } else if (assessment.type === 'tdah' && onViewTDAHReport) {
              onViewTDAHReport(assessment);
            }
          }} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all duration-200 hover-scale animate-fade-in cursor-pointer" style={{
            animationDelay: `${0.3 + index * 0.1}s`
          }}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg transition-colors ${assessment.type === 'physical' ? 'bg-green-500/10 hover:bg-green-500/20' : 'bg-blue-500/10 hover:bg-blue-500/20'}`}>
                      {assessment.type === 'physical' ? <Activity className="h-5 w-5 text-green-600" /> : <Brain className="h-5 w-5 text-blue-600" />}
                    </div>
                    <div>
                      <div className="font-medium flex items-center">
                        <span>{assessment.type === 'physical' ? 'Avaliação Física' : 'Avaliação TDAH'}</span>
                        {assessment.type === 'tdah' && <Badge className="ml-2 bg-blue-500/10 text-blue-700 border-0 text-xs">
                            Novo
                          </Badge>}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(assessment.created_at), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR
                  })}
                      </div>
                    </div>
                  </div>
                  <Badge variant={assessment.type === 'physical' ? 'default' : 'secondary'} className={assessment.type === 'physical' ? '' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}>
                    {assessment.type === 'physical' ? 'Física' : 'TDAH'}
                  </Badge>
                </div>)}
            </div>
          </CardContent>
        </Card>}
    </div>;
};
export default MainDashboard;