import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DeviceTable } from '@/components/devices/DeviceTable';
import { MetricCard } from '@/components/devices/MetricCard';
import { Device, getDeviceStatus } from '@/types/database';
import { Cpu, Zap, WifiOff, RefreshCw, Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export default function Devices() {
  const { profile, role } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = role === 'super_admin';

  useEffect(() => {
    fetchDevices();
  }, [profile?.org_id, role]);

  useEffect(() => {
    const filter = isSuperAdmin ? {} : { filter: `org_id=eq.${profile?.org_id}` };
    
    const channel = supabase
      .channel('devices-page-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devices',
          ...filter,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setDevices((prev) =>
              prev.map((d) =>
                d.id === payload.new.id ? { ...d, ...payload.new } : d
              )
            );
          } else if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            fetchDevices();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.org_id, isSuperAdmin]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('devices')
        .select(`*, organization:organizations(*)`)
        .order('name');

      if (!isSuperAdmin && profile?.org_id) {
        query = query.eq('org_id', profile.org_id);
      }

      const { data, error } = await query;
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

  const onlineCount = devices.filter((d) => getDeviceStatus(d.last_ping) === 'online').length;
  const offlineCount = devices.filter((d) => getDeviceStatus(d.last_ping) === 'offline').length;
  const speakingCount = devices.filter((d) => d.is_speaking).length;

  return (
    <div className="p-6 space-y-6 industrial-grid min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Cpu className="w-6 h-6 text-primary" />
            {isSuperAdmin ? 'Todos os Dispositivos' : 'Meus Totens'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie e monitore seus dispositivos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchDevices} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Dispositivo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total" value={devices.length} subtitle="Dispositivos" icon={Cpu} />
        <MetricCard title="Online" value={onlineCount} subtitle="Últimos 60s" icon={Zap} variant="success" />
        <MetricCard title="Offline" value={offlineCount} subtitle="Requer atenção" icon={WifiOff} variant={offlineCount > 0 ? 'danger' : 'default'} />
        <MetricCard title="Interagindo" value={speakingCount} subtitle="Avatares ativos" icon={MessageSquare} variant={speakingCount > 0 ? 'success' : 'default'} />
      </div>

      <DeviceTable devices={devices} showOrganization={isSuperAdmin} loading={loading} />
    </div>
  );
}
