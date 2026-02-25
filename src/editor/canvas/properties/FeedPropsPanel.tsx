import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, X, Plus, ChevronDown, ChevronUp, GripVertical, Image as ImageIcon, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Section, PropInput, ImageUploadField } from './shared';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FeedPost {
  id: string;
  image: string;
  images?: string[];
  title: string;
  description: string;
  ctaLabel?: string;
  ctaUrl?: string;
  avatar?: string;
  author?: string;
  likes?: number;
  badge?: string;
  phone?: string;
  address?: string;
  hours?: string;
  website?: string;
  category?: string;
  tags?: string[];
  rating?: number;
  detailDescription?: string;
}

function PostImageUpload({ onAdd }: { onAdd: (url: string) => void }) {
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
      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-7" onClick={() => fileRef.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
        {uploading ? 'Enviando…' : 'Upload imagem'}
      </Button>
    </>
  );
}

/* ───── Sortable Post Editor ───── */
function SortablePostEditor({ post, onChange, onRemove }: { post: FeedPost; onChange: (p: Partial<FeedPost>) => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <PostEditor post={post} onChange={onChange} onRemove={onRemove} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

function PostEditor({ post, onChange, onRemove, dragHandleProps }: {
  post: FeedPost;
  onChange: (p: Partial<FeedPost>) => void;
  onRemove: () => void;
  dragHandleProps?: Record<string, any>;
}) {
  const [open, setOpen] = useState(false);
  const images = post.images || (post.image ? [post.image] : []);

  const addImage = (url: string) => {
    onChange({ images: [...images, url], image: images.length === 0 ? url : post.image || url });
  };

  const removeImage = (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    onChange({ images: next, image: next[0] || '' });
  };

  const tagsStr = (post.tags || []).join(', ');
  const handleTagsChange = (v: string) => {
    onChange({ tags: v.split(',').map(t => t.trim()).filter(Boolean) });
  };

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden bg-muted/10">
      <div className="flex items-center gap-1.5 px-2 py-1.5 cursor-pointer hover:bg-muted/20" onClick={() => setOpen(!open)}>
        <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing shrink-0 touch-none" onClick={(e) => e.stopPropagation()}>
          <GripVertical className="w-3 h-3 text-muted-foreground/50" />
        </div>
        {images[0] && <img src={images[0]} alt="" className="w-6 h-6 rounded object-cover shrink-0" />}
        <span className="text-[10px] font-medium text-foreground truncate flex-1">{post.title || 'Loja sem título'}</span>
        <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
          <X className="w-3 h-3" />
        </Button>
        {open ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
      </div>

      {open && (
        <div className="px-2 pb-2 pt-1 space-y-2 border-t border-border/30">
          <PropInput label="Nome da loja" value={post.title} onChange={(v) => onChange({ title: v })} />
          <PropInput label="Autor / Responsável" value={post.author || ''} onChange={(v) => onChange({ author: v })} />
          <PropInput label="Descrição curta" value={post.description} onChange={(v) => onChange({ description: v })} type="textarea" />
          <PropInput label="Descrição detalhada" value={post.detailDescription || ''} onChange={(v) => onChange({ detailDescription: v })} type="textarea" />
          <PropInput label="Categoria" value={post.category || ''} onChange={(v) => onChange({ category: v })} />
          <PropInput label="Badge" value={post.badge || ''} onChange={(v) => onChange({ badge: v })} />

          <div>
            <Label className="text-[10px]">Avaliação</Label>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => onChange({ rating: post.rating === n ? 0 : n })} className="transition-transform active:scale-110">
                  <Star className="w-4 h-4" style={{ color: n <= (post.rating || 0) ? '#facc15' : 'rgba(150,150,150,0.3)', fill: n <= (post.rating || 0) ? '#facc15' : 'none' }} />
                </button>
              ))}
            </div>
          </div>

          <PropInput label="Tags (separar com vírgula)" value={tagsStr} onChange={handleTagsChange} />

          <div className="pt-1 border-t border-border/20">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Informações da loja</Label>
          </div>
          <PropInput label="Endereço" value={post.address || ''} onChange={(v) => onChange({ address: v })} />
          <PropInput label="Telefone" value={post.phone || ''} onChange={(v) => onChange({ phone: v })} />
          <PropInput label="Horário" value={post.hours || ''} onChange={(v) => onChange({ hours: v })} />
          <PropInput label="Website" value={post.website || ''} onChange={(v) => onChange({ website: v })} />
          <PropInput label="Curtidas" value={post.likes || 0} onChange={(v) => onChange({ likes: Number(v) })} type="number" />

          <div>
            <Label className="text-[10px]">Imagens da loja ({images.length})</Label>
            <div className="space-y-1 mt-1 max-h-[120px] overflow-y-auto">
              {images.map((src, i) => (
                <div key={i} className="flex items-center gap-1.5 group">
                  <img src={src} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                  <span className="text-[8px] text-muted-foreground truncate flex-1 font-mono">{src.split('/').pop()}</span>
                  <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0" onClick={() => removeImage(i)}>
                    <X className="w-2.5 h-2.5" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-1"><PostImageUpload onAdd={addImage} /></div>
          </div>

          <div>
            <Label className="text-[10px]">Logo / Avatar</Label>
            <ImageUploadField value={post.avatar || ''} onChange={(v) => onChange({ avatar: v })} />
          </div>

          <PropInput label="Botão CTA (texto)" value={post.ctaLabel || ''} onChange={(v) => onChange({ ctaLabel: v })} />
          <PropInput label="CTA URL" value={post.ctaUrl || ''} onChange={(v) => onChange({ ctaUrl: v })} />
        </div>
      )}
    </div>
  );
}

export function FeedPropsPanel({ props, onChange }: { props: Record<string, any>; onChange: (p: Record<string, any>) => void }) {
  const posts: FeedPost[] = props.posts || [];
  const set = (key: string) => (val: any) => onChange({ [key]: val });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const addPost = () => {
    const newPost: FeedPost = {
      id: `fp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      image: '', images: [], title: '', description: '', author: '', likes: 0, rating: 0, tags: [],
    };
    onChange({ posts: [...posts, newPost] });
  };

  const updatePost = (index: number, patch: Partial<FeedPost>) => {
    const next = posts.map((p, i) => i === index ? { ...p, ...patch } : p);
    onChange({ posts: next });
  };

  const removePost = (index: number) => {
    onChange({ posts: posts.filter((_, i) => i !== index) });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = posts.findIndex(p => p.id === active.id);
    const newIdx = posts.findIndex(p => p.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    onChange({ posts: arrayMove(posts, oldIdx, newIdx) });
  };

  return (
    <>
      <Section title="Lojas">
        <div>
          <Label className="text-[11px]">Layout</Label>
          <Select value={props.layout || 'vertical'} onValueChange={set('layout')}>
            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="vertical">📱 Vertical (scroll)</SelectItem>
              <SelectItem value="horizontal">↔️ Horizontal (carrossel)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Mostrar busca</Label>
          <Switch checked={props.showSearch !== false} onCheckedChange={set('showSearch')} />
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={posts.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {posts.map((post, i) => (
                <SortablePostEditor
                  key={post.id}
                  post={post}
                  onChange={(patch) => updatePost(i, patch)}
                  onRemove={() => removePost(i)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <Button variant="outline" size="sm" className="w-full text-xs gap-1.5" onClick={addPost}>
          <Plus className="w-3 h-3" /> Adicionar loja
        </Button>
      </Section>

      <Section title="Aparência">
        <PropInput label="Cor de fundo" value={props.bgColor || 'transparent'} onChange={set('bgColor')} type="color" />
        <PropInput label="Cor dos cards" value={props.cardBgColor || 'rgba(0,0,0,0.6)'} onChange={set('cardBgColor')} type="color" />
        <PropInput label="Cor do texto" value={props.textColor || '#ffffff'} onChange={set('textColor')} type="color" />
        <PropInput label="Cor de destaque" value={props.accentColor || '#ef4444'} onChange={set('accentColor')} type="color" />
        <PropInput label="Border Radius" value={props.borderRadius ?? 16} onChange={set('borderRadius')} type="number" />
        <PropInput label="Radius dos cards" value={props.cardBorderRadius ?? 12} onChange={set('cardBorderRadius')} type="number" />
        <PropInput label="Espaçamento" value={props.gap ?? 16} onChange={set('gap')} type="number" />
      </Section>

      <Section title="Opções">
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Mostrar autor</Label>
          <Switch checked={props.showAuthor !== false} onCheckedChange={set('showAuthor')} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Mostrar curtidas</Label>
          <Switch checked={props.showLikes !== false} onCheckedChange={set('showLikes')} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-[11px]">Mostrar comentários</Label>
          <Switch checked={props.showComments !== false} onCheckedChange={set('showComments')} />
        </div>
      </Section>
    </>
  );
}
