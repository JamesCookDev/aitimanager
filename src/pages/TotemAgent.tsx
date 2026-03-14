import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Download,
  CheckCircle2,
  Loader2,
  Copy,
  RefreshCw,
  ChevronDown,
  Monitor,
  Wifi,
  WifiOff,
  Zap,
  Smartphone,
  MousePointerClick,
  Power,
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';

/* ─── sub-components ─── */

function HeroSection({ orgName }: { orgName?: string }) {
  return (
    <section className="text-center space-y-4 pt-10 pb-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-2">
        <Monitor className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
        Instale seu Totem
      </h1>
      <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
        Em poucos minutos seu novo totem estará funcionando.
        <br />
        Sem complicação, sem configuração técnica.
      </p>
      {orgName && (
        <Badge variant="secondary" className="text-sm gap-1.5 px-3 py-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          {orgName}
        </Badge>
      )}
    </section>
  );
}

/* ─── distribution config ─── */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://iwqcltmeniotzbowbxzg.supabase.co';
const DISTRIBUTION = {
  windows: {
    url: `${SUPABASE_URL}/storage/v1/object/public/agent-dist/TotemAgent-Instalador.zip`,
    fileName: 'TotemAgent-Instalador.zip',
    label: 'Baixar Instalador Windows',
    description: 'Compatível com Windows 10/11 (64-bit)',
  },
};

function DownloadButton() {
  const dist = DISTRIBUTION.windows;
  const available = !!dist.url;

  const handleDownload = () => {
    if (!available) {
      toast.info('O instalador estará disponível em breve. Entre em contato com o suporte.');
      return;
    }
    const link = document.createElement('a');
    link.href = dist.url;
    link.download = dist.fileName;
    link.click();
    toast.success('Download iniciado!');
  };

  return (
    <section className="flex flex-col items-center gap-2 pb-2">
      <Button
        size="lg"
        className="h-16 px-10 text-lg gap-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
        onClick={handleDownload}
      >
        <Download className="w-6 h-6" />
        {dist.label}
      </Button>
      <span className="text-xs text-muted-foreground">{dist.description}</span>
    </section>
  );
}

const STEPS = [
  {
    icon: Download,
    title: 'Baixe',
    desc: 'Clique no botão acima e salve o instalador na máquina que será seu totem. Não é necessário instalar nada antes.',
  },
  {
    icon: MousePointerClick,
    title: 'Instale',
    desc: 'Execute o instalador na máquina do totem. Ele configura tudo automaticamente, sem precisar de conhecimento técnico.',
  },
  {
    icon: Power,
    title: 'Ative',
    desc: 'Informe o código da sua conta quando solicitado. Pronto — seu totem aparecerá no painel!',
  },
];

function HowItWorks() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold text-foreground text-center">Como funciona</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="relative flex flex-col items-center text-center p-6 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow"
          >
            <span className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow">
              {i + 1}
            </span>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <step.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActivationCode({
  enrollmentKey,
  enabled,
  onCopy,
  onRegenerate,
  regenerating,
}: {
  enrollmentKey: string | null;
  enabled: boolean;
  onCopy: (code: string) => void;
  onRegenerate: () => void;
  regenerating: boolean;
}) {
  if (!enrollmentKey) return null;

  const activationUrl = `https://aitimanager.lovable.app/activate?key=${enrollmentKey}`;

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold text-foreground text-center">
        Código de Ativação da sua Conta
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-lg mx-auto">
        Informe este código durante a instalação do agente. Seu novo totem será conectado
        automaticamente à sua conta.
      </p>

      <div className="max-w-md mx-auto space-y-5">
        {/* Code block */}
        <div
          className={`flex items-center gap-2 rounded-xl p-4 border-2 font-mono text-base select-all ${
            enabled
              ? 'bg-card border-primary/30 text-primary'
              : 'bg-muted/50 border-border text-muted-foreground'
          }`}
        >
          <code className="flex-1 tracking-widest break-all text-center font-bold">
            {enrollmentKey}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => onCopy(enrollmentKey)}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 bg-white rounded-xl border border-border shadow-sm">
            <QRCodeSVG value={activationUrl} size={160} level="M" />
          </div>
          <p className="text-xs text-muted-foreground">
            Ou escaneie o QR Code na máquina do totem
          </p>
        </div>

        {/* Regenerate */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={onRegenerate}
            disabled={regenerating}
          >
            {regenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Gerar novo código
          </Button>
        </div>
      </div>
    </section>
  );
}

