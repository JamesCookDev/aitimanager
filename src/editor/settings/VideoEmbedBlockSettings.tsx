import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutSettingsPanel } from '../shared/LayoutSettingsPanel';

export function VideoEmbedBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">URL do Vídeo</Label>
        <Input
          value={props.url || ''}
          onChange={(e) => setProp((p: any) => { p.url = e.target.value; })}
          placeholder="https://youtube.com/watch?v=..."
          className="mt-1"
        />
        <p className="text-[10px] text-muted-foreground mt-1">YouTube, Vimeo ou URL direta</p>
      </div>

      <div>
        <Label className="text-xs">Proporção</Label>
        <Select value={props.aspectRatio || '16:9'} onValueChange={(v) => setProp((p: any) => { p.aspectRatio = v; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
            <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
            <SelectItem value="4:3">4:3 (Clássico)</SelectItem>
            <SelectItem value="1:1">1:1 (Quadrado)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Borda arredondada: {props.borderRadius}px</Label>
        <Slider min={0} max={32} step={1} value={[props.borderRadius || 12]} onValueChange={([v]) => setProp((p: any) => { p.borderRadius = v; })} className="mt-1" />
      </div>

      <div>
        <Label className="text-xs">Opacidade: {Math.round((props.opacity ?? 1) * 100)}%</Label>
        <Slider min={0.1} max={1} step={0.05} value={[props.opacity ?? 1]} onValueChange={([v]) => setProp((p: any) => { p.opacity = v; })} className="mt-1" />
      </div>

      <div className="space-y-3 pt-2 border-t border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Reprodução</h4>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Autoplay</Label>
          <Switch checked={!!props.autoplay} onCheckedChange={(v) => setProp((p: any) => { p.autoplay = v; })} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Mudo</Label>
          <Switch checked={props.muted !== false} onCheckedChange={(v) => setProp((p: any) => { p.muted = v; })} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Loop</Label>
          <Switch checked={props.loop !== false} onCheckedChange={(v) => setProp((p: any) => { p.loop = v; })} />
        </div>
      </div>
      <LayoutSettingsPanel />
    </div>
  );
}
