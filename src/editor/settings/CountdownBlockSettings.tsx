import { useNode } from '@craftjs/core';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CountdownBlockProps } from '../components/CountdownBlock';
import { LayoutSettingsPanel } from '../shared/LayoutSettingsPanel';

export function CountdownBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as CountdownBlockProps,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Modo</Label>
        <Select value={props.mode} onValueChange={(v) => setProp((p: CountdownBlockProps) => { p.mode = v as any; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="clock">Relógio</SelectItem>
            <SelectItem value="countdown">Contagem regressiva</SelectItem>
            <SelectItem value="date">Data alvo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {props.mode === 'date' && (
        <div>
          <Label className="text-xs text-muted-foreground">Data alvo</Label>
          <Input type="datetime-local" value={props.targetDate} onChange={(e) => setProp((p: CountdownBlockProps) => { p.targetDate = e.target.value; })} className="mt-1" />
        </div>
      )}
      {props.mode === 'countdown' && (
        <div>
          <Label className="text-xs text-muted-foreground">Minutos: {props.countdownMinutes}</Label>
          <Slider value={[props.countdownMinutes]} onValueChange={([v]) => setProp((p: CountdownBlockProps) => { p.countdownMinutes = v; })} min={1} max={1440} step={1} className="mt-2" />
        </div>
      )}
      <div>
        <Label className="text-xs text-muted-foreground">Tamanho: {props.fontSize}px</Label>
        <Slider value={[props.fontSize]} onValueChange={([v]) => setProp((p: CountdownBlockProps) => { p.fontSize = v; })} min={14} max={72} step={1} className="mt-2" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Separador</Label>
        <Input value={props.separator} onChange={(e) => setProp((p: CountdownBlockProps) => { p.separator = e.target.value; })} className="mt-1 w-16 text-center" maxLength={2} />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Gap: {props.gap}px</Label>
        <Slider value={[props.gap]} onValueChange={([v]) => setProp((p: CountdownBlockProps) => { p.gap = v; })} min={2} max={24} step={2} className="mt-2" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Arredondamento: {props.borderRadius}px</Label>
        <Slider value={[props.borderRadius]} onValueChange={([v]) => setProp((p: CountdownBlockProps) => { p.borderRadius = v; })} min={0} max={32} step={2} className="mt-2" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Cor texto</Label>
          <Input type="color" value={props.color} onChange={(e) => setProp((p: CountdownBlockProps) => { p.color = e.target.value; })} className="mt-1 h-10 cursor-pointer" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Cor fundo</Label>
          <Input type="color" value={props.bgColor?.startsWith('rgba') ? '#1a1a2e' : props.bgColor} onChange={(e) => setProp((p: CountdownBlockProps) => { p.bgColor = e.target.value + '18'; })} className="mt-1 h-10 cursor-pointer" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Fundo visível</Label>
        <Switch checked={props.bgEnabled} onCheckedChange={(v) => setProp((p: CountdownBlockProps) => { p.bgEnabled = v; })} />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Segundos</Label>
        <Switch checked={props.showSeconds} onCheckedChange={(v) => setProp((p: CountdownBlockProps) => { p.showSeconds = v; })} />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Labels</Label>
        <Switch checked={props.showLabels} onCheckedChange={(v) => setProp((p: CountdownBlockProps) => { p.showLabels = v; })} />
      </div>
      <LayoutSettingsPanel />
    </div>
  );
}
