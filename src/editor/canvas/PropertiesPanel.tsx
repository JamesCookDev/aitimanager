import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Link2, X as XIcon } from 'lucide-react';
import type { CanvasElement, CanvasView } from '../types/canvas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Trash2, Copy, ArrowUp, ArrowDown, Lock, Unlock, Eye, EyeOff,
  Layers, Settings2, Globe, ChevronDown, Palette, Wand2, Move, Sparkles,
} from 'lucide-react';

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
      <div className="p-4 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Palette className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Canvas</h3>
            <p className="text-xs text-muted-foreground/60">Configurações globais</p>
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground font-medium">Cor de fundo</Label>
          <div className="flex gap-2 mt-1.5">
            <input type="color" value={bgColor} onChange={(e) => onBgColorChange(e.target.value)} className="w-9 h-9 rounded-lg cursor-pointer border-0" />
            <Input value={bgColor} onChange={(e) => onBgColorChange(e.target.value)} className="h-9 text-sm font-mono" />
          </div>
        </div>

        <ThemePalettesPicker currentBgColor={bgColor} onApply={handleApplyTheme} />

        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center">
            <span className="text-xl">👆</span>
          </div>
          <p className="text-xs text-muted-foreground/50 max-w-[180px]">
            Selecione um elemento no canvas para editar suas propriedades
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}

interface NavElementInfo {
  selector: string;
  tag: string;
  text: string;
  currentNavigate: string;
  elementId: string;
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
  selectedNavElement?: NavElementInfo | null;
  onAssignNavigation?: (selector: string, pageId: string, pageName: string) => void;
  onClearNavElement?: () => void;
}

