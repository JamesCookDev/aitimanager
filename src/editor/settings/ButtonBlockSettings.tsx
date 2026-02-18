import { useNode } from '@craftjs/core';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ButtonBlockProps } from '../components/ButtonBlock';

export function ButtonBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props as ButtonBlockProps }));

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Texto</Label>
        <Input value={props.label} onChange={(e) => setProp((p: ButtonBlockProps) => { p.label = e.target.value; })} className="mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Ícone</Label>
          <Input value={props.icon} onChange={(e) => setProp((p: ButtonBlockProps) => { p.icon = e.target.value; })} className="mt-1 text-center" placeholder="🔥" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Posição ícone</Label>
          <Select value={props.iconPosition} onValueChange={(v) => setProp((p: ButtonBlockProps) => { p.iconPosition = v as any; })}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Esquerda</SelectItem>
              <SelectItem value="right">Direita</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Cor fundo</Label>
          <Input type="color" value={props.bgColor?.startsWith('hsl') ? '#3b82f6' : props.bgColor} onChange={(e) => setProp((p: ButtonBlockProps) => { p.bgColor = e.target.value; })} className="mt-1 h-10 cursor-pointer" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Cor texto</Label>
          <Input type="color" value={props.textColor} onChange={(e) => setProp((p: ButtonBlockProps) => { p.textColor = e.target.value; })} className="mt-1 h-10 cursor-pointer" />
        </div>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Peso</Label>
        <Select value={props.fontWeight} onValueChange={(v) => setProp((p: ButtonBlockProps) => { p.fontWeight = v as any; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="semibold">Semibold</SelectItem>
            <SelectItem value="bold">Bold</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Tamanho: {props.fontSize}px</Label>
        <Slider value={[props.fontSize]} onValueChange={([v]) => setProp((p: ButtonBlockProps) => { p.fontSize = v; })} min={12} max={32} step={1} className="mt-2" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Borda arredondada: {props.borderRadius}px</Label>
        <Slider value={[props.borderRadius]} onValueChange={([v]) => setProp((p: ButtonBlockProps) => { p.borderRadius = v; })} min={0} max={50} step={1} className="mt-2" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Padding H: {props.paddingX}px</Label>
        <Slider value={[props.paddingX]} onValueChange={([v]) => setProp((p: ButtonBlockProps) => { p.paddingX = v; })} min={8} max={64} step={2} className="mt-2" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Padding V: {props.paddingY}px</Label>
        <Slider value={[props.paddingY]} onValueChange={([v]) => setProp((p: ButtonBlockProps) => { p.paddingY = v; })} min={4} max={32} step={2} className="mt-2" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Borda cor</Label>
          <Input type="color" value={props.borderColor === 'transparent' ? '#ffffff' : props.borderColor} onChange={(e) => setProp((p: ButtonBlockProps) => { p.borderColor = e.target.value; })} className="mt-1 h-10 cursor-pointer" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Borda: {props.borderWidth}px</Label>
          <Slider value={[props.borderWidth]} onValueChange={([v]) => setProp((p: ButtonBlockProps) => { p.borderWidth = v; })} min={0} max={4} step={1} className="mt-2" />
        </div>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Sombra</Label>
        <Select value={props.shadow} onValueChange={(v) => setProp((p: ButtonBlockProps) => { p.shadow = v as any; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma</SelectItem>
            <SelectItem value="sm">Leve</SelectItem>
            <SelectItem value="md">Média</SelectItem>
            <SelectItem value="lg">Forte</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Opacidade: {Math.round(props.opacity * 100)}%</Label>
        <Slider value={[props.opacity * 100]} onValueChange={([v]) => setProp((p: ButtonBlockProps) => { p.opacity = v / 100; })} min={10} max={100} step={5} className="mt-2" />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Largura total</Label>
        <Switch checked={props.fullWidth} onCheckedChange={(v) => setProp((p: ButtonBlockProps) => { p.fullWidth = v; })} />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Ação (prompt ou URL)</Label>
        <Input value={props.action} onChange={(e) => setProp((p: ButtonBlockProps) => { p.action = e.target.value; })} placeholder="ex: Quem é você?" className="mt-1" />
      </div>
    </div>
  );
}
