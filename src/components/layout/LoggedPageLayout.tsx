
import LoggedHeader from './LoggedHeader';

interface LoggedPageLayoutProps {
  children: React.ReactNode;
  userName?: string;
  onLogoClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

const LoggedPageLayout = ({ 
  children, 
  userName, 
  onLogoClick, 
  onProfileClick, 
  onLogout 
}: LoggedPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-green-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-emerald-300/20 to-green-300/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '-6s' }}></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-bg opacity-30"></div>
      
      <LoggedHeader
        userName={userName}
        onLogoClick={onLogoClick}
        onProfileClick={onProfileClick}
        onLogout={onLogout}
      />
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
};

export default LoggedPageLayout;
