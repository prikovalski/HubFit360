
import { useUserProfile } from '@/hooks/useUserProfile';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useNavigate } from 'react-router-dom';
import LoggedPageLayout from '@/components/layout/LoggedPageLayout';
import DashboardHeader from './dashboard/DashboardHeader';
import OptimizedDashboardStats from './dashboard/OptimizedDashboardStats';
import OptimizedAssessmentsList from './dashboard/OptimizedAssessmentsList';
import { DashboardStatsSkeleton } from '@/components/ui/dashboard-skeleton';
import { Activity } from 'lucide-react';

interface PhysicalAssessmentDashboardProps {
  onNewAssessment: () => void;
  onViewReport: (report: any) => void;
  onLogoClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const PhysicalAssessmentDashboard = ({ onNewAssessment, onViewReport, onLogoClick, onProfileClick, onLogout, currentPage, onNavigate }: PhysicalAssessmentDashboardProps) => {
  
  // Parallel data loading - all hooks start loading simultaneously
  const { userProfile, loading: profileLoading } = useUserProfile();
  const { assessments, assessmentsLoading, assessmentsError, refetchAssessments } = useDashboardData();
  
  const navigate = useNavigate();

  const handleNewAssessment = () => {
    console.log('Iniciando nova avaliação - sempre permitido agora');
    onNewAssessment();
  };

  const handleViewReport = (report: any) => {
    console.log('Visualizando relatório:', report);
    onViewReport(report);
  };

  // Show loading only when essential data (profile) is loading
  if (profileLoading) {
    return (
      <LoggedPageLayout
        userName="Carregando..."
        currentPage={currentPage}
        onLogoClick={onLogoClick}
        onProfileClick={onProfileClick}
        onLogout={onLogout}
        onNavigate={onNavigate}
      >
        <div className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="glass rounded-3xl p-12 backdrop-blur-xl border border-white/20 shadow-2xl text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <p className="text-gray-600 text-lg font-medium">Carregando dashboard...</p>
              <div className="mt-4 flex justify-center space-x-1">
                {[1,2,3].map((i) => (
                  <div key={i} className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </LoggedPageLayout>
    );
  }

  return (
    <LoggedPageLayout
      userName={userProfile?.name || 'Usuário'}
      currentPage={currentPage}
      onLogoClick={onLogoClick}
      onProfileClick={onProfileClick}
      onLogout={onLogout}
      onNavigate={onNavigate}
    >
      <div className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Avaliações Físicas por IA</h1>
            <p className="text-muted-foreground">Gerencie suas avaliações corporais com análise de inteligência artificial</p>
          </div>
          
          <DashboardHeader
            userName={userProfile?.name || 'Usuário'}
            onNewAssessment={handleNewAssessment}
            onUserProfile={onProfileClick}
          />
          
          {/* Stats load immediately with available data */}
          <OptimizedDashboardStats assessments={assessments} />
          
          {/* Assessments list with independent loading state */}
          <OptimizedAssessmentsList 
            assessments={assessments}
            loading={assessmentsLoading}
            error={assessmentsError}
            onReportClick={handleViewReport}
            onNewAssessment={handleNewAssessment}
          />
        </div>
      </div>
    </LoggedPageLayout>
  );
};

export default PhysicalAssessmentDashboard;
