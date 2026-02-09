import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Brain, Plus, Save, Trash2, Pencil, Sparkles, BookOpen, Mic, Bot, Cpu, ShieldAlert } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Navigate } from 'react-router-dom';

interface AIConfig {
  id: string;
  org_id: string;
  device_id: string | null;
  name: string;
  system_prompt: string;
  knowledge_base: string;
  model: string;
  temperature: number;
  max_tokens: number;
  avatar_name: string;
  voice: string;
  tts_url: string | null;
  stt_url: string | null;
  llm_url: string | null;
  tts_speed: number | null;
  tts_model: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Device {
  id: string;
  name: string;
  org_id: string;
  location: string | null;
}

interface Organization {
  id: string;
  name: string;
}

const VOICE_OPTIONS = [
  { value: 'af_bella', label: '🇺🇸 Bella (Feminina)' },
  { value: 'af_sarah', label: '🇺🇸 Sarah (Feminina)' },
  { value: 'am_adam', label: '🇺🇸 Adam (Masculina)' },
  { value: 'am_michael', label: '🇺🇸 Michael (Masculina)' },
  { value: 'bf_emma', label: '🇬🇧 Emma (Feminina)' },
  { value: 'bm_george', label: '🇬🇧 George (Masculina)' },
];

const MODEL_OPTIONS = [
  { value: 'llama3.2:1b', label: 'LLaMA 3.2 1B (Rápido)' },
  { value: 'llama3.2:3b', label: 'LLaMA 3.2 3B (Balanceado)' },
  { value: 'llama3.1:8b', label: 'LLaMA 3.1 8B (Avançado)' },
  { value: 'gemma2:2b', label: 'Gemma 2 2B (Leve)' },
  { value: 'phi3:mini', label: 'Phi-3 Mini (Compacto)' },
];

const PROMPT_TEMPLATES = [
  {
    id: 'loja',
    label: '🛍️ Loja / Varejo',
    prompt: `Você é um assistente virtual amigável de uma loja. Seu papel é:
- Cumprimentar os clientes de forma calorosa
- Informar sobre produtos, preços e promoções vigentes
- Indicar a localização de setores e produtos na loja
- Informar horários de funcionamento
- Responder de forma clara, educada e objetiva
- Não inventar informações que você não possui`,
    knowledge: `[SOBRE A LOJA]
Somos uma loja de varejo. Estamos aqui para ajudar nossos clientes.

[HORÁRIOS]
Segunda a Sexta: 9h às 21h
Sábado: 9h às 18h
Domingo: 10h às 16h`,
  },
  {
    id: 'hospital',
    label: '🏥 Clínica / Hospital',
    prompt: `Você é um assistente virtual de uma unidade de saúde. Seu papel é:
- Orientar pacientes sobre localização de consultórios e setores
- Informar sobre horários de atendimento e procedimentos para agendamento
- Manter um tom calmo, acolhedor e profissional
- NUNCA fornecer diagnósticos ou recomendações médicas
- Encaminhar dúvidas clínicas para a equipe médica`,
    knowledge: `[SOBRE A UNIDADE]
Somos uma unidade de saúde dedicada ao bem-estar dos pacientes.

[ORIENTAÇÕES]
Para emergências, dirija-se à recepção principal.
Agendamentos podem ser feitos pelo telefone ou presencialmente.`,
  },
  {
    id: 'hotel',
    label: '🏨 Hotel / Hospitalidade',
    prompt: `Você é o concierge virtual de um hotel. Seu papel é:
- Dar boas-vindas aos hóspedes com cordialidade
- Informar sobre serviços do hotel (restaurante, spa, piscina, academia)
- Fornecer informações sobre check-in, check-out e políticas
- Sugerir pontos turísticos e restaurantes na região
- Comunicar-se de forma elegante e prestativa`,
    knowledge: `[SOBRE O HOTEL]
Somos um hotel dedicado à excelência em hospitalidade.

[SERVIÇOS]
Check-in: a partir das 14h
Check-out: até as 12h
Restaurante: 6h às 22h`,
  },
  {
    id: 'corporativo',
    label: '🏢 Escritório / Corporativo',
    prompt: `Você é um assistente virtual de recepção corporativa. Seu papel é:
- Receber visitantes e orientá-los sobre o local da reunião
- Informar sobre andares, salas e departamentos da empresa
- Auxiliar com procedimentos de cadastro de visitante
- Manter um tom profissional e eficiente`,
    knowledge: `[SOBRE A EMPRESA]
Somos uma empresa comprometida com a inovação.

[INFORMAÇÕES]
Wi-Fi visitantes: Guest_Wifi
Estacionamento: 2 horas gratuitas com validação na recepção.`,
  },
  {
    id: 'porto_futuro',
    label: '🌿 Porto Futuro 2',
    prompt: `Você é o assistente virtual do Porto Futuro 2, um parque urbano em Belém do Pará. Seu papel é:
- Dar boas-vindas aos visitantes de forma simpática e acolhedora
- Informar sobre atrações, horários e regras do parque
- Indicar localização de restaurantes, banheiros e estacionamento
- Responder de forma clara, objetiva e com sotaque paraense quando apropriado
- NUNCA inventar informações que não estejam na base de conhecimento`,
    knowledge: `[SOBRE O PORTO FUTURO 2]
O Porto Futuro 2 é um parque urbano de lazer e contemplação.
Fica no bairro do Reduto, em Belém do Pará, pertinho da Estação das Docas.
A entrada é pela Avenida Visconde de Souza Franco, conhecida como Doca.
Importante: NÃO é praia e não pode tomar banho no rio.

[HORÁRIOS DE FUNCIONAMENTO]
Abre de segunda a domingo, das 10 horas às 22 horas.
A entrada é gratuita, não precisa pagar nada.

[ATRAÇÕES DO PARQUE]
Porto Gastronômico e Armazém 4: Vários restaurantes e bares com comida típica.
Museu das Amazônias: Espaço cultural com exposições sobre a fauna e flora local.
Parque da Bioeconomia: Local focado em sustentabilidade, inovação e na bioeconomia da região.
Caixa Cultural: Espaço para exposições de arte e eventos culturais.
Experiências e Infraestrutura: Áreas de convivência, anfiteatro, galerias de arte, áreas verdes e quiosques.
Rota da Bioeconomia: Circuito com experiências conectadas aos empreendimentos amazônicos, incluindo degustações e visitas guiadas.
Fonte Interativa: Fonte com jatos de água e luzes coloridas.

[COMIDA E BEBIDA]
Tem vários quiosques com comida típica paraense.
Tacacá, Vatapá, Maniçoba, Açaí e Sorvetes regionais.
Também tem água, refrigerante e sucos.

[BANHEIROS]
Os banheiros ficam próximos à entrada principal e perto dos quiosques de alimentação.

[ESTACIONAMENTO]
Tem estacionamento pago na entrada do parque.
Também dá pra estacionar nas ruas próximas.

[REGRAS DO PARQUE]
Pode trazer cachorro e outros pets, mas tem que estar na coleira.
Não pode: som alto, garrafas de vidro, nadar no rio.
O parque é pra passeio e contemplação, não pra banho.

[EVENTOS]
O parque recebe eventos culturais e shows aos finais de semana.
Pra saber o que ta rolando, é só verificar as redes sociais do Porto Futuro.`,
  },
];

const emptyForm = {
  name: '',
  system_prompt: '',
  knowledge_base: '',
  model: 'llama3.2:1b',
  temperature: 0.3,
  max_tokens: 50,
  avatar_name: 'Assistente',
  voice: 'af_bella',
  tts_url: '',
  stt_url: '',
  llm_url: '',
  tts_speed: 1,
  tts_model: 'kokoro',
  is_active: true,
  device_id: '' as string,
  org_id: '' as string,
};

export default function AIConfigs() {
  const { profile, role } = useAuth();
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const isSuperAdmin = role === 'super_admin';

  useEffect(() => {
    if (isSuperAdmin) fetchAll();
  }, [isSuperAdmin]);

  // Block non-super_admin (after hooks)
  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const fetchAll = async () => {
    setLoading(true);
    const [configsRes, devicesRes, orgsRes] = await Promise.all([
      supabase.from('ai_configs').select('*').order('created_at', { ascending: false }),
      supabase.from('devices').select('id, name, org_id, location').order('name'),
      supabase.from('organizations').select('id, name').order('name'),
    ]);

    if (configsRes.data) setConfigs(configsRes.data as any[]);
    if (devicesRes.data) setDevices(devicesRes.data as any[]);
    if (orgsRes.data) setOrganizations(orgsRes.data as any[]);
    setLoading(false);
  };

  const getOrgName = (orgId: string) => organizations.find(o => o.id === orgId)?.name || orgId;
  const getDeviceName = (deviceId: string | null) => {
    if (!deviceId) return null;
    const d = devices.find(dev => dev.id === deviceId);
    return d ? `${d.name}${d.location ? ` (${d.location})` : ''}` : deviceId;
  };

  const filteredDevices = form.org_id
    ? devices.filter(d => d.org_id === form.org_id)
    : devices;

  const openCreate = () => {
    setEditingConfig(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (config: AIConfig) => {
    setEditingConfig(config);
    setForm({
      name: config.name,
      system_prompt: config.system_prompt,
      knowledge_base: config.knowledge_base,
      model: config.model,
      temperature: config.temperature,
      max_tokens: config.max_tokens,
      avatar_name: config.avatar_name,
      voice: config.voice,
      tts_url: config.tts_url || '',
      stt_url: config.stt_url || '',
      llm_url: (config as any).llm_url || '',
      tts_speed: (config as any).tts_speed ?? 1,
      tts_model: (config as any).tts_model || 'kokoro',
      is_active: config.is_active,
      device_id: config.device_id || '',
      org_id: config.org_id,
    });
    setDialogOpen(true);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = PROMPT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setForm(prev => ({ ...prev, system_prompt: template.prompt, knowledge_base: template.knowledge }));
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.system_prompt.trim()) {
      toast.error('Nome e System Prompt são obrigatórios');
      return;
    }
    if (!editingConfig && !form.org_id) {
      toast.error('Selecione uma organização');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name: form.name,
        system_prompt: form.system_prompt,
        knowledge_base: form.knowledge_base,
        model: form.model,
        temperature: form.temperature,
        max_tokens: form.max_tokens,
        avatar_name: form.avatar_name,
        voice: form.voice,
        tts_url: form.tts_url || null,
        stt_url: form.stt_url || null,
        llm_url: form.llm_url || null,
        tts_speed: form.tts_speed,
        tts_model: form.tts_model || null,
        is_active: form.is_active,
        device_id: form.device_id || null,
      };

      if (editingConfig) {
        const { error } = await supabase
          .from('ai_configs')
          .update(payload)
          .eq('id', editingConfig.id);
        if (error) throw error;
        toast.success('Configuração atualizada!');
      } else {
        payload.org_id = form.org_id;
        const { error } = await supabase.from('ai_configs').insert(payload);
        if (error) throw error;
        toast.success('Configuração criada!');
      }

      setDialogOpen(false);
      fetchAll();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) return;
    const { error } = await supabase.from('ai_configs').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao excluir configuração');
    } else {
      toast.success('Configuração excluída');
      fetchAll();
    }
  };

