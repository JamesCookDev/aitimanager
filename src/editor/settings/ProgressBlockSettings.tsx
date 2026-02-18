import { useNode } from '@craftjs/core';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import type { ProgressBlockProps } from '../components/ProgressBlock';

export function ProgressBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as ProgressBlockProps,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Label</Label>
        <Input value={props.label} onChange={(e) => setProp((p: ProgressBlockProps) => { p.label = e.target.value; })} className="mt-1" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Valor: {props.value}</Label>
        <Slider value={[props.value]} onValueChange={([v]) => setProp((p: ProgressBlockProps) => { p.value = v; })} min={0} max={props.maxValue} step={1} className="mt-2" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Valor máximo: {props.maxValue}</Label>
        <Slider value={[props.maxValue]} onValueChange={([v]) => setProp((p: ProgressBlockProps) => { p.maxValue = v; })} min={1} max={1000} step={1} className="mt-2" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Altura: {props.height}px</Label>
        <Slider value={[props.height]} onValueChange={([v]) => setProp((p: ProgressBlockProps) => { p.height = v; })} min={4} max={40} step={2} className="mt-2" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Arredondamento: {props.borderRadius}px</Label>
        <Slider value={[props.borderRadius]} onValueChange={([v]) => setProp((p: ProgressBlockProps) => { p.borderRadius = v; })} min={0} max={99} step={1} className="mt-2" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Cor barra</Label>
          <Input type="color" value={props.barColor} onChange={(e) => setProp((p: ProgressBlockProps) => { p.barColor = e.target.value; })} className="mt-1 h-10 cursor-pointer" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Cor label</Label>
          <Input type="color" value={props.labelColor} onChange={(e) => setProp((p: ProgressBlockProps) => { p.labelColor = e.target.value; })} className="mt-1 h-10 cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Mostrar label</Label>
        <Switch checked={props.showLabel} onCheckedChange={(v) => setProp((p: ProgressBlockProps) => { p.showLabel = v; })} />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Mostrar %</Label>
        <Switch checked={props.showPercentage} onCheckedChange={(v) => setProp((p: ProgressBlockProps) => { p.showPercentage = v; })} />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Animado</Label>
        <Switch checked={props.animated} onCheckedChange={(v) => setProp((p: ProgressBlockProps) => { p.animated = v; })} />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Listrado</Label>
        <Switch checked={props.striped} onCheckedChange={(v) => setProp((p: ProgressBlockProps) => { p.striped = v; })} />
      </div>
    </div>
  );
}
