import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Trash2, ChevronDown, ChevronRight, FolderPlus } from 'lucide-react';
import { LayoutSettingsPanel } from '../shared/LayoutSettingsPanel';
import type { MenuBlockProps, MenuItemProps } from '../components/MenuBlock';

const GRADIENT_PRESETS = [
  { label: 'Azul / Índigo', value: 'from-blue-400 to-indigo-400' },
  { label: 'Verde / Ciano', value: 'from-teal-400 to-cyan-400' },
  { label: 'Roxo / Rosa', value: 'from-purple-400 to-pink-400' },
  { label: 'Laranja / Amarelo', value: 'from-orange-400 to-yellow-400' },
  { label: 'Verde / Esmeralda', value: 'from-green-400 to-emerald-400' },
  { label: 'Rosa / Vermelho', value: 'from-rose-400 to-red-400' },
];

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

function ItemEditor({
  item,
  onUpdate,
  onRemove,
  depth = 0,
}: {
  item: MenuItemProps;
  onUpdate: (updated: MenuItemProps) => void;
  onRemove: () => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const isFolder = item.type === 'folder';

  const updateField = (field: keyof MenuItemProps, value: any) =>
    onUpdate({ ...item, [field]: value });

  const addChild = () => {
    const newChild: MenuItemProps = {
      id: genId(), type: 'action', icon: '💬',
      label: 'Novo item', prompt: '', gradient: 'from-blue-400 to-indigo-400',
    };
    onUpdate({ ...item, children: [...(item.children || []), newChild] });
  };

  const updateChild = (idx: number, updated: MenuItemProps) => {
    const children = [...(item.children || [])];
    children[idx] = updated;
    onUpdate({ ...item, children });
  };

  const removeChild = (idx: number) => {
    onUpdate({ ...item, children: (item.children || []).filter((_, i) => i !== idx) });
  };

  return (
    <div style={{ marginLeft: depth * 8 }} className="border border-border/50 rounded-lg bg-card/30 overflow-hidden mb-1.5">
      <div className="flex items-center justify-between p-2 bg-muted/30">
        <button type="button" onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 text-xs font-medium text-foreground flex-1 min-w-0">
          {expanded ? <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground" />}
          <span className="truncate">{item.icon} {item.label}</span>
          {isFolder && <span className="text-muted-foreground text-[10px] ml-1">({item.children?.length || 0})</span>}
        </button>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10 shrink-0" onClick={onRemove}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {expanded && (
        <div className="p-2.5 space-y-2">
          {/* Tipo */}
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-muted-foreground">Tipo</Label>
            <div className="flex gap-1">
              {(['action', 'folder'] as const).map(t => (
                <button key={t} type="button" onClick={() => updateField('type', t)}
                  className={`px-2 py-1 rounded text-[10px] font-medium border transition-all ${item.type === t ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-muted/30 border-border/40 text-muted-foreground'}`}
                >
                  {t === 'folder' ? '📁 Pasta' : '⚡ Ação'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Ícone</Label>
              <Input value={item.icon} onChange={e => updateField('icon', e.target.value)} className="h-7 text-center text-base" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-[10px] text-muted-foreground">Label</Label>
              <Input value={item.label} onChange={e => updateField('label', e.target.value)} className="h-7 text-xs" />
            </div>
          </div>

          {!isFolder && (
            <>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Descrição (opcional)</Label>
                <Input value={item.description || ''} onChange={e => updateField('description', e.target.value)} className="h-7 text-xs" placeholder="Subtexto curto" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Prompt IA (mensagem ao clicar)</Label>
                <textarea
                  value={item.prompt || ''}
                  onChange={e => updateField('prompt', e.target.value)}
                  rows={2}
                  placeholder="Ex: Me fale sobre os serviços"
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Cor / Gradiente</Label>
                <select
                  value={item.gradient || 'from-blue-400 to-indigo-400'}
                  onChange={e => updateField('gradient', e.target.value)}
                  className="flex h-7 w-full rounded-md border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none"
                >
                  {GRADIENT_PRESETS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </>
          )}

          {isFolder && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-muted-foreground">Itens da pasta</Label>
                <Button variant="outline" size="sm" onClick={addChild} className="h-6 text-[10px]">
                  <Plus className="w-2.5 h-2.5 mr-1" /> Adicionar
                </Button>
              </div>
              {(item.children || []).map((child, ci) => (
                <ItemEditor key={child.id} item={child} depth={1}
                  onUpdate={(u) => updateChild(ci, u)}
                  onRemove={() => removeChild(ci)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MenuBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as Partial<MenuBlockProps>,
  }));

  const p = props as MenuBlockProps;
  const set = (field: keyof MenuBlockProps, value: any) =>
    setProp((pr: any) => { pr[field] = value; });

  const items: MenuItemProps[] = p.items || [];

  const addItem = (type: 'action' | 'folder') => {
    const newItem: MenuItemProps = type === 'folder'
      ? { id: genId(), type: 'folder', icon: '📁', label: 'Nova Pasta', children: [] }
      : { id: genId(), type: 'action', icon: '💬', label: 'Novo Item', prompt: '', gradient: 'from-blue-400 to-indigo-400' };
    set('items', [...items, newItem]);
  };

  const updateItem = (idx: number, updated: MenuItemProps) => {
    const next = [...items]; next[idx] = updated; set('items', next);
  };

  const removeItem = (idx: number) => set('items', items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      <Accordion type="multiple" defaultValue={['geral', 'aparencia', 'items']} className="space-y-0.5">

        {/* Geral */}
        <AccordionItem value="geral" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">✏️ Conteúdo</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <div className="grid grid-cols-3 gap-1.5">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Ícone</Label>
                <Input value={p.titleIcon || '💬'} onChange={e => set('titleIcon', e.target.value)} className="h-7 text-center text-base" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-[10px] text-muted-foreground">Título</Label>
                <Input value={p.title || ''} onChange={e => set('title', e.target.value)} className="h-7 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Seta Pasta</Label>
                <Input value={p.folderArrowSymbol || '▼'} onChange={e => set('folderArrowSymbol', e.target.value)} className="h-7 text-center text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Seta Item</Label>
                <Input value={p.itemArrowSymbol || '→'} onChange={e => set('itemArrowSymbol', e.target.value)} className="h-7 text-center text-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Fechar ao selecionar</Label>
              <Switch checked={p.closeOnSelect !== false} onCheckedChange={v => set('closeOnSelect', v)} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Aparência */}
        <AccordionItem value="aparencia" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">🎨 Aparência</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-[10px] text-muted-foreground">Blur (Desfoque)</Label>
                <span className="text-[10px] font-mono text-muted-foreground">{p.bgBlur ?? 20}px</span>
              </div>
              <Slider value={[p.bgBlur ?? 20]} onValueChange={([v]) => set('bgBlur', v)} min={0} max={32} step={1} />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-[10px] text-muted-foreground">Arredondamento</Label>
                <span className="text-[10px] font-mono text-muted-foreground">{p.borderRadius ?? 28}px</span>
              </div>
              <Slider value={[p.borderRadius ?? 28]} onValueChange={([v]) => set('borderRadius', v)} min={0} max={48} step={2} />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-[10px] text-muted-foreground">Espaçamento itens</Label>
                <span className="text-[10px] font-mono text-muted-foreground">{p.gap ?? 8}px</span>
              </div>
              <Slider value={[p.gap ?? 8]} onValueChange={([v]) => set('gap', v)} min={0} max={24} step={2} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Cor do fundo</Label>
              <div className="flex gap-2">
                <input type="color" value="#1e293b" onChange={e => set('bgColor', e.target.value + 'bf')} className="h-7 w-12 rounded border border-border cursor-pointer" />
                <Input value={p.bgColor || ''} onChange={e => set('bgColor', e.target.value)} className="h-7 text-xs font-mono flex-1" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Cor do título</Label>
              <div className="flex gap-2">
                <input type="color" value={p.titleColor || '#ffffff'} onChange={e => set('titleColor', e.target.value)} className="h-7 w-12 rounded border border-border cursor-pointer" />
                <Input value={p.titleColor || '#ffffff'} onChange={e => set('titleColor', e.target.value)} className="h-7 text-xs font-mono flex-1" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Itens */}
        <AccordionItem value="items" className="border-b-0 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">
            📋 Itens do Menu ({items.length})
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2">
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" onClick={() => addItem('action')} className="flex-1 h-7 text-[10px]">
                <Plus className="w-3 h-3 mr-1" /> Ação
              </Button>
              <Button variant="outline" size="sm" onClick={() => addItem('folder')} className="flex-1 h-7 text-[10px]">
                <FolderPlus className="w-3 h-3 mr-1" /> Pasta
              </Button>
            </div>
            {items.map((item, idx) => (
              <ItemEditor
                key={item.id}
                item={item}
                onUpdate={(u) => updateItem(idx, u)}
                onRemove={() => removeItem(idx)}
              />
            ))}
            {items.length === 0 && (
              <p className="text-[10px] text-muted-foreground text-center py-3">
                Adicione itens ao menu acima
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <LayoutSettingsPanel />
    </div>
  );
}