function ManualActivation({
  orgId,
  onActivated,
}: {
  orgId: string;
  onActivated: (name: string, code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('devices')
        .insert({ name: name.trim(), location: location.trim() || null, org_id: orgId, registration_method: 'manual' })
        .select('name, api_key')
        .single();
      if (error) throw error;
      onActivated(data.name, data.api_key);
      setName('');
      setLocation('');
      setOpen(false);
    } catch (err: any) {
      toast.error('Erro ao ativar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="flex justify-center">
        <CollapsibleTrigger asChild>
          <Button variant="link" className="gap-1 text-muted-foreground text-sm">
            Prefiro ativar manualmente
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-4 max-w-md mx-auto space-y-3">
        <Input placeholder="Nome do totem (ex: Recepção)" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Local (opcional)" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Button className="w-full gap-2" onClick={handleActivate} disabled={!name.trim() || loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Ativar Totem
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ManualResult({ name, code, onReset }: { name: string; code: string; onReset: () => void }) {
  return (
    <div className="max-w-md mx-auto text-center space-y-4 p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
      <div>
        <p className="font-bold text-foreground text-lg">{name} ativado!</p>
        <p className="text-sm text-muted-foreground mt-1">Cole este código no agente:</p>
      </div>
      <div className="flex items-center justify-center gap-2 bg-card rounded-lg p-3 border border-border">
        <code className="text-sm font-mono text-primary font-bold tracking-wider select-all">{code}</code>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { navigator.clipboard.writeText(code); toast.success('Copiado!'); }}>
          <Copy className="w-4 h-4" />
        </Button>
      </div>
      <Button variant="outline" size="sm" className="gap-2" onClick={onReset}>
        <RefreshCw className="w-4 h-4" /> Ativar outro
      </Button>
    </div>
  );
}

function DeviceList({ devices }: { devices: any[] }) {
  const isOnline = (lastPing: string | null) => {
    if (!lastPing) return false;
    return Date.now() - new Date(lastPing).getTime() < 90_000;
  };

  if (!devices.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        <h2 className="text-xl font-bold text-foreground">Seus Totens</h2>
        <Badge variant="secondary" className="text-xs">{devices.length}</Badge>
      </div>
      <div className="max-w-lg mx-auto divide-y divide-border rounded-xl border border-border overflow-hidden bg-card">
        {devices.map((d) => {
          const online = isOnline(d.last_ping);
          const isAuto = d.registration_method === 'enrollment' || d.registration_method === 'hardware';
          return (
            <div key={d.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground text-sm">{d.name}</p>
                    {isAuto && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-0.5 border-primary/30 text-primary">
                        <Zap className="w-2.5 h-2.5" /> Auto
                      </Badge>
                    )}
                  </div>
                  {d.location && <p className="text-xs text-muted-foreground">{d.location}</p>}
                </div>
              </div>
              <Badge variant={online ? 'default' : 'secondary'} className="text-xs gap-1">
                {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {online ? 'Conectado' : 'Offline'}
              </Badge>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const FAQ_ITEMS = [
  {
    q: 'Preciso de conhecimento técnico?',
    a: 'Não! O processo é tão simples quanto instalar qualquer programa. Basta baixar, instalar e informar o código da sua conta.',
  },
  {
    q: 'O totem funciona sem internet?',
    a: 'Sim. Após a primeira conexão, o totem mantém uma cópia local do conteúdo e funciona mesmo offline.',
  },
  {
    q: 'Meu totem não apareceu no painel. E agora?',
    a: 'Verifique se a máquina está conectada à internet e se o código informado está correto. O totem aparece em até 30 segundos após a ativação.',
  },
  {
    q: 'Posso ativar vários totens com o mesmo código?',
    a: 'Sim! O código da sua conta permite ativar quantos totens você precisar. Cada um aparecerá separadamente no seu painel.',
  },
  {
    q: 'O que acontece se eu gerar um novo código?',
    a: 'O código anterior deixa de funcionar para novas ativações. Os totens já conectados continuam funcionando normalmente.',
  },
];

function FAQSection() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-foreground text-center">Dúvidas Frequentes</h2>
      <div className="max-w-2xl mx-auto space-y-2">
        {FAQ_ITEMS.map((item, i) => (
          <Collapsible key={i}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors text-left group">
              <span className="font-medium text-foreground text-sm">{item.q}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-2 group-data-[state=open]:rotate-180 transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4 pt-1">
              <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </section>
  );
}

/* ─── main page ─── */

export default function TotemAgent() {
  const { profile } = useAuth();
  const orgId = profile?.org_id;
  const [manualResult, setManualResult] = useState<{ name: string; code: string } | null>(null);

  const { data: org } = useQuery({
    queryKey: ['org-for-agent', orgId],
    queryFn: async () => {
      if (!orgId) return null;
      const { data } = await supabase.from('organizations').select('*').eq('id', orgId).single();
      return data;
    },
    enabled: !!orgId,
  });

  const { data: devices = [], refetch: refetchDevices } = useQuery({
    queryKey: ['devices-for-agent', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data } = await supabase
        .from('devices')
        .select('id, name, location, last_ping, registration_method')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!orgId,
  });

  const regenerateKey = useMutation({
    mutationFn: async () => {
      if (!orgId) throw new Error('Sem organização');
      const { error } = await supabase
        .from('organizations')
        .update({ enrollment_key: crypto.randomUUID(), enrollment_enabled: true })
        .eq('id', orgId);
      if (error) throw error;
    },
    onSuccess: () => toast.success('Novo código gerado!'),
    onError: (err: any) => toast.error(err.message),
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!');
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 pb-16 space-y-12">
        <HeroSection orgName={org?.name} />
        <DownloadButton />
        <Separator />
        <HowItWorks />
        <Separator />
        <ActivationCode
          enrollmentKey={org?.enrollment_key ?? null}
          enabled={org?.enrollment_enabled ?? false}
          onCopy={copyCode}
          onRegenerate={() => regenerateKey.mutate()}
          regenerating={regenerateKey.isPending}
        />
        <Separator />

        {manualResult ? (
          <ManualResult
            name={manualResult.name}
            code={manualResult.code}
            onReset={() => { setManualResult(null); refetchDevices(); }}
          />
        ) : (
          orgId && (
            <ManualActivation
              orgId={orgId}
              onActivated={(name, code) => setManualResult({ name, code })}
            />
          )
        )}

        {devices.length > 0 && (
          <>
            <Separator />
            <DeviceList devices={devices} />
          </>
        )}

        <Separator />
        <FAQSection />
      </div>
    </div>
  );
}
