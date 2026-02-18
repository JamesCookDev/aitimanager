import { useNode } from '@craftjs/core';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import type { ButtonBlockProps } from '../components/ButtonBlock';

export function ButtonBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props as ButtonBlockProps }));

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Texto do botão</Label>
        <Input
          value={props.label}
          onChange={(e) => setProp((p: ButtonBlockProps) => { p.label = e.target.value; })}
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Cor de fundo</Label>
          <Input
            type="color"
            value={props.bgColor}
            onChange={(e) => setProp((p: ButtonBlockProps) => { p.bgColor = e.target.value; })}
            className="mt-1 h-10 cursor-pointer"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Cor do texto</Label>
          <Input
            type="color"
            value={props.textColor}
            onChange={(e) => setProp((p: ButtonBlockProps) => { p.textColor = e.target.value; })}
            className="mt-1 h-10 cursor-pointer"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Tamanho da fonte: {props.fontSize}px</Label>
        <Slider
          value={[props.fontSize]}
          onValueChange={([v]) => setProp((p: ButtonBlockProps) => { p.fontSize = v; })}
          min={12} max={32} step={1} className="mt-2"
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Borda arredondada: {props.borderRadius}px</Label>
        <Slider
          value={[props.borderRadius]}
          onValueChange={([v]) => setProp((p: ButtonBlockProps) => { p.borderRadius = v; })}
          min={0} max={30} step={1} className="mt-2"
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Padding horizontal: {props.paddingX}px</Label>
        <Slider
          value={[props.paddingX]}
          onValueChange={([v]) => setProp((p: ButtonBlockProps) => { p.paddingX = v; })}
          min={8} max={64} step={2} className="mt-2"
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Padding vertical: {props.paddingY}px</Label>
        <Slider
          value={[props.paddingY]}
          onValueChange={([v]) => setProp((p: ButtonBlockProps) => { p.paddingY = v; })}
          min={4} max={32} step={2} className="mt-2"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Largura total</Label>
        <Switch
          checked={props.fullWidth}
          onCheckedChange={(v) => setProp((p: ButtonBlockProps) => { p.fullWidth = v; })}
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Ação (prompt ou URL)</Label>
        <Input
          value={props.action}
          onChange={(e) => setProp((p: ButtonBlockProps) => { p.action = e.target.value; })}
          placeholder="ex: Quem é você?"
          className="mt-1"
        />
      </div>
    </div>
  );
}
