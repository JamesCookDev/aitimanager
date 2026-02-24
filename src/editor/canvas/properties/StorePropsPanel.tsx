import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Upload, Loader2, X, Plus, Trash2, ChevronDown, Star, Image as ImageIcon, Store, Paintbrush, Map, Eye } from 'lucide-react';
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

/* ── Collapsible sub-section inside a store ── */
function StoreSubSection({ title, icon, children, defaultOpen = false }: { title: string; icon: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger className="w-full flex items-center gap-1.5 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
        <span>{icon}</span>
        <span className="flex-1 text-left">{title}</span>
        <ChevronDown className="w-3 h-3 transition-transform" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2 pl-1 pb-2">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ── Single store editor ── */
function StoreItemEditor({ store, idx, updateStore, removeStore }: {
  store: any; idx: number;
  updateStore: (id: string, field: string, value: any) => void;
  removeStore: (id: string) => void;
}) {
  return (
    <Collapsible>
      <div className="rounded-lg border border-border/50 bg-muted/20 overflow-hidden">
        <CollapsibleTrigger className="w-full flex items-center gap-2 p-2 hover:bg-muted/40 transition-colors">
          {store.logo ? (
            <div className="w-6 h-6 rounded overflow-hidden shrink-0 border border-border/30">
              <img src={store.logo} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <span className="text-[10px] font-mono text-muted-foreground shrink-0 w-6 text-center">#{idx + 1}</span>
          )}
          <span className="text-xs font-semibold flex-1 text-left truncate">{store.name || 'Sem nome'}</span>
          {store.highlight && <Star className="w-3 h-3 text-amber-400 shrink-0" />}
          <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0" onClick={(e) => { e.stopPropagation(); removeStore(store.id); }}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-2.5 pt-1 space-y-1">
            {/* Basic info — always visible */}
            <div>
              <Label className="text-[10px]">Nome</Label>
              <Input value={store.name} onChange={(e) => updateStore(store.id, 'name', e.target.value)} className="h-7 text-xs" />
            </div>
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

            {/* Imagens */}
            <StoreSubSection title="Imagens" icon="🖼️">
              <ImageUpload value={store.logo} onChange={(v) => updateStore(store.id, 'logo', v)} label="Logo" storagePath="store-logos" />
              <ImageUpload value={store.coverImage || ''} onChange={(v) => updateStore(store.id, 'coverImage', v)} label="Imagem de capa" storagePath="store-covers" />
              <GalleryEditor images={store.gallery || []} onChange={(imgs) => updateStore(store.id, 'gallery', imgs)} />
            </StoreSubSection>

            {/* Detalhes */}
            <StoreSubSection title="Detalhes" icon="📋">
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
              <div>
                <Label className="text-[10px]">🏷️ Tags (separadas por vírgula)</Label>
                <Input value={store.tags || ''} onChange={(e) => updateStore(store.id, 'tags', e.target.value)} placeholder="promoção, novo, destaque" className="h-6 text-[10px]" />
              </div>
              <div>
                <Label className="text-[10px]">Descrição</Label>
                <Textarea value={store.description} onChange={(e) => updateStore(store.id, 'description', e.target.value)} placeholder="Descrição detalhada..." className="text-[10px] min-h-[40px] resize-y" />
              </div>
            </StoreSubSection>

            {/* Destaque */}
            <StoreSubSection title="Destaque" icon="⭐">
              <div className="flex items-center justify-between">
                <Label className="text-[10px]">Ativar destaque</Label>
                <Switch checked={!!store.highlight} onCheckedChange={(v) => updateStore(store.id, 'highlight', v)} />
              </div>
              {store.highlight && (
                <Input value={store.highlightLabel || ''} onChange={(e) => updateStore(store.id, 'highlightLabel', e.target.value)} placeholder="Ex: Promoção, Novo" className="h-6 text-[10px]" />
              )}
            </StoreSubSection>

            {/* Localização */}
            <StoreSubSection title="Localização no mapa" icon="📍">
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
            </StoreSubSection>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

/* ── Main Panel ── */
export function StorePropsPanel({ props, onChange, views }: { props: Record<string, any>; onChange: (p: Record<string, any>) => void; views?: import('../../types/canvas').CanvasView[] }) {
  const stores: any[] = props.stores || [];
  const set = (key: string) => (val: any) => onChange({ [key]: val });

  const addStore = () => {
    const newStore = {
      id: Date.now().toString(), name: 'Nova Loja', logo: '', coverImage: '', gallery: [] as string[],
      floor: 'Piso 1', category: 'Moda', hours: '10h–22h', phone: '', description: '',
      mapX: 50, mapY: 50, zone: '', website: '', instagram: '', highlight: false, highlightLabel: '', tags: '',
    };
    onChange({ stores: [...stores, newStore] });
  };

  const removeStore = (id: string) => onChange({ stores: stores.filter(s => s.id !== id) });
  const updateStore = (id: string, field: string, value: any) => {
    onChange({ stores: stores.map(s => s.id === id ? { ...s, [field]: value } : s) });
  };

  return (
    <Section title="Diretório de Lojas">
      {/* Title */}
      <PropInput label="Título" value={props.title || 'Lojas'} onChange={set('title')} />

      <Tabs defaultValue="stores" className="w-full">
        <TabsList className="w-full grid grid-cols-4 h-8">
          <TabsTrigger value="stores" className="text-[10px] gap-1 px-1"><Store className="w-3 h-3" /> Lojas</TabsTrigger>
          <TabsTrigger value="style" className="text-[10px] gap-1 px-1"><Paintbrush className="w-3 h-3" /> Estilo</TabsTrigger>
          <TabsTrigger value="map" className="text-[10px] gap-1 px-1"><Map className="w-3 h-3" /> Mapa</TabsTrigger>
          <TabsTrigger value="display" className="text-[10px] gap-1 px-1"><Eye className="w-3 h-3" /> Exibir</TabsTrigger>
        </TabsList>

        {/* ═══ TAB: Lojas ═══ */}
        <TabsContent value="stores" className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">{stores.length} loja{stores.length !== 1 ? 's' : ''}</p>
            <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={addStore}>
              <Plus className="w-3 h-3" /> Adicionar
            </Button>
          </div>
          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-0.5">
            {stores.map((store, idx) => (
              <StoreItemEditor key={store.id} store={store} idx={idx} updateStore={updateStore} removeStore={removeStore} />
            ))}
          </div>
          {stores.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-4">Clique "Adicionar" para criar a primeira loja</p>}
        </TabsContent>

        {/* ═══ TAB: Estilo ═══ */}
        <TabsContent value="style" className="mt-2 space-y-3">
          {/* Título */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="w-full flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase hover:text-foreground transition-colors">
              <span>📝</span> Título
              <ChevronDown className="w-3 h-3 ml-auto" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 pt-1.5 pl-1">
                <PropInput label="Cor do título" value={props.titleColor || '#ffffff'} onChange={set('titleColor')} type="color" />
                <PropInput label="Tamanho título" value={props.titleSize || 28} onChange={set('titleSize')} type="number" />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Cores gerais */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="w-full flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase hover:text-foreground transition-colors">
              <span>🎨</span> Cores
              <ChevronDown className="w-3 h-3 ml-auto" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 pt-1.5 pl-1">
                <PropInput label="Fundo" value={props.bgColor || 'rgba(0,0,0,0.6)'} onChange={set('bgColor')} type="color" />
                <PropInput label="Destaque" value={props.accentColor || '#6366f1'} onChange={set('accentColor')} type="color" />
                <PropInput label="Badge destaque" value={props.highlightColor || '#f59e0b'} onChange={set('highlightColor')} type="color" />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Cards */}
          <Collapsible>
            <CollapsibleTrigger className="w-full flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase hover:text-foreground transition-colors">
              <span>🃏</span> Cards
              <ChevronDown className="w-3 h-3 ml-auto" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 pt-1.5 pl-1">
                <PropInput label="Cor card" value={props.cardBgColor || 'rgba(255,255,255,0.08)'} onChange={set('cardBgColor')} type="color" />
                <PropInput label="Cor borda" value={props.cardBorderColor || 'rgba(255,255,255,0.06)'} onChange={set('cardBorderColor')} type="color" />
                <PropInput label="Arredondamento" value={props.cardBorderRadius || 12} onChange={set('cardBorderRadius')} type="number" />
                <div className="flex items-center justify-between">
                  <Label className="text-[11px]">Sombra</Label>
                  <Switch checked={!!props.cardShadow} onCheckedChange={set('cardShadow')} />
                </div>
                <PropInput label="Cor nome loja" value={props.storeNameColor || '#ffffff'} onChange={set('storeNameColor')} type="color" />
                <PropInput label="Tamanho nome" value={props.storeNameSize || 14} onChange={set('storeNameSize')} type="number" />
                <PropInput label="Cor descrição" value={props.storeDescColor || 'rgba(255,255,255,0.5)'} onChange={set('storeDescColor')} type="color" />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Layout */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="w-full flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase hover:text-foreground transition-colors">
              <span>📐</span> Layout
              <ChevronDown className="w-3 h-3 ml-auto" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 pt-1.5 pl-1">
                <PropInput label="Border Radius geral" value={props.borderRadius || 16} onChange={set('borderRadius')} type="number" />
                <div>
                  <Label className="text-[11px]">Colunas</Label>
                  <Select value={String(props.columns || 1)} onValueChange={(v) => onChange({ columns: parseInt(v) })}>
                    <SelectTrigger className="h-7 text-[10px] mt-1"><SelectValue /></SelectTrigger>
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
                    <SelectTrigger className="h-7 text-[10px] mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="alpha">A → Z</SelectItem>
                      <SelectItem value="alpha-desc">Z → A</SelectItem>
                      <SelectItem value="category">Por categoria</SelectItem>
                      <SelectItem value="highlight">Destaques primeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[11px]">Espaçamento: {props.gap || 12}px</Label>
                  <Slider value={[props.gap || 12]} onValueChange={([v]) => onChange({ gap: v })} min={4} max={32} step={2} />
                </div>
                <div>
                  <Label className="text-[11px]">Padding: {props.padding || 16}px</Label>
                  <Slider value={[props.padding || 16]} onValueChange={([v]) => onChange({ padding: v })} min={0} max={40} step={4} />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>

        {/* ═══ TAB: Mapa ═══ */}
        <TabsContent value="map" className="mt-2 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Ativar mapa interativo</Label>
            <Switch checked={!!props.enableMap} onCheckedChange={set('enableMap')} />
          </div>
          {!!props.enableMap ? (
            <div className="space-y-2">
              <ImageUpload value={props.floorPlanImage || ''} onChange={set('floorPlanImage')} label="Planta do local" storagePath="store-floorplan" />
              <PropInput label="Cor do pin" value={props.pinColor || '#ef4444'} onChange={set('pinColor')} type="color" />
              <div>
                <Label className="text-[11px]">Tamanho pin: {props.pinSize || 24}px</Label>
                <Slider value={[props.pinSize || 24]} onValueChange={([v]) => onChange({ pinSize: v })} min={16} max={48} step={2} />
              </div>
              <p className="text-[9px] text-muted-foreground bg-muted/30 rounded p-2">
                💡 Posicione cada loja na aba <strong>Lojas</strong> → abra a loja → <strong>📍 Localização no mapa</strong> e ajuste X% e Y%.
              </p>
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground text-center py-4">Ative para mostrar um botão Lista/Mapa no totem</p>
          )}
        </TabsContent>

        {/* ═══ TAB: Exibição ═══ */}
        <TabsContent value="display" className="mt-2 space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Campos visíveis</p>
          {[
            { key: 'showFloor', label: '📍 Piso', def: true },
            { key: 'showCategory', label: '🏷️ Categoria', def: true },
            { key: 'showHours', label: '🕐 Horário', def: true },
            { key: 'showPhone', label: '📞 Telefone', def: true },
            { key: 'showWebsite', label: '🌐 Website', def: true },
            { key: 'showInstagram', label: '📸 Instagram', def: true },
            { key: 'showTags', label: '🏷️ Tags', def: false },
          ].map(({ key, label, def }) => (
            <div key={key} className="flex items-center justify-between">
              <Label className="text-[11px]">{label}</Label>
              <Switch checked={def ? props[key] !== false : !!props[key]} onCheckedChange={set(key)} />
            </div>
          ))}

          <div className="border-t border-border/50 pt-2 mt-2 space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Funcionalidades</p>
            {[
              { key: 'showCategoryFilter', label: 'Filtro por categoria', def: true },
              { key: 'showSearch', label: 'Busca por nome', def: true },
              { key: 'showCount', label: 'Contador de resultados', def: false },
            ].map(({ key, label, def }) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="text-[11px]">{label}</Label>
                <Switch checked={def ? props[key] !== false : !!props[key]} onCheckedChange={set(key)} />
              </div>
            ))}
          </div>

          {views && views.length > 0 && (
            <div className="border-t border-border/50 pt-2 mt-2 space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">🔗 Navegação ao tocar</p>
              <p className="text-[9px] text-muted-foreground">Ao clicar em uma loja, navega para página de detalhes com dados da loja.</p>
              <div>
                <Label className="text-[11px]">Página de destino</Label>
                <Select value={props.storeNavigateTarget || ''} onValueChange={set('storeNavigateTarget')}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Desativado" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Desativado</SelectItem>
                    {views.map(v => (
                      <SelectItem key={v.id} value={v.id}>📄 {v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {props.storeNavigateTarget && (
                <div className="p-2 rounded-lg bg-muted/30 space-y-0.5">
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase">Variáveis na página de destino:</p>
                  <code className="text-[9px] text-primary block">{'{{store_name}}'} {'{{store_category}}'}</code>
                  <code className="text-[9px] text-primary block">{'{{store_description}}'} {'{{store_floor}}'}</code>
                  <code className="text-[9px] text-primary block">{'{{store_hours}}'} {'{{store_phone}}'}</code>
                  <code className="text-[9px] text-primary block">{'{{store_logo}}'} {'{{store_cover}}'}</code>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Section>
  );
}
