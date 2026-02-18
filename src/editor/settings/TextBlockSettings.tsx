import { useNode } from '@craftjs/core';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TextBlockProps } from '../components/TextBlock';

export function TextBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props as TextBlockProps }));

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Texto</Label>
        <Input
          value={props.text}
          onChange={(e) => setProp((p: TextBlockProps) => { p.text = e.target.value; })}
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Tamanho da fonte: {props.fontSize}px</Label>
        <Slider
          value={[props.fontSize]}
          onValueChange={([v]) => setProp((p: TextBlockProps) => { p.fontSize = v; })}
          min={10} max={72} step={1} className="mt-2"
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Peso</Label>
        <Select value={props.fontWeight} onValueChange={(v) => setProp((p: TextBlockProps) => { p.fontWeight = v as any; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="semibold">Semibold</SelectItem>
            <SelectItem value="bold">Bold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Alinhamento</Label>
        <Select value={props.textAlign} onValueChange={(v) => setProp((p: TextBlockProps) => { p.textAlign = v as any; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Esquerda</SelectItem>
            <SelectItem value="center">Centro</SelectItem>
            <SelectItem value="right">Direita</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Cor</Label>
        <Input
          type="color"
          value={props.color}
          onChange={(e) => setProp((p: TextBlockProps) => { p.color = e.target.value; })}
          className="mt-1 h-10 cursor-pointer"
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Padding: {props.padding}px</Label>
        <Slider
          value={[props.padding]}
          onValueChange={([v]) => setProp((p: TextBlockProps) => { p.padding = v; })}
          min={0} max={64} step={2} className="mt-2"
        />
      </div>
    </div>
  );
}
