
import { useEffect, useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserCredits } from '@/hooks/useUserCredits';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useNavigate } from 'react-router-dom';
import LoggedPageLayout from '@/components/layout/LoggedPageLayout';
import DashboardHeader from './dashboard/DashboardHeader';
import OptimizedDashboardStats from './dashboard/OptimizedDashboardStats';
import OptimizedAssessmentsList from './dashboard/OptimizedAssessmentsList';
import CreditsModal from './credits/CreditsModal';
import CreditUserForm from './admin/CreditUserForm';
import { DashboardStatsSkeleton } from '@/components/ui/dashboard-skeleton';

interface UserDashboardProps {
  onNewAssessment: () => void;
  onViewReport: (report: any) => void;
  onLogoClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

const UserDashboard = ({ onNewAssessment, onViewReport, onLogoClick, onProfileClick, onLogout }: UserDashboardProps) => {
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // Parallel data loading - all hooks start loading simultaneously
  const { userProfile, loading: profileLoading } = useUserProfile();
  const { credits, loading: creditsLoading } = useUserCredits();
  const { assessments, assessmentsLoading, assessmentsError, refetchAssessments } = useDashboardData();
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check admin status when user profile loads
    if (userProfile?.role === 'ADMIN') {
      setShowAdminPanel(true);
    }
  }, [userProfile]);

  const handleNewAssessment = () => {
    console.log('Iniciando nova avaliação - sempre permitido agora');
    onNewAssessment();
  };

  const handleViewReport = (report: any) => {
    console.log('Visualizando relatório:', report);
    onViewReport(report);
  };

  const handleBuyCredits = () => {
    console.log('Abrindo modal de compra de créditos');
    setCreditsModalOpen(true);
  };

  // Show loading only when essential data (profile) is loading
  if (profileLoading) {
    return (
      <LoggedPageLayout
        userName="Carregando..."
        onLogoClick={onLogoClick}
        onProfileClick={onProfileClick}
        onLogout={onLogout}
      >
        <div className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <DashboardStatsSkeleton />
          </div>
        </div>
      </LoggedPageLayout>
    );
  }

  return (
    <LoggedPageLayout
      userName={userProfile?.name || 'Usuário'}
      onLogoClick={onLogoClick}
      onProfileClick={onProfileClick}
      onLogout={onLogout}
    >
      <div className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <DashboardHeader 
            userName={userProfile?.name || 'Usuário'}
            onNewAssessment={handleNewAssessment}
            onUserProfile={onProfileClick}
            onBuyCredits={handleBuyCredits}
          />
          
          {/* Stats load immediately with available data */}
          <OptimizedDashboardStats assessments={assessments} />
          
          {showAdminPanel && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Painel Administrativo</h3>
              <CreditUserForm />
            </div>
          )}
          
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

      <CreditsModal 
        isOpen={creditsModalOpen}
        onClose={() => setCreditsModalOpen(false)}
      />
    </LoggedPageLayout>
  );
};

export default UserDashboard;
