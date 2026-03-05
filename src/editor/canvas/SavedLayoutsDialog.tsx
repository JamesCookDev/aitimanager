import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  FolderOpen, Save, Trash2, Clock, Loader2, Search, Plus, LayoutGrid, List,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { CanvasState } from '../types/canvas';

interface SavedLayout {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  layout: CanvasState;
  created_at: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentState: CanvasState;
  onLoad: (state: CanvasState) => void;
}

const ICONS = ['🎨', '📱', '🏪', '🎬', '🍕', '💈', '🏨', '🎵', '📅', '🛍️', '🏋️', '🎓', '⚕️', '🚗', '🐾', '🏠'];

export function SavedLayoutsDialog({ open, onOpenChange, currentState, onLoad }: Props) {
  const { user, profile } = useAuth();
  const [layouts, setLayouts] = useState<SavedLayout[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'list' | 'save'>('list');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteTarget, setDeleteTarget] = useState<SavedLayout | null>(null);

  // Save form
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');
  const [saveIcon, setSaveIcon] = useState('🎨');

  const orgId = profile?.org_id;

  const fetchLayouts = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('layout_templates')
      .select('id, name, description, icon, layout, created_at')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      toast.error('Erro ao carregar layouts salvos');
    }
    setLayouts((data as any[] || []).map(d => ({ ...d, layout: d.layout as CanvasState })));
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    if (open) {
      fetchLayouts();
      setMode('list');
      setSaveName('');
      setSaveDesc('');
      setSaveIcon('🎨');
    }
  }, [open, fetchLayouts]);

  const handleSave = async () => {
    if (!saveName.trim()) { toast.error('Digite um nome'); return; }
    if (!user || !orgId) { toast.error('Usuário não autenticado'); return; }
    setSaving(true);
    const { error } = await supabase.from('layout_templates').insert({
      name: saveName.trim(),
      description: saveDesc.trim() || null,
      icon: saveIcon,
      layout: currentState as any,
      org_id: orgId,
      created_by: user.id,
    });
    if (error) {
      console.error(error);
      toast.error('Erro ao salvar layout');
    } else {
      toast.success('Layout salvo com sucesso!');
      setMode('list');
      fetchLayouts();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('layout_templates').delete().eq('id', deleteTarget.id);
    if (error) {
      toast.error('Erro ao excluir');
    } else {
      toast.success('Layout excluído');
      setLayouts(prev => prev.filter(l => l.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const handleLoad = (layout: CanvasState) => {
    const cloned = JSON.parse(JSON.stringify(layout)) as CanvasState;
    cloned.selectedId = null;
    onLoad(cloned);
    onOpenChange(false);
    toast.success('Layout carregado!');
  };

  const filtered = layouts.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const elCount = (layout: CanvasState) => layout.elements?.length || 0;
  const pageCount = (layout: CanvasState) => layout.views?.length || 1;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">

          {/* Header */}
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/50">
            <DialogTitle className="flex items-center gap-2 text-base">
              <FolderOpen className="w-4 h-4 text-primary" />
              Layouts Salvos
            </DialogTitle>
            <DialogDescription className="text-xs">
              Salve e reutilize layouts entre dispositivos.
            </DialogDescription>
          </DialogHeader>

          {mode === 'list' ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar layouts..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="h-8 pl-8 text-xs bg-muted/30"
                  />
                </div>
                <div className="flex items-center bg-muted/30 rounded-md border border-border/40 p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn("p-1 rounded-sm transition-all", viewMode === 'grid' ? 'bg-primary/15 text-primary' : 'text-muted-foreground')}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn("p-1 rounded-sm transition-all", viewMode === 'list' ? 'bg-primary/15 text-primary' : 'text-muted-foreground')}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
                <Button size="sm" className="h-8 text-xs gap-1.5 font-semibold" onClick={() => setMode('save')}>
                  <Plus className="w-3.5 h-3.5" /> Salvar atual
                </Button>
              </div>

              {/* List */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <FolderOpen className="w-10 h-10 text-muted-foreground/20 mb-3" />
                      <p className="text-sm text-muted-foreground font-medium">
                        {search ? 'Nenhum layout encontrado' : 'Nenhum layout salvo ainda'}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Clique em "Salvar atual" para guardar o layout do canvas.
                      </p>
                    </div>
                  ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 gap-3">
                      {filtered.map(l => (
                        <button
                          key={l.id}
                          onClick={() => handleLoad(l.layout)}
                          className="group relative text-left p-4 rounded-xl border border-border/50 bg-card/60 hover:bg-primary/5 hover:border-primary/30 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl shrink-0">{l.icon}</span>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-semibold text-foreground truncate">{l.name}</h4>
                              {l.description && (
                                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{l.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                  {elCount(l.layout)} elementos
                                </Badge>
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                  {pageCount(l.layout)} pág.
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground/60">
                                <Clock className="w-2.5 h-2.5" /> {fmtDate(l.created_at)}
                              </div>
                            </div>
                          </div>
                          {/* Delete button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(l); }}
                            className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {filtered.map(l => (
                        <button
                          key={l.id}
                          onClick={() => handleLoad(l.layout)}
                          className="group w-full flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-card/40 hover:bg-primary/5 hover:border-primary/30 transition-all"
                        >
                          <span className="text-xl shrink-0">{l.icon}</span>
                          <div className="flex-1 min-w-0 text-left">
                            <h4 className="text-xs font-semibold text-foreground truncate">{l.name}</h4>
                            {l.description && <p className="text-[10px] text-muted-foreground truncate">{l.description}</p>}
                          </div>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 shrink-0">{elCount(l.layout)} el.</Badge>
                          <span className="text-[10px] text-muted-foreground/50 shrink-0">{fmtDate(l.created_at)}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(l); }}
                            className="p-1 rounded-md opacity-0 group-hover:opacity-100 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            /* ── SAVE MODE ── */
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Nome do layout</Label>
                <Input
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  placeholder="Ex: Agenda de Eventos, Menu Digital..."
                  className="h-9 text-sm"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Descrição (opcional)</Label>
                <Textarea
                  value={saveDesc}
                  onChange={e => setSaveDesc(e.target.value)}
                  placeholder="Notas sobre este layout..."
                  className="text-sm resize-none h-16"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Ícone</Label>
                <div className="flex flex-wrap gap-1.5">
                  {ICONS.map(ico => (
                    <button
                      key={ico}
                      onClick={() => setSaveIcon(ico)}
                      className={cn(
                        "w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all border",
                        ico === saveIcon
                          ? "border-primary bg-primary/15 shadow-sm shadow-primary/20"
                          : "border-border/40 bg-muted/20 hover:bg-muted/40"
                      )}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/20 border border-border/30">
                <span className="text-xl">{saveIcon}</span>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{currentState.elements?.length || 0}</span> elementos,{' '}
                  <span className="font-medium text-foreground">{currentState.views?.length || 1}</span> páginas serão salvas.
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setMode('list')}>
                  Cancelar
                </Button>
                <Button size="sm" className="text-xs gap-1.5 font-semibold" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Salvar Layout
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">Excluir layout?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              O layout "{deleteTarget?.name}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-8">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="text-xs h-8 bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
