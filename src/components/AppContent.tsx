import { useState, useEffect } from 'react';
import { Activity, Sparkles, Brain } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AboutSection from '@/components/AboutSection';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserCredits } from '@/hooks/useUserCredits';
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
import LazyDIVA2AssessmentForm from '@/components/lazy/LazyDIVA2AssessmentForm';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
const AppContent = () => {
  const [currentSection, setCurrentSection] = useState('home');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedTDAHReport, setSelectedTDAHReport] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const navigation = useNavigation();
  const { balance } = useUserCredits();

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
        return <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-green-200/20 rounded-full blur-3xl animate-float" style={{
              animationDelay: '-3s'
            }}></div>
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
                  {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{
                  animationDelay: `${i * 0.1}s`
                }}></div>)}
                </div>
              </div>
            </div>
          </div>;
      }

      // Renderizar seções baseadas no estado de navegação
      switch (navigation.currentPage) {
        case 'main-dashboard':
          return <MainDashboard onNavigateToPhysical={() => navigation.goToPhysicalDashboard()} onNavigateToTDAH={() => navigation.goToTDAHDashboard()} onLogout={handleLogout} onViewPhysicalReport={handleViewReport} onViewTDAHReport={handleViewTDAHReport} />;
        case 'physical-dashboard':
          return <LazyPhysicalAssessmentDashboard onNewAssessment={handleNewAssessment} onViewReport={handleViewReport} onLogoClick={() => navigation.goToMainDashboard()} onProfileClick={() => navigation.goToProfile()} onLogout={handleLogout} currentPage={navigation.currentPage} onNavigate={handleNavigate} />;
        case 'tdah-dashboard':
          return <TDAHDashboard onNavigate={(page, data) => {
            if (page === 'tdah-report' && data) {
              handleViewTDAHReport(data);
            } else {
              handleNavigate(page);
            }
          }} />;
        case 'tdah-assessment':
          return <LazyTDAHAssessmentForm onBack={handleBackToTDAHDashboard} onSuccess={handleTDAHAssessmentSuccess} />;
        case 'diva2-assessment':
          return <LazyDIVA2AssessmentForm onBack={handleBackToTDAHDashboard} onSuccess={handleTDAHAssessmentSuccess} />;
        case 'tdah-report':
          return <LazyTDAHReportViewer report={selectedTDAHReport} onBack={handleBackToTDAHDashboard} />;
        case 'assessment':
          return <LazyAssessmentForm onBack={handleBackToPhysicalDashboard} onSuccess={handleAssessmentSuccess} onLogoClick={() => navigation.goToMainDashboard()} onProfileClick={() => navigation.goToProfile()} onLogout={handleLogout} currentPage={navigation.currentPage} onNavigate={handleNavigate} />;
        case 'report':
          return <LazyReportViewer report={selectedReport} onBack={handleBackToPhysicalDashboard} onLogoClick={() => navigation.goToMainDashboard()} onProfileClick={() => navigation.goToProfile()} onLogout={handleLogout} currentPage={navigation.currentPage} onNavigate={handleNavigate} />;
        case 'profile':
          return <LazyUserProfile onBack={() => navigation.goToMainDashboard()} onLogoClick={() => navigation.goToMainDashboard()} onProfileClick={() => navigation.goToProfile()} onLogout={handleLogout} currentPage={navigation.currentPage} onNavigate={handleNavigate} />;
        default:
          return <MainDashboard onNavigateToPhysical={() => navigation.goToPhysicalDashboard()} onNavigateToTDAH={() => navigation.goToTDAHDashboard()} onLogout={handleLogout} onViewPhysicalReport={handleViewReport} onViewTDAHReport={handleViewTDAHReport} />;
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
    return <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-green-50 via-white to-emerald-50">
          <AppSidebar currentPage={navigation.currentPage} onNavigate={handleNavigate} onLogout={handleLogout} onShowAbout={() => setShowAboutModal(true)} />
          <main className="flex-1 flex flex-col">
            
            <div className="flex-1 overflow-auto">
              {renderSection()}
            </div>
          </main>

          {/* Modal Sobre o HubFit360 */}
          <Dialog open={showAboutModal} onOpenChange={setShowAboutModal}>
            <DialogContent className="max-w-2xl">
              <div className="text-center py-3 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-t-lg -mt-6 -mx-6 mb-4 border-b">
                <p className="text-sm text-muted-foreground">
                  Créditos Disponíveis: <span className="font-bold text-primary text-lg">{balance}</span>
                </p>
              </div>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  Bem-vindo ao HubFit360
                </DialogTitle>
                <DialogDescription className="text-base">
                  Sua plataforma completa de avaliações em saúde e bem-estar
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="p-3 bg-green-500/10 rounded-lg h-fit">
                      <Activity className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Avaliações Físicas</h3>
                      <p className="text-sm text-muted-foreground">
                        Análise corporal detalhada com cálculo de composição corporal, IMC, massa magra e gordura.
                        Receba recomendações personalizadas geradas por inteligência artificial para atingir seus objetivos.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg h-fit">
                      <Brain className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        Avaliações TDAH
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                          Novo
                        </Badge>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Questionário ASRS-18 cientificamente validado para triagem de TDAH em adultos.
                        Obtenha resultados imediatos com pontuação, classificação e recomendações profissionais.
                        Faça upgrade para relatório premium com análise detalhada por IA.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Sistema de Créditos
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Cada avaliação consome 1 crédito. Você recebeu 1 crédito de boas-vindas! 
                    Adquira mais créditos para continuar usando todas as funcionalidades da plataforma.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => {
                  setShowAboutModal(false);
                  navigation.goToPhysicalDashboard();
                }} className="flex-1 bg-green-600 hover:bg-green-700">
                    <Activity className="mr-2 h-4 w-4" />
                    Começar Avaliação Física
                  </Button>
                  <Button onClick={() => {
                  setShowAboutModal(false);
                  navigation.goToTDAHDashboard();
                }} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Brain className="mr-2 h-4 w-4" />
                    Experimentar Avaliação TDAH
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarProvider>;
  }

  // Se não está logado, renderizar sem sidebar
  return <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header - apenas para usuários não logados */}
      {!user && <Header setCurrentSection={setCurrentSection} />}

      {/* Main Content */}
      <main>
        {renderSection()}
      </main>
    </div>;
};
export default AppContent;