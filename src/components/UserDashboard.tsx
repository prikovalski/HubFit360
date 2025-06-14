
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import ReportViewer from '@/components/ReportViewer';
import AssessmentForm from '@/components/AssessmentForm';
import UserProfile from '@/components/UserProfile';
import DashboardStats from '@/components/dashboard/DashboardStats';
import AssessmentsList from '@/components/dashboard/AssessmentsList';
import LoggedPageLayout from '@/components/layout/LoggedPageLayout';
import { useNavigation } from '@/hooks/useNavigation';

interface Assessment {
  id: string;
  created_at: string;
  body_fat_percentage: number;
  lean_mass: number;
  bmi: number;
  status: string;
  assessment_text: string;
  age: number;
  fat_mass: number;
}

const UserDashboard = ({ user, onLogout }) => {
  const { toast } = useToast();
  const { userProfile } = useUserProfile();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const {
    currentPage,
    reportData,
    goToDashboard,
    goToProfile,
    goToAssessment,
    goToReport
  } = useNavigation();

  useEffect(() => {
    if (userProfile?.id) {
      fetchAssessments();
    }
  }, [userProfile?.id]);

  const fetchAssessments = async () => {
    if (!userProfile?.id) return;

    try {
      console.log('Buscando avaliações para usuário:', userProfile.id);
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Avaliações encontradas:', data);
      setAssessments(data || []);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar suas avaliações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentSuccess = (assessment) => {
    fetchAssessments();
    goToDashboard();
    toast({
      title: "Avaliação criada!",
      description: "Sua avaliação física foi processada com sucesso."
    });
  };

  const handleReportClick = (assessment) => {
    console.log('Avaliação selecionada:', assessment);
    
    const adaptedReport = {
      id: assessment.id,
      date: assessment.created_at,
      status: assessment.status,
      age: assessment.age,
      assessmentText: assessment.assessment_text,
      preview: {
        leanMass: `${assessment.lean_mass?.toFixed(1) || 'N/A'}kg`,
        bodyFat: `${assessment.body_fat_percentage?.toFixed(1) || 'N/A'}%`,
        bmi: assessment.bmi?.toFixed(1) || 'N/A',
        fatMass: `${assessment.fat_mass?.toFixed(1) || 'N/A'}kg`,
        summary: assessment.assessment_text ? 
          assessment.assessment_text.substring(0, 300) + '...' : 
          'Avaliação física completa com análise de composição corporal.'
      }
    };
    
    console.log('Report adaptado:', adaptedReport);
    goToReport(adaptedReport);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'report':
        return (
          <ReportViewer 
            report={reportData} 
            onBack={goToDashboard}
            onLogoClick={goToDashboard}
            onProfileClick={goToProfile}
            onLogout={onLogout}
          />
        );
      
      case 'assessment':
        return (
          <AssessmentForm 
            onBack={goToDashboard}
            onSuccess={handleAssessmentSuccess}
            onLogoClick={goToDashboard}
            onProfileClick={goToProfile}
            onLogout={onLogout}
          />
        );
      
      case 'profile':
        return (
          <UserProfile 
            onBack={goToDashboard} 
            onLogout={onLogout}
            onLogoClick={goToDashboard}
            onProfileClick={goToProfile}
          />
        );
      
      default:
        return (
          <LoggedPageLayout
            userName={user.name}
            onLogoClick={goToDashboard}
            onProfileClick={goToProfile}
            onLogout={onLogout}
          >
            <div className="py-12 px-4">
              <div className="container mx-auto max-w-6xl">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Dashboard
                  </h1>
                  <p className="text-gray-600">
                    Acompanhe suas avaliações e progresso físico
                  </p>
                </div>

                <DashboardStats assessments={assessments} />

                <AssessmentsList
                  assessments={assessments}
                  loading={loading}
                  onReportClick={handleReportClick}
                  onNewAssessment={goToAssessment}
                />
              </div>
            </div>
          </LoggedPageLayout>
        );
    }
  };

  return renderCurrentPage();
};

export default UserDashboard;
