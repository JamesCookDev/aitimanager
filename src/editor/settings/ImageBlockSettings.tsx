import { useNode } from '@craftjs/core';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ImageBlockProps } from '../components/ImageBlock';

export function ImageBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props as ImageBlockProps }));

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">URL da imagem</Label>
        <Input value={props.src} onChange={(e) => setProp((p: ImageBlockProps) => { p.src = e.target.value; })} placeholder="https://..." className="mt-1" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Texto alternativo</Label>
        <Input value={props.alt} onChange={(e) => setProp((p: ImageBlockProps) => { p.alt = e.target.value; })} className="mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Largura</Label>
          <Input value={props.width} onChange={(e) => setProp((p: ImageBlockProps) => { p.width = e.target.value; })} placeholder="100% ou 300px" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Altura</Label>
          <Input value={props.height} onChange={(e) => setProp((p: ImageBlockProps) => { p.height = e.target.value; })} placeholder="auto ou 200px" className="mt-1" />
        </div>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Ajuste</Label>
        <Select value={props.objectFit} onValueChange={(v) => setProp((p: ImageBlockProps) => { p.objectFit = v as any; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="cover">Cover</SelectItem>
            <SelectItem value="contain">Contain</SelectItem>
            <SelectItem value="fill">Fill</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Borda arredondada: {props.borderRadius}px</Label>
        <Slider value={[props.borderRadius]} onValueChange={([v]) => setProp((p: ImageBlockProps) => { p.borderRadius = v; })} min={0} max={50} step={1} className="mt-2" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Opacidade: {Math.round((props.opacity ?? 1) * 100)}%</Label>
        <Slider value={[(props.opacity ?? 1) * 100]} onValueChange={([v]) => setProp((p: ImageBlockProps) => { p.opacity = v / 100; })} min={10} max={100} step={5} className="mt-2" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Sombra</Label>
        <Select value={props.shadow ?? 'none'} onValueChange={(v) => setProp((p: ImageBlockProps) => { p.shadow = v as any; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma</SelectItem>
            <SelectItem value="sm">Leve</SelectItem>
            <SelectItem value="md">Média</SelectItem>
            <SelectItem value="lg">Forte</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Borda visível</Label>
        <Switch checked={props.borderEnabled ?? false} onCheckedChange={(v) => setProp((p: ImageBlockProps) => { p.borderEnabled = v; })} />
      </div>
      {(props.borderEnabled ?? false) && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Cor borda</Label>
            <Input type="color" value={props.borderColor ?? '#ffffff'} onChange={(e) => setProp((p: ImageBlockProps) => { p.borderColor = e.target.value; })} className="mt-1 h-10 cursor-pointer" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Espessura: {props.borderWidth ?? 2}px</Label>
            <Slider value={[props.borderWidth ?? 2]} onValueChange={([v]) => setProp((p: ImageBlockProps) => { p.borderWidth = v; })} min={1} max={6} step={1} className="mt-2" />
          </div>
        </div>
      )}
    </div>
  );
}
