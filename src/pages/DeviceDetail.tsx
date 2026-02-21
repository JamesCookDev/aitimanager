import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusBadge } from '@/components/devices/StatusBadge';
import { Device, DeviceVersion, getDeviceStatus } from '@/types/database';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  ArrowLeft, Copy as CopyIcon, Eye, EyeOff, FileBox, Clock,
  MapPin, Key, RefreshCw, Check, Power, CopyPlus, Pencil, X, GitCompare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { CommandHistory } from '@/components/devices/CommandHistory';
import { PendingCommandBadge } from '@/components/devices/PendingCommandBadge';
import { AIPromptEditor } from '@/components/devices/AIPromptEditor';
import { EnvironmentPresets } from '@/components/devices/EnvironmentPresets';
import { CodeSyncPanel } from '@/components/devices/CodeSyncPanel';

export default function DeviceDetail() {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [showApiKey, setShowApiKey] = useState(false);
  const [device, setDevice] = useState<Device | null>(null);
  const [versions, setVersions] = useState<DeviceVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [editingField, setEditingField] = useState<'name' | 'description' | 'location' | null>(null);
  const [editValue, setEditValue] = useState('');

  const [activeTab, setActiveTab] = useState('ai');

  // Force re-render every 15s for status
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!deviceId) return;
    fetchDevice();
    fetchVersions();

    const channel = supabase
      .channel(`device-detail-${deviceId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'devices',
        filter: `id=eq.${deviceId}`,
      }, (payload) => {
        // Only update non-ui_config fields from realtime to avoid overwriting local builder state
        const { ui_config, ...rest } = payload.new as any;
        setDevice(prev => prev ? { ...prev, ...rest } as Device : null);
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

    const deviceData = {
      ...data,
      avatar_config: (data.avatar_config as unknown as Device['avatar_config']) || null,
      model_3d_url: data.model_3d_url || null,
      is_speaking: data.is_speaking || false,
      last_interaction: data.last_interaction || null,
      status_details: (data.status_details as unknown as Device['status_details']) || null,
    } as unknown as Device;

    setDevice(deviceData);
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
        .update({ pending_command: 'restart', command_sent_at: new Date().toISOString() } as any)
        .eq('id', device.id);
      if (error) throw error;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('command_logs').insert({ device_id: device.id, command: 'restart', sent_by: user.id } as any);
      }
      toast.success('Comando de reinicialização enviado!');
    } catch (error) {
      toast.error('Erro ao enviar comando');
    } finally {
      setRestarting(false);
    }
  };

  const handleCloneDevice = async () => {
    if (!device) return;
    setCloning(true);
    try {
      const { data, error } = await supabase
        .from('devices')
        .insert({
          name: `${device.name} (Cópia)`,
          description: device.description,
          location: device.location,
          org_id: device.org_id,
          ai_prompt: (device as any).ai_prompt,
          avatar_config: device.avatar_config as any,
        } as any)
        .select()
        .single();
      if (error) throw error;
      toast.success('Dispositivo clonado!', {
        action: { label: 'Abrir', onClick: () => navigate(`/dashboard/devices/${data.id}`) },
      });
    } catch (error) {
      toast.error('Erro ao clonar');
    } finally {
      setCloning(false);
    }
  };

  const handleCopyApiKey = () => {
    if (!device) return;
    navigator.clipboard.writeText(device.api_key);
    toast.success('API Key copiada!');
  };

  const startEditing = (field: 'name' | 'description' | 'location') => {
    if (!device) return;
    setEditingField(field);
    setEditValue(field === 'name' ? device.name : field === 'description' ? (device.description || '') : (device.location || ''));
  };

  const cancelEditing = () => { setEditingField(null); setEditValue(''); };

  const saveField = async () => {
    if (!device || !editingField) return;
    const updateData: Record<string, string> = { [editingField]: editValue.trim() };
    try {
      const { error } = await supabase.from('devices').update(updateData).eq('id', device.id);
      if (error) throw error;
      setDevice(prev => prev ? { ...prev, ...updateData } as Device : null);
      toast.success('Campo atualizado!');
    } catch { toast.error('Erro ao atualizar'); }
    finally { setEditingField(null); setEditValue(''); }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
          <Skeleton className="h-[600px]" />
          <Skeleton className="h-[600px]" />
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
    <div className="p-4 space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <FileBox className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {editingField === 'name' ? (
                  <div className="flex items-center gap-1">
                    <input className="text-lg font-bold text-foreground bg-transparent border-b-2 border-primary outline-none" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveField(); if (e.key === 'Escape') cancelEditing(); }} autoFocus />
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={saveField}><Check className="w-3 h-3 text-green-500" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEditing}><X className="w-3 h-3 text-destructive" /></Button>
                  </div>
                ) : (
                  <h1 className="text-lg font-bold text-foreground cursor-pointer hover:text-primary transition-colors group flex items-center gap-1" onClick={() => startEditing('name')}>
                    {device.name}
                    <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                  </h1>
                )}
                <StatusBadge status={status} />
                <PendingCommandBadge command={(device as any).pending_command} />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {editingField === 'location' ? (
                  <div className="flex items-center gap-1">
                    <input className="text-xs bg-transparent border-b border-primary outline-none" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveField(); if (e.key === 'Escape') cancelEditing(); }} autoFocus />
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={saveField}><Check className="w-2.5 h-2.5 text-green-500" /></Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={cancelEditing}><X className="w-2.5 h-2.5 text-destructive" /></Button>
                  </div>
                ) : (
                  <span className="cursor-pointer hover:text-foreground flex items-center gap-1" onClick={() => startEditing('location')}>
                    <MapPin className="w-3 h-3" /> {device.location || 'Sem localização'}
                  </span>
                )}
                <span>•</span>
                <span>{device.last_ping ? formatDistanceToNow(new Date(device.last_ping), { addSuffix: true, locale: ptBR }) : 'Nunca conectado'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCloneDevice} disabled={cloning}>
            <CopyPlus className="w-4 h-4 mr-1" /> {cloning ? 'Clonando...' : 'Clonar'}
          </Button>
          <Button variant="outline" className="border-warning text-warning hover:bg-warning/10" size="sm" onClick={handleRestart} disabled={restarting}>
            {restarting ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Power className="w-4 h-4 mr-1" />}
            {restarting ? 'Enviando...' : 'Reiniciar'}
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="ai" className="gap-1.5">
            🧠 Prompt de IA
          </TabsTrigger>
          <TabsTrigger value="details" className="gap-1.5">
            <FileBox className="w-4 h-4" /> Detalhes
          </TabsTrigger>
          <TabsTrigger value="code-sync" className="gap-1.5">
            <GitCompare className="w-4 h-4" /> Code Sync
          </TabsTrigger>
        </TabsList>

        {/* AI PROMPT TAB */}
        <TabsContent value="ai" className="mt-4">
          <AIPromptEditor deviceId={deviceId!} initialPrompt={(device as any).ai_prompt} />
        </TabsContent>

        {/* DETAILS TAB */}
        <TabsContent value="details" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Key */}
            <Card className="card-industrial">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" /> Chave de API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-input rounded-lg p-3 border border-border">
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-xs font-mono text-foreground break-all">
                      {showApiKey ? device.api_key : '••••••••••••••••••••••••'}
                    </code>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowApiKey(!showApiKey)}>
                        {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyApiKey}>
                        <CopyIcon className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Device Info */}
            <Card className="card-industrial">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Descrição</p>
                  {editingField === 'description' ? (
                    <div className="flex items-center gap-1">
                      <input className="text-sm text-foreground bg-transparent border-b-2 border-primary outline-none flex-1" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveField(); if (e.key === 'Escape') cancelEditing(); }} autoFocus />
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={saveField}><Check className="w-3 h-3 text-green-500" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEditing}><X className="w-3 h-3 text-destructive" /></Button>
                    </div>
                  ) : (
                    <p className="text-foreground text-sm cursor-pointer hover:text-primary transition-colors group flex items-center gap-1" onClick={() => startEditing('description')}>
                      {device.description || 'Sem descrição'}
                      <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Criado em</p>
                  <p className="text-foreground text-sm">{format(new Date(device.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
                </div>
              </CardContent>
            </Card>

            {/* Command History */}
            <div className="lg:col-span-2">
              <CommandHistory deviceId={deviceId!} />
            </div>

            {/* Version History */}
            <Card className="card-industrial lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="w-4 h-4 text-primary" /> Histórico de Versões
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {versions.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">Nenhuma versão implantada ainda</p>
                )}
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border transition-colors',
                      index === 0 ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-border hover:border-border/80'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', index === 0 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground')}>
                        <FileBox className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground text-sm">{version.file_name}</p>
                          {index === 0 && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                              <Check className="w-3 h-3 mr-1" /> Ativo
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(version.created_at), { addSuffix: true, locale: ptBR })} • {(version.file_size ? (version.file_size / (1024 * 1024)).toFixed(1) : '0') + ' MB'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CODE SYNC TAB */}
        <TabsContent value="code-sync" className="mt-4">
          <CodeSyncPanel
            statusDetails={(device as any).status_details}
            deviceName={device.name}
            deviceId={device.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
