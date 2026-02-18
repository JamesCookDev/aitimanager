import { useNode } from '@craftjs/core';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CardBlockProps } from '../components/CardBlock';

export function CardBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as CardBlockProps,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Cabeçalho</Label>
        <Switch checked={props.showHeader} onCheckedChange={(v) => setProp((p: CardBlockProps) => { p.showHeader = v; })} />
      </div>

      {props.showHeader && (
        <>
          <div className="flex gap-2">
            <div className="w-14">
              <Label className="text-xs text-muted-foreground">Ícone</Label>
              <Input value={props.headerIcon} onChange={(e) => setProp((p: CardBlockProps) => { p.headerIcon = e.target.value; })} className="mt-1 text-center" />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Título</Label>
              <Input value={props.title} onChange={(e) => setProp((p: CardBlockProps) => { p.title = e.target.value; })} className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Subtítulo</Label>
            <Input value={props.subtitle} onChange={(e) => setProp((p: CardBlockProps) => { p.subtitle = e.target.value; })} className="mt-1" />
          </div>
        </>
      )}

      <div>
        <Label className="text-xs text-muted-foreground">Elevação</Label>
        <Select value={props.elevation} onValueChange={(v) => setProp((p: CardBlockProps) => { p.elevation = v as any; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma</SelectItem>
            <SelectItem value="sm">Suave</SelectItem>
            <SelectItem value="md">Média</SelectItem>
            <SelectItem value="lg">Forte</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Arredondamento: {props.borderRadius}px</Label>
        <Slider value={[props.borderRadius]} onValueChange={([v]) => setProp((p: CardBlockProps) => { p.borderRadius = v; })} min={0} max={32} step={2} className="mt-2" />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Padding: {props.padding}px</Label>
        <Slider value={[props.padding]} onValueChange={([v]) => setProp((p: CardBlockProps) => { p.padding = v; })} min={8} max={40} step={2} className="mt-2" />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Blur: {props.bgBlur}px</Label>
        <Slider value={[props.bgBlur]} onValueChange={([v]) => setProp((p: CardBlockProps) => { p.bgBlur = v; })} min={0} max={30} step={1} className="mt-2" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Cor fundo</Label>
          <Input type="color" value="#1a1a2e" onChange={(e) => setProp((p: CardBlockProps) => { p.bgColor = e.target.value + '18'; })} className="mt-1 h-10 cursor-pointer" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Cor borda</Label>
          <Input type="color" value="#ffffff" onChange={(e) => setProp((p: CardBlockProps) => { p.borderColor = e.target.value + '1a'; })} className="mt-1 h-10 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
