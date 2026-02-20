import { useNode } from '@craftjs/core';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { ContainerBlockProps } from '../components/ContainerBlock';
import { LayoutSettingsPanel } from '../shared/LayoutSettingsPanel';

export function ContainerBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as Partial<ContainerBlockProps>,
  }));

  const p: ContainerBlockProps = {
    bgColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    paddingIndividual: false,
    gap: 10,
    direction: 'column',
    wrap: 'nowrap',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    width: 'auto',
    height: 'auto',
    minHeight: 80,
    opacity: 1,
    bgOpacity: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    shadow: 'sm',
    blur: 16,
    overflow: 'visible',
    borderRadius: 24,
    ...(props || {}),
  };

  const set = (field: keyof ContainerBlockProps, value: any) =>
    setProp((pr: any) => { pr[field] = value; });

  return (
    <div className="space-y-1">
      <Accordion type="multiple" defaultValue={['layout', 'tamanho', 'visual', 'borda']} className="space-y-0.5">

        {/* LAYOUT */}
        <AccordionItem value="layout" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">📐 Direção & Alinhamento</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">

            {/* Direção com toggle visual */}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Direção</Label>
              <div className="flex gap-1.5">
                {([
                  { value: 'column', label: '↕ Vertical' },
                  { value: 'row', label: '↔ Horizontal' },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('direction', opt.value)}
                    className={`flex-1 py-1.5 rounded-md text-[10px] font-medium border transition-all ${p.direction === opt.value ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-muted/30 border-border/40 text-muted-foreground'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Wrap */}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Quebra de linha (wrap)</Label>
              <Select value={p.wrap || 'nowrap'} onValueChange={(v) => set('wrap', v as any)}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nowrap">Sem quebra</SelectItem>
                  <SelectItem value="wrap">Quebrar linha</SelectItem>
                  <SelectItem value="wrap-reverse">Quebrar inverso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Align Items */}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Alinhar itens (eixo cruzado)</Label>
              <Select value={p.alignItems} onValueChange={(v) => set('alignItems', v as any)}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="flex-start">Início</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="flex-end">Fim</SelectItem>
                  <SelectItem value="stretch">Esticar</SelectItem>
                  <SelectItem value="baseline">Baseline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Justify Content */}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Justificar (eixo principal)</Label>
              <Select value={p.justifyContent} onValueChange={(v) => set('justifyContent', v as any)}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="flex-start">Início</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="flex-end">Fim</SelectItem>
                  <SelectItem value="space-between">Espaço entre</SelectItem>
                  <SelectItem value="space-around">Espaço ao redor</SelectItem>
                  <SelectItem value="space-evenly">Espaço uniforme</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gap */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <Label className="text-[10px] text-muted-foreground">Espaço entre filhos (gap)</Label>
                <span className="text-[10px] font-mono text-muted-foreground">{p.gap}px</span>
              </div>
              <Slider value={[p.gap]} onValueChange={([v]) => set('gap', v)} min={0} max={64} step={2} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* TAMANHO */}
        <AccordionItem value="tamanho" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">📏 Tamanho & Espaçamento</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">

            {/* Width */}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Largura</Label>
              <div className="flex gap-1.5">
                {(['auto', '100%', '75%', '50%'] as const).map(w => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => set('width', w)}
                    className={`flex-1 py-1 rounded text-[10px] font-medium border transition-all ${p.width === w ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-muted/30 border-border/40 text-muted-foreground'}`}
                  >
                    {w}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Ex: 320px"
                value={!['auto', '100%', '75%', '50%'].includes(p.width || 'auto') ? p.width || '' : ''}
                onChange={(e) => set('width', e.target.value || 'auto')}
                className="h-7 text-xs mt-1"
              />
            </div>

            {/* Height */}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Altura</Label>
              <div className="flex gap-1.5">
                {(['auto', '100%', '50%'] as const).map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => set('height', h)}
                    className={`flex-1 py-1 rounded text-[10px] font-medium border transition-all ${p.height === h ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-muted/30 border-border/40 text-muted-foreground'}`}
                  >
                    {h}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Ex: 200px"
                value={!['auto', '100%', '50%'].includes(p.height || 'auto') ? p.height || '' : ''}
                onChange={(e) => set('height', e.target.value || 'auto')}
                className="h-7 text-xs mt-1"
              />
            </div>

            {/* Min Height */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <Label className="text-[10px] text-muted-foreground">Altura mínima</Label>
                <span className="text-[10px] font-mono text-muted-foreground">{p.minHeight}px</span>
              </div>
              <Slider value={[p.minHeight]} onValueChange={([v]) => set('minHeight', v)} min={0} max={800} step={10} />
            </div>

            {/* Overflow */}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Overflow</Label>
              <Select value={p.overflow || 'visible'} onValueChange={(v) => set('overflow', v as any)}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="visible">Visível</SelectItem>
                  <SelectItem value="hidden">Oculto</SelectItem>
                  <SelectItem value="auto">Scroll automático</SelectItem>
                  <SelectItem value="scroll">Sempre scroll</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Padding */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-muted-foreground">Padding individual</Label>
                <Switch
                  checked={p.paddingIndividual}
                  onCheckedChange={(v) => set('paddingIndividual', v)}
                />
              </div>

              {!p.paddingIndividual ? (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-[10px] text-muted-foreground">Padding</Label>
                    <span className="text-[10px] font-mono text-muted-foreground">{p.padding}px</span>
                  </div>
                  <Slider value={[p.padding]} onValueChange={([v]) => set('padding', v)} min={0} max={80} step={2} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: 'paddingTop', label: '↑ Topo' },
                    { key: 'paddingRight', label: '→ Direita' },
                    { key: 'paddingBottom', label: '↓ Base' },
                    { key: 'paddingLeft', label: '← Esquerda' },
                  ] as const).map(({ key, label }) => (
                    <div key={key} className="space-y-0.5">
                      <Label className="text-[10px] text-muted-foreground">{label}</Label>
                      <Input
                        type="number"
                        value={p[key] ?? p.padding}
                        onChange={(e) => set(key, Number(e.target.value))}
                        className="h-7 text-xs text-center"
                        min={0} max={120}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* VISUAL */}
        <AccordionItem value="visual" className="border-b border-border/50 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">🎨 Visual</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Cor de fundo</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={p.bgColor?.startsWith('rgba') ? '#1a1a2e' : p.bgColor}
                  onChange={(e) => set('bgColor', e.target.value + '18')}
                  className="h-7 w-12 rounded border border-border cursor-pointer"
                />
                <Input
                  value={p.bgColor || ''}
                  onChange={(e) => set('bgColor', e.target.value)}
                  className="h-7 text-xs font-mono flex-1"
                  placeholder="rgba(255,255,255,0.05)"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <Label className="text-[10px] text-muted-foreground">Blur de fundo</Label>
                <span className="text-[10px] font-mono text-muted-foreground">{p.blur}px</span>
              </div>
              <Slider value={[p.blur]} onValueChange={([v]) => set('blur', v)} min={0} max={40} step={1} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <Label className="text-[10px] text-muted-foreground">Opacidade</Label>
                <span className="text-[10px] font-mono text-muted-foreground">{Math.round((p.opacity ?? 1) * 100)}%</span>
              </div>
              <Slider value={[(p.opacity ?? 1) * 100]} onValueChange={([v]) => set('opacity', v / 100)} min={10} max={100} step={5} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <Label className="text-[10px] text-muted-foreground">Arredondamento</Label>
                <span className="text-[10px] font-mono text-muted-foreground">{p.borderRadius}px</span>
              </div>
              <Slider value={[p.borderRadius]} onValueChange={([v]) => set('borderRadius', v)} min={0} max={64} step={2} />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Sombra</Label>
              <Select value={p.shadow ?? 'none'} onValueChange={(v) => set('shadow', v as any)}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="sm">Leve</SelectItem>
                  <SelectItem value="md">Média</SelectItem>
                  <SelectItem value="lg">Forte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* BORDA */}
        <AccordionItem value="borda" className="border-b-0 px-0.5">
          <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2.5">🔲 Borda</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between">
                <Label className="text-[10px] text-muted-foreground">Espessura</Label>
                <span className="text-[10px] font-mono text-muted-foreground">{p.borderWidth}px</span>
              </div>
              <Slider value={[p.borderWidth ?? 0]} onValueChange={([v]) => set('borderWidth', v)} min={0} max={8} step={1} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Cor da borda</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={p.borderColor?.startsWith('rgba') ? '#ffffff' : p.borderColor}
                  onChange={(e) => set('borderColor', e.target.value)}
                  className="h-7 w-12 rounded border border-border cursor-pointer"
                />
                <Input
                  value={p.borderColor || ''}
                  onChange={(e) => set('borderColor', e.target.value)}
                  className="h-7 text-xs font-mono flex-1"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <LayoutSettingsPanel />
    </div>
  );
}
