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
      <div className="p-3 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
            <Palette className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-foreground">Canvas</h3>
            <p className="text-[9px] text-muted-foreground/60">Configurações globais</p>
          </div>
        </div>

        <div>
          <Label className="text-[10px] text-muted-foreground">Cor de fundo</Label>
          <div className="flex gap-2 mt-1">
            <input type="color" value={bgColor} onChange={(e) => onBgColorChange(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0" />
            <Input value={bgColor} onChange={(e) => onBgColorChange(e.target.value)} className="h-7 text-[10px] font-mono" />
          </div>
        </div>

        <ThemePalettesPicker currentBgColor={bgColor} onApply={handleApplyTheme} />

        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center">
            <span className="text-lg">👆</span>
          </div>
          <p className="text-[10px] text-muted-foreground/50 max-w-[160px]">
            Selecione um elemento no canvas para editar
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
      <TabsList className="w-full shrink-0 rounded-none border-b border-border/40 bg-transparent h-9 px-1.5 gap-0.5">
        <TabsTrigger value="props" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none flex-1 h-7 rounded-md font-semibold">
          <Settings2 className="w-3 h-3" /> Props
        </TabsTrigger>
        <TabsTrigger value="layers" className="text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none flex-1 h-7 rounded-md font-semibold">
          <Layers className="w-3 h-3" /> Camadas
          <span className="text-[8px] text-muted-foreground/50 bg-muted/40 px-1 rounded-full tabular-nums">{elements.length}</span>
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
        {/* Nav element panel - shown when user clicks an element in navigate mode */}
        {selectedNavElement && onAssignNavigation && (
          <div className="border-b border-border/50 bg-amber-500/5">
            <div className="p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-amber-500/15 flex items-center justify-center">
                    <Link2 className="w-3 h-3 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-foreground">Navegação do Elemento</p>
                    <p className="text-[8px] text-muted-foreground/60">Clique em outro elemento para trocar</p>
                  </div>
                </div>
                <button onClick={onClearNavElement} className="p-1 rounded hover:bg-muted/50">
                  <XIcon className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>

              {/* Selected element info */}
              <div className="rounded-md bg-muted/30 px-2.5 py-2 space-y-1">
                <p className="text-[9px] font-semibold text-foreground flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 font-mono text-[8px]">{selectedNavElement.tag}</span>
                  <span className="truncate">{selectedNavElement.text || '(sem texto)'}</span>
                </p>
              </div>

              {/* Page selector */}
              <div className="space-y-1">
                <Label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Ao clicar, ir para:</Label>
                <Select
                  value={selectedNavElement.currentNavigate || '__none__'}
                  onValueChange={(v) => {
                    const pageId = v === '__none__' ? '' : v;
                    const pageName = views?.find(p => p.id === v)?.name || '';
                    onAssignNavigation(selectedNavElement.selector, pageId, pageName);
                  }}
                >
                  <SelectTrigger className="h-7 text-[10px]">
                    <SelectValue placeholder="Selecione uma página..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">
                      <span className="text-muted-foreground">Nenhuma (remover navegação)</span>
                    </SelectItem>
                    {views?.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          {v.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedNavElement.currentNavigate && (
                <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-primary/10 border border-primary/20">
                  <span className="text-[9px] text-primary font-medium">✓ Vinculado a:</span>
                  <span className="text-[9px] font-bold text-primary">
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
      <div className="p-1.5 space-y-px">
        {sorted.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12">
            <Layers className="w-5 h-5 text-muted-foreground/15" />
            <p className="text-[10px] text-muted-foreground/40">Canvas vazio</p>
          </div>
        )}
        {sorted.map((el, i) => {
          const isSelected = el.id === selectedId;
          return (
            <div
              key={el.id}
              onClick={() => onSelect?.(el.id)}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all",
                isSelected
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-muted/30 border border-transparent',
                !el.visible && 'opacity-40'
              )}
            >
              <span className="text-[10px] shrink-0 w-4 text-center">{typeIcons[el.type] || '❓'}</span>
              <span className={cn(
                "text-[10px] flex-1 truncate",
                isSelected ? 'font-semibold text-foreground' : 'text-muted-foreground'
              )}>
                {el.name}
              </span>
              <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100" style={{ opacity: isSelected ? 1 : undefined }}>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleVisibility?.(el.id); }}
                  className="p-0.5 rounded hover:bg-muted/50 transition-colors"
                >
                  {el.visible
                    ? <Eye className="w-3 h-3 text-muted-foreground/40" />
                    : <EyeOff className="w-3 h-3 text-muted-foreground/20" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleLock?.(el.id); }}
                  className="p-0.5 rounded hover:bg-muted/50 transition-colors"
                >
                  {el.locked
                    ? <Lock className="w-3 h-3 text-warning" />
                    : <Unlock className="w-3 h-3 text-muted-foreground/20" />}
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
        <div className="flex items-center gap-1.5 py-1.5 px-1 group cursor-pointer">
          <Icon className="w-3 h-3 text-muted-foreground/50" />
          <span className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wider flex-1 text-left">{title}</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground/30 transition-transform group-data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2 pb-2">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ── Advanced Visual Props ──────────────── */

function AdvancedVisualProps({ props, onChange }: { props: Record<string, any>; onChange: (p: Record<string, any>) => void }) {
  const set = (key: string) => (val: any) => onChange({ [key]: val });

  return (
    <CollapsibleSection title="Efeitos Visuais" icon={Wand2} defaultOpen={false}>
      {/* Gradient */}
      <div className="space-y-1">
        <Label className="text-[9px] font-semibold text-muted-foreground/60 uppercase">Gradiente</Label>
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <Label className="text-[9px]">Cor 1</Label>
            <input type="color" value={props.gradientFrom || ''} onChange={(e) => set('gradientFrom')(e.target.value)} className="w-full h-5 rounded cursor-pointer border-0 bg-transparent" />
          </div>
          <div>
            <Label className="text-[9px]">Cor 2</Label>
            <input type="color" value={props.gradientTo || ''} onChange={(e) => set('gradientTo')(e.target.value)} className="w-full h-5 rounded cursor-pointer border-0 bg-transparent" />
          </div>
        </div>
        <Select value={props.gradientDirection || 'none'} onValueChange={set('gradientDirection')}>
          <SelectTrigger className="h-6 text-[9px]"><SelectValue /></SelectTrigger>
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
      <div className="space-y-1">
        <Label className="text-[9px] font-semibold text-muted-foreground/60 uppercase">Sombra</Label>
        <Select value={props.shadowPreset || 'none'} onValueChange={set('shadowPreset')}>
          <SelectTrigger className="h-6 text-[9px]"><SelectValue /></SelectTrigger>
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
            <Label className="text-[9px]">Cor</Label>
            <input type="color" value={props.shadowColor || '#6366f1'} onChange={(e) => set('shadowColor')(e.target.value)} className="w-full h-5 rounded cursor-pointer border-0 bg-transparent" />
          </div>
        )}
      </div>

      {/* Border */}
      <div className="space-y-1">
        <Label className="text-[9px] font-semibold text-muted-foreground/60 uppercase">Borda</Label>
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <Label className="text-[9px]">Espessura</Label>
            <Input type="number" value={props.borderWidth || 0} onChange={(e) => set('borderWidth')(Number(e.target.value))} className="h-6 text-[9px]" />
          </div>
          <div>
            <Label className="text-[9px]">Cor</Label>
            <input type="color" value={props.borderColor || '#ffffff'} onChange={(e) => set('borderColor')(e.target.value)} className="w-full h-5 rounded cursor-pointer border-0 bg-transparent" />
          </div>
        </div>
      </div>

      {/* Animation */}
      <div className="space-y-1">
        <Label className="text-[9px] font-semibold text-muted-foreground/60 uppercase">Animação</Label>
        <Select value={props.entranceAnimation || 'none'} onValueChange={set('entranceAnimation')}>
          <SelectTrigger className="h-6 text-[9px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma</SelectItem>
            <SelectItem value="fadeIn">Fade In</SelectItem>
            <SelectItem value="slideUp">Slide ↑</SelectItem>
            <SelectItem value="slideLeft">Slide ←</SelectItem>
            <SelectItem value="slideRight">Slide →</SelectItem>
            <SelectItem value="scaleUp">Zoom In</SelectItem>
            <SelectItem value="bounce">Bounce</SelectItem>
            <SelectItem value="pulse">Pulsar</SelectItem>
          </SelectContent>
        </Select>
        {props.entranceAnimation && props.entranceAnimation !== 'none' && (
          <div>
            <Label className="text-[9px]">Atraso (ms)</Label>
            <Input type="number" value={props.entranceDelay || 0} onChange={(e) => set('entranceDelay')(Number(e.target.value))} className="h-6 text-[9px]" step={100} />
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-1.5">
        <Label className="text-[9px] font-semibold text-muted-foreground/60 uppercase">Filtros</Label>
        <div>
          <div className="flex justify-between">
            <Label className="text-[9px]">Blur</Label>
            <span className="text-[8px] text-muted-foreground/40 tabular-nums">{props.filterBlur || 0}px</span>
          </div>
          <Slider value={[props.filterBlur || 0]} onValueChange={([v]) => set('filterBlur')(v)} min={0} max={20} step={1} />
        </div>
        <div>
          <div className="flex justify-between">
            <Label className="text-[9px]">Brilho</Label>
            <span className="text-[8px] text-muted-foreground/40 tabular-nums">{props.filterBrightness ?? 100}%</span>
          </div>
          <Slider value={[props.filterBrightness ?? 100]} onValueChange={([v]) => set('filterBrightness')(v)} min={0} max={200} step={5} />
        </div>
        <div>
          <div className="flex justify-between">
            <Label className="text-[9px]">Saturação</Label>
            <span className="text-[8px] text-muted-foreground/40 tabular-nums">{props.filterSaturation ?? 100}%</span>
          </div>
          <Slider value={[props.filterSaturation ?? 100]} onValueChange={([v]) => set('filterSaturation')(v)} min={0} max={200} step={5} />
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
      <div className="p-3 space-y-3">
        {/* Header with element info + quick actions */}
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-[11px] font-bold text-foreground truncate">{element.name}</h3>
            <p className="text-[8px] text-muted-foreground/50 font-mono">{element.type} • z{element.zIndex}</p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={() => onUpdate({ visible: !element.visible })} title={element.visible ? 'Ocultar' : 'Mostrar'}>
              {element.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={() => onUpdate({ locked: !element.locked })} title={element.locked ? 'Desbloquear' : 'Bloquear'}>
              {element.locked ? <Lock className="w-3 h-3 text-warning" /> : <Unlock className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {/* Quick actions row */}
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="flex-1 h-6 text-[9px] gap-1 px-2" onClick={onDuplicate}><Copy className="w-2.5 h-2.5" /> Duplicar</Button>
          <Button variant="outline" size="sm" className="h-6 px-2" onClick={onBringForward} title="Frente"><ArrowUp className="w-2.5 h-2.5" /></Button>
          <Button variant="outline" size="sm" className="h-6 px-2" onClick={onSendBackward} title="Trás"><ArrowDown className="w-2.5 h-2.5" /></Button>
          <Button variant="destructive" size="sm" className="h-6 px-2" onClick={onDelete} title="Excluir"><Trash2 className="w-2.5 h-2.5" /></Button>
        </div>

        {/* Position & Size */}
        <CollapsibleSection title="Posição" icon={Move} defaultOpen={true}>
          <div className="grid grid-cols-2 gap-1.5">
            <Field label="X" value={element.x} onChange={(v) => onUpdate({ x: v })} />
            <Field label="Y" value={element.y} onChange={(v) => onUpdate({ y: v })} />
            <Field label="L" value={element.width} onChange={(v) => onUpdate({ width: v })} />
            <Field label="A" value={element.height} onChange={(v) => onUpdate({ height: v })} />
          </div>
          <div>
            <div className="flex justify-between">
              <Label className="text-[9px] text-muted-foreground">Opacidade</Label>
              <span className="text-[8px] text-muted-foreground/40 tabular-nums">{Math.round(element.opacity * 100)}%</span>
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
        <CollapsibleSection title="Conteúdo" icon={Sparkles} defaultOpen={true}>
          <TypeProps type={element.type} props={element.props} onChange={onUpdateProps} views={views} />
        </CollapsibleSection>

        {/* Page assignment */}
        {views && views.length > 0 && onAssignView && (
          <CollapsibleSection title="Página" icon={Globe} defaultOpen={false}>
            <Select
              value={element.viewId || '__global__'}
              onValueChange={(v) => onAssignView(element.id, v === '__global__' ? null : v)}
            >
              <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__global__">
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Global</span>
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
