import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { Section, PropInput, ImageUploadField } from './shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CanvasView } from '../../types/canvas';

interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  price?: string;
  icon?: string;
  image?: string;
  badge?: string;
  badgeColor?: string;
  available?: boolean;
  rating?: number;
  tags?: string;
  location?: string;
  duration?: string;
}

export function ListPropsPanel({ props, onChange, views }: { props: Record<string, any>; onChange: (p: Record<string, any>) => void; views?: CanvasView[] }) {
  const items: ListItem[] = props.items || [];
  const set = (key: string) => (val: any) => onChange({ [key]: val });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState('items');

  const updateItem = (id: string, patch: Partial<ListItem>) => {
    onChange({ items: items.map(it => it.id === id ? { ...it, ...patch } : it) });
  };

  const addItem = () => {
    const newItem: ListItem = {
      id: `li_${Date.now()}`,
      title: `Item ${items.length + 1}`,
      subtitle: 'Descrição breve',
      description: '',
      price: 'R$ 0,00',
      icon: '📌',
      available: true,
    };
    onChange({ items: [...items, newItem] });
    setExpandedId(newItem.id);
  };

  const removeItem = (id: string) => {
    onChange({ items: items.filter(it => it.id !== id) });
  };

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="w-full grid grid-cols-3 h-8">
        <TabsTrigger value="items" className="text-[10px]">Itens</TabsTrigger>
        <TabsTrigger value="style" className="text-[10px]">Estilo</TabsTrigger>
        <TabsTrigger value="actions" className="text-[10px]">Ações</TabsTrigger>
      </TabsList>

      {/* ── ITEMS TAB ── */}
      <TabsContent value="items" className="space-y-2 mt-2">
        <Section title="Lista">
          <PropInput label="Título da lista" value={props.listTitle || ''} onChange={set('listTitle')} />

          <div className="space-y-1.5">
            {items.map((item) => (
              <div key={item.id} className="border border-border rounded-lg overflow-hidden">
                <div
                  className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/30"
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                >
                  <GripVertical className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                  <span className="text-[11px] flex-1 truncate font-medium">{item.icon} {item.title}</span>
                  {item.badge && <span className="text-[8px] px-1 rounded bg-primary/10 text-primary">{item.badge}</span>}
                  {expandedId === item.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>

                {expandedId === item.id && (
                  <div className="p-2 space-y-2 border-t border-border bg-muted/10">
                    <PropInput label="Título" value={item.title} onChange={(v) => updateItem(item.id, { title: v })} />
                    <PropInput label="Subtítulo" value={item.subtitle || ''} onChange={(v) => updateItem(item.id, { subtitle: v })} />
                    <PropInput label="Descrição" value={item.description || ''} onChange={(v) => updateItem(item.id, { description: v })} type="textarea" />
                    <PropInput label="Preço" value={item.price || ''} onChange={(v) => updateItem(item.id, { price: v })} />
                    <PropInput label="Emoji/Ícone" value={item.icon || ''} onChange={(v) => updateItem(item.id, { icon: v })} />
                    <PropInput label="Badge" value={item.badge || ''} onChange={(v) => updateItem(item.id, { badge: v })} />
                    <PropInput label="Cor da badge" value={item.badgeColor || ''} onChange={(v) => updateItem(item.id, { badgeColor: v })} type="color" />
                    <PropInput label="Tags" value={item.tags || ''} onChange={(v) => updateItem(item.id, { tags: v })} />
                    <PropInput label="Localização" value={item.location || ''} onChange={(v) => updateItem(item.id, { location: v })} />
                    <PropInput label="Duração" value={item.duration || ''} onChange={(v) => updateItem(item.id, { duration: v })} />
                    <PropInput label="Avaliação (1-5)" value={item.rating || 0} onChange={(v) => updateItem(item.id, { rating: parseFloat(v) || 0 })} type="number" />
                    <ImageUploadField value={item.image || ''} onChange={(v) => updateItem(item.id, { image: v })} />
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px]">Disponível</Label>
                      <Switch checked={item.available !== false} onCheckedChange={(v) => updateItem(item.id, { available: v })} />
                    </div>
                    <Button variant="destructive" size="sm" className="w-full text-[10px] gap-1" onClick={() => removeItem(item.id)}>
                      <Trash2 className="w-3 h-3" /> Remover item
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 mt-2" onClick={addItem}>
            <Plus className="w-3 h-3" /> Adicionar item
          </Button>
        </Section>
      </TabsContent>

      {/* ── STYLE TAB ── */}
      <TabsContent value="style" className="space-y-2 mt-2">
        <Section title="Layout">
          <div>
            <Label className="text-[11px]">Layout dos itens</Label>
            <Select value={props.itemLayout || 'detailed'} onValueChange={set('itemLayout')}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">📋 Compacto</SelectItem>
                <SelectItem value="detailed">📄 Detalhado</SelectItem>
                <SelectItem value="card">🃏 Cards (Grid)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Busca</Label>
            <Switch checked={props.showSearch === true} onCheckedChange={set('showSearch')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Mostrar descrição</Label>
            <Switch checked={props.showDescription === true} onCheckedChange={set('showDescription')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Mostrar badges</Label>
            <Switch checked={props.showBadges !== false} onCheckedChange={set('showBadges')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Mostrar avaliação</Label>
            <Switch checked={props.showRating === true} onCheckedChange={set('showRating')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Mostrar ícone/imagem</Label>
            <Switch checked={props.showIcon !== false} onCheckedChange={set('showIcon')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Mostrar preço</Label>
            <Switch checked={props.showPrice !== false} onCheckedChange={set('showPrice')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Disponibilidade</Label>
            <Switch checked={props.showAvailability === true} onCheckedChange={set('showAvailability')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Divisores</Label>
            <Switch checked={props.showDivider !== false} onCheckedChange={set('showDivider')} />
          </div>
        </Section>

        <Section title="Cores">
          <PropInput label="Cor de fundo" value={props.bgColor || 'rgba(0,0,0,0.4)'} onChange={set('bgColor')} type="color" />
          <PropInput label="Border Radius" value={props.borderRadius ?? 16} onChange={set('borderRadius')} type="number" />
          <PropInput label="Tamanho do texto" value={props.titleSize || 16} onChange={set('titleSize')} type="number" />
          <PropInput label="Cor do título" value={props.titleColor || '#ffffff'} onChange={set('titleColor')} type="color" />
          <PropInput label="Cor do subtítulo" value={props.subtitleColor || 'rgba(255,255,255,0.6)'} onChange={set('subtitleColor')} type="color" />
          <PropInput label="Cor do preço" value={props.priceColor || '#6366f1'} onChange={set('priceColor')} type="color" />
          <PropInput label="Cor de destaque" value={props.accentColor || '#6366f1'} onChange={set('accentColor')} type="color" />
        </Section>
      </TabsContent>

      {/* ── ACTIONS TAB ── */}
      <TabsContent value="actions" className="space-y-2 mt-2">
        <Section title="🔗 Ao tocar no item">
          <div>
            <Label className="text-[11px]">Tipo de ação</Label>
            <Select value={props.itemAction || 'none'} onValueChange={set('itemAction')}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                <SelectItem value="navigate">📄 Navegar para página</SelectItem>
                <SelectItem value="whatsapp">💬 Pedir via WhatsApp</SelectItem>
                <SelectItem value="webhook">🔌 Enviar via Webhook</SelectItem>
                <SelectItem value="prompt">🤖 Enviar ao Chat IA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {props.itemAction === 'navigate' && views && views.length > 0 && (
            <>
              <div>
                <Label className="text-[11px]">Navegar para</Label>
                <Select value={props.navigateOnSelect || '__none__'} onValueChange={(v) => set('navigateOnSelect')(v === '__none__' ? '' : v)}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Selecione uma página" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Nenhuma</SelectItem>
                    {views.map(v => (
                      <SelectItem key={v.id} value={v.id}>📄 {v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px]">Transição</Label>
                <Select value={props.navigateTransition || 'slide-left'} onValueChange={set('navigateTransition')}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="slide-left">Slide ←</SelectItem>
                    <SelectItem value="slide-right">Slide →</SelectItem>
                    <SelectItem value="slide-up">Slide ↑</SelectItem>
                    <SelectItem value="zoom">Zoom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {props.itemAction === 'whatsapp' && (
            <>
              <PropInput label="Número WhatsApp" value={props.whatsappNumber || ''} onChange={set('whatsappNumber')} />
              <PropInput label="Template da msg" value={props.whatsappTemplate || 'Quero pedir: {{titulo}} ({{preco}})'} onChange={set('whatsappTemplate')} type="textarea" />
              <p className="text-[9px] text-muted-foreground -mt-1">Variáveis: {'{{titulo}}'}, {'{{preco}}'}, {'{{subtitulo}}'}</p>
            </>
          )}

          {props.itemAction === 'webhook' && (
            <PropInput label="URL do Webhook" value={props.listWebhookUrl || ''} onChange={set('listWebhookUrl')} />
          )}
        </Section>

        <Section title="📦 Variáveis (dados do item selecionado)">
          <PropInput label="Prefixo das variáveis" value={props.variablePrefix || 'item'} onChange={set('variablePrefix')} />
          <PropInput label="Variável alvo (link direto)" value={props.targetVariable || ''} onChange={set('targetVariable')} />
          <p className="text-[9px] text-muted-foreground -mt-1">
            Preenche automaticamente um campo de outro elemento (ex: campo de formulário ou texto).
          </p>

          <div className="mt-2 p-2 rounded-lg bg-muted/30 space-y-0.5">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase">Variáveis disponíveis:</p>
            {['titulo', 'subtitulo', 'descricao', 'preco', 'icone', 'badge', 'id'].map(v => (
              <code key={v} className="text-[9px] text-primary block">{`{{${props.variablePrefix || 'item'}_${v}}}`}</code>
            ))}
            {props.targetVariable && (
              <code className="text-[9px] text-green-400 block mt-1">{`{{${props.targetVariable}}} ← título do item`}</code>
            )}
          </div>
          <p className="text-[9px] text-muted-foreground">
            Use estas variáveis em textos de outras páginas para exibir os dados do item selecionado.
          </p>
        </Section>
      </TabsContent>
    </Tabs>
  );
}
