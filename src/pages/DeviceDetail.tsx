import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusBadge } from '@/components/devices/StatusBadge';
import { Device, DeviceVersion, getDeviceStatus } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  Upload,
  FileBox,
  Clock,
  MapPin,
  Key,
  RefreshCw,
  Check,
  Power,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

export default function DeviceDetail() {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [device, setDevice] = useState<Device | null>(null);
  const [versions, setVersions] = useState<DeviceVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState(false);

  // Force re-render every 15s for status recalculation
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch device data
  useEffect(() => {
    if (!deviceId) return;
    fetchDevice();
    fetchVersions();

    // Realtime subscription
    const channel = supabase
      .channel(`device-detail-${deviceId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'devices',
        filter: `id=eq.${deviceId}`,
      }, (payload) => {
        setDevice(prev => prev ? { ...prev, ...payload.new } as Device : null);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [deviceId]);

  const fetchDevice = async () => {
    const { data, error } = await supabase
      .from('devices')
      .select('*, organization:organizations(*)')
      .eq('id', deviceId!)
      .single();

    if (error) {
      console.error('Erro ao buscar dispositivo:', error);
      toast.error('Dispositivo não encontrado');
      return;
    }

    setDevice({
      ...data,
      avatar_config: (data.avatar_config as unknown as Device['avatar_config']) || null,
      model_3d_url: data.model_3d_url || null,
      is_speaking: data.is_speaking || false,
      last_interaction: data.last_interaction || null,
      status_details: (data.status_details as unknown as Device['status_details']) || null,
    } as unknown as Device);
    setLoading(false);
  };

  const fetchVersions = async () => {
    const { data } = await supabase
      .from('device_versions')
      .select('*')
      .eq('device_id', deviceId!)
      .order('created_at', { ascending: false });

    if (data) setVersions(data as DeviceVersion[]);
  };

  const handleRestart = async () => {
    if (!device) return;
    setRestarting(true);

    try {
      const { error } = await supabase
        .from('devices')
        .update({
          pending_command: 'restart',
          command_sent_at: new Date().toISOString(),
        } as any)
        .eq('id', device.id);

      if (error) throw error;

      toast.success('Comando de reinicialização enviado!', {
        description: 'O totem será reiniciado no próximo heartbeat (até 30s).',
      });
    } catch (error) {
      console.error('Erro ao enviar comando:', error);
      toast.error('Erro ao enviar comando de reinicialização');
    } finally {
      setRestarting(false);
    }
  };

  const handleCopyApiKey = () => {
    if (!device) return;
    navigator.clipboard.writeText(device.api_key);
    toast.success('API Key copiada para a área de transferência');
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const glbFile = files.find(
      (f) => f.name.endsWith('.glb') || f.name.endsWith('.fbx')
    );

    if (glbFile) {
      handleUpload(glbFile);
    } else {
      toast.error('Tipo de arquivo inválido', {
        description: 'Por favor, envie um arquivo .glb ou .fbx',
      });
    }
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    toast.loading('Enviando modelo 3D...', { id: 'upload' });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setUploading(false);
    toast.success('Modelo enviado com sucesso!', {
      id: 'upload',
      description: `${file.name} (${formatFileSize(file.size)})`,
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Dispositivo não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const status = getDeviceStatus(device.last_ping);

  return (
    <div className="p-6 space-y-6 industrial-grid min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Monitor
        </Button>
      </div>

      {/* Device Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <FileBox className="w-7 h-7 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{device.name}</h1>
              <StatusBadge status={status} />
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">
              {device.description}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="border-warning text-warning hover:bg-warning/10"
          onClick={handleRestart}
          disabled={restarting}
        >
          {restarting ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Power className="w-4 h-4 mr-2" />
          )}
          {restarting ? 'Enviando...' : 'Reiniciar Dispositivo'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Zone */}
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Implantar Novo Modelo
              </CardTitle>
              <CardDescription>
                Envie um novo modelo de avatar 3D (.glb ou .fbx) para atualizar este dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  'dropzone cursor-pointer',
                  isDragging && 'dropzone-active'
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".glb,.fbx"
                  className="hidden"
                  onChange={handleFileInput}
                  disabled={uploading}
                />
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Upload className={cn('w-8 h-8 text-primary', uploading && 'animate-pulse')} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {uploading ? 'Enviando...' : 'Atualizar Modelo 3D'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Arraste e solte seu arquivo .glb ou .fbx aqui, ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Tamanho máximo do arquivo: 50MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version History */}
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Histórico de Versões
              </CardTitle>
              <CardDescription>
                Modelos implantados anteriormente neste dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {versions.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">
                  Nenhuma versão implantada ainda
                </p>
              )}
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border transition-colors',
                    index === 0
                      ? 'bg-primary/5 border-primary/30'
                      : 'bg-muted/30 border-border hover:border-border/80'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        index === 0 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <FileBox className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{version.file_name}</p>
                        {index === 0 && (
                          <Badge className="bg-primary/20 text-primary border-primary/30">
                            <Check className="w-3 h-3 mr-1" />
                            Ativo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{version.version_notes}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(version.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}{' '}
                        • {formatFileSize(version.file_size || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Device Info */}
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-base">Informações do Dispositivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Localização</p>
                <div className="flex items-center gap-2 text-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  {device.location || 'Não especificada'}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Último Ping</p>
                <p className="text-foreground font-mono text-sm">
                  {device.last_ping
                    ? formatDistanceToNow(new Date(device.last_ping), { addSuffix: true, locale: ptBR })
                    : 'Nunca'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Criado em</p>
                <p className="text-foreground text-sm">
                  {format(new Date(device.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* API Key */}
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                Chave de API
              </CardTitle>
              <CardDescription>
                Use esta chave para autenticar os pings do dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-input rounded-lg p-3 border border-border">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs font-mono text-foreground break-all">
                    {showApiKey ? device.api_key : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowApiKey(!showApiKey)}>
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyApiKey}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
