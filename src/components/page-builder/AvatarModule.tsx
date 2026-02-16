import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ColorPickerPopover } from '@/components/devices/ColorPickerPopover';
import { User, UserMinus, UserPlus } from 'lucide-react';
import type { AvatarComponent } from '@/types/page-builder';

interface AvatarModuleProps {
  avatar: AvatarComponent;
  onChange: (avatar: AvatarComponent) => void;
}

export function AvatarModule({ avatar, onChange }: AvatarModuleProps) {
  const update = (partial: Partial<AvatarComponent>) => {
    onChange({ ...avatar, ...partial });
  };

  return (
    <div className="space-y-4">
      {/* Global toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Avatar 3D</span>
        </div>
        <Switch checked={avatar.enabled} onCheckedChange={(enabled) => update({ enabled })} />
      </div>

      {avatar.enabled && (
        <div className="space-y-4 pl-1">
          {/* Position */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Posição</Label>
            <RadioGroup value={avatar.position} onValueChange={(v) => update({ position: v as any })} className="flex gap-2">
              {[
                { value: 'left', label: 'Esquerda' },
                { value: 'center', label: 'Centro' },
                { value: 'right', label: 'Direita' },
              ].map((opt) => (
                <label key={opt.value} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border cursor-pointer transition-all text-xs ${avatar.position === opt.value ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-muted/30 text-muted-foreground'}`}>
                  <RadioGroupItem value={opt.value} />
                  <span className="font-medium">{opt.label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Scale */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Escala</Label>
              <span className="text-xs font-mono font-medium text-foreground bg-muted px-1.5 py-0.5 rounded">{avatar.scale.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserMinus className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <Slider
                value={[avatar.scale]}
                onValueChange={([v]) => update({ scale: Math.round(v * 10) / 10 })}
                min={0.8}
                max={2.5}
                step={0.1}
                className="flex-1"
              />
              <UserPlus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Cores da Roupa</Label>
            <div className="grid grid-cols-2 gap-2">
              <ColorPickerPopover
                color={avatar.colors.shirt}
                onChange={(c) => update({ colors: { ...avatar.colors, shirt: c } })}
                label="Camisa"
              />
              <ColorPickerPopover
                color={avatar.colors.pants}
                onChange={(c) => update({ colors: { ...avatar.colors, pants: c } })}
                label="Calça"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
