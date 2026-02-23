import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { Section, PropInput } from './shared';

const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: '📸', color: '#E1306C' },
  { value: 'facebook', label: 'Facebook', icon: '👤', color: '#1877F2' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬', color: '#25D366' },
  { value: 'twitter', label: 'X / Twitter', icon: '𝕏', color: '#000000' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵', color: '#010101' },
  { value: 'youtube', label: 'YouTube', icon: '▶️', color: '#FF0000' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0A66C2' },
  { value: 'telegram', label: 'Telegram', icon: '✈️', color: '#26A5E4' },
  { value: 'email', label: 'E-mail', icon: '📧', color: '#EA4335' },
  { value: 'website', label: 'Website', icon: '🌐', color: '#6366f1' },
  { value: 'phone', label: 'Telefone', icon: '📞', color: '#10b981' },
  { value: 'maps', label: 'Maps', icon: '📍', color: '#4285F4' },
  { value: 'spotify', label: 'Spotify', icon: '🎧', color: '#1DB954' },
  { value: 'pinterest', label: 'Pinterest', icon: '📌', color: '#E60023' },
  { value: 'threads', label: 'Threads', icon: '🧵', color: '#000000' },
  { value: 'discord', label: 'Discord', icon: '🎮', color: '#5865F2' },
  { value: 'github', label: 'GitHub', icon: '🐱', color: '#333333' },
];

export function SocialPropsPanel({ props, onChange }: { props: Record<string, any>; onChange: (p: Record<string, any>) => void }) {
  const links: Array<{ id: string; platform: string; label: string; url: string; color: string }> = props.links || [];
  const set = (key: string) => (val: any) => onChange({ [key]: val });

  const addLink = (platformValue: string) => {
    const preset = SOCIAL_PLATFORMS.find(p => p.value === platformValue);
    const newLink = {
      id: Date.now().toString(),
      platform: platformValue,
      label: preset?.label || platformValue,
      url: '',
      color: preset?.color || '#6366f1',
    };
    onChange({ links: [...links, newLink] });
  };

  const removeLink = (id: string) => onChange({ links: links.filter(l => l.id !== id) });

  const updateLink = (id: string, field: string, value: string) => {
    onChange({ links: links.map(l => l.id === id ? { ...l, [field]: value } : l) });
  };

  const available = SOCIAL_PLATFORMS.filter(p => !links.some(l => l.platform === p.value));

  return (
    <Section title="Redes Sociais">
      <div>
        <Label className="text-[11px]">Adicionar rede</Label>
        <div className="flex flex-wrap gap-1 mt-1">
          {available.slice(0, 10).map(p => (
            <button key={p.value} onClick={() => addLink(p.value)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border border-border/50 hover:bg-accent/50 transition-colors"
              title={p.label}>
              <span>{p.icon}</span>
              <span className="hidden sm:inline">{p.label}</span>
            </button>
          ))}
          {available.length > 10 && (
            <Select onValueChange={addLink}>
              <SelectTrigger className="h-7 w-20 text-[10px]"><SelectValue placeholder="Mais…" /></SelectTrigger>
              <SelectContent>
                {available.slice(10).map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.icon} {p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="space-y-2 max-h-[240px] overflow-y-auto">
        {links.map((link) => {
          const preset = SOCIAL_PLATFORMS.find(p => p.value === link.platform);
          return (
            <div key={link.id} className="p-2 rounded-lg border border-border/50 bg-muted/20 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">{preset?.icon || '🔗'}</span>
                <span className="text-[11px] font-medium flex-1">{link.label}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0" onClick={() => removeLink(link.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <Input
                value={link.url}
                onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                placeholder={link.platform === 'email' ? 'email@exemplo.com' : link.platform === 'phone' ? '+55 11 99999-9999' : 'https://...'}
                className="h-7 text-xs"
              />
              <div className="flex gap-2">
                <Input value={link.label} onChange={(e) => updateLink(link.id, 'label', e.target.value)} className="h-7 text-xs flex-1" placeholder="Rótulo" />
                <input type="color" value={link.color} onChange={(e) => updateLink(link.id, 'color', e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0" />
              </div>
            </div>
          );
        })}
      </div>

      {links.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-2">Clique em uma rede acima para adicionar</p>}

      <div className="space-y-2 pt-2 border-t border-border">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Aparência</p>
        <div>
          <Label className="text-[11px]">Layout</Label>
          <Select value={props.layout || 'horizontal'} onValueChange={set('layout')}>
            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="horizontal">Horizontal</SelectItem>
              <SelectItem value="vertical">Vertical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px]">Tamanho ícone: {props.iconSize || 36}px</Label>
          <Slider value={[props.iconSize || 36]} onValueChange={([v]) => onChange({ iconSize: v })} min={20} max={64} step={2} />
        </div>
        <div>
          <Label className="text-[11px]">Espaçamento: {props.gap || 16}px</Label>
          <Slider value={[props.gap || 16]} onValueChange={([v]) => onChange({ gap: v })} min={4} max={40} step={2} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Mostrar rótulos</Label>
          <Switch checked={props.showLabels !== false} onCheckedChange={set('showLabels')} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Fundo</Label>
          <Switch checked={props.bgEnabled || false} onCheckedChange={set('bgEnabled')} />
        </div>
      </div>
    </Section>
  );
}
