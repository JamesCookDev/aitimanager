import { useState, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Section, PropInput } from './shared';

function CarouselImageUpload({ onAdd }: { onAdd: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const ext = file.name.split('.').pop();
        const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('canvas-images').upload(path, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('canvas-images').getPublicUrl(path);
        onAdd(urlData.publicUrl);
      }
      toast.success('Imagens enviadas!');
    } catch (err: any) {
      toast.error('Erro: ' + (err.message || 'tente novamente'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5" onClick={() => fileRef.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
        {uploading ? 'Enviando…' : 'Adicionar imagens'}
      </Button>
    </>
  );
}

export function CarouselPropsPanel({ props, onChange }: { props: Record<string, any>; onChange: (p: Record<string, any>) => void }) {
  const images: string[] = props.images || [];
  const set = (key: string) => (val: any) => onChange({ [key]: val });

  const addImage = useCallback((url: string) => {
    onChange({ images: [...images, url] });
  }, [images, onChange]);

  const removeImage = useCallback((index: number) => {
    onChange({ images: images.filter((_: string, i: number) => i !== index) });
  }, [images, onChange]);

  return (
    <Section title="Carrossel">
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
        {images.map((src: string, i: number) => (
          <div key={i} className="flex items-center gap-1.5 group">
            <div className="w-10 h-10 rounded border border-border/50 overflow-hidden shrink-0">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-[9px] text-muted-foreground truncate flex-1 font-mono">{src.split('/').pop()}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0" onClick={() => removeImage(i)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      <CarouselImageUpload onAdd={addImage} />

      <div>
        <Label className="text-[11px]">Ou cole URL</Label>
        <div className="flex gap-1 mt-1">
          <Input
            placeholder="https://..."
            className="h-7 text-xs font-mono"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value.trim();
                if (val) { addImage(val); (e.target as HTMLInputElement).value = ''; }
              }
            }}
          />
        </div>
        <p className="text-[9px] text-muted-foreground mt-0.5">Pressione Enter para adicionar</p>
      </div>

      <PropInput label="Border Radius" value={props.borderRadius} onChange={set('borderRadius')} type="number" />
      <PropInput label="Intervalo (seg)" value={props.interval} onChange={set('interval')} type="number" />

      <div>
        <Label className="text-[11px]">Transição</Label>
        <Select value={props.transition || 'fade'} onValueChange={set('transition')}>
          <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="fade">Fade</SelectItem>
            <SelectItem value="slide">Slide</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-[11px]">Ajuste da imagem</Label>
        <Select value={props.objectFit || 'contain'} onValueChange={set('objectFit')}>
          <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="contain">Sem corte (contain)</SelectItem>
            <SelectItem value="cover">Preencher (cover)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-[11px]">Autoplay</Label>
        <Switch checked={props.autoplay !== false} onCheckedChange={set('autoplay')} />
      </div>
    </Section>
  );
}
