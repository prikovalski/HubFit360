
import { useState } from 'react';
import { Activity } from 'lucide-react';
import AboutSection from '@/components/AboutSection';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import Header from '@/components/home/Header';
import HomePage from '@/components/home/HomePage';
import LazyUserDashboard from '@/components/lazy/LazyUserDashboard';
import LazyAuthSection from '@/components/lazy/LazyAuthSection';

const AppContent = () => {
  const [currentSection, setCurrentSection] = useState('home');
  const { user, signOut } = useAuth();
  const { userProfile, loading } = useUserProfile();

  const handleLogout = async () => {
    await signOut();
    setCurrentSection('home');
  };

  const renderSection = () => {
    // Se o usuário está logado, sempre mostrar o dashboard (mesmo que o perfil ainda esteja carregando)
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

      // Se o usuário está logado e o perfil foi carregado (ou falhou ao carregar), mostrar dashboard
      return <LazyUserDashboard user={userProfile || { name: user.email, id: user.id }} onLogout={handleLogout} />;
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
