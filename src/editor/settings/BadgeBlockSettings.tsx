import { useNode } from '@craftjs/core';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BadgeBlockProps } from '../components/BadgeBlock';

export function BadgeBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as BadgeBlockProps,
  }));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="w-16">
          <Label className="text-xs text-muted-foreground">Emoji</Label>
          <Input value={props.emoji} onChange={(e) => setProp((p: BadgeBlockProps) => { p.emoji = e.target.value; })} className="mt-1 text-center" />
        </div>
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Texto</Label>
          <Input value={props.text} onChange={(e) => setProp((p: BadgeBlockProps) => { p.text = e.target.value; })} className="mt-1" />
        </div>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Variante</Label>
        <Select value={props.variant} onValueChange={(v) => setProp((p: BadgeBlockProps) => { p.variant = v as any; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="glass">Glass</SelectItem>
            <SelectItem value="filled">Preenchido</SelectItem>
            <SelectItem value="outline">Contorno</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Alinhamento</Label>
        <Select value={props.align} onValueChange={(v) => setProp((p: BadgeBlockProps) => { p.align = v as any; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Esquerda</SelectItem>
            <SelectItem value="center">Centro</SelectItem>
            <SelectItem value="right">Direita</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Cor</Label>
          <Input type="color" value={props.bgColor} onChange={(e) => setProp((p: BadgeBlockProps) => { p.bgColor = e.target.value; })} className="mt-1 h-10 cursor-pointer" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Cor texto</Label>
          <Input type="color" value={props.textColor} onChange={(e) => setProp((p: BadgeBlockProps) => { p.textColor = e.target.value; })} className="mt-1 h-10 cursor-pointer" />
        </div>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Tamanho: {props.fontSize}px</Label>
        <Slider value={[props.fontSize]} onValueChange={([v]) => setProp((p: BadgeBlockProps) => { p.fontSize = v; })} min={10} max={24} step={1} className="mt-2" />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Pulsante</Label>
        <Switch checked={props.pulse} onCheckedChange={(v) => setProp((p: BadgeBlockProps) => { p.pulse = v; })} />
      </div>
    </div>
  );
}
