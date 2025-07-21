
import { useState, useEffect } from 'react';
import { Activity, Sparkles } from 'lucide-react';
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
    // ANTI-LOOP: Prevenir múltiplos redirecionamentos
    if (user && currentSection === 'home' && !isLoggingOut) {
      console.log('AppContent: Usuario logado detectado, redirecionando para dashboard (APENAS UMA VEZ)');
      setCurrentSection('dashboard');
    }
  }, [user, isLoggingOut]); // Removido currentSection da dependência para evitar loop

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
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0">
              <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-green-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }}></div>
            </div>
            
            {/* Grid pattern overlay */}
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
