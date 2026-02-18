import { useNode } from '@craftjs/core';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { GradientTextBlockProps } from '../components/GradientTextBlock';

export function GradientTextBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as GradientTextBlockProps,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Texto</Label>
        <Input value={props.text} onChange={(e) => setProp((p: GradientTextBlockProps) => { p.text = e.target.value; })} className="mt-1" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Tamanho: {props.fontSize}px</Label>
        <Slider value={[props.fontSize]} onValueChange={([v]) => setProp((p: GradientTextBlockProps) => { p.fontSize = v; })} min={12} max={96} step={1} className="mt-2" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Peso</Label>
        <Select value={props.fontWeight} onValueChange={(v) => setProp((p: GradientTextBlockProps) => { p.fontWeight = v as any; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="semibold">Semibold</SelectItem>
            <SelectItem value="bold">Bold</SelectItem>
            <SelectItem value="extrabold">Extrabold</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Transform</Label>
        <Select value={props.textTransform} onValueChange={(v) => setProp((p: GradientTextBlockProps) => { p.textTransform = v as any; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Normal</SelectItem>
            <SelectItem value="uppercase">MAIÚSCULAS</SelectItem>
            <SelectItem value="lowercase">minúsculas</SelectItem>
            <SelectItem value="capitalize">Capitalizar</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Alinhamento</Label>
        <Select value={props.textAlign} onValueChange={(v) => setProp((p: GradientTextBlockProps) => { p.textAlign = v as any; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Esquerda</SelectItem>
            <SelectItem value="center">Centro</SelectItem>
            <SelectItem value="right">Direita</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Ângulo: {props.gradientAngle}°</Label>
        <Slider value={[props.gradientAngle]} onValueChange={([v]) => setProp((p: GradientTextBlockProps) => { p.gradientAngle = v; })} min={0} max={360} step={5} className="mt-2" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Cor início</Label>
          <Input type="color" value={props.gradientFrom} onChange={(e) => setProp((p: GradientTextBlockProps) => { p.gradientFrom = e.target.value; })} className="mt-1 h-10 cursor-pointer" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Cor fim</Label>
          <Input type="color" value={props.gradientTo} onChange={(e) => setProp((p: GradientTextBlockProps) => { p.gradientTo = e.target.value; })} className="mt-1 h-10 cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Cor intermediária</Label>
        <Switch checked={props.useVia} onCheckedChange={(v) => setProp((p: GradientTextBlockProps) => { p.useVia = v; })} />
      </div>
      {props.useVia && (
        <div>
          <Label className="text-xs text-muted-foreground">Cor via</Label>
          <Input type="color" value={props.gradientVia} onChange={(e) => setProp((p: GradientTextBlockProps) => { p.gradientVia = e.target.value; })} className="mt-1 h-10 cursor-pointer" />
        </div>
      )}
      <div>
        <Label className="text-xs text-muted-foreground">Espaço letras: {props.letterSpacing}px</Label>
        <Slider value={[props.letterSpacing]} onValueChange={([v]) => setProp((p: GradientTextBlockProps) => { p.letterSpacing = v; })} min={-2} max={12} step={0.5} className="mt-2" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Altura da linha: {props.lineHeight}</Label>
        <Slider value={[props.lineHeight * 10]} onValueChange={([v]) => setProp((p: GradientTextBlockProps) => { p.lineHeight = v / 10; })} min={8} max={25} step={1} className="mt-2" />
      </div>
    </div>
  );
}
