import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  Server,
  Activity,
  Building2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Cpu,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const { profile, role, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isSuperAdmin = role === 'super_admin';

  const navItems = [
    {
      title: 'Monitor ao Vivo',
      icon: Activity,
      path: '/dashboard',
      showFor: 'all' as const,
    },
    {
      title: 'Todos Dispositivos',
      icon: Cpu,
      path: '/dashboard/devices',
      showFor: 'all' as const,
    },
    {
      title: 'Organizações',
      icon: Building2,
      path: '/dashboard/organizations',
      showFor: 'super_admin' as const,
    },
    {
      title: 'Configurações',
      icon: Settings,
      path: '/dashboard/settings',
      showFor: 'all' as const,
    },
  ];

  const filteredItems = navItems.filter(
    (item) => item.showFor === 'all' || item.showFor === role
  );

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <Server className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="animate-slide-in-left">
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                NEXUS<span className="text-primary">.</span>FLEET
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                {isSuperAdmin ? 'Super Admin' : 'Admin da Organização'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors',
              collapsed && 'justify-center px-2'
            )}
            activeClassName="bg-sidebar-accent text-sidebar-primary"
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">{item.title}</span>
            )}
          </NavLink>
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

        {/* Collapse toggle */}
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
