import { useNode } from '@craftjs/core';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ContainerBlockProps } from '../components/ContainerBlock';

export function ContainerBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props as ContainerBlockProps }));

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Cor de fundo</Label>
        <Input type="color" value={props.bgColor?.startsWith('rgba') ? '#1a1a2e' : props.bgColor} onChange={(e) => setProp((p: ContainerBlockProps) => { p.bgColor = e.target.value + '18'; })} className="mt-1 h-10 cursor-pointer" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Direção</Label>
        <Select value={props.direction} onValueChange={(v) => setProp((p: ContainerBlockProps) => { p.direction = v as any; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="column">Coluna</SelectItem>
            <SelectItem value="row">Linha</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Alinhar itens</Label>
        <Select value={props.alignItems} onValueChange={(v) => setProp((p: ContainerBlockProps) => { p.alignItems = v as any; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="flex-start">Início</SelectItem>
            <SelectItem value="center">Centro</SelectItem>
            <SelectItem value="flex-end">Fim</SelectItem>
            <SelectItem value="stretch">Esticar</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Justificar</Label>
        <Select value={props.justifyContent} onValueChange={(v) => setProp((p: ContainerBlockProps) => { p.justifyContent = v as any; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="flex-start">Início</SelectItem>
            <SelectItem value="center">Centro</SelectItem>
            <SelectItem value="flex-end">Fim</SelectItem>
            <SelectItem value="space-between">Espaço entre</SelectItem>
            <SelectItem value="space-around">Espaço ao redor</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Padding: {props.padding}px</Label>
        <Slider value={[props.padding]} onValueChange={([v]) => setProp((p: ContainerBlockProps) => { p.padding = v; })} min={0} max={64} step={2} className="mt-2" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Gap: {props.gap}px</Label>
        <Slider value={[props.gap]} onValueChange={([v]) => setProp((p: ContainerBlockProps) => { p.gap = v; })} min={0} max={48} step={2} className="mt-2" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Arredondamento: {props.borderRadius}px</Label>
        <Slider value={[props.borderRadius]} onValueChange={([v]) => setProp((p: ContainerBlockProps) => { p.borderRadius = v; })} min={0} max={32} step={1} className="mt-2" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Altura mín: {props.minHeight}px</Label>
        <Slider value={[props.minHeight]} onValueChange={([v]) => setProp((p: ContainerBlockProps) => { p.minHeight = v; })} min={40} max={600} step={10} className="mt-2" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Blur: {props.blur}px</Label>
        <Slider value={[props.blur]} onValueChange={([v]) => setProp((p: ContainerBlockProps) => { p.blur = v; })} min={0} max={30} step={1} className="mt-2" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Opacidade: {Math.round((props.opacity ?? 1) * 100)}%</Label>
        <Slider value={[(props.opacity ?? 1) * 100]} onValueChange={([v]) => setProp((p: ContainerBlockProps) => { p.opacity = v / 100; })} min={10} max={100} step={5} className="mt-2" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Sombra</Label>
        <Select value={props.shadow ?? 'none'} onValueChange={(v) => setProp((p: ContainerBlockProps) => { p.shadow = v as any; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma</SelectItem>
            <SelectItem value="sm">Leve</SelectItem>
            <SelectItem value="md">Média</SelectItem>
            <SelectItem value="lg">Forte</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Cor borda</Label>
          <Input type="color" value={props.borderColor?.startsWith('rgba') ? '#ffffff' : props.borderColor} onChange={(e) => setProp((p: ContainerBlockProps) => { p.borderColor = e.target.value; })} className="mt-1 h-10 cursor-pointer" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Borda: {props.borderWidth}px</Label>
          <Slider value={[props.borderWidth ?? 0]} onValueChange={([v]) => setProp((p: ContainerBlockProps) => { p.borderWidth = v; })} min={0} max={4} step={1} className="mt-2" />
        </div>
      </div>
    </div>
  );
}
