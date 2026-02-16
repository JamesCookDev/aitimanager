import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ImageIcon } from 'lucide-react';
import type { LogoComponent } from '@/types/page-builder';

interface LogoModuleProps {
  logo: LogoComponent;
  onChange: (logo: LogoComponent) => void;
}

const POSITION_OPTIONS = [
  { value: 'top_left', label: '↖ Superior Esquerda' },
  { value: 'top_right', label: '↗ Superior Direita' },
  { value: 'center_top', label: '↑ Centro Superior' },
  { value: 'bottom_left', label: '↙ Inferior Esquerda' },
  { value: 'bottom_right', label: '↘ Inferior Direita' },
] as const;

export function LogoModule({ logo, onChange }: LogoModuleProps) {
  const update = (partial: Partial<LogoComponent>) => {
    onChange({ ...logo, ...partial });
  };

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Logo / Marca</span>
        </div>
        <Switch checked={logo.enabled} onCheckedChange={(enabled) => update({ enabled })} />
      </div>

      {logo.enabled && (
        <div className="space-y-4">
          {/* URL */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">URL da Imagem</Label>
            <Input
              value={logo.url}
              onChange={(e) => update({ url: e.target.value })}
              placeholder="https://exemplo.com/logo.png"
              className="text-xs h-8"
            />
            {logo.url && (
              <div className="mt-2 p-2 rounded-lg border border-border bg-muted/30 flex items-center justify-center">
                <img
                  src={logo.url}
                  alt="Logo preview"
                  className="max-h-16 max-w-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          {/* Position */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Posição</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {POSITION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ position: opt.value })}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    logo.position === opt.value
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scale */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Tamanho</Label>
              <span className="text-xs text-muted-foreground font-mono">{logo.scale.toFixed(1)}x</span>
            </div>
            <Slider
              value={[logo.scale]}
              onValueChange={([v]) => update({ scale: v })}
              min={0.3}
              max={3}
              step={0.1}
            />
          </div>
        </div>
      )}
    </div>
  );
}
