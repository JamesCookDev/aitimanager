import { useState } from 'react';
import { cn } from '@/lib/utils';
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
import { ThemePalettesPicker, type ThemePalette } from './ThemePalettes';

/* ── Canvas Props (no element selected) ── */
function CanvasPropsPanel({ bgColor, onBgColorChange }: { bgColor: string; onBgColorChange: (c: string) => void }) {
  const handleApplyTheme = (palette: ThemePalette) => {
    onBgColorChange(palette.bgColor);
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Canvas</h3>
        <div>
          <Label className="text-[11px]">Cor de fundo</Label>
          <div className="flex gap-2 mt-1">
            <input type="color" value={bgColor} onChange={(e) => onBgColorChange(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
            <Input value={bgColor} onChange={(e) => onBgColorChange(e.target.value)} className="h-8 text-xs font-mono" />
          </div>
        </div>

        <ThemePalettesPicker currentBgColor={bgColor} onApply={handleApplyTheme} />

        <p className="text-[11px] text-muted-foreground mt-4 text-center">
          Selecione um elemento no canvas para editar suas propriedades
        </p>
      </div>
    </ScrollArea>
  );
}

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
      <TabsList className="w-full shrink-0 rounded-none border-b border-border bg-transparent h-10 px-2 gap-1">
        <TabsTrigger value="props" className="text-[11px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none flex-1 h-7 rounded-md font-medium">
          <Settings2 className="w-3.5 h-3.5" /> Propriedades
        </TabsTrigger>
        <TabsTrigger value="layers" className="text-[11px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none flex-1 h-7 rounded-md font-medium">
          <Layers className="w-3.5 h-3.5" /> Camadas
          <span className="text-[9px] text-muted-foreground/60 ml-0.5 bg-muted/50 px-1.5 rounded-full">{elements.length}</span>
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
          <CanvasPropsPanel bgColor={bgColor} onBgColorChange={onBgColorChange} />
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
    iframe: '🌐', avatar: '🤖', store: '🏪', list: '📋', gallery: '🖼️',
    'animated-number': '🔢', catalog: '🛍️', form: '📝',
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-0.5">
        {sorted.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12">
            <Layers className="w-6 h-6 text-muted-foreground/20" />
            <p className="text-[11px] text-muted-foreground/50">Nenhum elemento no canvas</p>
          </div>
        )}
        {sorted.map((el) => {
          const isSelected = el.id === selectedId;
          return (
            <div
              key={el.id}
              onClick={() => onSelect?.(el.id)}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all",
                isSelected
                  ? 'bg-primary/10 border border-primary/25'
                  : 'hover:bg-muted/40 border border-transparent'
              )}
            >
              <span className="text-xs shrink-0 w-5 text-center">{typeEmoji[el.type] || '❓'}</span>
              <span className={cn(
                "text-[11px] flex-1 truncate",
                isSelected ? 'font-semibold text-foreground' : 'text-muted-foreground'
              )}>
                {el.name}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleVisibility?.(el.id); }}
                  className="p-1 rounded-md hover:bg-muted/60 transition-colors"
                  title={el.visible ? 'Ocultar' : 'Mostrar'}
                >
                  {el.visible
                    ? <Eye className="w-3.5 h-3.5 text-muted-foreground/60" />
                    : <EyeOff className="w-3.5 h-3.5 text-muted-foreground/30" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleLock?.(el.id); }}
                  className="p-1 rounded-md hover:bg-muted/60 transition-colors"
                  title={el.locked ? 'Desbloquear' : 'Bloquear'}
                >
                  {el.locked
                    ? <Lock className="w-3.5 h-3.5 text-amber-400" />
                    : <Unlock className="w-3.5 h-3.5 text-muted-foreground/30" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

/* ── Advanced Visual Props ──────────────── */

function AdvancedVisualProps({ props, onChange }: { props: Record<string, any>; onChange: (p: Record<string, any>) => void }) {
  const set = (key: string) => (val: any) => onChange({ [key]: val });

  return (
    <>
      <Section title="🎨 Efeitos Visuais">
        {/* Gradient */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Gradiente de fundo</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">Cor 1</Label>
              <input type="color" value={props.gradientFrom || ''} onChange={(e) => set('gradientFrom')(e.target.value)} className="w-full h-6 rounded cursor-pointer border-0 bg-transparent" />
            </div>
            <div>
              <Label className="text-[10px]">Cor 2</Label>
              <input type="color" value={props.gradientTo || ''} onChange={(e) => set('gradientTo')(e.target.value)} className="w-full h-6 rounded cursor-pointer border-0 bg-transparent" />
            </div>
          </div>
          <Select value={props.gradientDirection || 'none'} onValueChange={set('gradientDirection')}>
            <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Desativado</SelectItem>
              <SelectItem value="to right">→ Horizontal</SelectItem>
              <SelectItem value="to bottom">↓ Vertical</SelectItem>
              <SelectItem value="135deg">↘ Diagonal</SelectItem>
              <SelectItem value="to top right">↗ Diagonal inv.</SelectItem>
              <SelectItem value="circle">◉ Radial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Shadow */}
        <div className="space-y-1.5 pt-2">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Sombra</Label>
          <Select value={props.shadowPreset || 'none'} onValueChange={set('shadowPreset')}>
            <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              <SelectItem value="sm">Suave</SelectItem>
              <SelectItem value="md">Média</SelectItem>
              <SelectItem value="lg">Grande</SelectItem>
              <SelectItem value="glow">✨ Glow</SelectItem>
              <SelectItem value="neon">💡 Neon</SelectItem>
            </SelectContent>
          </Select>
          {(props.shadowPreset === 'glow' || props.shadowPreset === 'neon') && (
            <div>
              <Label className="text-[10px]">Cor do glow</Label>
              <input type="color" value={props.shadowColor || '#6366f1'} onChange={(e) => set('shadowColor')(e.target.value)} className="w-full h-6 rounded cursor-pointer border-0 bg-transparent" />
            </div>
          )}
        </div>

        {/* Border */}
        <div className="space-y-1.5 pt-2">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Borda</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">Espessura</Label>
              <Input type="number" value={props.borderWidth || 0} onChange={(e) => set('borderWidth')(Number(e.target.value))} className="h-7 text-[10px]" />
            </div>
            <div>
              <Label className="text-[10px]">Cor</Label>
              <input type="color" value={props.borderColor || '#ffffff'} onChange={(e) => set('borderColor')(e.target.value)} className="w-full h-6 rounded cursor-pointer border-0 bg-transparent" />
            </div>
          </div>
        </div>

        {/* Entrance Animation */}
        <div className="space-y-1.5 pt-2">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Animação de entrada</Label>
          <Select value={props.entranceAnimation || 'none'} onValueChange={set('entranceAnimation')}>
            <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              <SelectItem value="fadeIn">Fade In</SelectItem>
              <SelectItem value="slideUp">Slide de baixo</SelectItem>
              <SelectItem value="slideLeft">Slide da esquerda</SelectItem>
              <SelectItem value="slideRight">Slide da direita</SelectItem>
              <SelectItem value="scaleUp">Zoom In</SelectItem>
              <SelectItem value="bounce">Bounce</SelectItem>
              <SelectItem value="pulse">Pulsar</SelectItem>
            </SelectContent>
          </Select>
          {props.entranceAnimation && props.entranceAnimation !== 'none' && (
            <div>
              <Label className="text-[10px]">Atraso (ms)</Label>
              <Input type="number" value={props.entranceDelay || 0} onChange={(e) => set('entranceDelay')(Number(e.target.value))} className="h-7 text-[10px]" step={100} />
            </div>
          )}
        </div>

        {/* Image filters */}
        <div className="space-y-1.5 pt-2">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Filtros</Label>
          <div>
            <Label className="text-[10px]">Blur: {props.filterBlur || 0}px</Label>
            <Slider value={[props.filterBlur || 0]} onValueChange={([v]) => set('filterBlur')(v)} min={0} max={20} step={1} />
          </div>
          <div>
            <Label className="text-[10px]">Brilho: {props.filterBrightness ?? 100}%</Label>
            <Slider value={[props.filterBrightness ?? 100]} onValueChange={([v]) => set('filterBrightness')(v)} min={0} max={200} step={5} />
          </div>
          <div>
            <Label className="text-[10px]">Saturação: {props.filterSaturation ?? 100}%</Label>
            <Slider value={[props.filterSaturation ?? 100]} onValueChange={([v]) => set('filterSaturation')(v)} min={0} max={200} step={5} />
          </div>
          <div>
            <Label className="text-[10px]">Escala de cinza: {props.filterGrayscale || 0}%</Label>
            <Slider value={[props.filterGrayscale || 0]} onValueChange={([v]) => set('filterGrayscale')(v)} min={0} max={100} step={5} />
          </div>
        </div>
      </Section>
    </>
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

        {/* Advanced Visual */}
        <AdvancedVisualProps props={element.props} onChange={onUpdateProps} />

        {/* Type-specific props */}
        <TypeProps type={element.type} props={element.props} onChange={onUpdateProps} views={views} />

        {/* Page assignment */}
        {views && views.length > 0 && onAssignView && (
          <Section title="Página">
            <div className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground">Visível na página</Label>
              <Select
                value={element.viewId || '__global__'}
                onValueChange={(v) => onAssignView(element.id, v === '__global__' ? null : v)}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__global__">
                    <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Global (todas as páginas)</span>
                  </SelectItem>
                  {views.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      <span className="flex items-center gap-1.5"><Navigation className="w-3 h-3" /> {v.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[9px] text-muted-foreground">
                Elementos globais aparecem em todas as páginas. Elementos vinculados só aparecem na página selecionada.
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
