import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Section, PropInput } from './shared';

export function AnimatedNumberPropsPanel({ props, onChange }: { props: Record<string, any>; onChange: (p: Record<string, any>) => void }) {
  const set = (key: string) => (val: any) => onChange({ [key]: val });

  return (
    <Section title="Número Animado">
      <PropInput label="Valor" value={props.value ?? 1234} onChange={(v) => set('value')(Number(v))} type="number" />
      <PropInput label="Prefixo" value={props.prefix || ''} onChange={set('prefix')} />
      <PropInput label="Sufixo" value={props.suffix || ''} onChange={set('suffix')} />
      <PropInput label="Legenda" value={props.label || ''} onChange={set('label')} />
      <PropInput label="Tamanho do número" value={props.fontSize || 64} onChange={set('fontSize')} type="number" />
      <PropInput label="Tamanho da legenda" value={props.labelSize || 18} onChange={set('labelSize')} type="number" />
      <PropInput label="Cor do número" value={props.color || '#ffffff'} onChange={set('color')} type="color" />
      <PropInput label="Cor da legenda" value={props.labelColor || 'rgba(255,255,255,0.6)'} onChange={set('labelColor')} type="color" />
      <PropInput label="Duração da animação (ms)" value={props.duration || 2000} onChange={(v) => set('duration')(Number(v))} type="number" />
      <div className="flex items-center justify-between">
        <Label className="text-[11px]">Separador de milhar</Label>
        <Switch checked={props.useGrouping !== false} onCheckedChange={set('useGrouping')} />
      </div>
    </Section>
  );
}
