import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { LayoutProps } from './layoutProps';

/**
 * Reusable layout settings panel that can be included in any block's settings.
 * Provides width, height, margins, alignment, overflow, position, and z-index controls.
 */
export function LayoutSettingsPanel() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));
  const [open, setOpen] = useState(false);

  const lp = props as Partial<LayoutProps>;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="pt-3 border-t border-border">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-1 group">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">📐 Layout & Posição</h4>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pt-3">
        {/* Width & Height */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">Largura</Label>
            <Select
              value={lp.layoutWidth || 'auto'}
              onValueChange={(v) => setProp((p: any) => { p.layoutWidth = v; })}
            >
              <SelectTrigger className="mt-1 h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="100%">100%</SelectItem>
                <SelectItem value="75%">75%</SelectItem>
                <SelectItem value="50%">50%</SelectItem>
                <SelectItem value="fit-content">Ajustar</SelectItem>
                <SelectItem value="custom">Customizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Altura</Label>
            <Select
              value={lp.layoutHeight || 'auto'}
              onValueChange={(v) => setProp((p: any) => { p.layoutHeight = v; })}
            >
              <SelectTrigger className="mt-1 h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="100%">100%</SelectItem>
                <SelectItem value="50%">50%</SelectItem>
                <SelectItem value="custom">Customizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Custom width/height inputs */}
        {(lp.layoutWidth === 'custom' || lp.layoutHeight === 'custom') && (
          <div className="grid grid-cols-2 gap-2">
            {lp.layoutWidth === 'custom' && (
              <div>
                <Label className="text-[10px] text-muted-foreground">Largura (px)</Label>
                <Input
                  type="number"
                  value={parseInt(String(lp.layoutWidth)) || 200}
                  onChange={(e) => setProp((p: any) => { p.layoutWidth = `${e.target.value}px`; })}
                  className="mt-1 h-7 text-xs"
                  min={20}
                  max={2000}
                />
              </div>
            )}
            {lp.layoutHeight === 'custom' && (
              <div>
                <Label className="text-[10px] text-muted-foreground">Altura (px)</Label>
                <Input
                  type="number"
                  value={parseInt(String(lp.layoutHeight)) || 100}
                  onChange={(e) => setProp((p: any) => { p.layoutHeight = `${e.target.value}px`; })}
                  className="mt-1 h-7 text-xs"
                  min={20}
                  max={2000}
                />
              </div>
            )}
          </div>
        )}

        {/* Margins */}
        <div>
          <Label className="text-[10px] text-muted-foreground">Margens (px)</Label>
          <div className="grid grid-cols-4 gap-1.5 mt-1">
            {(['marginTop', 'marginRight', 'marginBottom', 'marginLeft'] as const).map((key) => (
              <div key={key} className="flex flex-col items-center">
                <span className="text-[8px] text-muted-foreground/60 mb-0.5">
                  {key === 'marginTop' ? '↑' : key === 'marginRight' ? '→' : key === 'marginBottom' ? '↓' : '←'}
                </span>
                <Input
                  type="number"
                  value={lp[key] || 0}
                  onChange={(e) => setProp((p: any) => { p[key] = Number(e.target.value); })}
                  className="h-6 text-[10px] text-center px-1"
                  min={-100}
                  max={200}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Align Self */}
        <div>
          <Label className="text-[10px] text-muted-foreground">Alinhar no container</Label>
          <Select
            value={lp.alignSelf || 'auto'}
            onValueChange={(v) => setProp((p: any) => { p.alignSelf = v; })}
          >
            <SelectTrigger className="mt-1 h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="flex-start">Início</SelectItem>
              <SelectItem value="center">Centro</SelectItem>
              <SelectItem value="flex-end">Fim</SelectItem>
              <SelectItem value="stretch">Esticar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overflow */}
        <div>
          <Label className="text-[10px] text-muted-foreground">Overflow</Label>
          <Select
            value={lp.overflow || 'visible'}
            onValueChange={(v) => setProp((p: any) => { p.overflow = v; })}
          >
            <SelectTrigger className="mt-1 h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="visible">Visível</SelectItem>
              <SelectItem value="hidden">Oculto</SelectItem>
              <SelectItem value="auto">Scroll auto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Position */}
        <div>
          <Label className="text-[10px] text-muted-foreground">Posição</Label>
          <Select
            value={lp.positionType || 'relative'}
            onValueChange={(v) => setProp((p: any) => { p.positionType = v; })}
          >
            <SelectTrigger className="mt-1 h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="relative">Relativo</SelectItem>
              <SelectItem value="absolute">Absoluto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {lp.positionType === 'absolute' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Top: {lp.positionTop || 0}px</Label>
              <Slider
                value={[lp.positionTop || 0]}
                onValueChange={([v]) => setProp((p: any) => { p.positionTop = v; })}
                min={-500} max={1500} step={5} className="mt-1"
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Left: {lp.positionLeft || 0}px</Label>
              <Slider
                value={[lp.positionLeft || 0]}
                onValueChange={([v]) => setProp((p: any) => { p.positionLeft = v; })}
                min={-500} max={1500} step={5} className="mt-1"
              />
            </div>
          </div>
        )}

        {/* Z-Index */}
        <div>
          <Label className="text-[10px] text-muted-foreground">Z-Index: {lp.zIndex || 0}</Label>
          <Slider
            value={[lp.zIndex || 0]}
            onValueChange={([v]) => setProp((p: any) => { p.zIndex = v; })}
            min={0} max={100} step={1} className="mt-1"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
