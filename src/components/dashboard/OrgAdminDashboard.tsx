import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DeviceTable } from '@/components/devices/DeviceTable';
import { MetricCard } from '@/components/devices/MetricCard';
import { Device, getDeviceStatus } from '@/types/database';
import { Activity, Cpu, WifiOff, Zap, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export function OrgAdminDashboard() {
  const { profile } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.org_id) {
      fetchDevices();
    }
  }, [profile?.org_id]);

  // Force re-render every 15s to recalculate online/offline status
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 15000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!profile?.org_id) return;

    const channel = supabase
      .channel('org-devices-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devices',
          filter: `org_id=eq.${profile.org_id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setDevices((prev) =>
              prev.map((d) =>
                d.id === payload.new.id ? { ...d, ...payload.new } : d
              )
            );
          } else if (payload.eventType === 'INSERT') {
            fetchDevices();
          } else if (payload.eventType === 'DELETE') {
            setDevices((prev) => prev.filter((d) => d.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.org_id]);

  const fetchDevices = async () => {
    if (!profile?.org_id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('org_id', profile.org_id)
        .order('name');

      if (error) throw error;

      if (data) {
        const mappedDevices = data.map((d: any) => ({
          ...d,
          avatar_config: d.avatar_config || null,
          model_3d_url: d.model_3d_url || null,
          is_speaking: d.is_speaking || false,
          last_interaction: d.last_interaction || null,
          status_details: d.status_details || null,
        })) as Device[];
        setDevices(mappedDevices);
      }
    } catch (error) {
      console.error('Erro ao buscar dispositivos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const onlineCount = devices.filter(
    (d) => getDeviceStatus(d.last_ping) === 'online'
  ).length;
  const offlineCount = devices.filter(
    (d) => getDeviceStatus(d.last_ping) === 'offline'
  ).length;
  const speakingCount = devices.filter((d) => d.is_speaking).length;
  const totalCount = devices.length;
  const uptimePercent = totalCount > 0 ? Math.round((onlineCount / totalCount) * 100) : 0;

  return (
    <div className="p-6 space-y-6 industrial-grid min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Meus Totens
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor em tempo real dos seus dispositivos
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="border-border"
          onClick={fetchDevices}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Totens"
          value={totalCount}
          subtitle="Na sua organização"
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
          title="Interagindo"
          value={speakingCount}
          subtitle="Avatares ativos"
          icon={MessageSquare}
          variant={speakingCount > 0 ? 'success' : 'default'}
        />
      </div>

      {/* Device Table */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Status dos Totens</h2>
        <DeviceTable
          devices={devices}
          showOrganization={false}
          loading={loading}
        />
      </div>
    </div>
  );
}
