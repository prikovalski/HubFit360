import { useState } from 'react';
import LoggedPageLayout from './layout/LoggedPageLayout';
import { Button } from '@/components/ui/button';
import { Plus, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CreditsWidget from './credits/CreditsWidget';
import CreditsModal from './credits/CreditsModal';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserCredits } from '@/hooks/useUserCredits';
import { usePollockDashboardData } from '@/hooks/usePollockDashboardData';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PollockAssessmentDashboardProps {
  onNavigateToAssessment: () => void;
  onNavigateToReport: (assessment: any) => void;
  onLogout: () => void;
  onNavigateToProfile: () => void;
  onShowAbout: () => void;
  onNavigate: (page: string) => void;
  onLogoClick: () => void;
}

export const PollockAssessmentDashboard = ({
  onNavigateToAssessment,
  onNavigateToReport,
  onLogout,
  onNavigateToProfile,
  onShowAbout,
  onNavigate,
  onLogoClick
}: PollockAssessmentDashboardProps) => {
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  
  const { userProfile, loading: profileLoading } = useUserProfile();
  const { credits, loading: creditsLoading } = useUserCredits();
  const { 
    assessments, 
    stats, 
    loading: assessmentsLoading 
  } = usePollockDashboardData();

  if (profileLoading) {
    return (
      <LoggedPageLayout
        userName={userProfile?.name || ''}
        currentPage="pollock-dashboard"
        onLogoClick={onLogoClick}
        onProfileClick={onNavigateToProfile}
        onLogout={onLogout}
        onNavigate={onNavigate}
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </LoggedPageLayout>
    );
  }

  return (
    <LoggedPageLayout
      userName={userProfile?.name || ''}
      currentPage="pollock-dashboard"
      onLogoClick={onLogoClick}
      onProfileClick={onNavigateToProfile}
      onLogout={onLogout}
      onNavigate={onNavigate}
    >
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="glass rounded-3xl p-8 backdrop-blur-xl border border-white/20 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-xl"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 relative z-10">
            <div>
              <h1 className="text-3xl font-black text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Avaliações por Dobras Cutâneas
              </h1>
              <p className="text-gray-600 font-medium">Método de Pollock 7 Dobras</p>
            </div>
            
            <Button 
              onClick={onNavigateToAssessment}
              className="btn-modern-blue text-white px-6 py-3 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-bold group"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Nova Avaliação
            </Button>
          </div>
        </div>

        {/* Credits Widget */}
        <div className="w-full md:w-80">
          <CreditsWidget 
            onBuyCredits={() => setShowCreditsModal(true)}
            onViewHistory={() => console.log('Ver histórico')}
            showActions={true}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">% Gordura Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgBodyFat}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Última Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {stats.lastAssessment 
                  ? formatDistanceToNow(new Date(stats.lastAssessment), { addSuffix: true, locale: ptBR })
                  : 'Nenhuma'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessments List */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Avaliações</CardTitle>
            <CardDescription>Suas avaliações por método de dobras cutâneas</CardDescription>
          </CardHeader>
          <CardContent>
            {assessmentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma avaliação encontrada</p>
                <Button 
                  onClick={onNavigateToAssessment}
                  className="mt-4"
                  variant="outline"
                >
                  Criar primeira avaliação
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {assessments.map((assessment: any) => (
                  <div 
                    key={assessment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => onNavigateToReport(assessment)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {assessment.assessment_type === 'patient' && assessment.patient_name
                            ? assessment.patient_name
                            : 'Autoavaliação'}
                        </span>
                        {assessment.assessment_type === 'patient' && (
                          <Badge variant="secondary">Paciente</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(assessment.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {assessment.body_fat_percentage?.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        % Gordura
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreditsModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
      />
    </LoggedPageLayout>
  );
};

export default PollockAssessmentDashboard;
