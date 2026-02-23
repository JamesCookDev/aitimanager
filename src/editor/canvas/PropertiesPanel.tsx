import { useState } from 'react';
import type { CanvasElement, CanvasView } from '../types/canvas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Copy, ArrowUp, ArrowDown, Lock, Unlock, Eye, EyeOff, Layers, Settings2, Globe, Navigation } from 'lucide-react';

import { Section, Field } from './properties/shared';
import { TypeProps } from './properties/TypeProps';

interface Props {
  element: CanvasElement | null;
  elements?: CanvasElement[];
  onUpdate: (patch: Partial<CanvasElement>) => void;
  onUpdateProps: (props: Record<string, any>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onSelectElement?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  onToggleLock?: (id: string) => void;
  bgColor: string;
  onBgColorChange: (c: string) => void;
  selectedId?: string | null;
  views?: CanvasView[];
  onAssignView?: (elementId: string, viewId: string | null) => void;
}

export function PropertiesPanel({
  element, elements = [], onUpdate, onUpdateProps, onDelete, onDuplicate,
  onBringForward, onSendBackward, onSelectElement, onToggleVisibility, onToggleLock,
  bgColor, onBgColorChange, selectedId, views, onAssignView,
}: Props) {
  const [activeTab, setActiveTab] = useState<string>('props');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
      <TabsList className="w-full shrink-0 rounded-none border-b border-border bg-transparent h-9 px-2">
        <TabsTrigger value="props" className="text-[11px] gap-1.5 data-[state=active]:bg-muted/50 flex-1 h-7">
          <Settings2 className="w-3 h-3" /> Propriedades
        </TabsTrigger>
        <TabsTrigger value="layers" className="text-[11px] gap-1.5 data-[state=active]:bg-muted/50 flex-1 h-7">
          <Layers className="w-3 h-3" /> Camadas
          <span className="text-[9px] text-muted-foreground ml-0.5">({elements.length})</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="layers" className="flex-1 overflow-hidden mt-0">
        <LayersPanel
          elements={elements}
          selectedId={selectedId || null}
          onSelect={onSelectElement}
          onToggleVisibility={onToggleVisibility}
          onToggleLock={onToggleLock}
        />
      </TabsContent>

      <TabsContent value="props" className="flex-1 overflow-hidden mt-0">
        {!element ? (
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
        ) : (
          <PropsContent
            element={element}
            onUpdate={onUpdate}
            onUpdateProps={onUpdateProps}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onBringForward={onBringForward}
            onSendBackward={onSendBackward}
            views={views}
            onAssignView={onAssignView}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}

/* ── Layers Panel ─────────────────────────── */

function LayersPanel({
  elements, selectedId, onSelect, onToggleVisibility, onToggleLock,
}: {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  onToggleLock?: (id: string) => void;
}) {
  const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);
  const typeEmoji: Record<string, string> = {
    text: '📝', image: '🖼️', button: '🔘', shape: '⬜', icon: '⭐',
    video: '🎬', qrcode: '📱', map: '🗺️', social: '🔗', chat: '💬',
    carousel: '🎠', clock: '🕐', weather: '🌤️', countdown: '⏱️',
    iframe: '🌐', avatar: '🤖', store: '🏪',
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-0.5">
        {sorted.length === 0 && (
          <p className="text-[11px] text-muted-foreground text-center py-8">Nenhum elemento no canvas</p>
        )}
        {sorted.map((el) => {
          const isSelected = el.id === selectedId;
          return (
            <div
              key={el.id}
              onClick={() => onSelect?.(el.id)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                isSelected ? 'bg-primary/15 border border-primary/30' : 'hover:bg-muted/50 border border-transparent'
              }`}
            >
              <span className="text-xs shrink-0">{typeEmoji[el.type] || '❓'}</span>
              <span className={`text-[11px] flex-1 truncate ${isSelected ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                {el.name}
              </span>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleVisibility?.(el.id); }}
                  className="p-0.5 rounded hover:bg-muted/50 transition-colors"
                  title={el.visible ? 'Ocultar' : 'Mostrar'}
                >
                  {el.visible ? <Eye className="w-3 h-3 text-muted-foreground" /> : <EyeOff className="w-3 h-3 text-muted-foreground/40" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleLock?.(el.id); }}
                  className="p-0.5 rounded hover:bg-muted/50 transition-colors"
                  title={el.locked ? 'Desbloquear' : 'Bloquear'}
                >
                  {el.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 text-muted-foreground/40" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

/* ── Properties Content ──────────────────── */

function PropsContent({
  element, onUpdate, onUpdateProps, onDelete, onDuplicate, onBringForward, onSendBackward,
  views, onAssignView,
}: {
  element: CanvasElement;
  onUpdate: (patch: Partial<CanvasElement>) => void;
  onUpdateProps: (props: Record<string, any>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  views?: CanvasView[];
  onAssignView?: (elementId: string, viewId: string | null) => void;
}) {
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
        <TypeProps type={element.type} props={element.props} onChange={onUpdateProps} views={views} />

        {/* View assignment */}
        {views && views.length > 0 && onAssignView && (
          <Section title="View">
            <div className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground">Visível na view</Label>
              <Select
                value={element.viewId || '__global__'}
                onValueChange={(v) => onAssignView(element.id, v === '__global__' ? null : v)}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__global__">
                    <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Global (todas as views)</span>
                  </SelectItem>
                  {views.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      <span className="flex items-center gap-1.5"><Navigation className="w-3 h-3" /> {v.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[9px] text-muted-foreground">
                Elementos globais aparecem em todas as views. Elementos vinculados só aparecem na view selecionada.
              </p>
            </div>
          </Section>
        )}

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
