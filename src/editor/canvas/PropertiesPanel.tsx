import { useState, useRef, useCallback } from 'react';
import type { CanvasElement } from '../types/canvas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Copy, ArrowUp, ArrowDown, Lock, Unlock, Eye, EyeOff, Upload, Loader2, Plus, X, GripVertical, Store } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  element: CanvasElement | null;
  onUpdate: (patch: Partial<CanvasElement>) => void;
  onUpdateProps: (props: Record<string, any>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  bgColor: string;
  onBgColorChange: (c: string) => void;
}

export function PropertiesPanel({
  element, onUpdate, onUpdateProps, onDelete, onDuplicate,
  onBringForward, onSendBackward, bgColor, onBgColorChange,
}: Props) {
  if (!element) {
    return (
      <div className="p-4 space-y-4">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Canvas</h3>
        <div>
          <Label className="text-[11px]">Cor de fundo</Label>
          <div className="flex gap-2 mt-1">
            <input type="color" value={bgColor} onChange={(e) => onBgColorChange(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
            <Input value={bgColor} onChange={(e) => onBgColorChange(e.target.value)} className="h-8 text-xs font-mono" />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-8 text-center">
          Selecione um elemento no canvas para editar suas propriedades
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{element.name}</h3>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onUpdate({ visible: !element.visible })}>
              {element.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onUpdate({ locked: !element.locked })}>
              {element.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        {/* Position & Size */}
        <Section title="Posição e Tamanho">
          <div className="grid grid-cols-2 gap-2">
            <Field label="X" value={element.x} onChange={(v) => onUpdate({ x: v })} />
            <Field label="Y" value={element.y} onChange={(v) => onUpdate({ y: v })} />
            <Field label="L" value={element.width} onChange={(v) => onUpdate({ width: v })} />
            <Field label="A" value={element.height} onChange={(v) => onUpdate({ height: v })} />
          </div>
        </Section>

        {/* Opacity */}
        <Section title="Opacidade">
          <Slider
            value={[element.opacity * 100]}
            onValueChange={([v]) => onUpdate({ opacity: v / 100 })}
            min={0} max={100} step={1}
          />
          <span className="text-[10px] text-muted-foreground">{Math.round(element.opacity * 100)}%</span>
        </Section>

        {/* Type-specific props */}
        <TypeProps type={element.type} props={element.props} onChange={onUpdateProps} />

        {/* Actions */}
        <Section title="Ações">
          <div className="grid grid-cols-2 gap-1.5">
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={onDuplicate}>
              <Copy className="w-3 h-3" /> Duplicar
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={onBringForward}>
              <ArrowUp className="w-3 h-3" /> Frente
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={onSendBackward}>
              <ArrowDown className="w-3 h-3" /> Trás
            </Button>
            <Button variant="destructive" size="sm" className="text-xs gap-1" onClick={onDelete}>
              <Trash2 className="w-3 h-3" /> Excluir
            </Button>
          </div>
        </Section>
      </div>
    </ScrollArea>
  );
}

/* ── Helpers ─────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-muted-foreground font-mono w-3">{label}</span>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-7 text-xs font-mono"
      />
    </div>
  );
}

function PropInput({ label, value, onChange, type = 'text' }: { label: string; value: any; onChange: (v: any) => void; type?: string }) {
  return (
    <div>
      <Label className="text-[11px]">{label}</Label>
      {type === 'color' ? (
        <div className="flex gap-2 mt-1">
          <input type="color" value={value || '#ffffff'} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
          <Input value={value || ''} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs font-mono" />
        </div>
      ) : type === 'textarea' ? (
        <Textarea value={value || ''} onChange={(e) => onChange(e.target.value)} className="text-xs mt-1 min-h-[60px]" />
      ) : (
        <Input type={type} value={value ?? ''} onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} className="h-8 text-xs mt-1" />
      )}
    </div>
  );
}

function ImageUploadField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage.from('canvas-images').upload(path, file);
      if (error) throw error;

      const { data: urlData } = supabase.storage.from('canvas-images').getPublicUrl(path);
      onChange(urlData.publicUrl);
      toast.success('Imagem enviada!');
    } catch (err: any) {
      toast.error('Erro ao enviar: ' + (err.message || 'tente novamente'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-[11px]">Imagem</Label>

      {/* Preview */}
      {value && (
        <div className="w-full h-20 rounded-md overflow-hidden border border-border/50">
          <img src={value} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Upload button */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs gap-1.5"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
        {uploading ? 'Enviando…' : 'Enviar imagem'}
      </Button>

      {/* URL fallback */}
      <Input
        placeholder="ou cole a URL da imagem"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 text-xs font-mono"
      />
    </div>
  );
}
/* ── Map Properties with Address Search ───── */

function MapPropsPanel({ props, onChange }: { props: Record<string, any>; onChange: (p: Record<string, any>) => void }) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const set = (key: string) => (val: any) => onChange({ [key]: val });

  const searchAddress = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setResults([]);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&accept-language=pt-BR`, {
        headers: { 'User-Agent': 'AitiManager/1.0' },
      });
      const data = await res.json();
      setResults(data);
      if (data.length === 0) toast('Nenhum endereço encontrado');
    } catch {
      toast.error('Erro ao buscar endereço');
    } finally {
      setSearching(false);
    }
  };

  const selectResult = (r: { lat: string; lon: string; display_name: string }) => {
    onChange({ lat: parseFloat(r.lat), lng: parseFloat(r.lon), label: r.display_name.split(',')[0] });
    setResults([]);
    setQuery('');
  };

  return (
    <Section title="Mapa">
      <div className="space-y-1.5">
        <Label className="text-[11px]">🔍 Buscar endereço</Label>
        <div className="flex gap-1">
          <Input
            placeholder="Ex: Av. Paulista, São Paulo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
            className="h-8 text-xs"
          />
          <Button variant="outline" size="sm" className="h-8 px-2 shrink-0" onClick={searchAddress} disabled={searching}>
            {searching ? <Loader2 className="w-3 h-3 animate-spin" /> : '🔍'}
          </Button>
        </div>
        {results.length > 0 && (
          <div className="border border-border rounded-md overflow-hidden bg-background max-h-[160px] overflow-y-auto">
            {results.map((r, i) => (
              <button
                key={i}
                className="w-full text-left px-2 py-1.5 text-[11px] hover:bg-accent/50 border-b border-border/30 last:border-b-0 transition-colors"
                onClick={() => selectResult(r)}
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}
        <p className="text-[9px] text-muted-foreground">Digite e pressione Enter ou clique 🔍</p>
      </div>

      <div className="space-y-2 pt-2 border-t border-border">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Coordenadas</p>
        <PropInput label="Latitude" value={props.lat ?? -23.5505} onChange={set('lat')} type="number" />
        <PropInput label="Longitude" value={props.lng ?? -46.6333} onChange={set('lng')} type="number" />
      </div>

      <div>
        <Label className="text-[11px]">Zoom: {props.zoom ?? 15}</Label>
        <Slider value={[props.zoom ?? 15]} onValueChange={([v]) => onChange({ zoom: v })} min={3} max={20} step={1} />
      </div>
      <PropInput label="Border Radius" value={props.borderRadius ?? 12} onChange={set('borderRadius')} type="number" />

      <div className="space-y-2 pt-2 border-t border-border">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Legenda</p>
        <PropInput label="Texto" value={props.label || ''} onChange={set('label')} />
        <PropInput label="Cor" value={props.labelColor || '#ffffff'} onChange={set('labelColor')} type="color" />
        <PropInput label="Tamanho" value={props.labelSize || 14} onChange={set('labelSize')} type="number" />
      </div>
    </Section>
  );
}

/* ── Carousel Properties ─────────────────── */

function CarouselImageUpload({ onAdd }: { onAdd: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const ext = file.name.split('.').pop();
        const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('canvas-images').upload(path, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('canvas-images').getPublicUrl(path);
        onAdd(urlData.publicUrl);
      }
      toast.success('Imagens enviadas!');
    } catch (err: any) {
      toast.error('Erro: ' + (err.message || 'tente novamente'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5" onClick={() => fileRef.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
        {uploading ? 'Enviando…' : 'Adicionar imagens'}
      </Button>
    </>
  );
}

function CarouselPropsPanel({ props, onChange }: { props: Record<string, any>; onChange: (p: Record<string, any>) => void }) {
  const images: string[] = props.images || [];
  const set = (key: string) => (val: any) => onChange({ [key]: val });

  const addImage = useCallback((url: string) => {
    onChange({ images: [...images, url] });
  }, [images, onChange]);

  const removeImage = useCallback((index: number) => {
    onChange({ images: images.filter((_: string, i: number) => i !== index) });
  }, [images, onChange]);

  return (
    <Section title="Carrossel">
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
        {images.map((src: string, i: number) => (
          <div key={i} className="flex items-center gap-1.5 group">
            <div className="w-10 h-10 rounded border border-border/50 overflow-hidden shrink-0">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-[9px] text-muted-foreground truncate flex-1 font-mono">{src.split('/').pop()}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0" onClick={() => removeImage(i)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      <CarouselImageUpload onAdd={addImage} />

      <div>
        <Label className="text-[11px]">Ou cole URL</Label>
        <div className="flex gap-1 mt-1">
          <Input
            placeholder="https://..."
            className="h-7 text-xs font-mono"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value.trim();
                if (val) { addImage(val); (e.target as HTMLInputElement).value = ''; }
              }
            }}
          />
        </div>
        <p className="text-[9px] text-muted-foreground mt-0.5">Pressione Enter para adicionar</p>
      </div>

      <PropInput label="Border Radius" value={props.borderRadius} onChange={set('borderRadius')} type="number" />
      <PropInput label="Intervalo (seg)" value={props.interval} onChange={set('interval')} type="number" />

      <div>
        <Label className="text-[11px]">Transição</Label>
        <Select value={props.transition || 'fade'} onValueChange={set('transition')}>
          <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="fade">Fade</SelectItem>
            <SelectItem value="slide">Slide</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-[11px]">Ajuste da imagem</Label>
        <Select value={props.objectFit || 'contain'} onValueChange={set('objectFit')}>
          <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="contain">Sem corte (contain)</SelectItem>
            <SelectItem value="cover">Preencher (cover)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-[11px]">Autoplay</Label>
        <Switch checked={props.autoplay !== false} onCheckedChange={set('autoplay')} />
      </div>
    </Section>
  );
}

const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: '📸', color: '#E1306C' },
  { value: 'facebook', label: 'Facebook', icon: '👤', color: '#1877F2' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬', color: '#25D366' },
  { value: 'twitter', label: 'X / Twitter', icon: '𝕏', color: '#000000' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵', color: '#010101' },
  { value: 'youtube', label: 'YouTube', icon: '▶️', color: '#FF0000' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0A66C2' },
  { value: 'telegram', label: 'Telegram', icon: '✈️', color: '#26A5E4' },
  { value: 'email', label: 'E-mail', icon: '📧', color: '#EA4335' },
  { value: 'website', label: 'Website', icon: '🌐', color: '#6366f1' },
  { value: 'phone', label: 'Telefone', icon: '📞', color: '#10b981' },
  { value: 'maps', label: 'Maps', icon: '📍', color: '#4285F4' },
  { value: 'spotify', label: 'Spotify', icon: '🎧', color: '#1DB954' },
  { value: 'pinterest', label: 'Pinterest', icon: '📌', color: '#E60023' },
  { value: 'threads', label: 'Threads', icon: '🧵', color: '#000000' },
  { value: 'discord', label: 'Discord', icon: '🎮', color: '#5865F2' },
  { value: 'github', label: 'GitHub', icon: '🐱', color: '#333333' },
];

function SocialPropsPanel({ props, onChange }: { props: Record<string, any>; onChange: (p: Record<string, any>) => void }) {
  const links: Array<{ id: string; platform: string; label: string; url: string; color: string }> = props.links || [];
  const set = (key: string) => (val: any) => onChange({ [key]: val });

  const addLink = (platformValue: string) => {
    const preset = SOCIAL_PLATFORMS.find(p => p.value === platformValue);
    const newLink = {
      id: Date.now().toString(),
      platform: platformValue,
      label: preset?.label || platformValue,
      url: '',
      color: preset?.color || '#6366f1',
    };
    onChange({ links: [...links, newLink] });
  };

  const removeLink = (id: string) => {
    onChange({ links: links.filter(l => l.id !== id) });
  };

  const updateLink = (id: string, field: string, value: string) => {
    onChange({ links: links.map(l => l.id === id ? { ...l, [field]: value } : l) });
  };

  // Platforms not yet added
  const available = SOCIAL_PLATFORMS.filter(p => !links.some(l => l.platform === p.value));

  return (
    <Section title="Redes Sociais">
      {/* Quick-add buttons */}
      <div>
        <Label className="text-[11px]">Adicionar rede</Label>
        <div className="flex flex-wrap gap-1 mt-1">
          {available.slice(0, 10).map(p => (
            <button key={p.value} onClick={() => addLink(p.value)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border border-border/50 hover:bg-accent/50 transition-colors"
              title={p.label}>
              <span>{p.icon}</span>
              <span className="hidden sm:inline">{p.label}</span>
            </button>
          ))}
          {available.length > 10 && (
            <Select onValueChange={addLink}>
              <SelectTrigger className="h-7 w-20 text-[10px]"><SelectValue placeholder="Mais…" /></SelectTrigger>
              <SelectContent>
                {available.slice(10).map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.icon} {p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Current links */}
      <div className="space-y-2 max-h-[240px] overflow-y-auto">
        {links.map((link, idx) => {
          const preset = SOCIAL_PLATFORMS.find(p => p.value === link.platform);
          return (
            <div key={link.id} className="p-2 rounded-lg border border-border/50 bg-muted/20 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">{preset?.icon || '🔗'}</span>
                <span className="text-[11px] font-medium flex-1">{link.label}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0" onClick={() => removeLink(link.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <Input
                value={link.url}
                onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                placeholder={link.platform === 'email' ? 'email@exemplo.com' : link.platform === 'phone' ? '+55 11 99999-9999' : 'https://...'}
                className="h-7 text-xs"
              />
              <div className="flex gap-2">
                <Input value={link.label} onChange={(e) => updateLink(link.id, 'label', e.target.value)} className="h-7 text-xs flex-1" placeholder="Rótulo" />
                <input type="color" value={link.color} onChange={(e) => updateLink(link.id, 'color', e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0" />
              </div>
            </div>
          );
        })}
      </div>

      {links.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-2">Clique em uma rede acima para adicionar</p>}

      {/* Layout & style */}
      <div className="space-y-2 pt-2 border-t border-border">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Aparência</p>
        <div>
          <Label className="text-[11px]">Layout</Label>
          <Select value={props.layout || 'horizontal'} onValueChange={set('layout')}>
            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="horizontal">Horizontal</SelectItem>
              <SelectItem value="vertical">Vertical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px]">Tamanho ícone: {props.iconSize || 36}px</Label>
          <Slider value={[props.iconSize || 36]} onValueChange={([v]) => onChange({ iconSize: v })} min={20} max={64} step={2} />
        </div>
        <div>
          <Label className="text-[11px]">Espaçamento: {props.gap || 16}px</Label>
          <Slider value={[props.gap || 16]} onValueChange={([v]) => onChange({ gap: v })} min={4} max={40} step={2} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Mostrar rótulos</Label>
          <Switch checked={props.showLabels !== false} onCheckedChange={set('showLabels')} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Fundo</Label>
          <Switch checked={props.bgEnabled || false} onCheckedChange={set('bgEnabled')} />
        </div>
      </div>
    </Section>
  );
}

/* ── Store / Mall Directory Properties ─────── */

const STORE_CATEGORIES = [
  'Moda', 'Alimentação', 'Eletrônicos', 'Saúde & Beleza', 'Esportes',
  'Casa & Decoração', 'Entretenimento', 'Serviços', 'Joalheria', 'Infantil', 'Outro',
];

function StoreLogoUpload({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Selecione uma imagem'); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `store-logos/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('canvas-images').upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('canvas-images').getPublicUrl(path);
      onChange(urlData.publicUrl);
      toast.success('Logo enviado!');
    } catch (err: any) {
      toast.error('Erro: ' + (err.message || 'tente novamente'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1">
      <Label className="text-[10px]">Logo</Label>
      <div className="flex items-center gap-1.5">
        {value && (
          <div className="w-8 h-8 rounded border border-border/50 overflow-hidden shrink-0">
            <img src={value} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 flex-1" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          {uploading ? 'Enviando…' : value ? 'Trocar' : 'Enviar logo'}
        </Button>
        {value && (
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => onChange('')}>
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
      <Input placeholder="ou cole URL" value={value || ''} onChange={(e) => onChange(e.target.value)} className="h-6 text-[10px] font-mono" />
    </div>
  );
}

function StorePropsPanel({ props, onChange }: { props: Record<string, any>; onChange: (p: Record<string, any>) => void }) {
  const stores: Array<{ id: string; name: string; logo: string; floor: string; category: string; hours: string; phone: string; description: string }> = props.stores || [];
  const set = (key: string) => (val: any) => onChange({ [key]: val });

  const addStore = () => {
    const newStore = {
      id: Date.now().toString(),
      name: 'Nova Loja',
      logo: '',
      floor: 'Piso 1',
      category: 'Moda',
      hours: '10h–22h',
      phone: '',
      description: '',
    };
    onChange({ stores: [...stores, newStore] });
  };

  const removeStore = (id: string) => onChange({ stores: stores.filter(s => s.id !== id) });

  const updateStore = (id: string, field: string, value: string) => {
    onChange({ stores: stores.map(s => s.id === id ? { ...s, [field]: value } : s) });
  };

  return (
    <Section title="Diretório de Lojas">
      {/* Title settings */}
      <PropInput label="Título" value={props.title || 'Lojas'} onChange={set('title')} />
      <PropInput label="Cor do título" value={props.titleColor || '#ffffff'} onChange={set('titleColor')} type="color" />
      <PropInput label="Tamanho título" value={props.titleSize || 28} onChange={set('titleSize')} type="number" />

      {/* Store list */}
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase">Lojas ({stores.length})</p>
          <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={addStore}>
            <Plus className="w-3 h-3" /> Adicionar
          </Button>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {stores.map((store) => (
            <div key={store.id} className="p-2.5 rounded-lg border border-border/50 bg-muted/20 space-y-1.5">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-[11px] font-medium flex-1 truncate">{store.name}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0" onClick={() => removeStore(store.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <Input value={store.name} onChange={(e) => updateStore(store.id, 'name', e.target.value)} placeholder="Nome da loja" className="h-7 text-xs" />
              <Input value={store.description || ''} onChange={(e) => updateStore(store.id, 'description', e.target.value)} placeholder="Descrição breve" className="h-7 text-xs" />
              <div className="grid grid-cols-2 gap-1.5">
                <Input value={store.floor} onChange={(e) => updateStore(store.id, 'floor', e.target.value)} placeholder="Piso" className="h-7 text-xs" />
                <Select value={store.category || 'Outro'} onValueChange={(v) => updateStore(store.id, 'category', v)}>
                  <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STORE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <Input value={store.hours} onChange={(e) => updateStore(store.id, 'hours', e.target.value)} placeholder="Horário" className="h-7 text-xs" />
                <Input value={store.phone} onChange={(e) => updateStore(store.id, 'phone', e.target.value)} placeholder="Telefone" className="h-7 text-xs" />
              </div>
              <StoreLogoUpload value={store.logo} onChange={(v) => updateStore(store.id, 'logo', v)} />
            </div>
          ))}
        </div>

        {stores.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-2">Clique "Adicionar" para criar lojas</p>}
      </div>

      {/* Appearance */}
      <div className="space-y-2 pt-2 border-t border-border">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Aparência</p>
        <PropInput label="Cor de fundo" value={props.bgColor || 'rgba(0,0,0,0.6)'} onChange={set('bgColor')} type="color" />
        <PropInput label="Cor de destaque" value={props.accentColor || '#6366f1'} onChange={set('accentColor')} type="color" />
        <PropInput label="Cor card" value={props.cardBgColor || 'rgba(255,255,255,0.08)'} onChange={set('cardBgColor')} type="color" />
        <PropInput label="Border Radius" value={props.borderRadius || 16} onChange={set('borderRadius')} type="number" />
        <PropInput label="Border Radius card" value={props.cardBorderRadius || 12} onChange={set('cardBorderRadius')} type="number" />
        <div>
          <Label className="text-[11px]">Colunas</Label>
          <Select value={String(props.columns || 1)} onValueChange={(v) => onChange({ columns: parseInt(v) })}>
            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 coluna</SelectItem>
              <SelectItem value="2">2 colunas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px]">Espaçamento: {props.gap || 12}px</Label>
          <Slider value={[props.gap || 12]} onValueChange={([v]) => onChange({ gap: v })} min={4} max={24} step={2} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Mostrar piso</Label>
          <Switch checked={props.showFloor !== false} onCheckedChange={set('showFloor')} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Mostrar categoria</Label>
          <Switch checked={props.showCategory !== false} onCheckedChange={set('showCategory')} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Mostrar horário</Label>
          <Switch checked={props.showHours !== false} onCheckedChange={set('showHours')} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Mostrar telefone</Label>
          <Switch checked={props.showPhone !== false} onCheckedChange={set('showPhone')} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Filtro por categoria</Label>
          <Switch checked={props.showFilter !== false} onCheckedChange={set('showFilter')} />
        </div>
      </div>
    </Section>
  );
}

function TypeProps({ type, props, onChange }: { type: string; props: Record<string, any>; onChange: (p: Record<string, any>) => void }) {
  const set = (key: string) => (val: any) => onChange({ [key]: val });

  switch (type) {
    case 'text':
      return (
        <Section title="Texto">
          <PropInput label="Conteúdo" value={props.text} onChange={set('text')} type="textarea" />
          <PropInput label="Tamanho" value={props.fontSize} onChange={set('fontSize')} type="number" />
          <PropInput label="Cor" value={props.color} onChange={set('color')} type="color" />
          <div>
            <Label className="text-[11px]">Peso</Label>
            <Select value={props.fontWeight || 'normal'} onValueChange={set('fontWeight')}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="semibold">Semi-bold</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px]">Alinhamento</Label>
            <Select value={props.align || 'left'} onValueChange={set('align')}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Esquerda</SelectItem>
                <SelectItem value="center">Centro</SelectItem>
                <SelectItem value="right">Direita</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Section>
      );
    case 'image':
      return (
        <Section title="Imagem">
          <ImageUploadField value={props.src} onChange={set('src')} />
          <div>
            <Label className="text-[11px]">Ajuste</Label>
            <Select value={props.fit || 'cover'} onValueChange={set('fit')}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">Cover</SelectItem>
                <SelectItem value="contain">Contain</SelectItem>
                <SelectItem value="fill">Fill</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <PropInput label="Border Radius" value={props.borderRadius} onChange={set('borderRadius')} type="number" />
        </Section>
      );
    case 'button':
      return (
        <Section title="Botão">
          <PropInput label="Texto" value={props.label} onChange={set('label')} />
          <PropInput label="Cor de fundo" value={props.bgColor} onChange={set('bgColor')} type="color" />
          <PropInput label="Cor do texto" value={props.textColor} onChange={set('textColor')} type="color" />
          <PropInput label="Tamanho da fonte" value={props.fontSize} onChange={set('fontSize')} type="number" />
          <PropInput label="Border Radius" value={props.borderRadius} onChange={set('borderRadius')} type="number" />
          <PropInput label="Ação (URL ou prompt IA)" value={props.action} onChange={set('action')} />
        </Section>
      );
    case 'shape':
      return (
        <Section title="Forma">
          <div>
            <Label className="text-[11px]">Tipo</Label>
            <Select value={props.shapeType || 'rectangle'} onValueChange={set('shapeType')}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rectangle">Retângulo</SelectItem>
                <SelectItem value="circle">Círculo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <PropInput label="Cor" value={props.fill} onChange={set('fill')} type="color" />
          <PropInput label="Border Radius" value={props.borderRadius} onChange={set('borderRadius')} type="number" />
        </Section>
      );
    case 'icon':
      return (
        <Section title="Ícone">
          <PropInput label="Emoji / Ícone" value={props.icon} onChange={set('icon')} />
          <PropInput label="Tamanho" value={props.size} onChange={set('size')} type="number" />
          <PropInput label="Cor" value={props.color} onChange={set('color')} type="color" />
        </Section>
      );
    case 'qrcode':
      return (
        <Section title="QR Code">
          <PropInput label="URL / Valor" value={props.value} onChange={set('value')} />
          <PropInput label="Cor do QR" value={props.fgColor} onChange={set('fgColor')} type="color" />
          <PropInput label="Cor de fundo" value={props.bgColor || 'transparent'} onChange={set('bgColor')} type="color" />
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">Correção de erro</label>
            <select
              value={props.errorCorrectionLevel || 'M'}
              onChange={(e) => set('errorCorrectionLevel')(e.target.value)}
              className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
            >
              <option value="L">L – Baixa (7%)</option>
              <option value="M">M – Média (15%)</option>
              <option value="Q">Q – Alta (25%)</option>
              <option value="H">H – Máxima (30%)</option>
            </select>
          </div>
          <PropInput label="Margem" value={props.margin ?? 1} onChange={set('margin')} type="number" />
          <PropInput label="Legenda" value={props.label || ''} onChange={set('label')} />
          <PropInput label="Cor da legenda" value={props.labelColor || '#ffffff'} onChange={set('labelColor')} type="color" />
          <PropInput label="Tamanho legenda" value={props.labelSize || 14} onChange={set('labelSize')} type="number" />
        </Section>
      );
    case 'clock':
      return (
        <Section title="Relógio">
          <PropInput label="Cor" value={props.color} onChange={set('color')} type="color" />
          <PropInput label="Tamanho" value={props.fontSize} onChange={set('fontSize')} type="number" />
        </Section>
      );
    case 'avatar':
      return (
        <Section title="Avatar 3D">
          <PropInput label="URL do modelo" value={props.avatarUrl} onChange={set('avatarUrl')} />
          <PropInput label="URL das animações" value={props.animationsUrl} onChange={set('animationsUrl')} />
          <PropInput label="Escala" value={props.scale} onChange={set('scale')} type="number" />
          <PropInput label="Cor da camisa" value={props.colors?.shirt || '#1E3A8A'} onChange={(v) => onChange({ colors: { ...(props.colors || {}), shirt: v } })} type="color" />
          <PropInput label="Cor da calça" value={props.colors?.pants || '#1F2937'} onChange={(v) => onChange({ colors: { ...(props.colors || {}), pants: v } })} type="color" />
          <PropInput label="Cor dos sapatos" value={props.colors?.shoes || '#000000'} onChange={(v) => onChange({ colors: { ...(props.colors || {}), shoes: v } })} type="color" />
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pt-2">Enquadramento</p>
          <div>
            <Label className="text-[11px]">↕ Vertical: {props.frameY ?? 0}</Label>
            <Slider value={[props.frameY ?? 0]} onValueChange={([v]) => onChange({ frameY: v })} min={-100} max={100} step={1} />
            <span className="text-[9px] text-muted-foreground">Negativo = sobe · Positivo = desce</span>
          </div>
          <div>
            <Label className="text-[11px]">🔍 Zoom: {props.frameZoom ?? 50}</Label>
            <Slider value={[props.frameZoom ?? 50]} onValueChange={([v]) => onChange({ frameZoom: v })} min={10} max={100} step={1} />
            <span className="text-[9px] text-muted-foreground">10 = longe · 100 = perto</span>
          </div>
        </Section>
      );
    case 'carousel':
      return <CarouselPropsPanel props={props} onChange={onChange} />;
    case 'video':
      return (
        <Section title="Vídeo">
          <PropInput label="URL do vídeo" value={props.url} onChange={set('url')} />
          <p className="text-[9px] text-muted-foreground -mt-1">YouTube, Vimeo ou link direto (.mp4)</p>
          <PropInput label="Border Radius" value={props.borderRadius} onChange={set('borderRadius')} type="number" />
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Autoplay</Label>
            <Switch checked={props.autoplay !== false} onCheckedChange={set('autoplay')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Mudo</Label>
            <Switch checked={props.muted !== false} onCheckedChange={set('muted')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Loop</Label>
            <Switch checked={props.loop !== false} onCheckedChange={set('loop')} />
          </div>
        </Section>
      );
    case 'iframe':
      return (
        <Section title="Iframe">
          <PropInput label="URL do site" value={props.url} onChange={set('url')} />
          <p className="text-[9px] text-muted-foreground -mt-1">Cole o endereço completo (https://...)</p>
          <PropInput label="Border Radius" value={props.borderRadius} onChange={set('borderRadius')} type="number" />
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Scrolling</Label>
            <Switch checked={props.scrolling !== false} onCheckedChange={set('scrolling')} />
          </div>
        </Section>
      );
    case 'map':
      return <MapPropsPanel props={props} onChange={onChange} />;
    case 'social':
      return <SocialPropsPanel props={props} onChange={onChange} />;
    case 'store':
      return <StorePropsPanel props={props} onChange={onChange} />;
    default:
      return (
        <Section title="Propriedades">
          <p className="text-[11px] text-muted-foreground">Configurações avançadas em breve.</p>
        </Section>
      );
  }
}
