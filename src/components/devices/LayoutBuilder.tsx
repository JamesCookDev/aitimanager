import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Monitor, Save, User, UserMinus, UserPlus, MessageSquare, Paintbrush, LayoutTemplate, Layers, Sparkles, Trash2, BookmarkPlus, Maximize2 } from 'lucide-react';
import { ColorPickerPopover } from './ColorPickerPopover';
import { UnsplashImagePicker } from './UnsplashImagePicker';
// FullscreenPreview removed - use new PageBuilder instead

interface LayoutConfig {
  layout_style: 'fullscreen' | 'split' | 'box';
  avatar_position: 'left' | 'center' | 'right';
  avatar_scale: number;
  chat_position: 'left' | 'right';
  show_chat_menu: boolean;
  bg_type: 'solid' | 'gradient' | 'image';
  bg_color: string;
  bg_gradient: string;
  bg_image: string;
  show_floor: boolean;
  floor_color: string;
  show_wall: boolean;
  show_particles: boolean;
  show_header: boolean;
  primary_color: string;
}

const DEFAULT_LAYOUT: LayoutConfig = {
  layout_style: 'fullscreen',
  avatar_position: 'center',
  avatar_scale: 1.5,
  chat_position: 'right',
  show_chat_menu: true,
  bg_type: 'solid',
  bg_color: '#0f3460',
  bg_gradient: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
  bg_image: '',
  show_floor: true,
  floor_color: '#1a1a2e',
  show_wall: true,
  show_particles: true,
  show_header: true,
  primary_color: '#4ade80',
};

const LAYOUT_TEMPLATES: { name: string; description: string; layout: Partial<LayoutConfig> }[] = [
  { name: 'Recepcao', description: 'Avatar a esquerda com chat a direita', layout: { avatar_position: 'left', avatar_scale: 1.8, chat_position: 'right', bg_type: 'solid', bg_color: '#1a1a2e', floor_color: '#2d2d44' } },
  { name: 'Quiosque', description: 'Avatar centralizado e compacto', layout: { avatar_position: 'center', avatar_scale: 1.3, chat_position: 'right', bg_type: 'solid', bg_color: '#0a192f', floor_color: '#112240' } },
  { name: 'Palco', description: 'Avatar grande para apresentacoes', layout: { avatar_position: 'center', avatar_scale: 2.2, chat_position: 'right', bg_type: 'gradient', bg_color: '#0f0f23', bg_gradient: 'linear-gradient(135deg, #0f0f23, #1a1a3e)', floor_color: '#1a1a3e' } },
  { name: 'Loja', description: 'Avatar a direita com chat a esquerda', layout: { avatar_position: 'right', avatar_scale: 1.6, chat_position: 'left', bg_type: 'solid', bg_color: '#1b2838', floor_color: '#2a3f54' } },
  { name: 'Hospital', description: 'Layout limpo para saude', layout: { avatar_position: 'left', avatar_scale: 1.5, chat_position: 'right', bg_type: 'solid', bg_color: '#0d2137', floor_color: '#162d4a' } },
];

interface LayoutBuilderProps {
  deviceId: string;
  initialLayout?: Partial<LayoutConfig> | null;
  fullUiConfig?: Record<string, any> | null;
}

interface CustomTemplate {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  layout: LayoutConfig;
}

