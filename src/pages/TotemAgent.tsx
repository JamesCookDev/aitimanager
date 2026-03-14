import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Download,
  Monitor,
  CheckCircle2,
  Loader2,
  Rocket,
  ShieldCheck,
  Wifi,
  Package,
  ArrowRight,
  Copy,
  RefreshCw,
  Sparkles,
  Key,
  WifiOff,
  AlertTriangle,
  Clock,
  Zap,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function TotemAgent() {
  const { profile, role } = useAuth();
  const queryClient = useQueryClient();
  const [activating, setActivating] = useState(false);
  const [totemName, setTotemName] = useState('');
  const [totemLocation, setTotemLocation] = useState('');
  const [showActivation, setShowActivation] = useState(false);
  const [activationResult, setActivationResult] = useState<{ name: string; code: string } | null>(null);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);

  const orgId = profile?.org_id;

  const { data: org, refetch: refetchOrg } = useQuery({
    queryKey: ['org-for-agent', orgId],
    queryFn: async () => {
      if (!orgId) return null;
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();
      return data;
    },
    enabled: !!orgId,
  });

  const { data: devices, refetch: refetchDevices } = useQuery({
    queryKey: ['devices-for-agent', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data } = await supabase
        .from('devices')
        .select('id, name, location, last_ping, status_details, api_key, registration_method, hardware_id, created_at')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!orgId,
  });

  const toggleEnrollment = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!orgId) throw new Error('Sem organização');
      const { error } = await supabase
        .from('organizations')
        .update({ enrollment_enabled: enabled })
        .eq('id', orgId);
      if (error) throw error;
    },
    onSuccess: (_, enabled) => {
      refetchOrg();
      toast.success(enabled ? 'Ativação automática habilitada!' : 'Ativação automática desabilitada.');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const regenerateKey = useMutation({
    mutationFn: async () => {
      if (!orgId) throw new Error('Sem organização');
      const { error } = await supabase
        .from('organizations')
        .update({ enrollment_key: crypto.randomUUID() })
        .eq('id', orgId);
      if (error) throw error;
    },
    onSuccess: () => {
      refetchOrg();
      setShowRegenerateDialog(false);
      toast.success('Nova chave de ativação gerada! A chave anterior foi invalidada.');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const isOnline = (lastPing: string | null) => {
    if (!lastPing) return false;
    return Date.now() - new Date(lastPing).getTime() < 90_000;
  };

  const handleActivate = async () => {
    if (!totemName.trim() || !orgId) return;
    setActivating(true);
    try {
      const { data, error } = await supabase
        .from('devices')
        .insert({
          name: totemName.trim(),
          location: totemLocation.trim() || null,
          org_id: orgId,
          registration_method: 'manual',
        })
        .select('name, api_key')
        .single();

      if (error) throw error;
      setActivationResult({ name: data.name, code: data.api_key });
      setTotemName('');
      setTotemLocation('');
      refetchDevices();
      toast.success('Totem ativado com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao ativar: ' + err.message);
    } finally {
      setActivating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!');
  };

  const downloadInstaller = () => {
    const link = document.createElement('a');
    link.href = '/sync-worker.js';
    link.download = 'totem-agent.js';
    link.click();
    toast.success('Download iniciado! Siga as instruções de instalação.');
  };

  const enrollmentKey = (org as any)?.enrollment_key;
  const enrollmentEnabled = (org as any)?.enrollment_enabled ?? false;
  const enrollmentExpires = (org as any)?.enrollment_expires_at;
  const isExpired = enrollmentExpires ? new Date(enrollmentExpires) < new Date() : false;

  const autoRegisteredCount = devices?.filter((d: any) => d.registration_method === 'enrollment' || d.registration_method === 'hardware').length ?? 0;

  const steps = [
    {
      num: 1,
      icon: Key,
      title: 'Ative a Chave',
      desc: 'Habilite a ativação automática e copie a chave da sua organização.',
    },
    {
      num: 2,
      icon: Download,
      title: 'Instale o Agente',
      desc: 'Baixe e execute o Totem Agent na nova máquina.',
    },
    {
      num: 3,
      icon: Zap,
      title: 'Conectou!',
      desc: 'O totem se registra automaticamente. Sem configuração manual.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />
        <div className="relative max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Package className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Totem Agent</h1>
              <p className="text-muted-foreground text-sm">Instale e ative seus totens em minutos</p>
            </div>
          </div>

          {org && (
            <div className="flex items-center gap-2 mt-4">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">
                Conta: <span className="font-semibold text-foreground">{org.name}</span>
              </span>
              <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600">Ativa</Badge>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <Card key={step.num} className="relative overflow-hidden group hover:shadow-md transition-shadow border-border/60">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Passo {step.num}</p>
                    <h3 className="font-semibold text-foreground text-sm">{step.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
                {i < 2 && (
                  <ArrowRight className="hidden md:block absolute right-[-20px] top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 z-10" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enrollment Key Management */}
        <Card className="border-primary/20 bg-primary/[0.02]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Chave de Ativação da Organização
            </CardTitle>
            <CardDescription>
              Com esta chave, novos totens se registram automaticamente na sua conta. Basta informar a chave durante a instalação do agente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40 border border-border">
              <div className="flex items-center gap-3">
                <Zap className={`w-5 h-5 ${enrollmentEnabled ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                <div>
                  <p className="font-medium text-sm text-foreground">Ativação Automática</p>
                  <p className="text-xs text-muted-foreground">
                    {enrollmentEnabled
                      ? 'Novas máquinas podem se registrar usando a chave abaixo'
                      : 'Ative para permitir que novas máquinas se registrem automaticamente'}
                  </p>
                </div>
              </div>
              <Switch
                checked={enrollmentEnabled}
                onCheckedChange={(v) => toggleEnrollment.mutate(v)}
                disabled={toggleEnrollment.isPending}
              />
            </div>

            {/* Key display */}
            {enrollmentKey && (
              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Sua Chave de Ativação</Label>
                <div className="flex items-center gap-2">
                  <div className={`flex-1 flex items-center gap-2 rounded-lg p-3 border font-mono text-sm select-all ${
                    enrollmentEnabled && !isExpired
                      ? 'bg-background border-primary/20 text-primary'
                      : 'bg-muted/50 border-border text-muted-foreground'
                  }`}>
                    <code className="flex-1 tracking-wider break-all">{enrollmentKey}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => copyCode(enrollmentKey)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {isExpired && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Esta chave expirou. Gere uma nova chave para continuar ativando totens.</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowRegenerateDialog(true)}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Gerar Nova Chave
                  </Button>
                </div>
              </div>
            )}

            {/* How it works */}
            <Separator />
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm font-medium text-foreground mb-2">Como funciona:</p>
              <ol className="space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
                <li>Habilite a <strong>Ativação Automática</strong> acima</li>
                <li>Copie a <strong>Chave de Ativação</strong> e guarde com segurança</li>
                <li>Na nova máquina, instale o <strong>Totem Agent</strong> e informe a chave</li>
                <li>O totem aparecerá automaticamente na sua lista em segundos</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Actions row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Download card */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Baixar Instalador
              </CardTitle>
              <CardDescription>
                Instale o agente na máquina que será seu totem. Compatível com Windows, Linux e macOS.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-muted-foreground">Instalação em menos de 5 minutos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-muted-foreground">Registro automático com chave de ativação</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-muted-foreground">Funciona offline após a primeira sincronização</span>
                </div>
              </div>
              <Button className="w-full gap-2" size="lg" onClick={downloadInstaller}>
                <Download className="w-5 h-5" />
                Baixar Totem Agent
              </Button>
            </CardContent>
          </Card>

          {/* Manual activation card */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                Ativação Manual
              </CardTitle>
              <CardDescription>
                Prefere registrar manualmente? Crie um totem e receba o código de ativação individual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showActivation && !activationResult && (
                <Button className="w-full gap-2" size="lg" variant="outline" onClick={() => setShowActivation(true)}>
                  <Sparkles className="w-5 h-5" />
                  Ativar Manualmente
                </Button>
              )}

              {showActivation && !activationResult && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Nome do Totem</label>
                    <Input placeholder="Ex: Recepção, Loja Centro..." value={totemName} onChange={(e) => setTotemName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Local (opcional)</label>
                    <Input placeholder="Ex: Shopping Norte, Sala 12..." value={totemLocation} onChange={(e) => setTotemLocation(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setShowActivation(false)} className="flex-1">Cancelar</Button>
                    <Button className="flex-1 gap-2" onClick={handleActivate} disabled={!totemName.trim() || activating}>
                      {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Ativar
                    </Button>
                  </div>
                </div>
              )}

              {activationResult && (
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <div>
                      <p className="font-semibold text-foreground">{activationResult.name} ativado!</p>
                      <p className="text-sm text-muted-foreground mt-1">Cole este código no agente instalado:</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 bg-background rounded-lg p-3 border border-border">
                      <code className="text-sm font-mono text-primary font-bold tracking-wider select-all">{activationResult.code}</code>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyCode(activationResult.code)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full gap-2" onClick={() => { setActivationResult(null); setShowActivation(false); }}>
                    <RefreshCw className="w-4 h-4" />
                    Ativar Outro Totem
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Installed totems */}
        {devices && devices.length > 0 && (
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-primary" />
                  Seus Totens
                </CardTitle>
                <div className="flex items-center gap-2">
                  {autoRegisteredCount > 0 && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Zap className="w-3 h-3" />
                      {autoRegisteredCount} automático{autoRegisteredCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {devices.length} {devices.length === 1 ? 'totem' : 'totens'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                {devices.map((device: any) => {
                  const online = isOnline(device.last_ping);
                  const isAutoRegistered = device.registration_method === 'enrollment' || device.registration_method === 'hardware';
                  return (
                    <div key={device.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground text-sm">{device.name}</p>
                            {isAutoRegistered && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-1 border-primary/30 text-primary">
                                <Zap className="w-2.5 h-2.5" />
                                Auto
                              </Badge>
                            )}
                          </div>
                          {device.location && (
                            <p className="text-xs text-muted-foreground">{device.location}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant={online ? 'default' : 'secondary'} className="text-xs">
                        {online ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                        {online ? 'Conectado' : 'Offline'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help section */}
        <Card className="border-border/60 bg-muted/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-3">Precisa de ajuda?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">O totem não aparece como conectado?</p>
                <p>Verifique se a máquina está ligada e conectada à internet. Após iniciar o agente, o totem aparecerá em até 30 segundos.</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Ativação automática vs manual</p>
                <p>Com a chave de ativação, basta instalar o agente e informar a chave. No modo manual, você cria o totem aqui e copia o código.</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Regenerar a chave de ativação</p>
                <p>Ao gerar uma nova chave, a anterior é invalidada. Totens já conectados continuam funcionando normalmente.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regenerate Key Dialog */}
      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Gerar Nova Chave
            </DialogTitle>
            <DialogDescription>
              A chave atual será <strong>invalidada imediatamente</strong>. Totens já registrados continuarão funcionando, mas novas instalações precisarão da nova chave.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegenerateDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => regenerateKey.mutate()} disabled={regenerateKey.isPending}>
              {regenerateKey.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Gerar Nova Chave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
