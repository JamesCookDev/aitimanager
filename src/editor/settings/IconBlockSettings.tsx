import { useNode } from '@craftjs/core';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IconBlockProps } from '../components/IconBlock';

export function IconBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as IconBlockProps,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Emoji / Ícone</Label>
        <Input value={props.emoji} onChange={(e) => setProp((p: IconBlockProps) => { p.emoji = e.target.value; })} className="mt-1 text-2xl text-center" />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Tamanho: {props.size}px</Label>
        <Slider value={[props.size]} onValueChange={([v]) => setProp((p: IconBlockProps) => { p.size = v; })} min={16} max={80} step={2} className="mt-2" />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Alinhamento</Label>
        <Select value={props.align} onValueChange={(v) => setProp((p: IconBlockProps) => { p.align = v as any; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Esquerda</SelectItem>
            <SelectItem value="center">Centro</SelectItem>
            <SelectItem value="right">Direita</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Fundo</Label>
        <Switch checked={props.bgEnabled} onCheckedChange={(v) => setProp((p: IconBlockProps) => { p.bgEnabled = v; })} />
      </div>

      {props.bgEnabled && (
        <>
          <div>
            <Label className="text-xs text-muted-foreground">Tamanho fundo: {props.bgSize}px</Label>
            <Slider value={[props.bgSize]} onValueChange={([v]) => setProp((p: IconBlockProps) => { p.bgSize = v; })} min={24} max={120} step={4} className="mt-2" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Arredondamento: {props.bgBorderRadius}px</Label>
            <Slider value={[props.bgBorderRadius]} onValueChange={([v]) => setProp((p: IconBlockProps) => { p.bgBorderRadius = v; })} min={0} max={60} step={2} className="mt-2" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Cor de fundo</Label>
            <Input type="color" value="#6366f1" onChange={(e) => setProp((p: IconBlockProps) => { p.bgColor = e.target.value + '33'; p.borderColor = e.target.value + '55'; })} className="mt-1 h-10 cursor-pointer" />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Sombra</Label>
            <Switch checked={props.shadow} onCheckedChange={(v) => setProp((p: IconBlockProps) => { p.shadow = v; })} />
          </div>
        </>
      )}
    </div>
  );
}
