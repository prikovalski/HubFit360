import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Calendar, TrendingUp, Eye, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LoggedPageLayout from '@/components/layout/LoggedPageLayout';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Skeleton } from '@/components/ui/skeleton';

interface PhysicalAssessmentsOverviewProps {
  onLogoClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface Assessment {
  id: string;
  created_at: string;
  type: 'ia' | 'dobras';
  patient_name?: string;
  assessment_type: 'self' | 'patient';
}

const PhysicalAssessmentsOverview = ({
  onLogoClick,
  onProfileClick,
  onLogout,
  currentPage,
  onNavigate
}: PhysicalAssessmentsOverviewProps) => {
  const { toast } = useToast();
  const { userProfile } = useUserProfile();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    ia: 0,
    dobras: 0,
    lastAssessment: null as Assessment | null
  });

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      
      // Buscar user_id do usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError) throw userError;

      // Buscar avaliações por IA
      const { data: iaAssessments, error: iaError } = await supabase
        .from('assessments')
        .select('id, created_at, patient_name, assessment_type')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      if (iaError) throw iaError;

      // Buscar avaliações por dobras
      const { data: dobrasAssessments, error: dobrasError } = await supabase
        .from('pollock_assessments')
        .select('id, created_at, patient_name, assessment_type')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      if (dobrasError) throw dobrasError;

      // Combinar e ordenar todas as avaliações
      const allAssessments: Assessment[] = [
        ...(iaAssessments || []).map(a => ({ 
          id: a.id,
          created_at: a.created_at,
          type: 'ia' as const,
          patient_name: a.patient_name,
          assessment_type: a.assessment_type as 'self' | 'patient'
        })),
        ...(dobrasAssessments || []).map(a => ({ 
          id: a.id,
          created_at: a.created_at,
          type: 'dobras' as const,
          patient_name: a.patient_name,
          assessment_type: a.assessment_type as 'self' | 'patient'
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setAssessments(allAssessments);

      // Calcular estatísticas
      setStats({
        total: allAssessments.length,
        ia: (iaAssessments || []).length,
        dobras: (dobrasAssessments || []).length,
        lastAssessment: allAssessments[0] || null
      });

    } catch (error: any) {
      console.error('Erro ao buscar avaliações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as avaliações',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewAssessment = (assessment: Assessment) => {
    if (assessment.type === 'ia') {
      onNavigate('report');
    } else {
      onNavigate('pollock-report');
    }
  };

  const getAssessmentTypeBadge = (type: 'ia' | 'dobras') => {
    if (type === 'ia') {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Avaliação por IA</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Avaliação por Dobras</Badge>;
  };

  return (
    <LoggedPageLayout
      userName={userProfile?.name || ''}
      currentPage={currentPage}
      onLogoClick={onLogoClick}
      onProfileClick={onProfileClick}
      onLogout={onLogout}
      onNavigate={onNavigate}
    >
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Dumbbell className="h-8 w-8 text-primary" />
              Avaliações Físicas
            </h1>
            <p className="text-muted-foreground mt-2">
              Acompanhe todas as suas avaliações físicas em um só lugar
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => onNavigate('physical-dashboard')}
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Avaliação por IA
            </Button>
            <Button
              onClick={() => onNavigate('pollock-dashboard')}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Avaliação por Dobras
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Avaliações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.ia} por IA • {stats.dobras} por Dobras
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avaliações por IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.ia}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avaliações por Dobras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.dobras}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Last Assessment */}
        {!loading && stats.lastAssessment && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Última Avaliação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  {getAssessmentTypeBadge(stats.lastAssessment.type)}
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(stats.lastAssessment.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  {stats.lastAssessment.patient_name && (
                    <p className="text-sm">
                      Paciente: <span className="font-semibold">{stats.lastAssessment.patient_name}</span>
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => handleViewAssessment(stats.lastAssessment!)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver Relatório
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assessment History */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Avaliações</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                  </div>
                ))}
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-12">
                <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Você ainda não possui avaliações físicas
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => onNavigate('physical-dashboard')}
                    variant="outline"
                  >
                    Criar Avaliação por IA
                  </Button>
                  <Button onClick={() => onNavigate('pollock-dashboard')}>
                    Criar Avaliação por Dobras
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {getAssessmentTypeBadge(assessment.type)}
                        {assessment.assessment_type === 'patient' && (
                          <Badge variant="outline">Paciente</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(assessment.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {assessment.patient_name && (
                        <p className="text-sm">
                          Paciente: <span className="font-semibold">{assessment.patient_name}</span>
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleViewAssessment(assessment)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Relatório
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LoggedPageLayout>
  );
};

export default PhysicalAssessmentsOverview;
