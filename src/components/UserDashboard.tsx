import { useEffect, useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserCredits } from '@/hooks/useUserCredits';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import LoggedPageLayout from '@/components/layout/LoggedPageLayout';
import DashboardHeader from './dashboard/DashboardHeader';
import DashboardStats from './dashboard/DashboardStats';
import AssessmentsList from './dashboard/AssessmentsList';
import { DashboardStatsSkeleton } from '@/components/ui/dashboard-skeleton';
import { supabase } from '@/integrations/supabase/client';

interface UserDashboardProps {
  onNewAssessment: () => void;
  onViewReport: (report: any) => void;
  onLogoClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

const UserDashboard = ({ onNewAssessment, onViewReport, onLogoClick, onProfileClick, onLogout }: UserDashboardProps) => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useUserProfile();
  const { credits, fetchCredits } = useUserCredits();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssessments = async () => {
      if (!userProfile?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', userProfile.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar avaliações:', error);
          toast({
            title: "Erro",
            description: "Falha ao carregar avaliações. Tente novamente.",
            variant: "destructive"
          });
        } else {
          // Transformar os dados do banco para incluir o objeto preview
          const transformedAssessments = (data || []).map(assessment => ({
            ...assessment,
            preview: {
              leanMass: assessment.lean_mass ? `${assessment.lean_mass.toFixed(1)}kg` : 'N/A',
              bodyFat: assessment.body_fat_percentage ? `${assessment.body_fat_percentage.toFixed(1)}%` : 'N/A',
              bmi: assessment.bmi ? assessment.bmi.toFixed(1) : 'N/A',
              fatMass: assessment.fat_mass ? `${assessment.fat_mass.toFixed(1)}kg` : 'N/A',
              summary: assessment.assessment_text || ''
            }
          }));
          
          console.log('Avaliações transformadas:', transformedAssessments);
          setAssessments(transformedAssessments);
        }
      } finally {
        setLoading(false);
      }
    };

    if (userProfile?.id) {
      fetchAssessments();
    }
  }, [userProfile?.id, toast]);

  const handleNewAssessment = () => {
    console.log('Iniciando nova avaliação - sempre permitido agora');
    onNewAssessment();
  };

  const handleViewReport = (report: any) => {
    console.log('Visualizando relatório:', report);
    onViewReport(report);
  };

  if (loading) {
    return (
      <LoggedPageLayout
        userName={userProfile?.name || 'Usuário'}
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
            onLogout={onLogout}
          />
          
          <DashboardStats assessments={assessments} />
          
          <AssessmentsList 
            assessments={assessments}
            loading={loading}
            onReportClick={handleViewReport}
            onNewAssessment={handleNewAssessment}
          />
        </div>
      </div>
    </LoggedPageLayout>
  );
};

export default UserDashboard;
