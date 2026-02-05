import { useAuth } from '@/hooks/useAuth';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';
import { OrgAdminDashboard } from '@/components/dashboard/OrgAdminDashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Render different dashboards based on user role
  if (role === 'super_admin') {
    return <SuperAdminDashboard />;
  }

  return <OrgAdminDashboard />;
}
