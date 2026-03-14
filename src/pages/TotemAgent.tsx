import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function TotemAgent() {
  const { profile, role } = useAuth();
  const [activating, setActivating] = useState(false);
  const [totemName, setTotemName] = useState('');
  const [totemLocation, setTotemLocation] = useState('');
  const [showActivation, setShowActivation] = useState(false);
  const [activationResult, setActivationResult] = useState<{ name: string; code: string } | null>(null);

  const orgId = profile?.org_id;

  const { data: org } = useQuery({
    queryKey: ['org-for-agent', orgId],
    queryFn: async () => {
      if (!orgId) return null;
      const { data } = await supabase.from('organizations').select('*').eq('id', orgId).single();
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
        .select('id, name, location, last_ping, status_details, api_key')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!orgId,
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
    // Download the sync-worker.js from public folder
    const link = document.createElement('a');
    link.href = '/sync-worker.js';
    link.download = 'totem-agent.js';
    link.click();
    toast.success('Download iniciado! Siga as instruções de instalação.');
  };

  const steps = [
    {
      num: 1,
      icon: Download,
      title: 'Baixe o Agente',
      desc: 'Faça o download do instalador do Totem Agent para sua máquina.',
    },
    {
      num: 2,
      icon: Rocket,
      title: 'Ative um Totem',
      desc: 'Dê um nome ao seu totem e receba o código de ativação.',
    },
    {
      num: 3,
      icon: Monitor,
      title: 'Cole o Código',
      desc: 'Insira o código de ativação no agente instalado e pronto.',
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
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Totem Agent
              </h1>
              <p className="text-muted-foreground text-sm">
                Instale e ative seus totens em minutos
              </p>
            </div>
          </div>

          {org && (
            <div className="flex items-center gap-2 mt-4">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">
                Conta: <span className="font-semibold text-foreground">{org.name}</span>
              </span>
              <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600">
                Ativa
              </Badge>
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
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                      Passo {step.num}
                    </p>
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
                  <span className="text-muted-foreground">Atualizações automáticas</span>
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

          {/* Activation card */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                Ativar Novo Totem
              </CardTitle>
              <CardDescription>
                Registre um novo totem na sua conta para receber o código de ativação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showActivation && !activationResult && (
                <Button
                  className="w-full gap-2"
                  size="lg"
                  variant="outline"
                  onClick={() => setShowActivation(true)}
                >
                  <Sparkles className="w-5 h-5" />
                  Ativar Novo Totem
                </Button>
              )}

              {showActivation && !activationResult && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Nome do Totem
                    </label>
                    <Input
                      placeholder="Ex: Recepção, Loja Centro, Andar 2..."
                      value={totemName}
                      onChange={(e) => setTotemName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Local (opcional)
                    </label>
                    <Input
                      placeholder="Ex: Shopping Norte, Sala 12..."
                      value={totemLocation}
                      onChange={(e) => setTotemLocation(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowActivation(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1 gap-2"
                      onClick={handleActivate}
                      disabled={!totemName.trim() || activating}
                    >
                      {activating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
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
                      <p className="font-semibold text-foreground">
                        {activationResult.name} ativado!
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Cole este código de ativação no agente instalado:
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 bg-background rounded-lg p-3 border border-border">
                      <code className="text-sm font-mono text-primary font-bold tracking-wider select-all">
                        {activationResult.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyCode(activationResult.code)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      setActivationResult(null);
                      setShowActivation(false);
                    }}
                  >
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
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="w-5 h-5 text-primary" />
                Seus Totens
                <Badge variant="secondary" className="ml-auto text-xs">
                  {devices.length} {devices.length === 1 ? 'totem' : 'totens'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                {devices.map((device) => {
                  const online = isOnline(device.last_ping);
                  return (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                        <div>
                          <p className="font-medium text-foreground text-sm">{device.name}</p>
                          {device.location && (
                            <p className="text-xs text-muted-foreground">{device.location}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={online ? 'default' : 'secondary'} className="text-xs">
                          <Wifi className="w-3 h-3 mr-1" />
                          {online ? 'Conectado' : 'Offline'}
                        </Badge>
                      </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">O totem não aparece como conectado?</p>
                <p>Verifique se a máquina está ligada e conectada à internet. Após iniciar o agente, o totem aparecerá automaticamente em até 30 segundos.</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Perdi meu código de ativação</p>
                <p>Não se preocupe! Basta ativar um novo totem com o mesmo nome. O código anterior será substituído automaticamente.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
