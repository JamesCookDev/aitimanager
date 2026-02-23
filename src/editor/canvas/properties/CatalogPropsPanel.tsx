import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Section, PropInput, ImageUploadField } from './shared';

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  badge?: string;
  badgeColor?: string;
}

interface Props {
  props: Record<string, any>;
  onChange: (p: Record<string, any>) => void;
}

export function CatalogPropsPanel({ props, onChange }: Props) {
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
    };
    onChange({ items: [...items, newItem] });
    setExpandedId(newItem.id);
  };

  const removeItem = (id: string) => {
    onChange({ items: items.filter(i => i.id !== id) });
  };

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="w-full grid grid-cols-2 h-8">
        <TabsTrigger value="items" className="text-[10px]">Produtos</TabsTrigger>
        <TabsTrigger value="style" className="text-[10px]">Estilo</TabsTrigger>
      </TabsList>

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
            <Label className="text-[11px]">Campo de busca</Label>
            <Switch checked={props.showSearch === true} onCheckedChange={set('showSearch')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Filtro por categoria</Label>
            <Switch checked={props.showCategoryFilter === true} onCheckedChange={set('showCategoryFilter')} />
          </div>
        </Section>
      </TabsContent>
    </Tabs>
  );
}
