import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, X, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Section, PropInput } from './shared';

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

export function StorePropsPanel({ props, onChange }: { props: Record<string, any>; onChange: (p: Record<string, any>) => void }) {
  const stores: Array<{ id: string; name: string; logo: string; coverImage: string; gallery: string[]; floor: string; category: string; hours: string; phone: string; description: string; mapX: number; mapY: number; zone: string }> = props.stores || [];
  const set = (key: string) => (val: any) => onChange({ [key]: val });

  const addStore = () => {
    const newStore = {
      id: Date.now().toString(),
      name: 'Nova Loja',
      logo: '',
      coverImage: '',
      gallery: [] as string[],
      floor: 'Piso 1',
      category: 'Moda',
      hours: '10h–22h',
      phone: '',
      description: '',
      mapX: 50,
      mapY: 50,
      zone: '',
    };
    onChange({ stores: [...stores, newStore] });
  };

  const removeStore = (id: string) => onChange({ stores: stores.filter(s => s.id !== id) });

  const updateStore = (id: string, field: string, value: string) => {
    onChange({ stores: stores.map(s => s.id === id ? { ...s, [field]: value } : s) });
  };

  return (
    <Section title="Diretório de Lojas">
      <PropInput label="Título" value={props.title || 'Lojas'} onChange={set('title')} />
      <PropInput label="Cor do título" value={props.titleColor || '#ffffff'} onChange={set('titleColor')} type="color" />
      <PropInput label="Tamanho título" value={props.titleSize || 28} onChange={set('titleSize')} type="number" />

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Lojas ({stores.length})</p>
        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={addStore}>
          <Plus className="w-3 h-3" /> Adicionar
        </Button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {stores.map((store, idx) => (
          <div key={store.id} className="p-2.5 rounded-lg border border-border/50 bg-muted/20 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground">#{idx + 1}</span>
              <Input value={store.name} onChange={(e) => updateStore(store.id, 'name', e.target.value)} className="h-7 text-xs font-semibold flex-1" />
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0" onClick={() => removeStore(store.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            <StoreLogoUpload value={store.logo} onChange={(v) => updateStore(store.id, 'logo', v)} />

            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <Label className="text-[10px]">Piso</Label>
                <Input value={store.floor} onChange={(e) => updateStore(store.id, 'floor', e.target.value)} className="h-6 text-[10px]" />
              </div>
              <div>
                <Label className="text-[10px]">Categoria</Label>
                <Select value={store.category} onValueChange={(v) => updateStore(store.id, 'category', v)}>
                  <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STORE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <Label className="text-[10px]">Horário</Label>
                <Input value={store.hours} onChange={(e) => updateStore(store.id, 'hours', e.target.value)} className="h-6 text-[10px]" />
              </div>
              <div>
                <Label className="text-[10px]">Telefone</Label>
                <Input value={store.phone} onChange={(e) => updateStore(store.id, 'phone', e.target.value)} className="h-6 text-[10px]" />
              </div>
            </div>

            <div>
              <Label className="text-[10px]">Descrição</Label>
              <Input value={store.description} onChange={(e) => updateStore(store.id, 'description', e.target.value)} className="h-6 text-[10px]" placeholder="Breve descrição..." />
            </div>

            <div className="space-y-1 pt-1.5 border-t border-border/30">
              <Label className="text-[10px] text-muted-foreground">📍 Localização no mapa</Label>
              <div className="grid grid-cols-3 gap-1">
                <div>
                  <Label className="text-[9px] text-muted-foreground/60">X%</Label>
                  <Input type="number" min={0} max={100} value={store.mapX ?? 50} onChange={(e) => updateStore(store.id, 'mapX', e.target.value)} className="h-6 text-[10px]" />
                </div>
                <div>
                  <Label className="text-[9px] text-muted-foreground/60">Y%</Label>
                  <Input type="number" min={0} max={100} value={store.mapY ?? 50} onChange={(e) => updateStore(store.id, 'mapY', e.target.value)} className="h-6 text-[10px]" />
                </div>
                <div>
                  <Label className="text-[9px] text-muted-foreground/60">Zona</Label>
                  <Input value={store.zone || ''} onChange={(e) => updateStore(store.id, 'zone', e.target.value)} placeholder="A1" className="h-6 text-[10px]" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stores.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-2">Clique "Adicionar" para criar lojas</p>}

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
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Busca por nome</Label>
          <Switch checked={props.showSearch !== false} onCheckedChange={set('showSearch')} />
        </div>
      </div>
    </Section>
  );
}
