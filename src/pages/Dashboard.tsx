import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DeviceTable } from '@/components/devices/DeviceTable';
import { MetricCard } from '@/components/devices/MetricCard';
import { Device, Organization, getDeviceStatus } from '@/types/database';
import { Activity, Cpu, WifiOff, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Dashboard() {
  const { role, profile } = useAuth();
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [devices, setDevices] = useState<Device[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = role === 'super_admin';

  // Fetch data from Supabase
  useEffect(() => {
    fetchData();
  }, [role, profile]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('devices-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devices',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setDevices((prev) =>
              prev.map((d) =>
                d.id === payload.new.id ? { ...d, ...payload.new } : d
              )
            );
          } else if (payload.eventType === 'INSERT') {
            fetchData();
          } else if (payload.eventType === 'DELETE') {
            setDevices((prev) => prev.filter((d) => d.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch organizations
      const { data: orgsData } = await supabase
        .from('organizations')
        .select('*')
        .order('name');

      if (orgsData) {
        setOrganizations(orgsData as Organization[]);
      }

      // Fetch devices with organization info
      const { data: devicesData } = await supabase
        .from('devices')
        .select(`
          *,
          organization:organizations(*)
        `)
        .order('name');

      if (devicesData) {
        setDevices(devicesData as Device[]);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter devices based on selected org
  const filteredDevices =
    selectedOrg === 'all'
      ? devices
      : devices.filter((d) => d.org_id === selectedOrg);

  // Calculate metrics
  const onlineCount = filteredDevices.filter(
    (d) => getDeviceStatus(d.last_ping) === 'online'
  ).length;
  const offlineCount = filteredDevices.filter(
    (d) => getDeviceStatus(d.last_ping) === 'offline'
  ).length;
  const totalCount = filteredDevices.length;
  const uptimePercent = totalCount > 0 ? Math.round((onlineCount / totalCount) * 100) : 0;

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div className="p-6 space-y-6 industrial-grid min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Monitor ao Vivo
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Status da frota em tempo real e gerenciamento de dispositivos
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Org filter (Super Admin only) */}
          {isSuperAdmin && (
            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger className="w-[200px] bg-input border-border">
                <SelectValue placeholder="Filtrar por organização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Organizações</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            variant="outline"
            size="sm"
            className="border-border"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Dispositivos"
          value={totalCount}
          subtitle="Registrados na frota"
          icon={Cpu}
        />
        <MetricCard
          title="Online"
          value={onlineCount}
          subtitle="Últimos 60 segundos"
          icon={Zap}
          variant="success"
        />
        <MetricCard
          title="Offline"
          value={offlineCount}
          subtitle="Requer atenção"
          icon={WifiOff}
          variant={offlineCount > 0 ? 'danger' : 'default'}
        />
        <MetricCard
          title="Disponibilidade"
          value={`${uptimePercent}%`}
          subtitle="Uptime da frota"
          icon={Activity}
          variant={uptimePercent >= 90 ? 'success' : uptimePercent >= 70 ? 'warning' : 'danger'}
        />
      </div>

      {/* Device Table */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Status da Frota</h2>
        <DeviceTable
          devices={filteredDevices}
          showOrganization={isSuperAdmin && selectedOrg === 'all'}
          loading={loading}
        />
      </div>
    </div>
  );
}
