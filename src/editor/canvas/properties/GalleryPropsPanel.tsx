import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { Section, PropInput, ImageUploadField } from './shared';

export function GalleryPropsPanel({ props, onChange }: { props: Record<string, any>; onChange: (p: Record<string, any>) => void }) {
  const images: string[] = props.images || [];
  const set = (key: string) => (val: any) => onChange({ [key]: val });

  const addImage = () => onChange({ images: [...images, ''] });
  const removeImage = (i: number) => onChange({ images: images.filter((_, idx) => idx !== i) });
  const updateImage = (i: number, v: string) => onChange({ images: images.map((img, idx) => idx === i ? v : img) });

  return (
    <>
      <Section title="Galeria">
        <div>
          <Label className="text-[11px]">Colunas</Label>
          <Select value={String(props.columns || 2)} onValueChange={(v) => set('columns')(Number(v))}>
            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 coluna</SelectItem>
              <SelectItem value="2">2 colunas</SelectItem>
              <SelectItem value="3">3 colunas</SelectItem>
              <SelectItem value="4">4 colunas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px]">Proporção</Label>
          <Select value={props.aspectRatio || '1/1'} onValueChange={set('aspectRatio')}>
            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1/1">1:1 Quadrada</SelectItem>
              <SelectItem value="4/3">4:3 Paisagem</SelectItem>
              <SelectItem value="3/4">3:4 Retrato</SelectItem>
              <SelectItem value="16/9">16:9 Widescreen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <PropInput label="Espaçamento" value={props.gap ?? 8} onChange={set('gap')} type="number" />
        <PropInput label="Border Radius" value={props.borderRadius ?? 12} onChange={set('borderRadius')} type="number" />
      </Section>

      <Section title={`Imagens (${images.length})`}>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {images.map((src, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1">
                <ImageUploadField value={src} onChange={(v) => updateImage(i, v)} />
              </div>
              <button onClick={() => removeImage(i)} className="p-1 rounded hover:bg-destructive/20 mt-1">
                <Trash2 className="w-3 h-3 text-destructive" />
              </button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 mt-2" onClick={addImage}>
          <Plus className="w-3 h-3" /> Adicionar imagem
        </Button>
      </Section>
    </>
  );
}
