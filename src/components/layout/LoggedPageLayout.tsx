
import LoggedHeader from './LoggedHeader';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useState } from 'react';
import { Activity, Brain, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const [showAboutModal, setShowAboutModal] = useState(false);

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
        
        <AppSidebar 
          currentPage={currentPage} 
          onNavigate={onNavigate} 
          onLogout={onLogout}
          onShowAbout={() => setShowAboutModal(true)}
        />
        
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

        {/* Modal Sobre o HubFit360 */}
        <Dialog open={showAboutModal} onOpenChange={setShowAboutModal}>
          <DialogContent className="max-w-2xl">
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
                <Button 
                  onClick={() => {
                    setShowAboutModal(false);
                    onNavigate('physical-dashboard');
                  }} 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Começar Avaliação Física
                </Button>
                <Button 
                  onClick={() => {
                    setShowAboutModal(false);
                    onNavigate('tdah-dashboard');
                  }} 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Experimentar Avaliação TDAH
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default LoggedPageLayout;