export function PropertiesPanel({
  element, elements = [], onUpdate, onUpdateProps, onDelete, onDuplicate,
  onBringForward, onSendBackward, onSelectElement, onToggleVisibility, onToggleLock,
  bgColor, onBgColorChange, selectedId, views, onAssignView,
  selectedNavElement, onAssignNavigation, onClearNavElement,
}: Props) {
  const [activeTab, setActiveTab] = useState<string>('props');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
      <TabsList className="w-full shrink-0 rounded-none border-b border-border/40 bg-transparent h-11 px-2 gap-1">
        <TabsTrigger value="props" className="text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none flex-1 h-9 rounded-lg font-semibold">
          <Settings2 className="w-4 h-4" /> Propriedades
        </TabsTrigger>
        <TabsTrigger value="layers" className="text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none flex-1 h-9 rounded-lg font-semibold">
          <Layers className="w-4 h-4" /> Camadas
          <span className="text-[10px] text-muted-foreground/50 bg-muted/40 px-1.5 rounded-full tabular-nums">{elements.length}</span>
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
        {/* Nav element panel */}
        {selectedNavElement && onAssignNavigation && (
          <div className="border-b border-border/50 bg-amber-500/5">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <Link2 className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Navegação do Elemento</p>
                    <p className="text-[10px] text-muted-foreground/60">Clique em outro para trocar</p>
                  </div>
                </div>
                <button onClick={onClearNavElement} className="p-1.5 rounded-lg hover:bg-muted/50">
                  <XIcon className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="rounded-lg bg-muted/30 px-3 py-2.5 space-y-1">
                <p className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500 font-mono text-[10px]">{selectedNavElement.tag}</span>
                  <span className="truncate">{selectedNavElement.text || '(sem texto)'}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Ao clicar, ir para:</Label>
                <Select
                  value={selectedNavElement.currentNavigate || '__none__'}
                  onValueChange={(v) => {
                    const pageId = v === '__none__' ? '' : v;
                    const pageName = views?.find(p => p.id === v)?.name || '';
                    onAssignNavigation(selectedNavElement.selector, pageId, pageName);
                  }}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Selecione uma página..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">
                      <span className="text-muted-foreground">Nenhuma (remover navegação)</span>
                    </SelectItem>
                    {views?.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          {v.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedNavElement.currentNavigate && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-xs text-primary font-medium">✓ Vinculado a:</span>
                  <span className="text-xs font-bold text-primary">
                    {views?.find(v => v.id === selectedNavElement.currentNavigate)?.name || selectedNavElement.currentNavigate}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

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
  const typeIcons: Record<string, any> = {
    text: '📝', image: '🖼️', button: '🔘', shape: '⬜', icon: '⭐',
    video: '🎬', qrcode: '📱', map: '🗺️', social: '🔗', chat: '💬',
    carousel: '🎠', clock: '🕐', weather: '🌤️', countdown: '⏱️',
    iframe: '🌐', avatar: '🤖', store: '🏪', list: '📋', gallery: '🖼️',
    'animated-number': '🔢', catalog: '🛍️', form: '📝',
    bigcta: '👆', ticket: '🎫', qrpix: '💠', numpad: '🔢',
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-0.5">
        {sorted.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <Layers className="w-6 h-6 text-muted-foreground/15" />
            <p className="text-xs text-muted-foreground/40">Canvas vazio</p>
          </div>
        )}
        {sorted.map((el) => {
          const isSelected = el.id === selectedId;
          return (
            <div
              key={el.id}
              onClick={() => onSelect?.(el.id)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all group",
                isSelected
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-muted/30 border border-transparent',
                !el.visible && 'opacity-40'
              )}
            >
              <span className="text-sm shrink-0 w-5 text-center">{typeIcons[el.type] || '❓'}</span>
              <span className={cn(
                "text-xs flex-1 truncate",
                isSelected ? 'font-semibold text-foreground' : 'text-muted-foreground'
              )}>
                {el.name}
              </span>
              <div className={cn("flex items-center gap-1 shrink-0 transition-opacity", isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleVisibility?.(el.id); }}
                  className="p-1 rounded-md hover:bg-muted/50 transition-colors"
                >
                  {el.visible
                    ? <Eye className="w-3.5 h-3.5 text-muted-foreground/40" />
                    : <EyeOff className="w-3.5 h-3.5 text-muted-foreground/20" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleLock?.(el.id); }}
                  className="p-1 rounded-md hover:bg-muted/50 transition-colors"
                >
                  {el.locked
                    ? <Lock className="w-3.5 h-3.5 text-warning" />
                    : <Unlock className="w-3.5 h-3.5 text-muted-foreground/20" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

/* ── Collapsible Section ──────────────── */
function CollapsibleSection({ title, icon: Icon, defaultOpen = true, children }: {
  title: string; icon: any; defaultOpen?: boolean; children: React.ReactNode;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center gap-2 py-2 px-1 group cursor-pointer">
          <Icon className="w-4 h-4 text-muted-foreground/50" />
          <span className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider flex-1 text-left">{title}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/30 transition-transform group-data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2.5 pb-3">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ── Gradient Presets ──────────────── */
const GRADIENT_PRESETS = [
  { name: 'Sunset', from: '#f97316', to: '#ef4444', dir: 'to bottom' },
  { name: 'Ocean', from: '#06b6d4', to: '#3b82f6', dir: '135deg' },
  { name: 'Forest', from: '#22c55e', to: '#059669', dir: 'to bottom' },
  { name: 'Purple', from: '#a855f7', to: '#6366f1', dir: '135deg' },
  { name: 'Rose', from: '#f43f5e', to: '#ec4899', dir: 'to right' },
  { name: 'Gold', from: '#eab308', to: '#f97316', dir: 'to right' },
  { name: 'Neon Blue', from: '#06b6d4', to: '#8b5cf6', dir: '135deg' },
  { name: 'Fire', from: '#ef4444', to: '#f59e0b', dir: 'to bottom' },
  { name: 'Night', from: '#1e293b', to: '#0f172a', dir: 'to bottom' },
  { name: 'Aurora', from: '#22d3ee', to: '#a855f7', dir: '135deg' },
  { name: 'Emerald', from: '#10b981', to: '#14b8a6', dir: 'to right' },
  { name: 'Pink Sky', from: '#f472b6', to: '#c084fc', dir: '135deg' },
];

/* ── Advanced Visual Props ──────────────── */

function AdvancedVisualProps({ props, onChange }: { props: Record<string, any>; onChange: (p: Record<string, any>) => void }) {
  const set = (key: string) => (val: any) => onChange({ [key]: val });

  return (
    <CollapsibleSection title="Efeitos Visuais" icon={Wand2} defaultOpen={false}>
      {/* Quick Gradient Presets */}
      <div className="space-y-2">
        <Label className="text-[10px] font-semibold text-muted-foreground/60 uppercase">Gradientes Rápidos</Label>
        <div className="grid grid-cols-6 gap-1.5">
          {GRADIENT_PRESETS.map((g) => (
            <button
              key={g.name}
              title={g.name}
              onClick={() => onChange({ gradientFrom: g.from, gradientTo: g.to, gradientDirection: g.dir })}
              className="w-full aspect-square rounded-lg border border-border/40 hover:scale-110 transition-transform cursor-pointer"
              style={{ background: `linear-gradient(${g.dir}, ${g.from}, ${g.to})` }}
            />
          ))}
        </div>
        {props.gradientDirection && props.gradientDirection !== 'none' && (
          <button
            onClick={() => onChange({ gradientDirection: 'none', gradientFrom: '', gradientTo: '' })}
            className="text-[10px] text-destructive hover:underline cursor-pointer"
          >
            ✕ Remover gradiente
          </button>
        )}
      </div>

      {/* Custom Gradient */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-semibold text-muted-foreground/60 uppercase">Gradiente Personalizado</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px]">Cor 1</Label>
            <input type="color" value={props.gradientFrom || '#6366f1'} onChange={(e) => set('gradientFrom')(e.target.value)} className="w-full h-7 rounded-lg cursor-pointer border-0 bg-transparent" />
          </div>
          <div>
            <Label className="text-[10px]">Cor 2</Label>
            <input type="color" value={props.gradientTo || '#ec4899'} onChange={(e) => set('gradientTo')(e.target.value)} className="w-full h-7 rounded-lg cursor-pointer border-0 bg-transparent" />
          </div>
        </div>
        <Select value={props.gradientDirection || 'none'} onValueChange={set('gradientDirection')}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Desativado</SelectItem>
            <SelectItem value="to right">→ Horizontal</SelectItem>
            <SelectItem value="to bottom">↓ Vertical</SelectItem>
            <SelectItem value="135deg">↘ Diagonal</SelectItem>
            <SelectItem value="to top right">↗ Diagonal inv.</SelectItem>
            <SelectItem value="45deg">↗ 45°</SelectItem>
            <SelectItem value="circle">◉ Radial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Glassmorphism */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-semibold text-muted-foreground/60 uppercase">Glassmorphism</Label>
        <div className="flex gap-1.5">
          {[
            { value: 'none', label: 'Off' },
            { value: 'subtle', label: 'Suave' },
            { value: 'medium', label: 'Médio' },
            { value: 'strong', label: 'Forte' },
            { value: 'frosted', label: 'Fosco' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => set('glassEffect')(opt.value)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all border',
                (props.glassEffect || 'none') === opt.value
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'border-border/40 text-muted-foreground hover:border-primary/30'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shadow */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-semibold text-muted-foreground/60 uppercase">Sombra</Label>
        <Select value={props.shadowPreset || 'none'} onValueChange={set('shadowPreset')}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma</SelectItem>
            <SelectItem value="sm">Suave</SelectItem>
            <SelectItem value="md">Média</SelectItem>
            <SelectItem value="lg">Grande</SelectItem>
            <SelectItem value="xl">Extra Grande</SelectItem>
            <SelectItem value="inner">Interna</SelectItem>
            <SelectItem value="glow">✨ Glow</SelectItem>
            <SelectItem value="neon">💡 Neon</SelectItem>
            <SelectItem value="colored">🎨 Colorida</SelectItem>
            <SelectItem value="layered">📐 Multi-camada</SelectItem>
          </SelectContent>
        </Select>
        {['glow', 'neon', 'colored'].includes(props.shadowPreset) && (
          <div>
            <Label className="text-[10px]">Cor da sombra</Label>
            <input type="color" value={props.shadowColor || '#6366f1'} onChange={(e) => set('shadowColor')(e.target.value)} className="w-full h-7 rounded-lg cursor-pointer border-0 bg-transparent" />
          </div>
        )}
      </div>

      {/* Border */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-semibold text-muted-foreground/60 uppercase">Borda</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px]">Espessura</Label>
            <Input type="number" value={props.borderWidth || 0} onChange={(e) => set('borderWidth')(Number(e.target.value))} className="h-8 text-xs" />
          </div>
          <div>
            <Label className="text-[10px]">Cor</Label>
            <input type="color" value={props.borderColor || '#ffffff'} onChange={(e) => set('borderColor')(e.target.value)} className="w-full h-7 rounded-lg cursor-pointer border-0 bg-transparent" />
          </div>
        </div>
        <Select value={props.borderStyle || 'solid'} onValueChange={set('borderStyle')}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Sólida</SelectItem>
            <SelectItem value="dashed">Tracejada</SelectItem>
            <SelectItem value="dotted">Pontilhada</SelectItem>
            <SelectItem value="double">Dupla</SelectItem>
          </SelectContent>
        </Select>
        <div>
          <div className="flex justify-between">
            <Label className="text-[10px]">Arredondamento</Label>
            <span className="text-[10px] text-muted-foreground/40 tabular-nums">{props.borderRadius ?? 0}px</span>
          </div>
          <Slider value={[props.borderRadius ?? 0]} onValueChange={([v]) => set('borderRadius')(v)} min={0} max={100} step={1} />
        </div>
      </div>

      {/* Text Shadow */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-semibold text-muted-foreground/60 uppercase">Sombra de Texto</Label>
        <Select value={props.textShadow || 'none'} onValueChange={set('textShadow')}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma</SelectItem>
            <SelectItem value="subtle">Suave</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="strong">Forte</SelectItem>
            <SelectItem value="glow">✨ Glow</SelectItem>
            <SelectItem value="neon">💡 Neon</SelectItem>
            <SelectItem value="outline">Contorno</SelectItem>
          </SelectContent>
        </Select>
        {['glow', 'neon'].includes(props.textShadow) && (
          <div>
            <Label className="text-[10px]">Cor</Label>
            <input type="color" value={props.textShadowColor || '#6366f1'} onChange={(e) => set('textShadowColor')(e.target.value)} className="w-full h-7 rounded-lg cursor-pointer border-0 bg-transparent" />
          </div>
        )}
      </div>

      {/* Animation */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-semibold text-muted-foreground/60 uppercase">Animação</Label>
        <Select value={props.entranceAnimation || 'none'} onValueChange={set('entranceAnimation')}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma</SelectItem>
            <SelectItem value="fadeIn">Fade In</SelectItem>
            <SelectItem value="slideUp">Slide ↑</SelectItem>
            <SelectItem value="slideDown">Slide ↓</SelectItem>
            <SelectItem value="slideLeft">Slide ←</SelectItem>
            <SelectItem value="slideRight">Slide →</SelectItem>
            <SelectItem value="scaleUp">Zoom In</SelectItem>
            <SelectItem value="scaleDown">Zoom Out</SelectItem>
            <SelectItem value="bounce">Bounce</SelectItem>
            <SelectItem value="pulse">Pulsar</SelectItem>
            <SelectItem value="shake">Vibrar</SelectItem>
            <SelectItem value="flip">Flip</SelectItem>
            <SelectItem value="rotate">Rotacionar</SelectItem>
            <SelectItem value="float">Flutuar</SelectItem>
            <SelectItem value="glow-pulse">Glow Pulse</SelectItem>
          </SelectContent>
        </Select>
        {props.entranceAnimation && props.entranceAnimation !== 'none' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">Atraso (ms)</Label>
              <Input type="number" value={props.entranceDelay || 0} onChange={(e) => set('entranceDelay')(Number(e.target.value))} className="h-8 text-xs" step={100} />
            </div>
            <div>
              <Label className="text-[10px]">Duração (ms)</Label>
              <Input type="number" value={props.entranceDuration || 600} onChange={(e) => set('entranceDuration')(Number(e.target.value))} className="h-8 text-xs" step={100} />
            </div>
          </div>
        )}
      </div>

      {/* Transform */}
      <div className="space-y-2">
        <Label className="text-[10px] font-semibold text-muted-foreground/60 uppercase">Transformação</Label>
        <div>
          <div className="flex justify-between">
            <Label className="text-[10px]">Rotação</Label>
            <span className="text-[10px] text-muted-foreground/40 tabular-nums">{props.transformRotate ?? 0}°</span>
          </div>
          <Slider value={[props.transformRotate ?? 0]} onValueChange={([v]) => set('transformRotate')(v)} min={-180} max={180} step={1} />
        </div>
        <div>
          <div className="flex justify-between">
            <Label className="text-[10px]">Escala</Label>
            <span className="text-[10px] text-muted-foreground/40 tabular-nums">{props.transformScale ?? 100}%</span>
          </div>
          <Slider value={[props.transformScale ?? 100]} onValueChange={([v]) => set('transformScale')(v)} min={10} max={200} step={5} />
        </div>
        <div>
          <div className="flex justify-between">
            <Label className="text-[10px]">Skew X</Label>
            <span className="text-[10px] text-muted-foreground/40 tabular-nums">{props.transformSkewX ?? 0}°</span>
          </div>
          <Slider value={[props.transformSkewX ?? 0]} onValueChange={([v]) => set('transformSkewX')(v)} min={-45} max={45} step={1} />
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <Label className="text-[10px] font-semibold text-muted-foreground/60 uppercase">Filtros</Label>
        <div>
          <div className="flex justify-between">
            <Label className="text-[10px]">Blur</Label>
            <span className="text-[10px] text-muted-foreground/40 tabular-nums">{props.filterBlur || 0}px</span>
          </div>
          <Slider value={[props.filterBlur || 0]} onValueChange={([v]) => set('filterBlur')(v)} min={0} max={20} step={1} />
        </div>
        <div>
          <div className="flex justify-between">
            <Label className="text-[10px]">Backdrop Blur</Label>
            <span className="text-[10px] text-muted-foreground/40 tabular-nums">{props.backdropBlur || 0}px</span>
          </div>
          <Slider value={[props.backdropBlur || 0]} onValueChange={([v]) => set('backdropBlur')(v)} min={0} max={30} step={1} />
        </div>
        <div>
          <div className="flex justify-between">
            <Label className="text-[10px]">Brilho</Label>
            <span className="text-[10px] text-muted-foreground/40 tabular-nums">{props.filterBrightness ?? 100}%</span>
          </div>
          <Slider value={[props.filterBrightness ?? 100]} onValueChange={([v]) => set('filterBrightness')(v)} min={0} max={200} step={5} />
        </div>
        <div>
          <div className="flex justify-between">
            <Label className="text-[10px]">Saturação</Label>
            <span className="text-[10px] text-muted-foreground/40 tabular-nums">{props.filterSaturation ?? 100}%</span>
          </div>
          <Slider value={[props.filterSaturation ?? 100]} onValueChange={([v]) => set('filterSaturation')(v)} min={0} max={200} step={5} />
        </div>
        <div>
          <div className="flex justify-between">
            <Label className="text-[10px]">Contraste</Label>
            <span className="text-[10px] text-muted-foreground/40 tabular-nums">{props.filterContrast ?? 100}%</span>
          </div>
          <Slider value={[props.filterContrast ?? 100]} onValueChange={([v]) => set('filterContrast')(v)} min={0} max={200} step={5} />
        </div>
        <div>
          <div className="flex justify-between">
            <Label className="text-[10px]">Escala de cinza</Label>
            <span className="text-[10px] text-muted-foreground/40 tabular-nums">{props.filterGrayscale ?? 0}%</span>
          </div>
          <Slider value={[props.filterGrayscale ?? 0]} onValueChange={([v]) => set('filterGrayscale')(v)} min={0} max={100} step={5} />
        </div>
        <div>
          <div className="flex justify-between">
            <Label className="text-[10px]">Hue Rotate</Label>
            <span className="text-[10px] text-muted-foreground/40 tabular-nums">{props.filterHueRotate ?? 0}°</span>
          </div>
          <Slider value={[props.filterHueRotate ?? 0]} onValueChange={([v]) => set('filterHueRotate')(v)} min={0} max={360} step={5} />
        </div>
      </div>
    </CollapsibleSection>
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
        {/* Header with element info + quick actions */}
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground truncate">{element.name}</h3>
            <p className="text-[10px] text-muted-foreground/50 font-mono">{element.type} • z{element.zIndex}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onUpdate({ visible: !element.visible })} title={element.visible ? 'Ocultar' : 'Mostrar'}>
              {element.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onUpdate({ locked: !element.locked })} title={element.locked ? 'Desbloquear' : 'Bloquear'}>
              {element.locked ? <Lock className="w-4 h-4 text-warning" /> : <Unlock className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Quick actions row */}
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1.5" onClick={onDuplicate}><Copy className="w-3.5 h-3.5" /> Duplicar</Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={onBringForward} title="Frente"><ArrowUp className="w-3.5 h-3.5" /></Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={onSendBackward} title="Trás"><ArrowDown className="w-3.5 h-3.5" /></Button>
          <Button variant="destructive" size="sm" className="h-8 w-8 p-0" onClick={onDelete} title="Excluir"><Trash2 className="w-3.5 h-3.5" /></Button>
        </div>

        {/* Position & Size */}
        <CollapsibleSection title="Posição & Tamanho" icon={Move} defaultOpen={true}>
          <div className="grid grid-cols-2 gap-2">
            <Field label="X" value={element.x} onChange={(v) => onUpdate({ x: v })} />
            <Field label="Y" value={element.y} onChange={(v) => onUpdate({ y: v })} />
            <Field label="Largura" value={element.width} onChange={(v) => onUpdate({ width: v })} />
            <Field label="Altura" value={element.height} onChange={(v) => onUpdate({ height: v })} />
          </div>
          <div>
            <div className="flex justify-between">
              <Label className="text-xs text-muted-foreground">Opacidade</Label>
              <span className="text-[10px] text-muted-foreground/40 tabular-nums">{Math.round(element.opacity * 100)}%</span>
            </div>
            <Slider
              value={[element.opacity * 100]}
              onValueChange={([v]) => onUpdate({ opacity: v / 100 })}
              min={0} max={100} step={1}
            />
          </div>
        </CollapsibleSection>

        {/* Advanced Visual */}
        <AdvancedVisualProps props={element.props} onChange={onUpdateProps} />

        {/* Type-specific props */}
        {element.type === 'iframe' ? (
          <TypeProps type={element.type} props={element.props} onChange={onUpdateProps} views={views} />
        ) : (
          <CollapsibleSection title="Conteúdo" icon={Sparkles} defaultOpen={true}>
            <TypeProps type={element.type} props={element.props} onChange={onUpdateProps} views={views} />
          </CollapsibleSection>
        )}

        {/* Page assignment */}
        {views && views.length > 0 && onAssignView && (
          <CollapsibleSection title="Página" icon={Globe} defaultOpen={false}>
            <Select
              value={element.viewId || '__global__'}
              onValueChange={(v) => onAssignView(element.id, v === '__global__' ? null : v)}
            >
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__global__">
                  <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> Global</span>
                </SelectItem>
                {views.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CollapsibleSection>
        )}
      </div>
    </ScrollArea>
  );
}
