import { useState, useEffect } from 'react';
import { Activity, Sparkles } from 'lucide-react';
import AboutSection from '@/components/AboutSection';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useNavigation } from '@/hooks/useNavigation';
import Header from '@/components/home/Header';
import HomePage from '@/components/home/HomePage';
import MainDashboard from '@/components/MainDashboard';
import TDAHDashboard from '@/components/TDAHDashboard';
import LazyPhysicalAssessmentDashboard from '@/components/lazy/LazyUserDashboard';
import LazyAuthSection from '@/components/lazy/LazyAuthSection';
import LazyAssessmentForm from '@/components/lazy/LazyAssessmentForm';
import LazyReportViewer from '@/components/lazy/LazyReportViewer';
import LazyUserProfile from '@/components/lazy/LazyUserProfile';
import LazyTDAHAssessmentForm from '@/components/lazy/LazyTDAHAssessmentForm';
import LazyTDAHReportViewer from '@/components/lazy/LazyTDAHReportViewer';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';

const AppContent = () => {
  const [currentSection, setCurrentSection] = useState('home');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedTDAHReport, setSelectedTDAHReport] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const navigation = useNavigation();
  
  // Use try-catch to handle potential auth context issues
  let user = null;
  let signOut = () => Promise.resolve();
  let userProfile = null;
  let loading = true;
  let authLoading = true;
  
  try {
    const auth = useAuth();
    user = auth.user;
    signOut = auth.signOut;
    authLoading = auth.loading;
    const profile = useUserProfile();
    userProfile = profile.userProfile;
    loading = profile.loading;
  } catch (error) {
    console.error('Error accessing auth context:', error);
  }

  // Auto-redirect to main dashboard when user logs in
  useEffect(() => {
    if (user && !authLoading && !loading && currentSection === 'home' && !isLoggingOut) {
      console.log('AppContent: Usuario autenticado confirmado, redirecionando para main dashboard');
      
      setTimeout(() => {
        setCurrentSection('logged-in');
        navigation.goToMainDashboard();
      }, 100);
    }
  }, [user, authLoading, loading, isLoggingOut]);

  const handleLogout = async () => {
    try {
      console.log('AppContent: Iniciando logout...');
      setIsLoggingOut(true);
      
      await signOut();
      
      setCurrentSection('home');
      setSelectedReport(null);
      navigation.goToMainDashboard();
      
      console.log('AppContent: Logout concluído, redirecionando para home');
    } catch (error) {
      console.error('AppContent: Erro no logout:', error);
      setCurrentSection('home');
      setSelectedReport(null);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigate = (page: string) => {
    console.log('AppContent: Navegando para', page);
    navigation.navigateTo(page as any);
  };

  const handleNewAssessment = () => {
    navigation.goToAssessment();
  };

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    navigation.goToReport(report);
  };

  const handleBackToPhysicalDashboard = () => {
    navigation.goToPhysicalDashboard();
    setSelectedReport(null);
  };

  const handleAssessmentSuccess = (assessment: any) => {
    console.log('AppContent: Avaliação recebida com dados completos:', {
      id: assessment.id,
      hasHeight: !!assessment.patient_height,
      hasWeight: !!assessment.patient_weight,
      hasName: !!assessment.patient_name,
      hasGender: !!assessment.patient_gender,
      hasGoal: !!assessment.patient_goal,
      fullAssessment: assessment
    });

    const completeReport = {
      ...assessment,
      leanMass: assessment.leanMass,
      bodyFatPercentage: assessment.bodyFatPercentage,
      bmi: assessment.bmi,
      fatMass: assessment.fatMass,
      patient_height: assessment.patient_height,
      patient_weight: assessment.patient_weight,
      patient_name: assessment.patient_name,
      patient_gender: assessment.patient_gender,
      patient_goal: assessment.patient_goal,
      preview: assessment.preview || {
        leanMass: assessment.leanMass ? `${assessment.leanMass.toFixed(1)}kg` : 'N/A',
        bodyFat: assessment.bodyFatPercentage ? `${assessment.bodyFatPercentage.toFixed(1)}%` : 'N/A',
        bmi: assessment.bmi ? assessment.bmi.toFixed(1) : 'N/A',
        fatMass: assessment.fatMass ? `${assessment.fatMass.toFixed(1)}kg` : 'N/A',
        summary: assessment.assessmentText || ''
      }
    };

    console.log('AppContent: Relatório completo preparado:', completeReport);

    setSelectedReport(completeReport);
    navigation.goToReport(completeReport);
  };

  const handleTDAHAssessmentSuccess = (assessment: any) => {
    setSelectedTDAHReport(assessment);
    navigation.goToTDAHReport(assessment);
  };

  const handleViewTDAHReport = (report: any) => {
    setSelectedTDAHReport(report);
    navigation.goToTDAHReport(report);
  };

  const handleBackToTDAHDashboard = () => {
    navigation.goToTDAHDashboard();
    setSelectedTDAHReport(null);
  };

  const renderSection = () => {
    // Se o usuário está logado, mostrar as seções do dashboard
    if (user) {
      if (loading) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-green-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }}></div>
            </div>
            
            <div className="absolute inset-0 grid-bg opacity-30"></div>
            
            <div className="text-center relative z-10">
              <div className="glass rounded-3xl p-12 backdrop-blur-xl border border-white/20 shadow-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse-glow relative">
                  <Activity className="w-10 h-10 text-white" />
                  <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-green-300 animate-pulse" />
                </div>
                <p className="text-gray-700 text-lg font-medium mb-4">Carregando dashboard...</p>
                <div className="flex justify-center space-x-1">
                  {[1,2,3].map((i) => (
                    <div key={i} className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Renderizar seções baseadas no estado de navegação
      switch (navigation.currentPage) {
        case 'main-dashboard':
          return (
            <MainDashboard
              onNavigateToPhysical={() => navigation.goToPhysicalDashboard()}
              onNavigateToTDAH={() => navigation.goToTDAHDashboard()}
              onLogout={handleLogout}
            />
          );
        
        case 'physical-dashboard':
          return (
            <LazyPhysicalAssessmentDashboard
              onNewAssessment={handleNewAssessment}
              onViewReport={handleViewReport}
              onLogoClick={() => navigation.goToMainDashboard()}
              onProfileClick={() => navigation.goToProfile()}
              onLogout={handleLogout}
              currentPage={navigation.currentPage}
              onNavigate={handleNavigate}
            />
          );
        
        case 'tdah-dashboard':
          return (
            <TDAHDashboard
              onNavigate={(page, data) => {
                if (page === 'tdah-report' && data) {
                  handleViewTDAHReport(data);
                } else {
                  handleNavigate(page);
                }
              }}
            />
          );
        
        case 'tdah-assessment':
          return (
            <LazyTDAHAssessmentForm
              onBack={handleBackToTDAHDashboard}
              onSuccess={handleTDAHAssessmentSuccess}
            />
          );
        
        case 'tdah-report':
          return (
            <LazyTDAHReportViewer
              report={selectedTDAHReport}
              onBack={handleBackToTDAHDashboard}
            />
          );
        
        case 'assessment':
          return (
            <LazyAssessmentForm
              onBack={handleBackToPhysicalDashboard}
              onSuccess={handleAssessmentSuccess}
              onLogoClick={() => navigation.goToMainDashboard()}
              onProfileClick={() => navigation.goToProfile()}
              onLogout={handleLogout}
              currentPage={navigation.currentPage}
              onNavigate={handleNavigate}
            />
          );
        
        case 'report':
          return (
            <LazyReportViewer
              report={selectedReport}
              onBack={handleBackToPhysicalDashboard}
              onLogoClick={() => navigation.goToMainDashboard()}
              onProfileClick={() => navigation.goToProfile()}
              onLogout={handleLogout}
              currentPage={navigation.currentPage}
              onNavigate={handleNavigate}
            />
          );
        
        case 'profile':
          return (
            <LazyUserProfile
              onBack={() => navigation.goToMainDashboard()}
              onLogoClick={() => navigation.goToMainDashboard()}
              onProfileClick={() => navigation.goToProfile()}
              onLogout={handleLogout}
              currentPage={navigation.currentPage}
              onNavigate={handleNavigate}
            />
          );
        
        default:
          return (
            <MainDashboard
              onNavigateToPhysical={() => navigation.goToPhysicalDashboard()}
              onNavigateToTDAH={() => navigation.goToTDAHDashboard()}
              onLogout={handleLogout}
            />
          );
      }
    }

    // Se não está logado, mostrar as seções normais
    switch (currentSection) {
      case 'about':
        return <AboutSection onBack={() => setCurrentSection('home')} />;
      case 'auth':
        return <LazyAuthSection onBack={() => setCurrentSection('home')} onLogin={() => setCurrentSection('home')} />;
      default:
        return <HomePage setCurrentSection={setCurrentSection} />;
    }
  };

  // Se usuário está logado, renderizar com sidebar
  if (user && !loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-green-50 via-white to-emerald-50">
          <AppSidebar 
            currentPage={navigation.currentPage}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
          <main className="flex-1 flex flex-col">
            <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 sticky top-0 z-10">
              <SidebarTrigger />
            </header>
            <div className="flex-1 overflow-auto">
              {renderSection()}
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // Se não está logado, renderizar sem sidebar
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header - apenas para usuários não logados */}
      {!user && (
        <Header setCurrentSection={setCurrentSection} />
      )}

      {/* Main Content */}
      <main>
        {renderSection()}
      </main>
    </div>
  );
};

export default AppContent;