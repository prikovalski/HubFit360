
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
import { Activity, Sparkles } from 'lucide-react';

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
            <div className="mb-8 glass rounded-3xl p-6 backdrop-blur-xl border border-white/20 shadow-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Painel Administrativo</h3>
              </div>
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
