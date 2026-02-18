import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export function SpacerBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <div className="space-y-4 p-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Altura ({props.height}px)</Label>
        <Slider
          min={8} max={200} step={4}
          value={[props.height]}
          onValueChange={([v]) => setProp((p: any) => { p.height = v; })}
        />
      </div>
    </div>
  );
}
