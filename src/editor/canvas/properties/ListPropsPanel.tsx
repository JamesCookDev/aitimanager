import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { Section, PropInput, ImageUploadField } from './shared';
import type { CanvasView } from '../../types/canvas';

interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  price?: string;
  icon?: string;
  image?: string;
}

export function ListPropsPanel({ props, onChange, views }: { props: Record<string, any>; onChange: (p: Record<string, any>) => void; views?: CanvasView[] }) {
  const items: ListItem[] = props.items || [];
  const set = (key: string) => (val: any) => onChange({ [key]: val });

  const updateItem = (id: string, patch: Partial<ListItem>) => {
    onChange({ items: items.map(it => it.id === id ? { ...it, ...patch } : it) });
  };

  const addItem = () => {
    const newItem: ListItem = {
      id: `li_${Date.now()}`,
      title: `Item ${items.length + 1}`,
      subtitle: 'Descrição',
      price: 'R$ 0,00',
      icon: '📌',
    };
    onChange({ items: [...items, newItem] });
  };

  const removeItem = (id: string) => {
    onChange({ items: items.filter(it => it.id !== id) });
  };

  return (
    <>
      <Section title="Lista">
        <PropInput label="Título da lista" value={props.listTitle || ''} onChange={set('listTitle')} />
        <PropInput label="Cor de fundo" value={props.bgColor || 'rgba(0,0,0,0.4)'} onChange={set('bgColor')} type="color" />
        <PropInput label="Border Radius" value={props.borderRadius ?? 16} onChange={set('borderRadius')} type="number" />
        <PropInput label="Tamanho do texto" value={props.titleSize || 18} onChange={set('titleSize')} type="number" />
        <PropInput label="Cor do título" value={props.titleColor || '#ffffff'} onChange={set('titleColor')} type="color" />
        <PropInput label="Cor do preço" value={props.priceColor || '#6366f1'} onChange={set('priceColor')} type="color" />
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Mostrar ícone/imagem</Label>
          <Switch checked={props.showIcon !== false} onCheckedChange={set('showIcon')} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Mostrar preço</Label>
          <Switch checked={props.showPrice !== false} onCheckedChange={set('showPrice')} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Divisores</Label>
          <Switch checked={props.showDivider !== false} onCheckedChange={set('showDivider')} />
        </div>
      </Section>

      <Section title={`Itens (${items.length})`}>
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.id} className="p-2 rounded-lg border border-border/50 bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-foreground">{item.icon} {item.title}</span>
                <button onClick={() => removeItem(item.id)} className="p-0.5 rounded hover:bg-destructive/20">
                  <Trash2 className="w-3 h-3 text-destructive" />
                </button>
              </div>
              <PropInput label="Título" value={item.title} onChange={(v) => updateItem(item.id, { title: v })} />
              <PropInput label="Subtítulo" value={item.subtitle || ''} onChange={(v) => updateItem(item.id, { subtitle: v })} />
              <PropInput label="Preço" value={item.price || ''} onChange={(v) => updateItem(item.id, { price: v })} />
              <PropInput label="Emoji/Ícone" value={item.icon || ''} onChange={(v) => updateItem(item.id, { icon: v })} />
              <ImageUploadField value={item.image || ''} onChange={(v) => updateItem(item.id, { image: v })} />
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 mt-2" onClick={addItem}>
          <Plus className="w-3 h-3" /> Adicionar item
        </Button>
      </Section>
    </>
  );
}
