import { useState } from 'react';
import { Plus, X, Pencil, Check, Home, Clock, Trash2, Copy, FileText, ChevronRight, GripVertical, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { CanvasView } from '../types/canvas';

interface Props {
  views: CanvasView[];
  activeViewId: string;
  viewIdleTimeout: number;
  elementCounts: Record<string, number>;
  pageBgColors?: Record<string, string>;
  globalBgColor: string;
  onSelectView: (id: string) => void;
  onAddView: (name: string) => void;
  onRenameView: (id: string, name: string) => void;
  onDeleteView: (id: string) => void;
  onDuplicateView?: (id: string) => void;
  onSetDefault: (id: string) => void;
  onSetIdleTimeout: (seconds: number) => void;
  onSetPageBgColor?: (viewId: string, color: string) => void;
}

export function PagesPanel({
  views, activeViewId, viewIdleTimeout, elementCounts,
  pageBgColors = {}, globalBgColor,
  onSelectView, onAddView, onRenameView, onDeleteView, onDuplicateView,
  onSetDefault, onSetIdleTimeout, onSetPageBgColor,
}: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const startEdit = (v: CanvasView) => {
    setEditing(v.id);
    setEditName(v.name);
  };

  const saveEdit = () => {
    if (editing && editName.trim()) {
      onRenameView(editing, editName.trim());
    }
    setEditing(null);
  };

  const handleAdd = () => {
    if (newName.trim()) {
      onAddView(newName.trim());
      setNewName('');
      setAdding(false);
    }
  };

  const defaultView = views.find(v => v.isDefault) || views[0];

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Páginas</h3>
          <span className="text-[9px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">{views.length}</span>
        </div>

        {/* Pages list */}
        <div className="space-y-1.5">
          {views.map((v) => {
            const isActive = v.id === activeViewId;
            const count = elementCounts[v.id] || 0;
            const bgColor = pageBgColors[v.id] || globalBgColor;

            return (
              <div
                key={v.id}
                onClick={() => onSelectView(v.id)}
                className={cn(
                  'group relative flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all border',
                  isActive
                    ? 'bg-primary/10 border-primary/30 shadow-sm'
                    : 'border-transparent hover:bg-muted/50 hover:border-border/50'
                )}
              >
                {/* Page thumbnail preview */}
                <div
                  className="w-8 h-14 rounded border border-border/50 shrink-0 relative overflow-hidden"
                  style={{ backgroundColor: bgColor }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText className="w-3 h-3 text-white/30" />
                  </div>
                  {v.isDefault && (
                    <div className="absolute top-0.5 right-0.5">
                      <Home className="w-2 h-2 text-primary" />
                    </div>
                  )}
                </div>

                {/* Page info */}
                <div className="flex-1 min-w-0">
                  {editing === v.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') setEditing(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-6 text-[11px] px-1.5"
                        autoFocus
                      />
                      <button onClick={(e) => { e.stopPropagation(); saveEdit(); }} className="text-green-500 hover:text-green-400 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className={cn(
                        'text-[11px] font-medium truncate',
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {v.name}
                      </p>
                      <p className="text-[9px] text-muted-foreground/60">
                        {count} {count === 1 ? 'elemento' : 'elementos'}
                      </p>
                    </>
                  )}
                </div>

                {/* Actions */}
                {editing !== v.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted/60 transition-opacity shrink-0">
                        <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); startEdit(v); }} className="text-xs gap-2">
                        <Pencil className="w-3 h-3" /> Renomear
                      </DropdownMenuItem>
                      {onDuplicateView && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicateView(v.id); }} className="text-xs gap-2">
                          <Copy className="w-3 h-3" /> Duplicar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSetDefault(v.id); }} className="text-xs gap-2">
                        <Home className="w-3 h-3" /> Definir como inicial
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {views.length > 1 && (
                        <DropdownMenuItem
                          onClick={(e) => { e.stopPropagation(); onDeleteView(v.id); }}
                          className="text-xs gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" /> Excluir
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </div>

        {/* Add page */}
        {adding ? (
          <div className="flex items-center gap-1.5 px-1">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') setAdding(false);
              }}
              placeholder="Nome da página..."
              className="h-7 text-[11px]"
              autoFocus
            />
            <button onClick={handleAdd} className="text-green-500 hover:text-green-400 shrink-0">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => setAdding(false)} className="text-muted-foreground hover:text-foreground shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-[11px] gap-1.5 border-dashed"
            onClick={() => setAdding(true)}
          >
            <Plus className="w-3.5 h-3.5" /> Nova Página
          </Button>
        )}

        {/* Settings */}
        <div className="pt-3 border-t border-border space-y-3">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Configurações</h4>

          {/* Per-page bg color */}
          {onSetPageBgColor && activeViewId && (
            <div className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground">Fundo da página atual</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={pageBgColors[activeViewId] || globalBgColor}
                  onChange={(e) => onSetPageBgColor(activeViewId, e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border-0"
                />
                <Input
                  value={pageBgColors[activeViewId] || globalBgColor}
                  onChange={(e) => onSetPageBgColor(activeViewId, e.target.value)}
                  className="h-7 text-[10px] font-mono"
                />
              </div>
            </div>
          )}

          {/* Idle timeout */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Auto-retorno
              </Label>
              <span className="text-[9px] font-mono text-muted-foreground">
                {viewIdleTimeout > 0 ? `${viewIdleTimeout}s` : 'Off'}
              </span>
            </div>
            <Slider
              value={[viewIdleTimeout]}
              onValueChange={([v]) => onSetIdleTimeout(v)}
              min={0} max={120} step={5}
            />
            <p className="text-[9px] text-muted-foreground">
              Após inatividade, volta para "{defaultView?.name || 'Home'}". 0 = desativado.
            </p>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
