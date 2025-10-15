import { User, Brain, Activity, LogOut, ChevronDown, Info, Dumbbell, Home, Coins, Sparkles } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useUserCredits } from '@/hooks/useUserCredits';
import { Badge } from '@/components/ui/badge';

interface AppSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onShowAbout: () => void;
}

export function AppSidebar({ currentPage, onNavigate, onLogout, onShowAbout }: AppSidebarProps) {
  const { state, setOpen } = useSidebar();
  const { siteName } = useSiteConfig();
  const { balance } = useUserCredits();
  const isCollapsed = state === "collapsed";

  const isActive = (page: string) => currentPage === page;

  return (
    <Sidebar 
      className={isCollapsed ? "w-14" : "w-64"} 
      collapsible="icon"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Header */}
      <SidebarHeader className="border-b">
        <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center p-1' : 'px-4 py-3'}`}>
          <img 
            src="/lovable-uploads/logo-new.png" 
            alt="Logo HubFit360" 
            className={`transition-all duration-300 ${isCollapsed ? 'h-8 w-8' : 'h-10 w-10'}`}
          />
          {!isCollapsed && (
            <span className="font-bold text-lg bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              {siteName}
            </span>
          )}
        </div>
        
        {/* Créditos */}
        <div className={`${isCollapsed ? 'px-2 py-2' : 'px-4 py-3'} border-t bg-gradient-to-r from-primary/5 to-purple-500/5`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
            {isCollapsed ? (
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                {balance}
              </Badge>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Créditos</span>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 font-bold">
                  {balance}
                </Badge>
              </>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Tela Inicial */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => onNavigate('main-dashboard')}
                isActive={isActive('main-dashboard')}
                className={isActive('main-dashboard') ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}
              >
                <Home className="h-4 w-4" />
                {!isCollapsed && <span>Tela Inicial</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Perfil */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => onNavigate('profile')}
                isActive={isActive('profile')}
                className={isActive('profile') ? 'bg-green-50 text-green-700 hover:bg-green-100' : ''}
              >
                <User className="h-4 w-4" />
                {!isCollapsed && <span>Perfil</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Avaliações Psicológicas */}
        <SidebarGroup>
          <Collapsible defaultOpen={isActive('tdah-dashboard') || isActive('tdah-assessment') || isActive('tdah-report') || isActive('diva2-assessment') || isActive('big-five-dashboard') || isActive('big-five-assessment')}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                  <Brain className="h-4 w-4 text-purple-600" />
                  {!isCollapsed && (
                    <>
                      <span>Avaliações Psicológicas</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                    </>
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      onClick={() => onNavigate('tdah-assessment')}
                      isActive={isActive('tdah-assessment')}
                      className={isActive('tdah-assessment') ? 'bg-purple-50 text-purple-700' : ''}
                    >
                      {!isCollapsed && <span>TDAH - Avaliação Rápida</span>}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      onClick={() => onNavigate('diva2-assessment')}
                      isActive={isActive('diva2-assessment')}
                      className={isActive('diva2-assessment') ? 'bg-purple-50 text-purple-700' : ''}
                    >
                      {!isCollapsed && <span>TDAH - DIVA 2.0</span>}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      onClick={() => onNavigate('big-five-dashboard')}
                      isActive={isActive('big-five-dashboard') || isActive('big-five-assessment')}
                      className={isActive('big-five-dashboard') || isActive('big-five-assessment') ? 'bg-purple-50 text-purple-700' : ''}
                    >
                      {!isCollapsed && (
                        <div className="flex items-center gap-2">
                          <span>Big Five - Personalidade</span>
                          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 text-[10px] px-1 py-0">
                            Novo
                          </Badge>
                        </div>
                      )}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarGroup>

        {/* Avaliações Físicas */}
        <SidebarGroup>
          <Collapsible defaultOpen={isActive('physical-dashboard') || isActive('assessment') || isActive('report')}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                  <Dumbbell className="h-4 w-4 text-green-600" />
                  {!isCollapsed && (
                    <>
                      <span>Avaliações Físicas</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                    </>
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      onClick={() => onNavigate('physical-dashboard')}
                      isActive={isActive('physical-dashboard')}
                      className={isActive('physical-dashboard') ? 'bg-green-50 text-green-700' : ''}
                    >
                      {!isCollapsed && <span>Avaliação por IA</span>}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - Sobre e Sair */}
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onShowAbout}
              className="hover:bg-muted"
            >
              <Info className="h-4 w-4" />
              {!isCollapsed && <span>Sobre o HubFit360</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onLogout}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
