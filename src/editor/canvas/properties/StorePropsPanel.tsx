import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Upload, Loader2, X, Plus, Trash2, ChevronDown, Star, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Section, PropInput } from './shared';

const STORE_CATEGORIES = [
  'Moda', 'Alimentação', 'Eletrônicos', 'Saúde & Beleza', 'Esportes',
  'Casa & Decoração', 'Entretenimento', 'Serviços', 'Joalheria', 'Infantil', 'Outro',
];

function ImageUpload({ value, onChange, label, storagePath }: { value: string; onChange: (v: string) => void; label: string; storagePath: string }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Selecione uma imagem'); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${storagePath}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('canvas-images').upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('canvas-images').getPublicUrl(path);
      onChange(urlData.publicUrl);
      toast.success(`${label} enviado!`);
    } catch (err: any) {
      toast.error('Erro: ' + (err.message || 'tente novamente'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1">
      <Label className="text-[10px]">{label}</Label>
      <div className="flex items-center gap-1.5">
        {value && (
          <div className="w-8 h-8 rounded border border-border/50 overflow-hidden shrink-0">
            <img src={value} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 flex-1" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          {uploading ? 'Enviando…' : value ? 'Trocar' : 'Enviar'}
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

function GalleryEditor({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Selecione uma imagem'); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `store-gallery/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('canvas-images').upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('canvas-images').getPublicUrl(path);
      onChange([...images, urlData.publicUrl]);
      toast.success('Imagem adicionada!');
    } catch (err: any) {
      toast.error('Erro: ' + (err.message || 'tente novamente'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1">
      <Label className="text-[10px]">Galeria ({images.length})</Label>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {images.map((img, i) => (
            <div key={i} className="relative w-10 h-10 rounded border border-border/50 overflow-hidden group">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => onChange(images.filter((_, j) => j !== i))}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 w-full" onClick={() => fileRef.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
        {uploading ? 'Enviando…' : 'Adicionar imagem'}
      </Button>
    </div>
  );
}

export function StorePropsPanel({ props, onChange }: { props: Record<string, any>; onChange: (p: Record<string, any>) => void }) {
  const stores: any[] = props.stores || [];
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
      website: '',
      instagram: '',
      highlight: false,
      highlightLabel: '',
      tags: '',
    };
    onChange({ stores: [...stores, newStore] });
  };

  const removeStore = (id: string) => onChange({ stores: stores.filter(s => s.id !== id) });

  const updateStore = (id: string, field: string, value: any) => {
    onChange({ stores: stores.map(s => s.id === id ? { ...s, [field]: value } : s) });
  };

  return (
    <Section title="Diretório de Lojas">
      {/* Title settings */}
      <PropInput label="Título" value={props.title || 'Lojas'} onChange={set('title')} />
      <PropInput label="Cor do título" value={props.titleColor || '#ffffff'} onChange={set('titleColor')} type="color" />
      <PropInput label="Tamanho título" value={props.titleSize || 28} onChange={set('titleSize')} type="number" />

      {/* Store list */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Lojas ({stores.length})</p>
        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={addStore}>
          <Plus className="w-3 h-3" /> Adicionar
        </Button>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {stores.map((store, idx) => (
          <Collapsible key={store.id}>
            <div className="rounded-lg border border-border/50 bg-muted/20 overflow-hidden">
              <CollapsibleTrigger className="w-full flex items-center gap-2 p-2 hover:bg-muted/40 transition-colors">
                {store.logo && (
                  <div className="w-6 h-6 rounded overflow-hidden shrink-0 border border-border/30">
                    <img src={store.logo} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                {!store.logo && <span className="text-[10px] font-mono text-muted-foreground shrink-0">#{idx + 1}</span>}
                <span className="text-xs font-semibold flex-1 text-left truncate">{store.name || 'Sem nome'}</span>
                {store.highlight && <Star className="w-3 h-3 text-amber-400 shrink-0" />}
                <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0 transition-transform" />
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0" onClick={(e) => { e.stopPropagation(); removeStore(store.id); }}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="p-2.5 pt-0 space-y-2">
                  {/* Name */}
                  <div>
                    <Label className="text-[10px]">Nome</Label>
                    <Input value={store.name} onChange={(e) => updateStore(store.id, 'name', e.target.value)} className="h-7 text-xs" />
                  </div>

                  {/* Logo */}
                  <ImageUpload value={store.logo} onChange={(v) => updateStore(store.id, 'logo', v)} label="Logo" storagePath="store-logos" />

                  {/* Cover image */}
                  <ImageUpload value={store.coverImage || ''} onChange={(v) => updateStore(store.id, 'coverImage', v)} label="Imagem de capa" storagePath="store-covers" />

                  {/* Gallery */}
                  <GalleryEditor images={store.gallery || []} onChange={(imgs) => updateStore(store.id, 'gallery', imgs)} />

                  {/* Highlight badge */}
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px]">⭐ Destaque</Label>
                    <Switch checked={!!store.highlight} onCheckedChange={(v) => updateStore(store.id, 'highlight', v)} />
                  </div>
                  {store.highlight && (
                    <Input value={store.highlightLabel || ''} onChange={(e) => updateStore(store.id, 'highlightLabel', e.target.value)} placeholder="Ex: Promoção, Novo, etc." className="h-6 text-[10px]" />
                  )}

                  {/* Floor & category */}
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

                  {/* Hours & phone */}
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

                  {/* Website & Instagram */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <Label className="text-[10px]">🌐 Website</Label>
                      <Input value={store.website || ''} onChange={(e) => updateStore(store.id, 'website', e.target.value)} placeholder="https://..." className="h-6 text-[10px]" />
                    </div>
                    <div>
                      <Label className="text-[10px]">📸 Instagram</Label>
                      <Input value={store.instagram || ''} onChange={(e) => updateStore(store.id, 'instagram', e.target.value)} placeholder="@loja" className="h-6 text-[10px]" />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <Label className="text-[10px]">🏷️ Tags (separadas por vírgula)</Label>
                    <Input value={store.tags || ''} onChange={(e) => updateStore(store.id, 'tags', e.target.value)} placeholder="promoção, novo, destaque" className="h-6 text-[10px]" />
                  </div>

                  {/* Description */}
                  <div>
                    <Label className="text-[10px]">Descrição</Label>
                    <Textarea value={store.description} onChange={(e) => updateStore(store.id, 'description', e.target.value)} placeholder="Descrição detalhada da loja..." className="text-[10px] min-h-[50px] resize-y" />
                  </div>

                  {/* Map location */}
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
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>

      {stores.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-2">Clique "Adicionar" para criar lojas</p>}

      {/* Appearance */}
      <div className="space-y-2 pt-2 border-t border-border">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Aparência</p>
        <PropInput label="Cor de fundo" value={props.bgColor || 'rgba(0,0,0,0.6)'} onChange={set('bgColor')} type="color" />
        <PropInput label="Cor de destaque" value={props.accentColor || '#6366f1'} onChange={set('accentColor')} type="color" />
        <PropInput label="Cor card" value={props.cardBgColor || 'rgba(255,255,255,0.08)'} onChange={set('cardBgColor')} type="color" />
        <PropInput label="Cor borda card" value={props.cardBorderColor || 'rgba(255,255,255,0.06)'} onChange={set('cardBorderColor')} type="color" />
        <PropInput label="Border Radius" value={props.borderRadius || 16} onChange={set('borderRadius')} type="number" />
        <PropInput label="Border Radius card" value={props.cardBorderRadius || 12} onChange={set('cardBorderRadius')} type="number" />

        {/* Card shadow */}
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Sombra nos cards</Label>
          <Switch checked={!!props.cardShadow} onCheckedChange={set('cardShadow')} />
        </div>

        {/* Name color/size */}
        <PropInput label="Cor nome loja" value={props.storeNameColor || '#ffffff'} onChange={set('storeNameColor')} type="color" />
        <PropInput label="Tamanho nome" value={props.storeNameSize || 14} onChange={set('storeNameSize')} type="number" />
        <PropInput label="Cor descrição" value={props.storeDescColor || 'rgba(255,255,255,0.5)'} onChange={set('storeDescColor')} type="color" />

        {/* Highlight badge color */}
        <PropInput label="Cor badge destaque" value={props.highlightColor || '#f59e0b'} onChange={set('highlightColor')} type="color" />

        <div>
          <Label className="text-[11px]">Colunas</Label>
          <Select value={String(props.columns || 1)} onValueChange={(v) => onChange({ columns: parseInt(v) })}>
            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 coluna</SelectItem>
              <SelectItem value="2">2 colunas</SelectItem>
              <SelectItem value="3">3 colunas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[11px]">Ordenação</Label>
          <Select value={props.sortOrder || 'manual'} onValueChange={(v) => onChange({ sortOrder: v })}>
            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual (ordem de cadastro)</SelectItem>
              <SelectItem value="alpha">Alfabética (A-Z)</SelectItem>
              <SelectItem value="alpha-desc">Alfabética (Z-A)</SelectItem>
              <SelectItem value="category">Por categoria</SelectItem>
              <SelectItem value="highlight">Destaques primeiro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[11px]">Espaçamento: {props.gap || 12}px</Label>
          <Slider value={[props.gap || 12]} onValueChange={([v]) => onChange({ gap: v })} min={4} max={32} step={2} />
        </div>

        {/* Padding */}
        <div>
          <Label className="text-[11px]">Padding interno: {props.padding || 16}px</Label>
          <Slider value={[props.padding || 16]} onValueChange={([v]) => onChange({ padding: v })} min={0} max={40} step={4} />
        </div>

        {/* Toggles */}
        <div className="space-y-1.5 pt-1 border-t border-border/50">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase">Visibilidade</p>
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
            <Label className="text-[11px]">Mostrar website</Label>
            <Switch checked={props.showWebsite !== false} onCheckedChange={set('showWebsite')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Mostrar Instagram</Label>
            <Switch checked={props.showInstagram !== false} onCheckedChange={set('showInstagram')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Mostrar tags</Label>
            <Switch checked={!!props.showTags} onCheckedChange={set('showTags')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Filtro por categoria</Label>
            <Switch checked={props.showCategoryFilter !== false} onCheckedChange={set('showCategoryFilter')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Busca por nome</Label>
            <Switch checked={props.showSearch !== false} onCheckedChange={set('showSearch')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Contador de resultados</Label>
            <Switch checked={!!props.showCount} onCheckedChange={set('showCount')} />
          </div>
        </div>
      </div>
    </Section>
  );
}
