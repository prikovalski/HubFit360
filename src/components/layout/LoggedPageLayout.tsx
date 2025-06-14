
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <LoggedHeader
        userName={userName}
        onLogoClick={onLogoClick}
        onProfileClick={onProfileClick}
        onLogout={onLogout}
      />
      <main>
        {children}
      </main>
    </div>
  );
};

export default LoggedPageLayout;
