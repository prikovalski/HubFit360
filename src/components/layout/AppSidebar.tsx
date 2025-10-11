import { Home, Activity, Brain, User } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

interface AppSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { 
    title: 'Dashboard', 
    page: 'main-dashboard', 
    icon: Home,
    description: 'Visão geral'
  },
  { 
    title: 'Avaliação Física', 
    page: 'physical-dashboard', 
    icon: Activity,
    description: 'Análise corporal por IA'
  },
  { 
    title: 'Avaliação TDAH', 
    page: 'tdah-dashboard', 
    icon: Brain,
    description: 'Questionário de TDAH'
  },
  { 
    title: 'Meu Perfil', 
    page: 'profile', 
    icon: User,
    description: 'Dados pessoais'
  },
];

export function AppSidebar({ currentPage, onNavigate }: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'opacity-0' : ''}>
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = currentPage === item.page;
                const Icon = item.icon;
                
                return (
                  <SidebarMenuItem key={item.page}>
                    <SidebarMenuButton
                      onClick={() => onNavigate(item.page)}
                      isActive={isActive}
                      tooltip={isCollapsed ? item.title : undefined}
                      className={isActive ? 'bg-primary/10 text-primary font-medium' : ''}
                    >
                      <Icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}