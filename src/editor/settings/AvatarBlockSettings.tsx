import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

export function AvatarBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <div className="space-y-4 p-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Ativo</Label>
        <Switch
          checked={props.enabled}
          onCheckedChange={(v) => setProp((p: any) => { p.enabled = v; })}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Nome do Avatar</Label>
        <Input
          value={props.avatarName}
          onChange={(e) => setProp((p: any) => { p.avatarName = e.target.value; })}
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Altura ({props.height}px)</Label>
        <Slider
          min={100} max={600} step={10}
          value={[props.height]}
          onValueChange={([v]) => setProp((p: any) => { p.height = v; })}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Borda arredondada ({props.borderRadius}px)</Label>
        <Slider
          min={0} max={32} step={2}
          value={[props.borderRadius]}
          onValueChange={([v]) => setProp((p: any) => { p.borderRadius = v; })}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Cor de fundo</Label>
        <Input
          type="color"
          value={props.bgColor?.startsWith('rgba') ? '#111827' : props.bgColor}
          onChange={(e) => setProp((p: any) => { p.bgColor = e.target.value; })}
          className="h-8"
        />
      </div>
    </div>
  );
}
