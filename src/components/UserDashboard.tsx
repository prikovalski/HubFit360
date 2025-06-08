import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import ReportViewer from '@/components/ReportViewer';
import AssessmentForm from '@/components/AssessmentForm';
import UserProfile from '@/components/UserProfile';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import AssessmentsList from '@/components/dashboard/AssessmentsList';

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
  const [selectedReport, setSelectedReport] = useState(null);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

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
    setShowAssessmentForm(false);
    fetchAssessments();
    toast({
      title: "Avaliação criada!",
      description: "Sua avaliação física foi processada com sucesso."
    });
  };

  const handleReportClick = (assessment) => {
    console.log('Avaliação selecionada:', assessment);
    
    // Criar o objeto report com os dados corretos da avaliação
    const adaptedReport = {
      id: assessment.id,
      date: assessment.created_at,
      status: assessment.status,
      age: assessment.age, // Incluir a idade salva na avaliação
      assessmentText: assessment.assessment_text, // Incluir o texto completo da avaliação
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
    setSelectedReport(adaptedReport);
  };

  if (selectedReport) {
    return <ReportViewer report={selectedReport} onBack={() => setSelectedReport(null)} />;
  }

  if (showAssessmentForm) {
    return (
      <AssessmentForm 
        onBack={() => setShowAssessmentForm(false)}
        onSuccess={handleAssessmentSuccess}
      />
    );
  }

  if (showUserProfile) {
    return <UserProfile onBack={() => setShowUserProfile(false)} />;
  }

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <DashboardHeader
          userName={user.name}
          onNewAssessment={() => setShowAssessmentForm(true)}
          onUserProfile={() => setShowUserProfile(true)}
          onLogout={onLogout}
        />

        <DashboardStats assessments={assessments} />

        <AssessmentsList
          assessments={assessments}
          loading={loading}
          onReportClick={handleReportClick}
          onNewAssessment={() => setShowAssessmentForm(true)}
        />
      </div>
    </div>
  );
};

export default UserDashboard;
