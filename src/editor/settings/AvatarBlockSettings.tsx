import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutSettingsPanel } from '../shared/LayoutSettingsPanel';

export function AvatarBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <div className="space-y-4 p-3">
      {/* Core */}
      <div className="flex items-center justify-between">
        <Label className="text-xs">Ativo</Label>
        <Switch checked={props.enabled} onCheckedChange={(v) => setProp((p: any) => { p.enabled = v; })} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Nome do Avatar</Label>
        <Input value={props.avatarName || ''} onChange={(e) => setProp((p: any) => { p.avatarName = e.target.value; })} className="h-8 text-xs" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Posição</Label>
        <Select value={props.position || 'center'} onValueChange={(v) => setProp((p: any) => { p.position = v; })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Esquerda</SelectItem>
            <SelectItem value="center">Centro</SelectItem>
            <SelectItem value="right">Direita</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Escala: {props.scale?.toFixed(1)}</Label>
        <Slider min={0.5} max={3} step={0.1} value={[props.scale ?? 1.5]} onValueChange={([v]) => setProp((p: any) => { p.scale = v; })} />
      </div>

      {/* Visual placeholder */}
      <div className="pt-2 border-t border-border space-y-3">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Placeholder Visual</h4>
        <div className="space-y-1.5">
          <Label className="text-xs">Altura ({props.height}px)</Label>
          <Slider min={100} max={600} step={10} value={[props.height ?? 300]} onValueChange={([v]) => setProp((p: any) => { p.height = v; })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Borda arredondada ({props.borderRadius}px)</Label>
          <Slider min={0} max={32} step={2} value={[props.borderRadius ?? 16]} onValueChange={([v]) => setProp((p: any) => { p.borderRadius = v; })} />
        </div>
      </div>

      {/* Colors */}
      <div className="pt-2 border-t border-border space-y-3">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cores da Roupa</h4>
        {([
          ['shirtColor', 'Camisa'],
          ['pantsColor', 'Calça'],
          ['shoesColor', 'Sapato'],
        ] as const).map(([key, label]) => (
          <div key={key} className="space-y-1.5">
            <Label className="text-xs">{label}</Label>
            <div className="flex gap-2">
              <input type="color" value={props[key] || '#000000'} onChange={(e) => setProp((p: any) => { p[key] = e.target.value; })} className="w-8 h-8 rounded border border-border cursor-pointer" />
              <Input value={props[key] || ''} onChange={(e) => setProp((p: any) => { p[key] = e.target.value; })} className="flex-1 h-8 text-xs" />
            </div>
          </div>
        ))}
      </div>

      {/* Models */}
      <div className="pt-2 border-t border-border space-y-3">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Modelos 3D</h4>
        <div className="space-y-1.5">
          <Label className="text-xs">URL do Avatar (.glb)</Label>
          <Input value={props.avatarUrl || ''} onChange={(e) => setProp((p: any) => { p.avatarUrl = e.target.value; })} className="h-8 text-xs" placeholder="/models/avatar.glb" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">URL das Animações (.glb)</Label>
          <Input value={props.animationsUrl || ''} onChange={(e) => setProp((p: any) => { p.animationsUrl = e.target.value; })} className="h-8 text-xs" placeholder="/models/animations.glb" />
        </div>
      </div>

      {/* Animations */}
      <div className="pt-2 border-t border-border space-y-3">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Animações</h4>
        <div className="space-y-1.5">
          <Label className="text-xs">Idle</Label>
          <Input value={props.idleAnimation || 'Idle'} onChange={(e) => setProp((p: any) => { p.idleAnimation = e.target.value; })} className="h-8 text-xs" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Falando</Label>
          <Input value={props.talkingAnimation || 'TalkingOne'} onChange={(e) => setProp((p: any) => { p.talkingAnimation = e.target.value; })} className="h-8 text-xs" />
        </div>
      </div>

      {/* Materials */}
      <div className="pt-2 border-t border-border space-y-3">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Material</h4>
        <div className="space-y-1.5">
          <Label className="text-xs">Roughness: {(props.roughness ?? 0.5).toFixed(1)}</Label>
          <Slider min={0} max={1} step={0.1} value={[props.roughness ?? 0.5]} onValueChange={([v]) => setProp((p: any) => { p.roughness = v; })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Metalness: {(props.metalness ?? 0).toFixed(1)}</Label>
          <Slider min={0} max={1} step={0.1} value={[props.metalness ?? 0]} onValueChange={([v]) => setProp((p: any) => { p.metalness = v; })} />
        </div>
      </div>
      <LayoutSettingsPanel />
    </div>
  );
}
