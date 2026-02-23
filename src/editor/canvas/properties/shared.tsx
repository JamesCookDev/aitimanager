import { useState, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2, X, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import React from 'react';

/* ── Section ─────────────────────────────── */

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
      {children}
    </div>
  );
}

/* ── Field ─────────────────────────────── */

export function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-muted-foreground font-mono w-3">{label}</span>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-7 text-xs font-mono"
      />
    </div>
  );
}

/* ── PropInput ─────────────────────────────── */

export function PropInput({ label, value, onChange, type = 'text' }: { label: string; value: any; onChange: (v: any) => void; type?: string }) {
  return (
    <div>
      <Label className="text-[11px]">{label}</Label>
      {type === 'color' ? (
        <div className="flex gap-2 mt-1">
          <input type="color" value={value || '#ffffff'} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
          <Input value={value || ''} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs font-mono" />
        </div>
      ) : type === 'textarea' ? (
        <Textarea value={value || ''} onChange={(e) => onChange(e.target.value)} className="text-xs mt-1 min-h-[60px]" />
      ) : (
        <Input type={type} value={value ?? ''} onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} className="h-8 text-xs mt-1" />
      )}
    </div>
  );
}

/* ── ImageUploadField ─────────────────────────────── */

export function ImageUploadField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Selecione um arquivo de imagem'); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('canvas-images').upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('canvas-images').getPublicUrl(path);
      onChange(urlData.publicUrl);
      toast.success('Imagem enviada!');
    } catch (err: any) {
      toast.error('Erro ao enviar: ' + (err.message || 'tente novamente'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-[11px]">Imagem</Label>
      {value && (
        <div className="w-full h-20 rounded-md overflow-hidden border border-border/50">
          <img src={value} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5" onClick={() => fileRef.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
        {uploading ? 'Enviando…' : 'Enviar imagem'}
      </Button>
      <Input placeholder="ou cole a URL da imagem" value={value || ''} onChange={(e) => onChange(e.target.value)} className="h-7 text-xs font-mono" />
    </div>
  );
}
