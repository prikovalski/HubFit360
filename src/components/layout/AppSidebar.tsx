import { User, Brain, Activity, LogOut, ChevronDown, Info } from 'lucide-react';
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

interface AppSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onShowAbout: () => void;
}

export function AppSidebar({ currentPage, onNavigate, onLogout, onShowAbout }: AppSidebarProps) {
  const { state, setOpen } = useSidebar();
  const { siteName } = useSiteConfig();
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
        <div className="flex items-center gap-2 px-4 py-3">
          <Activity className="h-6 w-6 text-green-600" />
          {!isCollapsed && (
            <span className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {siteName}
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
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
          <Collapsible defaultOpen={isActive('tdah-dashboard') || isActive('tdah-assessment') || isActive('tdah-report')}>
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
                      onClick={() => onNavigate('tdah-dashboard')}
                      isActive={isActive('tdah-dashboard')}
                      className={isActive('tdah-dashboard') ? 'bg-purple-50 text-purple-700' : ''}
                    >
                      {!isCollapsed && <span>TDAH - Avaliação Rápida</span>}
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
                  <Activity className="h-4 w-4 text-green-600" />
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
