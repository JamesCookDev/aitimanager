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
import { Trash2, Copy, ArrowUp, ArrowDown, Lock, Unlock, Eye, EyeOff, Upload, Loader2, Plus, X, GripVertical } from 'lucide-react';
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
      return (
        <Section title="Mapa">
          <PropInput label="Latitude" value={props.lat ?? -23.5505} onChange={set('lat')} type="number" />
          <PropInput label="Longitude" value={props.lng ?? -46.6333} onChange={set('lng')} type="number" />
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
          <p className="text-[9px] text-muted-foreground mt-2">💡 Dica: pesquise as coordenadas no Google Maps e cole aqui.</p>
        </Section>
      );
    default:
      return (
        <Section title="Propriedades">
          <p className="text-[11px] text-muted-foreground">Configurações avançadas em breve.</p>
        </Section>
      );
  }
}