export function LayoutBuilder({ deviceId, initialLayout, fullUiConfig }: LayoutBuilderProps) {
  const [layout, setLayout] = useState<LayoutConfig>({ ...DEFAULT_LAYOUT, ...initialLayout });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [gradColor1, setGradColor1] = useState('#1e3a8a');
  const [gradColor2, setGradColor2] = useState('#0f172a');
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTplName, setNewTplName] = useState('');
  const [newTplIcon, setNewTplIcon] = useState('');
  const [newTplDesc, setNewTplDesc] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const fetchCustomTemplates = useCallback(async () => {
    const { data } = await supabase
      .from('layout_templates')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setCustomTemplates(data.map((t: any) => ({
        id: t.id,
        name: t.name,
        icon: t.icon,
        description: t.description,
        layout: t.layout as LayoutConfig,
      })));
    }
  }, []);

  useEffect(() => { fetchCustomTemplates(); }, [fetchCustomTemplates]);

  useEffect(() => {
    if (initialLayout) {
      setLayout({ ...DEFAULT_LAYOUT, ...initialLayout });
      if (initialLayout.bg_gradient) {
        const match = initialLayout.bg_gradient.match(/#[0-9a-fA-F]{6}/g);
        if (match && match.length >= 2) { setGradColor1(match[0]); setGradColor2(match[1]); }
      }
    }
  }, [initialLayout]);

  const handleSaveTemplate = async () => {
    if (!newTplName.trim()) { toast.error('Digite um nome para o template'); return; }
    setSavingTemplate(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nao autenticado');
      const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single();
      if (!profile?.org_id) throw new Error('Organizacao nao encontrada');
      const { error } = await supabase.from('layout_templates').insert({
        org_id: profile.org_id, created_by: user.id, name: newTplName.trim(),
        icon: newTplIcon || 'T', description: newTplDesc.trim() || null, layout: layout as any,
      } as any);
      if (error) throw error;
      toast.success(`Template "${newTplName}" salvo!`);
      setShowSaveDialog(false); setNewTplName(''); setNewTplIcon(''); setNewTplDesc('');
      fetchCustomTemplates();
    } catch (error) { console.error('Erro:', error); toast.error('Erro ao salvar template'); }
    finally { setSavingTemplate(false); }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    const { error } = await supabase.from('layout_templates').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir'); return; }
    toast.success(`Template "${name}" excluido`);
    fetchCustomTemplates();
  };

  const update = <K extends keyof LayoutConfig>(key: K, value: LayoutConfig[K]) => {
    setLayout(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateGradient = (c1: string, c2: string) => {
    setGradColor1(c1); setGradColor2(c2);
    update('bg_gradient', `linear-gradient(135deg, ${c1}, ${c2})`);
  };

  const getPreviewBg = (): string => {
    if (layout.bg_type === 'gradient') return layout.bg_gradient;
    if (layout.bg_type === 'image' && layout.bg_image) return `url(${layout.bg_image}) center/cover no-repeat`;
    return layout.bg_color;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const merged = { ...(fullUiConfig || {}), layout };
      const { error } = await supabase.from('devices').update({ ui_config: merged as any }).eq('id', deviceId);
      if (error) throw error;
      toast.success('Layout atualizado!', { description: 'Mudancas aplicadas no proximo carregamento.' });
      setHasChanges(false);
    } catch (error) { console.error('Erro:', error); toast.error('Erro ao salvar layout'); }
    finally { setSaving(false); }
  };

  const menuCategories = fullUiConfig?.menu_categories || [];

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            Layout do Cenario
          </h3>
          <p className="text-sm text-muted-foreground">Posicao do avatar, fundo e elementos 3D</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFullscreen(true)}>
            <Maximize2 className="w-4 h-4 mr-2" />
            Tela Cheia
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasChanges} size="sm">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Mini Preview */}
      <div className="rounded-xl border border-border overflow-hidden" style={{ background: getPreviewBg() }}>
        <div className="relative h-48 flex items-end">
          {layout.show_wall && (
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.15) 100%)' }} />
          )}
          {layout.show_particles && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="absolute rounded-full bg-white/20 animate-pulse" style={{
                  width: `${2 + (i % 3)}px`, height: `${2 + (i % 3)}px`,
                  left: `${8 + i * 7.5}%`, top: `${10 + (i % 5) * 18}%`,
                  animationDelay: `${i * 0.25}s`, animationDuration: `${1.5 + (i % 3) * 0.5}s`,
                }} />
              ))}
            </div>
          )}
          <div className="absolute bottom-0 flex flex-col items-center transition-all duration-300" style={{
            left: layout.avatar_position === 'left' ? '20%' : layout.avatar_position === 'center' ? '50%' : '80%',
            transform: `translateX(-50%) scale(${layout.avatar_scale / 2})`,
            transformOrigin: 'bottom center',
          }}>
            <div className="w-14 h-20 rounded-lg bg-primary/60 border-2 border-primary/40 flex items-center justify-center mb-1 shadow-lg">
              <User className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <div className="absolute top-4 w-36 rounded-lg bg-background/20 backdrop-blur-sm border border-white/10 p-2 transition-all duration-300" style={{ [layout.chat_position === 'left' ? 'left' : 'right']: '6%' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <MessageSquare className="w-3 h-3 text-white/60" />
              <span className="text-[9px] text-white/60 font-medium">Chat</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-1.5 w-4/5 rounded-full bg-white/20" />
              <div className="h-1.5 w-3/5 rounded-full bg-white/15" />
            </div>
          </div>
          {layout.show_chat_menu && (
            <div className="absolute bottom-3 rounded-full bg-primary/70 border border-primary/50 px-3 py-1.5 flex items-center gap-1.5 shadow-lg" style={{ [layout.chat_position === 'left' ? 'left' : 'right']: '6%' }}>
              <MessageSquare className="w-3 h-3 text-white/90" />
              <span className="text-[9px] text-white/90 font-semibold">Menu</span>
            </div>
          )}
          {layout.show_floor ? (
            <div className="w-full h-10 rounded-b-xl" style={{ background: layout.floor_color }} />
          ) : (
            <div className="w-full h-10 rounded-b-xl border-t border-dashed border-white/10 flex items-center justify-center">
              <span className="text-[9px] text-white/20">Chao oculto</span>
            </div>
          )}
        </div>
      </div>

      {/* Layout Style Selector */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Estilo da Tela</Label>
        <div className="grid grid-cols-3 gap-3">
          {([
            { value: 'fullscreen' as const, label: 'Tela Cheia', desc: 'Avatar e chat ocupam a tela inteira', icon: '🖥️' },
            { value: 'split' as const, label: 'Tela Dividida', desc: 'Avatar de um lado, chat do outro', icon: '📐' },
            { value: 'box' as const, label: 'Avatar em Janela', desc: 'Avatar em uma caixa flutuante (PiP)', icon: '🪟' },
          ]).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update('layout_style', opt.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                layout.layout_style === opt.value
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              <span className="text-2xl">{opt.icon}</span>
              <span className="text-sm font-semibold text-foreground">{opt.label}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accordion sections */}
      <Accordion type="multiple" defaultValue={['templates', 'position', 'background', 'visibility']} className="space-y-2">
        {/* Templates */}
        <AccordionItem value="templates" className="border border-border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            <span className="flex items-center gap-2"><LayoutTemplate className="w-4 h-4 text-primary" /> Templates</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-3">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
                <BookmarkPlus className="w-4 h-4 mr-1" /> Salvar como Template
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {LAYOUT_TEMPLATES.map((tpl) => (
                <button key={tpl.name} type="button" onClick={() => { setLayout(prev => ({ ...prev, ...tpl.layout })); setHasChanges(true); toast.info(`"${tpl.name}" aplicado`); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-center group">
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary">{tpl.name}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{tpl.description}</span>
                </button>
              ))}
            </div>
            {customTemplates.length > 0 && (
              <div className="space-y-2 pt-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Meus Templates</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {customTemplates.map((tpl) => (
                    <div key={tpl.id} className="relative flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-center group cursor-pointer"
                      onClick={() => { setLayout(prev => ({ ...prev, ...tpl.layout })); setHasChanges(true); toast.info(`"${tpl.name}" aplicado`); }}>
                      <button type="button" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(tpl.id, tpl.name); }}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <LayoutTemplate className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary">{tpl.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Position & Scale */}
        <AccordionItem value="position" className="border border-border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            <span className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Posicao e Escala</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-5">
            {/* Avatar Position */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Posicao do Avatar</Label>
              <RadioGroup value={layout.avatar_position} onValueChange={(v) => update('avatar_position', v as any)} className="flex gap-3">
                {[{ value: 'left', label: 'Esquerda' }, { value: 'center', label: 'Centro' }, { value: 'right', label: 'Direita' }].map((opt) => (
                  <label key={opt.value} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${layout.avatar_position === opt.value ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80'}`}>
                    <RadioGroupItem value={opt.value} />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Chat Position */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Posicao do Chat</Label>
              <RadioGroup value={layout.chat_position} onValueChange={(v) => update('chat_position', v as any)} className="flex gap-3">
                {[{ value: 'left', label: 'Esquerda' }, { value: 'right', label: 'Direita' }].map((opt) => (
                  <label key={opt.value} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${layout.chat_position === opt.value ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80'}`}>
                    <RadioGroupItem value={opt.value} />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Avatar Scale with visual icons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Tamanho do Avatar</Label>
                <span className="text-sm font-mono font-medium text-foreground bg-muted px-2 py-0.5 rounded">{layout.avatar_scale.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-3">
                <UserMinus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Slider
                  value={[layout.avatar_scale]}
                  onValueChange={([v]) => update('avatar_scale', Math.round(v * 10) / 10)}
                  min={1.0}
                  max={2.5}
                  step={0.1}
                  className="flex-1"
                />
                <UserPlus className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Background */}
        <AccordionItem value="background" className="border border-border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            <span className="flex items-center gap-2"><Paintbrush className="w-4 h-4 text-primary" /> Fundo e Cores</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-5">
            {/* Background Type */}
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground">Tipo de Fundo</Label>
              <RadioGroup value={layout.bg_type} onValueChange={(v) => update('bg_type', v as any)} className="flex gap-3">
                {[{ value: 'solid', label: 'Cor Solida' }, { value: 'gradient', label: 'Gradiente' }, { value: 'image', label: 'Imagem' }].map((opt) => (
                  <label key={opt.value} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${layout.bg_type === opt.value ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80'}`}>
                    <RadioGroupItem value={opt.value} />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {layout.bg_type === 'solid' && (
              <ColorPickerPopover color={layout.bg_color} onChange={(c) => update('bg_color', c)} label="Cor de Fundo" />
            )}

            {layout.bg_type === 'gradient' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <ColorPickerPopover color={gradColor1} onChange={(c) => updateGradient(c, gradColor2)} label="Cor Inicial" />
                  <ColorPickerPopover color={gradColor2} onChange={(c) => updateGradient(gradColor1, c)} label="Cor Final" />
                </div>
                <div className="h-8 rounded-lg border border-border" style={{ background: layout.bg_gradient }} />
              </div>
            )}

            {layout.bg_type === 'image' && (
              <UnsplashImagePicker currentImage={layout.bg_image} onSelect={(url) => update('bg_image', url)} />
            )}

            {/* Floor color */}
            <ColorPickerPopover color={layout.floor_color} onChange={(c) => update('floor_color', c)} label="Cor do Chao" />

            {/* Primary color */}
            <ColorPickerPopover color={layout.primary_color || '#4ade80'} onChange={(c) => update('primary_color', c)} label="Cor Primaria (Botoes e Destaques)" />
          </AccordionContent>
        </AccordionItem>

        {/* Visibility */}
        <AccordionItem value="visibility" className="border border-border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-primary" /> Visibilidade</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'show_header' as const, label: 'Cabecalho (Header)' },
                { key: 'show_chat_menu' as const, label: 'Botao Chat/Menu' },
                { key: 'show_floor' as const, label: 'Chao 3D' },
                { key: 'show_wall' as const, label: 'Parede 3D' },
                { key: 'show_particles' as const, label: 'Particulas/Efeitos' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <Switch checked={layout[item.key]} onCheckedChange={(checked) => update(item.key, checked)} />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Layout como Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Nome do Template</Label>
              <Input value={newTplName} onChange={(e) => setNewTplName(e.target.value)} placeholder="Meu layout personalizado" autoFocus />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Descricao (opcional)</Label>
              <Input value={newTplDesc} onChange={(e) => setNewTplDesc(e.target.value)} placeholder="Breve descricao" />
            </div>
            <div className="h-16 rounded-lg border border-border overflow-hidden" style={{ background: getPreviewBg() }}>
              <p className="text-[9px] text-white/40 text-center pt-1 uppercase tracking-widest">Preview</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveTemplate} disabled={savingTemplate}>
              <Save className="w-4 h-4 mr-2" /> {savingTemplate ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Preview - deprecated, use PageBuilder instead */}
    </div>
  );
}
