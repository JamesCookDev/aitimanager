import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Section, PropInput } from './shared';

export function MapPropsPanel({ props, onChange }: { props: Record<string, any>; onChange: (p: Record<string, any>) => void }) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const set = (key: string) => (val: any) => onChange({ [key]: val });

  const searchAddress = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setResults([]);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&accept-language=pt-BR`, {
        headers: { 'User-Agent': 'AitiManager/1.0' },
      });
      const data = await res.json();
      setResults(data);
      if (data.length === 0) toast('Nenhum endereço encontrado');
    } catch {
      toast.error('Erro ao buscar endereço');
    } finally {
      setSearching(false);
    }
  };

  const selectResult = (r: { lat: string; lon: string; display_name: string }) => {
    onChange({ lat: parseFloat(r.lat), lng: parseFloat(r.lon), label: r.display_name.split(',')[0] });
    setResults([]);
    setQuery('');
  };

  return (
    <Section title="Mapa">
      <div className="space-y-1.5">
        <Label className="text-[11px]">🔍 Buscar endereço</Label>
        <div className="flex gap-1">
          <Input
            placeholder="Ex: Av. Paulista, São Paulo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
            className="h-8 text-xs"
          />
          <Button variant="outline" size="sm" className="h-8 px-2 shrink-0" onClick={searchAddress} disabled={searching}>
            {searching ? <Loader2 className="w-3 h-3 animate-spin" /> : '🔍'}
          </Button>
        </div>
        {results.length > 0 && (
          <div className="border border-border rounded-md overflow-hidden bg-background max-h-[160px] overflow-y-auto">
            {results.map((r, i) => (
              <button
                key={i}
                className="w-full text-left px-2 py-1.5 text-[11px] hover:bg-accent/50 border-b border-border/30 last:border-b-0 transition-colors"
                onClick={() => selectResult(r)}
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}
        <p className="text-[9px] text-muted-foreground">Digite e pressione Enter ou clique 🔍</p>
      </div>

      <div className="space-y-2 pt-2 border-t border-border">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Coordenadas</p>
        <PropInput label="Latitude" value={props.lat ?? -23.5505} onChange={set('lat')} type="number" />
        <PropInput label="Longitude" value={props.lng ?? -46.6333} onChange={set('lng')} type="number" />
      </div>

      <div>
        <Label className="text-[11px]">Zoom: {props.zoom ?? 15}</Label>
        <Slider value={[props.zoom ?? 15]} onValueChange={([v]) => onChange({ zoom: v })} min={3} max={20} step={1} />
      </div>
      <PropInput label="Border Radius" value={props.borderRadius ?? 12} onChange={set('borderRadius')} type="number" />

      <div className="space-y-2 pt-2 border-t border-border">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Legenda</p>
        <PropInput label="Texto" value={props.label || ''} onChange={set('label')} />
        <PropInput label="Cor" value={props.labelColor || '#ffffff'} onChange={set('labelColor')} type="color" />
        <PropInput label="Tamanho" value={props.labelSize || 14} onChange={set('labelSize')} type="number" />
      </div>
    </Section>
  );
}
