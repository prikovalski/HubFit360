import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import AboutSection from '@/components/AboutSection';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import Header from '@/components/home/Header';
import HomePage from '@/components/home/HomePage';
import LazyUserDashboard from '@/components/lazy/LazyUserDashboard';
import LazyAuthSection from '@/components/lazy/LazyAuthSection';
import LazyAssessmentForm from '@/components/lazy/LazyAssessmentForm';
import LazyReportViewer from '@/components/lazy/LazyReportViewer';
import LazyUserProfile from '@/components/lazy/LazyUserProfile';

const AppContent = () => {
  const [currentSection, setCurrentSection] = useState('home');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, signOut } = useAuth();
  const { userProfile, loading } = useUserProfile();

  // Auto-redirect to dashboard when user logs in (but not during logout)
  useEffect(() => {
    if (user && currentSection === 'home' && !isLoggingOut) {
      console.log('Usuario logado detectado, redirecionando para dashboard');
      setCurrentSection('dashboard');
    }
  }, [user, currentSection, isLoggingOut]);

  const handleLogout = async () => {
    try {
      console.log('AppContent: Iniciando logout...');
      setIsLoggingOut(true);
      
      await signOut();
      
      // Resetar estado da aplicação
      setCurrentSection('home');
      setSelectedReport(null);
      
      console.log('AppContent: Logout concluído, redirecionando para home');
    } catch (error) {
      console.error('AppContent: Erro no logout:', error);
      // Mesmo com erro, resetar o estado da aplicação
      setCurrentSection('home');
      setSelectedReport(null);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNewAssessment = () => {
    setCurrentSection('assessment');
  };

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setCurrentSection('report');
  };

  const handleBackToDashboard = () => {
    setCurrentSection('dashboard');
    setSelectedReport(null);
  };

  const handleAssessmentSuccess = (assessment: any) => {
    setSelectedReport(assessment);
    setCurrentSection('report');
  };

  const renderSection = () => {
    // Se o usuário está logado, mostrar as seções do dashboard
    if (user) {
      if (loading) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#019f80] to-[#4ade80] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-600">Carregando dashboard...</p>
            </div>
          </div>
        );
      }

      // Renderizar seções baseadas no estado atual
      switch (currentSection) {
        case 'assessment':
          return (
            <LazyAssessmentForm
              onBack={handleBackToDashboard}
              onSuccess={handleAssessmentSuccess}
              onLogoClick={handleBackToDashboard}
              onProfileClick={() => setCurrentSection('profile')}
              onLogout={handleLogout}
            />
          );
        case 'report':
          return (
            <LazyReportViewer
              report={selectedReport}
              onBack={handleBackToDashboard}
              onLogoClick={handleBackToDashboard}
              onProfileClick={() => setCurrentSection('profile')}
              onLogout={handleLogout}
            />
          );
        case 'profile':
          return (
            <LazyUserProfile
              onBack={handleBackToDashboard}
              onLogoClick={handleBackToDashboard}
              onProfileClick={() => setCurrentSection('profile')}
              onLogout={handleLogout}
            />
          );
        default:
          return (
            <LazyUserDashboard
              onNewAssessment={handleNewAssessment}
              onViewReport={handleViewReport}
              onLogoClick={() => setCurrentSection('dashboard')}
              onProfileClick={() => setCurrentSection('profile')}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
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