  const handleToggleActive = async (config: AIConfig) => {
    const { error } = await supabase
      .from('ai_configs')
      .update({ is_active: !config.is_active } as any)
      .eq('id', config.id);
    if (error) toast.error('Erro ao alterar status');
    else fetchAll();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-7 h-7 text-primary" />
            Configurações de IA
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie o system prompt, knowledge base e vincule a dispositivos de cada cliente.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Configuração
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-muted-foreground text-center py-12">Carregando...</div>
      ) : configs.length === 0 ? (
        <Card className="card-industrial">
          <CardContent className="py-12 text-center">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma configuração ainda</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira configuração de IA para personalizar o comportamento dos totens.
            </p>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Configuração
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {configs.map((config) => (
            <Card key={config.id} className={`card-industrial transition-all ${!config.is_active ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary" />
                      {config.name}
                      {config.is_active && (
                        <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Ativa
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1 space-y-0.5">
                      <span className="block">{getOrgName(config.org_id)} · {config.model} · Temp: {config.temperature}</span>
                      {config.device_id && (
                        <span className="flex items-center gap-1 text-primary/80 text-xs">
                          <Cpu className="w-3 h-3" />
                          {getDeviceName(config.device_id)}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(config)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(config.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> System Prompt
                  </p>
                  <p className="text-sm text-foreground line-clamp-3 whitespace-pre-wrap bg-muted/30 rounded-md p-2">
                    {config.system_prompt}
                  </p>
                </div>
                {config.knowledge_base && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Knowledge Base
                    </p>
                    <p className="text-sm text-foreground line-clamp-2 whitespace-pre-wrap bg-muted/30 rounded-md p-2">
                      {config.knowledge_base}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Mic className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{config.voice}</span>
                  </div>
                  <Switch checked={config.is_active} onCheckedChange={() => handleToggleActive(config)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              {editingConfig ? 'Editar Configuração' : 'Nova Configuração de IA'}
            </DialogTitle>
            <DialogDescription>
              Configure o comportamento da IA, knowledge base e vincule a um dispositivo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Configuração</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Config Loja Centro"
              />
            </div>

            {/* Organization selector (only on create) */}
            {!editingConfig && (
              <div className="space-y-2">
                <Label>Organização *</Label>
                <Select value={form.org_id} onValueChange={(v) => setForm(p => ({ ...p, org_id: v, device_id: '' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a organização do cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map(org => (
                      <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Device selector */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Cpu className="w-4 h-4" /> Vincular a Dispositivo (opcional)
              </Label>
              <Select value={form.device_id} onValueChange={(v) => setForm(p => ({ ...p, device_id: v === '_none' ? '' : v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum dispositivo vinculado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Nenhum (config geral da org)</SelectItem>
                  {filteredDevices.map(d => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}{d.location ? ` — ${d.location}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Se vinculado, esta config será usada exclusivamente por este dispositivo.
              </p>
            </div>

            {/* Template selector */}
            {!editingConfig && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> Usar Template
                </Label>
                <Select onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template como base..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PROMPT_TEMPLATES.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* System Prompt */}
            <div className="space-y-2">
              <Label htmlFor="system_prompt" className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> System Prompt *
              </Label>
              <Textarea
                id="system_prompt"
                value={form.system_prompt}
                onChange={(e) => setForm(p => ({ ...p, system_prompt: e.target.value }))}
                placeholder="Instruções de comportamento para a IA..."
                className="min-h-[140px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">{form.system_prompt.length} caracteres</p>
            </div>

            {/* Knowledge Base */}
            <div className="space-y-2">
              <Label htmlFor="knowledge_base" className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" /> Knowledge Base
              </Label>
              <Textarea
                id="knowledge_base"
                value={form.knowledge_base}
                onChange={(e) => setForm(p => ({ ...p, knowledge_base: e.target.value }))}
                placeholder="Informações que a IA deve conhecer: horários, endereços, produtos, FAQ..."
                className="min-h-[140px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">{form.knowledge_base.length} caracteres</p>
            </div>

            {/* Model & Params */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Select value={form.model} onValueChange={(v) => setForm(p => ({ ...p, model: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_OPTIONS.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Max Tokens: {form.max_tokens}</Label>
                <Slider
                  value={[form.max_tokens]}
                  onValueChange={([v]) => setForm(p => ({ ...p, max_tokens: v }))}
                  min={20}
                  max={500}
                  step={10}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Temperature: {form.temperature.toFixed(2)}</Label>
              <Slider
                value={[form.temperature]}
                onValueChange={([v]) => setForm(p => ({ ...p, temperature: parseFloat(v.toFixed(2)) }))}
                min={0}
                max={1}
                step={0.05}
              />
              <p className="text-xs text-muted-foreground">
                Menor = mais preciso e repetitivo · Maior = mais criativo e variável
              </p>
            </div>

            {/* Avatar */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="avatar_name" className="flex items-center gap-1">
                  <Bot className="w-4 h-4" /> Nome do Avatar
                </Label>
                <Input
                  id="avatar_name"
                  value={form.avatar_name}
                  onChange={(e) => setForm(p => ({ ...p, avatar_name: e.target.value }))}
                  placeholder="Assistente"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Mic className="w-4 h-4" /> Voz
                </Label>
                <Select value={form.voice} onValueChange={(v) => setForm(p => ({ ...p, voice: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICE_OPTIONS.map(v => (
                      <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* TTS / STT URLs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tts_url">URL do TTS (Kokoro)</Label>
                <Input
                  id="tts_url"
                  value={form.tts_url}
                  onChange={(e) => setForm(p => ({ ...p, tts_url: e.target.value }))}
                  placeholder="http://localhost:8880/v1/audio/speech"
                />
                <p className="text-xs text-muted-foreground">
                  Deixe vazio para usar o .env local do totem
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stt_url">URL do STT (Whisper)</Label>
                <Input
                  id="stt_url"
                  value={form.stt_url}
                  onChange={(e) => setForm(p => ({ ...p, stt_url: e.target.value }))}
                  placeholder="http://localhost:8000/transcribe"
                />
                <p className="text-xs text-muted-foreground">
                  Deixe vazio para usar o .env local do totem
                </p>
              </div>
            </div>

            {/* LLM URL + TTS Speed/Model */}
            <div className="space-y-2">
              <Label htmlFor="llm_url">URL do LLM (Ollama)</Label>
              <Input
                id="llm_url"
                value={(form as any).llm_url}
                onChange={(e) => setForm(p => ({ ...p, llm_url: e.target.value }))}
                placeholder="http://localhost:11434"
              />
              <p className="text-xs text-muted-foreground">
                Deixe vazio para usar o .env local do totem
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Velocidade TTS: {(form as any).tts_speed}</Label>
                <Slider
                  value={[(form as any).tts_speed]}
                  onValueChange={([v]) => setForm(p => ({ ...p, tts_speed: parseFloat(v.toFixed(1)) }))}
                  min={0.5}
                  max={2}
                  step={0.1}
                />
                <p className="text-xs text-muted-foreground">0.5 = lento · 1 = normal · 2 = rápido</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tts_model">Modelo TTS</Label>
                <Input
                  id="tts_model"
                  value={(form as any).tts_model}
                  onChange={(e) => setForm(p => ({ ...p, tts_model: e.target.value }))}
                  placeholder="kokoro"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm(p => ({ ...p, is_active: v }))}
              />
              <Label>Configuração ativa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : editingConfig ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
