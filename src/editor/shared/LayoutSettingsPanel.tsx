import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useRef, useState } from 'react';
import type { LayoutProps } from './layoutProps';

/**
 * Painel de layout pixel-perfect com controle total:
 * width, height, top, left, right, bottom (inputs numéricos diretos),
 * posição absoluta/relativa, z-index e alinhamento.
 */
export function LayoutSettingsPanel() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));
  const openRef = useRef(false);
  const [open, setOpenState] = useState(false);
  const setOpen = (v: boolean) => { openRef.current = v; setOpenState(v); };

  const lp = props as Partial<LayoutProps> & {
    positionRight?: number;
    positionBottom?: number;
    layoutWidthPx?: number;
    layoutHeightPx?: number;
  };

  const isAbsolute = lp.positionType === 'absolute';

  /** Número extraído de qualquer valor de width/height */
  const parsePx = (v: string | undefined, fallback = 200) =>
    v && v !== 'auto' ? parseInt(v) || fallback : fallback;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="pt-3 border-t border-border">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-1 group">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">📐 Layout & Posição</h4>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-3">

        {/* Tipo de Posição */}
        <div>
          <Label className="text-[10px] text-muted-foreground">Posição</Label>
          <div className="flex gap-1.5 mt-1">
            {(['relative', 'absolute'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setProp((p: any) => { p.positionType = type; })}
                className={`flex-1 py-1.5 rounded-md text-[10px] font-medium border transition-all ${lp.positionType === type ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-muted/30 border-border/40 text-muted-foreground hover:border-border'}`}
              >
                {type === 'relative' ? '📄 Relativo' : '📌 Absoluto'}
              </button>
            ))}
          </div>
        </div>

        {/* Tamanho */}
        <div>
          <Label className="text-[10px] text-muted-foreground mb-1 block">Tamanho</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground/70">Largura</Label>
              <Select
                value={lp.layoutWidth || 'auto'}
                onValueChange={(v) => setProp((p: any) => { p.layoutWidth = v; })}
              >
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="100%">100%</SelectItem>
                  <SelectItem value="75%">75%</SelectItem>
                  <SelectItem value="50%">50%</SelectItem>
                  <SelectItem value="fit-content">Ajustar</SelectItem>
                  <SelectItem value="custom">Pixels</SelectItem>
                </SelectContent>
              </Select>
              {lp.layoutWidth === 'custom' && (
                <Input
                  type="number"
                  value={parsePx(lp.layoutWidth)}
                  onChange={(e) => setProp((p: any) => { p.layoutWidth = `${e.target.value}px`; })}
                  className="h-7 text-xs mt-1"
                  min={20} max={2000}
                  placeholder="px"
                />
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground/70">Altura</Label>
              <Select
                value={lp.layoutHeight || 'auto'}
                onValueChange={(v) => setProp((p: any) => { p.layoutHeight = v; })}
              >
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="100%">100%</SelectItem>
                  <SelectItem value="50%">50%</SelectItem>
                  <SelectItem value="custom">Pixels</SelectItem>
                </SelectContent>
              </Select>
              {lp.layoutHeight === 'custom' && (
                <Input
                  type="number"
                  value={parsePx(lp.layoutHeight, 100)}
                  onChange={(e) => setProp((p: any) => { p.layoutHeight = `${e.target.value}px`; })}
                  className="h-7 text-xs mt-1"
                  min={20} max={2000}
                  placeholder="px"
                />
              )}
            </div>
          </div>
        </div>

        {/* Posição Absoluta — grade 4 campos (top/right/bottom/left) */}
        {isAbsolute && (
          <div>
            <Label className="text-[10px] text-muted-foreground mb-1.5 block">
              Coordenadas (px) — <span className="text-muted-foreground/60">deixe em branco para ignorar</span>
            </Label>
            {/* Grid visual tipo "bússola" */}
            <div className="grid grid-cols-3 gap-1 place-items-center">
              {/* Linha 1: vazio | top | vazio */}
              <div />
              <div className="w-full space-y-0.5">
                <Label className="text-[10px] text-muted-foreground/60 text-center block">↑ Top</Label>
                <Input
                  type="number"
                  value={lp.positionTop ?? 0}
                  onChange={(e) => setProp((p: any) => { p.positionTop = Number(e.target.value); })}
                  className="h-7 text-xs text-center"
                />
              </div>
              <div />
              {/* Linha 2: left | z-index | right */}
              <div className="w-full space-y-0.5">
                <Label className="text-[10px] text-muted-foreground/60 text-center block">← Left</Label>
                <Input
                  type="number"
                  value={lp.positionLeft ?? 0}
                  onChange={(e) => setProp((p: any) => { p.positionLeft = Number(e.target.value); })}
                  className="h-7 text-xs text-center"
                />
              </div>
              <div className="flex flex-col items-center justify-center h-7">
                <span className="text-[10px] text-muted-foreground/40">⊕</span>
              </div>
              <div className="w-full space-y-0.5">
                <Label className="text-[10px] text-muted-foreground/60 text-center block">Right →</Label>
                <Input
                  type="number"
                  value={(lp as any).positionRight ?? ''}
                  placeholder="—"
                  onChange={(e) => setProp((p: any) => { p.positionRight = e.target.value === '' ? undefined : Number(e.target.value); })}
                  className="h-7 text-xs text-center"
                />
              </div>
              {/* Linha 3: vazio | bottom | vazio */}
              <div />
              <div className="w-full space-y-0.5">
                <Label className="text-[10px] text-muted-foreground/60 text-center block">↓ Bottom</Label>
                <Input
                  type="number"
                  value={(lp as any).positionBottom ?? ''}
                  placeholder="—"
                  onChange={(e) => setProp((p: any) => { p.positionBottom = e.target.value === '' ? undefined : Number(e.target.value); })}
                  className="h-7 text-xs text-center"
                />
              </div>
              <div />
            </div>
          </div>
        )}

        {/* Margens — apenas para modo relativo */}
        {!isAbsolute && (
          <div>
            <Label className="text-[10px] text-muted-foreground mb-1 block">Margens (px)</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { key: 'marginTop', label: '↑' },
                { key: 'marginRight', label: '→' },
                { key: 'marginBottom', label: '↓' },
                { key: 'marginLeft', label: '←' },
              ] as const).map(({ key, label }) => (
                <div key={key} className="flex flex-col items-center gap-0.5">
                  <span className="text-[8px] text-muted-foreground/60">{label}</span>
                  <Input
                    type="number"
                    value={lp[key] || 0}
                    onChange={(e) => setProp((p: any) => { p[key] = Number(e.target.value); })}
                    className="h-6 text-[10px] text-center px-1"
                    min={-200} max={500}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Z-Index */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Label className="text-[10px] text-muted-foreground">Z-Index (camada)</Label>
            <Input
              type="number"
              value={lp.zIndex ?? 0}
              onChange={(e) => setProp((p: any) => { p.zIndex = Number(e.target.value); })}
              className="h-7 text-xs mt-1"
              min={0} max={999}
            />
          </div>
          {!isAbsolute && (
            <div className="flex-1">
              <Label className="text-[10px] text-muted-foreground">Alinhar</Label>
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
          )}
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

      </CollapsibleContent>
    </Collapsible>
  );
}
