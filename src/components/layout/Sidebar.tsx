import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  Activity,
  Building2,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Cpu,
  Brain,
  PanelTop,
  LayoutDashboard,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logoAitinet from '@/assets/logo-aitinet.png';

interface NavGroup {
  label: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  items: {
    title: string;
    icon: React.ElementType;
    path: string;
    showFor: 'all' | 'super_admin';
  }[];
}

export function Sidebar() {
  const { profile, role, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isSuperAdmin = role === 'super_admin';

  const navGroups: NavGroup[] = [
    {
      label: 'Principal',
      icon: LayoutDashboard,
      defaultOpen: true,
      items: [
        { title: 'Monitor ao Vivo', icon: Activity, path: '/dashboard', showFor: 'all' },
        { title: isSuperAdmin ? 'Todos Dispositivos' : 'Meus Totens', icon: Cpu, path: '/dashboard/devices', showFor: 'all' },
        { title: 'Page Builder', icon: PanelTop, path: '/dashboard/page-editor', showFor: 'all' },
        { title: 'Configurações IA', icon: Brain, path: '/dashboard/ai-configs', showFor: 'super_admin' },
      ],
    },
    {
      label: 'Administração',
      icon: Shield,
      defaultOpen: true,
      items: [
        { title: 'Organizações', icon: Building2, path: '/dashboard/organizations', showFor: 'super_admin' },
        { title: 'Usuários', icon: Users, path: '/dashboard/users', showFor: 'super_admin' },
        { title: 'Configurações', icon: Settings, path: '/dashboard/settings', showFor: 'super_admin' },
      ],
    },
  ];

  // Filter groups by role and remove empty groups
  const filteredGroups = navGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => item.showFor === 'all' || item.showFor === role),
    }))
    .filter(group => group.items.length > 0);

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src={logoAitinet} alt="AITINET" className="h-9 w-auto flex-shrink-0" />
          {!collapsed && (
            <div className="animate-slide-in-left">
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                AITI<span className="text-primary">.</span>MANAGER
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                {isSuperAdmin ? 'Super Admin' : 'Admin da Organização'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
        {filteredGroups.map((group) => (
          <SidebarGroup
            key={group.label}
            group={group}
            collapsed={collapsed}
            currentPath={location.pathname}
          />
        ))}
      </nav>

      {/* User info & actions */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {!collapsed && profile && (
          <div className="px-3 py-2 bg-sidebar-accent/50 rounded-lg">
            <p className="text-sm font-medium text-foreground truncate">
              {profile.full_name || 'Operador'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile.email}
            </p>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'w-full text-muted-foreground hover:text-foreground hover:bg-sidebar-accent',
            collapsed && 'px-2'
          )}
          onClick={signOut}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Sair</span>}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'w-full text-muted-foreground hover:text-foreground hover:bg-sidebar-accent',
            collapsed && 'px-2'
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="ml-2">Recolher</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

/* ── Collapsible Sidebar Group ── */
function SidebarGroup({ group, collapsed, currentPath }: {
  group: NavGroup;
  collapsed: boolean;
  currentPath: string;
}) {
  const hasActiveItem = group.items.some(item =>
    item.path === '/dashboard' ? currentPath === '/dashboard' : currentPath.startsWith(item.path)
  );
  const [open, setOpen] = useState(group.defaultOpen ?? hasActiveItem);

  // When sidebar is collapsed, show only icons without grouping
  if (collapsed) {
    return (
      <div className="space-y-1">
        {group.items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className="flex items-center justify-center px-2 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-primary"
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
          </NavLink>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {/* Group header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest hover:text-muted-foreground transition-colors"
      >
        <group.icon className="w-3.5 h-3.5" />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown className={cn(
          'w-3 h-3 transition-transform duration-200',
          !open && '-rotate-90'
        )} />
      </button>

      {/* Group items with tree line */}
      {open && (
        <div className="relative ml-[18px] pl-3 border-l border-sidebar-border/40 space-y-0.5">
          {group.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors relative before:absolute before:left-[-12px] before:top-1/2 before:w-2.5 before:h-px before:bg-sidebar-border/40"
              activeClassName="bg-sidebar-accent text-sidebar-primary before:!bg-primary"
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{item.title}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}