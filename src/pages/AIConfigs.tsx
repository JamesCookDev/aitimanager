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
import { Brain, Plus, Save, Trash2, Pencil, Sparkles, BookOpen, Mic, Bot } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface AIConfig {
  id: string;
  org_id: string;
  name: string;
  system_prompt: string;
  knowledge_base: string;
  model: string;
  temperature: number;
  max_tokens: number;
  avatar_name: string;
  voice: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
];

const emptyConfig: Omit<AIConfig, 'id' | 'org_id' | 'created_at' | 'updated_at'> = {
  name: '',
  system_prompt: '',
  knowledge_base: '',
  model: 'llama3.2:1b',
  temperature: 0.3,
  max_tokens: 50,
  avatar_name: 'Assistente',
  voice: 'af_bella',
  is_active: true,
};

export default function AIConfigs() {
  const { profile, role } = useAuth();
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null);
  const [form, setForm] = useState(emptyConfig);
  const [saving, setSaving] = useState(false);

  const isSuperAdmin = role === 'super_admin';

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ai_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar configs:', error);
      toast.error('Erro ao carregar configurações de IA');
    } else {
      setConfigs((data as any[]) || []);
    }
    setLoading(false);
  };

  const openCreate = () => {
    setEditingConfig(null);
    setForm({ ...emptyConfig });
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
      is_active: config.is_active,
    });
    setDialogOpen(true);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = PROMPT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setForm(prev => ({
        ...prev,
        system_prompt: template.prompt,
        knowledge_base: template.knowledge,
      }));
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.system_prompt.trim()) {
      toast.error('Nome e System Prompt são obrigatórios');
      return;
    }

    setSaving(true);
    try {
      if (editingConfig) {
        const { error } = await supabase
          .from('ai_configs')
          .update({
            name: form.name,
            system_prompt: form.system_prompt,
            knowledge_base: form.knowledge_base,
            model: form.model,
            temperature: form.temperature,
            max_tokens: form.max_tokens,
            avatar_name: form.avatar_name,
            voice: form.voice,
            is_active: form.is_active,
          } as any)
          .eq('id', editingConfig.id);

        if (error) throw error;
        toast.success('Configuração atualizada!');
      } else {
        const orgId = profile?.org_id;
        if (!orgId) {
          toast.error('Organização não encontrada');
          return;
        }

        const { error } = await supabase
          .from('ai_configs')
          .insert({
            org_id: orgId,
            name: form.name,
            system_prompt: form.system_prompt,
            knowledge_base: form.knowledge_base,
            model: form.model,
            temperature: form.temperature,
            max_tokens: form.max_tokens,
            avatar_name: form.avatar_name,
            voice: form.voice,
            is_active: form.is_active,
          } as any);

        if (error) throw error;
        toast.success('Configuração criada!');
      }

      setDialogOpen(false);
      fetchConfigs();
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
      fetchConfigs();
    }
  };

  const handleToggleActive = async (config: AIConfig) => {
    const { error } = await supabase
      .from('ai_configs')
      .update({ is_active: !config.is_active } as any)
      .eq('id', config.id);

    if (error) {
      toast.error('Erro ao alterar status');
    } else {
      fetchConfigs();
    }
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
            Gerencie o system prompt, knowledge base e parâmetros do modelo para seus totens.
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
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Ativa
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {config.avatar_name} · {config.model} · Temp: {config.temperature}
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
                  <Switch
                    checked={config.is_active}
                    onCheckedChange={() => handleToggleActive(config)}
                  />
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
              Configure o comportamento da IA, knowledge base e parâmetros do modelo.
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

            {/* Active toggle */}
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
