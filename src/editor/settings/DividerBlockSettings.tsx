import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutSettingsPanel } from '../shared/LayoutSettingsPanel';

export function DividerBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <div className="space-y-4 p-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Espessura ({props.thickness}px)</Label>
        <Slider
          min={1} max={8} step={1}
          value={[props.thickness]}
          onValueChange={([v]) => setProp((p: any) => { p.thickness = v; })}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Estilo</Label>
        <Select
          value={props.lineStyle}
          onValueChange={(v) => setProp((p: any) => { p.lineStyle = v; })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Sólido</SelectItem>
            <SelectItem value="dashed">Tracejado</SelectItem>
            <SelectItem value="dotted">Pontilhado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Margem ({props.margin}px)</Label>
        <Slider
          min={0} max={48} step={4}
          value={[props.margin]}
          onValueChange={([v]) => setProp((p: any) => { p.margin = v; })}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Cor</Label>
        <Input
          type="color"
          value={props.color?.startsWith('rgba') ? '#ffffff' : props.color}
          onChange={(e) => setProp((p: any) => { p.color = e.target.value; })}
          className="h-8"
        />
      </div>
      <LayoutSettingsPanel />
    </div>
  );
}
