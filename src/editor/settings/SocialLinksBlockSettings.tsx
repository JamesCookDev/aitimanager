import { useNode } from '@craftjs/core';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import type { SocialLinksBlockProps, SocialLink } from '../components/SocialLinksBlock';

export function SocialLinksBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as SocialLinksBlockProps,
  }));

  const addLink = () => {
    const newLink: SocialLink = { id: Date.now().toString(), icon: '🔗', label: 'Link', url: '', color: '#6366f1' };
    setProp((p: SocialLinksBlockProps) => { p.links = [...(p.links || []), newLink]; });
  };

  const removeLink = (id: string) => {
    setProp((p: SocialLinksBlockProps) => { p.links = p.links.filter((l) => l.id !== id); });
  };

  const updateLink = (id: string, field: keyof SocialLink, value: string) => {
    setProp((p: SocialLinksBlockProps) => {
      p.links = p.links.map((l) => l.id === id ? { ...l, [field]: value } : l);
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Layout</Label>
        <Select value={props.layout} onValueChange={(v) => setProp((p: SocialLinksBlockProps) => { p.layout = v as any; })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="horizontal">Horizontal</SelectItem>
            <SelectItem value="vertical">Vertical</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Tamanho ícone: {props.iconSize}px</Label>
        <Slider value={[props.iconSize]} onValueChange={([v]) => setProp((p: SocialLinksBlockProps) => { p.iconSize = v; })} min={24} max={64} step={2} className="mt-2" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Gap: {props.gap}px</Label>
        <Slider value={[props.gap]} onValueChange={([v]) => setProp((p: SocialLinksBlockProps) => { p.gap = v; })} min={4} max={32} step={2} className="mt-2" />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Labels visíveis</Label>
        <Switch checked={props.showLabels} onCheckedChange={(v) => setProp((p: SocialLinksBlockProps) => { p.showLabels = v; })} />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Fundo</Label>
        <Switch checked={props.bgEnabled} onCheckedChange={(v) => setProp((p: SocialLinksBlockProps) => { p.bgEnabled = v; })} />
      </div>

      {/* Links */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-muted-foreground font-semibold">Links</Label>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={addLink}>
            <Plus className="w-3 h-3" /> Adicionar
          </Button>
        </div>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {(props.links || []).map((link, idx) => (
            <div key={link.id} className="space-y-2 p-2.5 rounded-lg border border-border/50 bg-muted/20">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">#{idx + 1}</span>
                <Input value={link.icon} onChange={(e) => updateLink(link.id, 'icon', e.target.value)} className="w-12 h-7 text-xs text-center" />
                <Input value={link.label} onChange={(e) => updateLink(link.id, 'label', e.target.value)} className="flex-1 h-7 text-xs" />
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive" onClick={() => removeLink(link.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input value={link.url} onChange={(e) => updateLink(link.id, 'url', e.target.value)} className="flex-1 h-7 text-xs" placeholder="URL" />
                <Input type="color" value={link.color} onChange={(e) => updateLink(link.id, 'color', e.target.value)} className="w-10 h-7 cursor-pointer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
