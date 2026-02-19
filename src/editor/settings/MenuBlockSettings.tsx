import { useNode } from '@craftjs/core';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import type { MenuBlockProps, MenuItem } from '../components/MenuBlock';
import { LayoutSettingsPanel } from '../shared/LayoutSettingsPanel';

export function MenuBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as MenuBlockProps,
  }));

  const addItem = () => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      emoji: '🔹',
      label: 'Novo item',
      action: 'Novo prompt',
      color: '#6366f1',
    };
    setProp((p: MenuBlockProps) => { p.items = [...(p.items || []), newItem]; });
  };

  const removeItem = (id: string) => {
    setProp((p: MenuBlockProps) => { p.items = p.items.filter((i) => i.id !== id); });
  };

  const updateItem = (id: string, field: keyof MenuItem, value: string) => {
    setProp((p: MenuBlockProps) => {
      p.items = p.items.map((i) => i.id === id ? { ...i, [field]: value } : i);
    });
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <Label className="text-xs text-muted-foreground">Título</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={props.titleIcon}
            onChange={(e) => setProp((p: MenuBlockProps) => { p.titleIcon = e.target.value; })}
            className="w-12 text-center"
            placeholder="💬"
          />
          <Input
            value={props.title}
            onChange={(e) => setProp((p: MenuBlockProps) => { p.title = e.target.value; })}
            className="flex-1"
          />
        </div>
      </div>

      {/* Layout */}
      <div>
        <Label className="text-xs text-muted-foreground">Layout</Label>
        <Select value={props.layout} onValueChange={(v) => setProp((p: MenuBlockProps) => { p.layout = v as any; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grade</SelectItem>
            <SelectItem value="list">Lista</SelectItem>
            <SelectItem value="pills">Pílulas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {props.layout === 'grid' && (
        <div>
          <Label className="text-xs text-muted-foreground">Colunas: {props.columns}</Label>
          <Slider value={[props.columns]} onValueChange={([v]) => setProp((p: MenuBlockProps) => { p.columns = v; })} min={1} max={4} step={1} className="mt-2" />
        </div>
      )}

      {/* Style */}
      <div>
        <Label className="text-xs text-muted-foreground">Arredondamento: {props.borderRadius}px</Label>
        <Slider value={[props.borderRadius]} onValueChange={([v]) => setProp((p: MenuBlockProps) => { p.borderRadius = v; })} min={0} max={32} step={2} className="mt-2" />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Gap: {props.gap}px</Label>
        <Slider value={[props.gap]} onValueChange={([v]) => setProp((p: MenuBlockProps) => { p.gap = v; })} min={2} max={24} step={2} className="mt-2" />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Blur: {props.bgBlur}px</Label>
        <Slider value={[props.bgBlur]} onValueChange={([v]) => setProp((p: MenuBlockProps) => { p.bgBlur = v; })} min={0} max={30} step={1} className="mt-2" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Cor fundo</Label>
          <Input type="color" value="#1a1a2e" onChange={(e) => setProp((p: MenuBlockProps) => { p.bgColor = e.target.value + '18'; })} className="mt-1 h-10 cursor-pointer" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Cor título</Label>
          <Input type="color" value={props.titleColor} onChange={(e) => setProp((p: MenuBlockProps) => { p.titleColor = e.target.value; })} className="mt-1 h-10 cursor-pointer" />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Emojis visíveis</Label>
        <Switch checked={props.showItemEmoji} onCheckedChange={(v) => setProp((p: MenuBlockProps) => { p.showItemEmoji = v; })} />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Colapsável</Label>
        <Switch checked={props.collapsible} onCheckedChange={(v) => setProp((p: MenuBlockProps) => { p.collapsible = v; })} />
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-muted-foreground font-semibold">Itens do Menu</Label>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={addItem}>
            <Plus className="w-3 h-3" /> Adicionar
          </Button>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {(props.items || []).map((item, idx) => (
            <div key={item.id} className="space-y-2 p-2.5 rounded-lg border border-border/50 bg-muted/20">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">#{idx + 1}</span>
                <Input value={item.emoji} onChange={(e) => updateItem(item.id, 'emoji', e.target.value)} className="w-12 h-7 text-xs text-center" />
                <Input value={item.label} onChange={(e) => updateItem(item.id, 'label', e.target.value)} className="flex-1 h-7 text-xs" />
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive" onClick={() => removeItem(item.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input value={item.action} onChange={(e) => updateItem(item.id, 'action', e.target.value)} className="flex-1 h-7 text-xs" placeholder="Prompt / Ação" />
                <Input type="color" value={item.color} onChange={(e) => updateItem(item.id, 'color', e.target.value)} className="w-10 h-7 cursor-pointer" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <LayoutSettingsPanel />
    </div>
  );
}
