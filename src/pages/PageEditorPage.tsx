import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Cpu, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FreeFormEditor } from '@/editor/canvas/FreeFormEditor';
import { getDeviceStatus, type DeviceStatus } from '@/types/database';
import { cn } from '@/lib/utils';
import type { CanvasState } from '@/editor/types/canvas';
import { DEFAULT_CANVAS_STATE } from '@/editor/types/canvas';

interface DeviceSummary {
  id: string;
  name: string;
  location: string | null;
  last_ping: string | null;
  org_id: string;
  organization?: { name: string } | null;
}

export default function PageEditorPage() {
  const { role } = useAuth();
  const [devices, setDevices] = useState<DeviceSummary[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [canvasState, setCanvasState] = useState<CanvasState | null>(null);

  const selectedDevice = devices.find(d => d.id === selectedDeviceId) || null;

  // Fetch devices list
  useEffect(() => {
    async function fetchDevices() {
      const { data, error } = await supabase
        .from('devices')
        .select('id, name, location, last_ping, org_id, organization:organizations(name)')
        .order('name');
      if (error) {
        console.error('Erro ao carregar dispositivos:', error);
        toast.error('Erro ao carregar dispositivos');
      }
      if (data) {
        const mapped = data.map(d => ({
          ...d,
          organization: Array.isArray(d.organization) ? d.organization[0] : d.organization,
        })) as DeviceSummary[];
        setDevices(mapped);
        if (mapped.length > 0) {
          setSelectedDeviceId(prev => prev ?? mapped[0].id);
        }
      }
      setLoadingDevices(false);
    }
    fetchDevices();
  }, []);

  // Load canvas state from ui_config when device changes
  useEffect(() => {
    if (!selectedDeviceId) return;
    setLoadingConfig(true);

    async function loadConfig() {
      const { data, error } = await supabase
        .from('devices')
        .select('ui_config')
        .eq('id', selectedDeviceId!)
        .single();

      if (error) {
        toast.error('Erro ao carregar configuração do dispositivo');
        setLoadingConfig(false);
        return;
      }

      const raw = data?.ui_config as Record<string, any> | null;
      // Check if there's a free_canvas key in the existing config
      if (raw?.free_canvas) {
        setCanvasState(raw.free_canvas as CanvasState);
      } else {
        setCanvasState(DEFAULT_CANVAS_STATE);
      }
      setLoadingConfig(false);
    }
    loadConfig();
  }, [selectedDeviceId]);

  const handleSave = async (state: CanvasState) => {
    if (!selectedDeviceId) return;

    try {
      // Use a lightweight RPC-style update to avoid loading the full ui_config
      const { data: existing } = await supabase
        .from('devices')
        .select('ui_config')
        .eq('id', selectedDeviceId)
        .single();

      const currentConfig = (existing?.ui_config as Record<string, any>) || {};
      
      // Only update free_canvas, keep other keys
      const updatedConfig = { ...currentConfig, free_canvas: state };

      const { error } = await supabase
        .from('devices')
        .update({
          ui_config: updatedConfig as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedDeviceId);

      if (error) {
        toast.error('Erro ao salvar: ' + error.message);
        console.error(error);
        throw error;
      }
    } catch (err) {
      console.error('Save failed:', err);
      throw err;
    }
  };

  const handlePublish = async (state: CanvasState) => {
    try {
      await handleSave(state);
    } catch {
      toast.error('Falha ao salvar — publicação cancelada');
      return;
    }

    toast.success('Layout publicado no dispositivo!');

    // Broadcast a lightweight reload signal
    if (selectedDeviceId) {
      try {
        const channel = supabase.channel(`live-preview:${selectedDeviceId}`);
        await channel.send({
          type: 'broadcast',
          event: 'ui-update',
          payload: { reload: true, ts: Date.now() },
        });
        supabase.removeChannel(channel);
      } catch (err) {
        console.warn('Broadcast falhou, totem usará polling:', err);
      }
    }
  };

  const getStatus = (d: DeviceSummary): DeviceStatus => getDeviceStatus(d.last_ping);

  if (loadingDevices) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Cpu className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-1">Nenhum dispositivo encontrado</h2>
        <p className="text-sm text-muted-foreground">Cadastre um dispositivo primeiro para usar o Page Builder.</p>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 space-y-2">
      {/* Device selector */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 min-w-[220px] justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  selectedDevice
                    ? (getStatus(selectedDevice) === 'online' ? 'bg-primary' : 'bg-muted-foreground/40')
                    : 'bg-muted-foreground/40'
                )} />
                <span className="truncate text-sm font-medium">
                  {selectedDevice?.name || 'Selecione um dispositivo'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[280px]">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Dispositivos</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {devices.map((d) => {
              const status = getStatus(d);
              const isSelected = d.id === selectedDeviceId;
              return (
                <DropdownMenuItem
                  key={d.id}
                  onClick={() => setSelectedDeviceId(d.id)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    status === 'online' ? 'bg-primary' : 'bg-muted-foreground/40'
                  )} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block truncate">{d.name}</span>
                    {d.location && (
                      <span className="text-[10px] text-muted-foreground truncate block">{d.location}</span>
                    )}
                  </div>
                  {d.organization?.name && (
                    <Badge variant="outline" className="text-[9px] shrink-0">{d.organization.name}</Badge>
                  )}
                  {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {selectedDevice?.location && (
          <span className="text-xs text-muted-foreground hidden sm:inline">📍 {selectedDevice.location}</span>
        )}
      </div>

      {/* Canvas Editor */}
      {loadingConfig ? (
        <Skeleton className="h-[calc(100vh-12rem)] rounded-xl" />
      ) : (
        <FreeFormEditor
          initialState={canvasState}
          onSave={handleSave}
          onPublish={handlePublish}
          deviceName={selectedDevice?.name || 'Totem'}
        />
      )}
    </div>
  );
}
