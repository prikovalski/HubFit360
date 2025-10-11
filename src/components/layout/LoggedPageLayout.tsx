
import LoggedHeader from './LoggedHeader';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface LoggedPageLayoutProps {
  children: React.ReactNode;
  userName?: string;
  currentPage: string;
  onLogoClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

const LoggedPageLayout = ({ 
  children, 
  userName,
  currentPage,
  onLogoClick, 
  onProfileClick, 
  onLogout,
  onNavigate
}: LoggedPageLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-green-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-emerald-300/20 to-green-300/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '-6s' }}></div>
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid-bg opacity-30"></div>
        
        <AppSidebar currentPage={currentPage} onNavigate={onNavigate} />
        
        <div className="flex-1 flex flex-col relative z-10">
          <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4">
              <SidebarTrigger className="mr-4" />
              <LoggedHeader
                userName={userName}
                onLogoClick={onLogoClick}
                onProfileClick={onProfileClick}
                onLogout={onLogout}
              />
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default LoggedPageLayout;
