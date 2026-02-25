import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Section, PropInput, ImageUploadField } from './shared';
import type { CanvasView } from '../../types/canvas';

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  badge?: string;
  badgeColor?: string;
  available?: boolean;
  rating?: number;
  location?: string;
  sku?: string;
}

interface Props {
  props: Record<string, any>;
  onChange: (p: Record<string, any>) => void;
  views?: CanvasView[];
}

export function CatalogPropsPanel({ props, onChange, views }: Props) {
  const set = (key: string) => (val: any) => onChange({ [key]: val });
  const items: CatalogItem[] = props.items || [];
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState('items');

  const updateItem = (id: string, patch: Partial<CatalogItem>) => {
    onChange({ items: items.map(i => i.id === id ? { ...i, ...patch } : i) });
  };

  const addItem = () => {
    const newItem: CatalogItem = {
      id: `prod_${Date.now()}`,
      name: 'Novo Produto',
      description: 'Descrição do produto',
      price: 'R$ 0,00',
      image: '',
      category: 'Geral',
      badge: '',
      badgeColor: '#6366f1',
      available: true,
    };
    onChange({ items: [...items, newItem] });
    setExpandedId(newItem.id);
  };

  const removeItem = (id: string) => {
    onChange({ items: items.filter(i => i.id !== id) });
  };

  const prefix = props.variablePrefix || 'produto';

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="w-full grid grid-cols-3 h-8">
        <TabsTrigger value="items" className="text-[10px]">Produtos</TabsTrigger>
        <TabsTrigger value="style" className="text-[10px]">Estilo</TabsTrigger>
        <TabsTrigger value="actions" className="text-[10px]">Ações</TabsTrigger>
      </TabsList>

      {/* ── ITEMS TAB ── */}
      <TabsContent value="items" className="space-y-2 mt-2">
        <Section title="Catálogo">
          <PropInput label="Título" value={props.title || 'Catálogo'} onChange={set('title')} />

          <div className="space-y-1.5">
            {items.map((item) => (
              <div key={item.id} className="border border-border rounded-lg overflow-hidden">
                <div
                  className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/30"
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                >
                  <span className="text-[11px] flex-1 truncate font-medium">{item.name}</span>
                  <span className="text-[9px] text-muted-foreground">{item.category}</span>
                  {expandedId === item.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>

                {expandedId === item.id && (
                  <div className="p-2 space-y-2 border-t border-border bg-muted/10">
                    <PropInput label="Nome" value={item.name} onChange={(v) => updateItem(item.id, { name: v })} />
                    <PropInput label="Descrição" value={item.description} onChange={(v) => updateItem(item.id, { description: v })} type="textarea" />
                    <PropInput label="Preço" value={item.price} onChange={(v) => updateItem(item.id, { price: v })} />
                    <PropInput label="Categoria" value={item.category} onChange={(v) => updateItem(item.id, { category: v })} />
                    <ImageUploadField value={item.image} onChange={(v) => updateItem(item.id, { image: v })} />
                    <PropInput label="Badge" value={item.badge || ''} onChange={(v) => updateItem(item.id, { badge: v })} />
                    <PropInput label="Cor do badge" value={item.badgeColor || '#6366f1'} onChange={(v) => updateItem(item.id, { badgeColor: v })} type="color" />
                    <PropInput label="SKU / Código" value={item.sku || ''} onChange={(v) => updateItem(item.id, { sku: v })} />
                    <PropInput label="Localização" value={item.location || ''} onChange={(v) => updateItem(item.id, { location: v })} />
                    <PropInput label="Avaliação (1-5)" value={item.rating || 0} onChange={(v) => updateItem(item.id, { rating: parseFloat(v) || 0 })} type="number" />
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px]">Disponível</Label>
                      <Switch checked={item.available !== false} onCheckedChange={(v) => updateItem(item.id, { available: v })} />
                    </div>
                    <Button variant="destructive" size="sm" className="w-full text-[10px] gap-1" onClick={() => removeItem(item.id)}>
                      <Trash2 className="w-3 h-3" /> Remover
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" className="w-full text-[10px] gap-1" onClick={addItem}>
            <Plus className="w-3 h-3" /> Adicionar produto
          </Button>
        </Section>
      </TabsContent>

      {/* ── STYLE TAB ── */}
      <TabsContent value="style" className="space-y-2 mt-2">
        <Section title="Aparência">
          <PropInput label="Cor do título" value={props.titleColor || '#ffffff'} onChange={set('titleColor')} type="color" />
          <PropInput label="Tamanho título" value={props.titleSize || 24} onChange={set('titleSize')} type="number" />
          <PropInput label="Cor de fundo" value={props.bgColor || 'rgba(0,0,0,0.5)'} onChange={set('bgColor')} type="color" />
          <PropInput label="Border Radius" value={props.borderRadius || 16} onChange={set('borderRadius')} type="number" />
          <PropInput label="Cor do card" value={props.cardBgColor || 'rgba(255,255,255,0.08)'} onChange={set('cardBgColor')} type="color" />
          <PropInput label="Raio do card" value={props.cardBorderRadius || 12} onChange={set('cardBorderRadius')} type="number" />
          <PropInput label="Cor do preço" value={props.priceColor || '#22c55e'} onChange={set('priceColor')} type="color" />
          <PropInput label="Cor de destaque" value={props.accentColor || '#6366f1'} onChange={set('accentColor')} type="color" />

          <div>
            <Label className="text-[11px]">Colunas</Label>
            <Select value={String(props.columns || 2)} onValueChange={(v) => set('columns')(Number(v))}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 coluna</SelectItem>
                <SelectItem value="2">2 colunas</SelectItem>
                <SelectItem value="3">3 colunas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[11px]">Proporção da imagem</Label>
            <Select value={props.imageAspect || '4/3'} onValueChange={set('imageAspect')}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1/1">1:1 Quadrado</SelectItem>
                <SelectItem value="4/3">4:3 Paisagem</SelectItem>
                <SelectItem value="3/4">3:4 Retrato</SelectItem>
                <SelectItem value="16/9">16:9 Wide</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <PropInput label="Espaçamento" value={props.gap || 12} onChange={set('gap')} type="number" />
        </Section>

        <Section title="Visibilidade">
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Preço</Label>
            <Switch checked={props.showPrice !== false} onCheckedChange={set('showPrice')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Categoria</Label>
            <Switch checked={props.showCategory !== false} onCheckedChange={set('showCategory')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Avaliação</Label>
            <Switch checked={props.showRating === true} onCheckedChange={set('showRating')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Campo de busca</Label>
            <Switch checked={props.showSearch === true} onCheckedChange={set('showSearch')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Filtro por categoria</Label>
            <Switch checked={props.showCategoryFilter === true} onCheckedChange={set('showCategoryFilter')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Mostrar indisponíveis</Label>
            <Switch checked={props.showUnavailable !== false} onCheckedChange={set('showUnavailable')} />
          </div>
          <PropInput label="Texto indisponível" value={props.unavailableText || 'Indisponível'} onChange={set('unavailableText')} />
        </Section>
      </TabsContent>

      {/* ── ACTIONS TAB ── */}
      <TabsContent value="actions" className="space-y-2 mt-2">
        <Section title="🔗 Ao tocar no produto">
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
                <Select value={props.itemNavigateTarget || '__none__'} onValueChange={(v) => set('itemNavigateTarget')(v === '__none__' ? '' : v)}>
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
                <Select value={props.itemNavigateTransition || 'fade'} onValueChange={set('itemNavigateTransition')}>
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
              <PropInput label="Template da mensagem" value={props.whatsappOrderTemplate || 'Olá! Gostaria de pedir: {{item_name}} ({{item_price}})'} onChange={set('whatsappOrderTemplate')} type="textarea" />
              <p className="text-[9px] text-muted-foreground -mt-1">Variáveis: {'{{item_name}}'}, {'{{item_price}}'}, {'{{item_category}}'}, {'{{item_description}}'}</p>
            </>
          )}

          {props.itemAction === 'webhook' && (
            <>
              <PropInput label="URL do Webhook" value={props.orderWebhookUrl || ''} onChange={set('orderWebhookUrl')} />
              <PropInput label="Mensagem de sucesso" value={props.orderSuccessMsg || 'Pedido enviado!'} onChange={set('orderSuccessMsg')} />
            </>
          )}
        </Section>

        <Section title="📦 Variáveis (dados do produto selecionado)">
          <PropInput label="Prefixo das variáveis" value={props.variablePrefix || 'produto'} onChange={set('variablePrefix')} />
          <PropInput label="Variável alvo (link direto)" value={props.targetVariable || ''} onChange={set('targetVariable')} />
          <p className="text-[9px] text-muted-foreground -mt-1">
            Preenche automaticamente um campo de outro elemento (ex: campo de formulário ou texto).
          </p>

          <div className="mt-2 p-2 rounded-lg bg-muted/30 space-y-0.5">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase">Variáveis disponíveis:</p>
            {['nome', 'descricao', 'preco', 'imagem', 'categoria', 'badge', 'id', 'sku'].map(v => (
              <code key={v} className="text-[9px] text-primary block">{`{{${prefix}_${v}}}`}</code>
            ))}
            {props.targetVariable && (
              <code className="text-[9px] text-green-400 block mt-1">{`{{${props.targetVariable}}} ← nome do produto`}</code>
            )}
          </div>
          <p className="text-[9px] text-muted-foreground">
            Use estas variáveis em textos de outras páginas para exibir os dados do produto selecionado.
          </p>
        </Section>
      </TabsContent>
    </Tabs>
  );
}
