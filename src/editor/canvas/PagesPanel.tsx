import { useState } from 'react';
import { Plus, X, Pencil, Check, Home, Clock, Trash2, Copy, FileText, ChevronRight, ChevronDown, MoreHorizontal, CornerDownRight, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  onAddView: (name: string, parentId?: string | null) => void;
  onRenameView: (id: string, name: string) => void;
  onDeleteView: (id: string) => void;
  onDuplicateView?: (id: string) => void;
  onSetDefault: (id: string) => void;
  onSetIdleTimeout: (seconds: number) => void;
  onSetPageBgColor?: (viewId: string, color: string) => void;
  onSetParent?: (viewId: string, parentId: string | null) => void;
}

export function PagesPanel({
  views, activeViewId, viewIdleTimeout, elementCounts,
  pageBgColors = {}, globalBgColor,
  onSelectView, onAddView, onRenameView, onDeleteView, onDuplicateView,
  onSetDefault, onSetIdleTimeout, onSetPageBgColor, onSetParent,
}: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [adding, setAdding] = useState(false);
  const [addingChildOf, setAddingChildOf] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const startEdit = (v: CanvasView) => { setEditing(v.id); setEditName(v.name); };
  const saveEdit = () => { if (editing && editName.trim()) onRenameView(editing, editName.trim()); setEditing(null); };

  const handleAdd = (parentId?: string | null) => {
    if (newName.trim()) {
      onAddView(newName.trim(), parentId || null);
      setNewName('');
      setAdding(false);
      setAddingChildOf(null);
    }
  };

  const handleAddChild = (parentId: string) => {
    setAddingChildOf(parentId);
    setAdding(false);
    setNewName('');
  };

  const toggleCollapse = (id: string) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));

  const defaultView = views.find(v => v.isDefault) || views[0];

  // Build tree structure
  const rootViews = views.filter(v => !v.parentId);
  const getChildren = (parentId: string) => views.filter(v => v.parentId === parentId);
  const hasChildren = (id: string) => views.some(v => v.parentId === id);

  // Get all ancestors to prevent circular references
  const getAncestors = (id: string): string[] => {
    const view = views.find(v => v.id === id);
    if (!view?.parentId) return [];
    return [view.parentId, ...getAncestors(view.parentId)];
  };

  const renderPageItem = (v: CanvasView, depth: number = 0) => {
    const isActive = v.id === activeViewId;
    const count = elementCounts[v.id] || 0;
    const bgColor = pageBgColors[v.id] || globalBgColor;
    const children = getChildren(v.id);
    const isCollapsed = collapsed[v.id];
    const hasKids = children.length > 0;

    // Pages that can be set as parent (not self, not descendants)
    const validParents = views.filter(p => {
      if (p.id === v.id) return false;
      const ancestors = getAncestors(p.id);
      return !ancestors.includes(v.id);
    });

    return (
      <div key={v.id} className="relative">
        {/* Tree connector lines */}
        {depth > 0 && (
          <>
            {/* Vertical line from parent */}
            <div
              className="absolute border-l-2 border-muted-foreground/20"
              style={{
                left: `${depth * 20 + 2}px`,
                top: 0,
                bottom: hasKids && !isCollapsed ? 0 : '50%',
                height: hasKids && !isCollapsed ? undefined : '50%',
              }}
            />
            {/* Horizontal line to item */}
            <div
              className="absolute border-t-2 border-muted-foreground/20"
              style={{
                left: `${depth * 20 + 2}px`,
                top: '50%',
                width: '10px',
              }}
            />
          </>
        )}

        <div
          onClick={() => onSelectView(v.id)}
          className={cn(
            'group relative flex items-center gap-2 py-2 rounded-lg cursor-pointer transition-all border',
            isActive
              ? 'bg-primary/10 border-primary/30 shadow-sm'
              : 'border-transparent hover:bg-muted/50 hover:border-border/50'
          )}
          style={{ paddingLeft: `${10 + depth * 20}px`, paddingRight: '10px' }}
        >
          {/* Collapse toggle for parents */}
          {hasKids ? (
            <button
              onClick={(e) => { e.stopPropagation(); toggleCollapse(v.id); }}
              className="shrink-0 p-0.5 rounded hover:bg-muted/60 text-muted-foreground"
            >
              {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          ) : (
            <div className="w-4 shrink-0" />
          )}

          {/* Page thumbnail */}
          <div
            className="w-7 h-12 rounded border border-border/50 shrink-0 relative overflow-hidden"
            style={{ backgroundColor: bgColor }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="w-2.5 h-2.5 text-white/30" />
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
                  onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(null); }}
                  onClick={(e) => e.stopPropagation()}
                  className="h-6 text-[11px] px-1.5"
                  autoFocus
                />
                <button onClick={(e) => { e.stopPropagation(); saveEdit(); }} className="text-primary hover:text-primary/80 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <p className={cn('text-[11px] font-medium truncate', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                  {v.name}
                </p>
                <p className="text-[9px] text-muted-foreground/60">
                  {count} {count === 1 ? 'elemento' : 'elementos'}
                  {hasKids && ` · ${children.length} sub`}
                </p>
              </>
            )}
          </div>

          {/* Actions menu */}
          {editing !== v.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted/60 transition-opacity shrink-0">
                  <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); startEdit(v); }} className="text-xs gap-2">
                  <Pencil className="w-3 h-3" /> Renomear
                </DropdownMenuItem>
                {onDuplicateView && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicateView(v.id); }} className="text-xs gap-2">
                    <Copy className="w-3 h-3" /> Duplicar
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAddChild(v.id); }} className="text-xs gap-2">
                  <Plus className="w-3 h-3" /> Adicionar sub-página
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSetDefault(v.id); }} className="text-xs gap-2">
                  <Home className="w-3 h-3" /> Definir como inicial
                </DropdownMenuItem>

                {/* Move to parent submenu */}
                {onSetParent && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="text-xs gap-2">
                      <CornerDownRight className="w-3 h-3" /> Mover para...
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-40">
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); onSetParent(v.id, null); }}
                        className={cn('text-xs gap-2', !v.parentId && 'text-primary')}
                      >
                        Raiz (sem pai)
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {validParents.map(p => (
                        <DropdownMenuItem
                          key={p.id}
                          onClick={(e) => { e.stopPropagation(); onSetParent(v.id, p.id); }}
                          className={cn('text-xs gap-2', v.parentId === p.id && 'text-primary')}
                        >
                          {p.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}

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

        {/* Inline add child input */}
        {addingChildOf === v.id && (
          <div className="flex items-center gap-1.5 py-1 relative" style={{ paddingLeft: `${30 + depth * 20}px` }}>
            <CornerDownRight className="w-3 h-3 text-muted-foreground shrink-0" />
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newName.trim()) {
                  onAddView(newName.trim(), v.id);
                  setNewName('');
                  setAddingChildOf(null);
                }
                if (e.key === 'Escape') setAddingChildOf(null);
              }}
              placeholder="Nome da sub-página..."
              className="h-6 text-[10px] flex-1"
              autoFocus
            />
            <button onClick={() => setAddingChildOf(null)} className="text-muted-foreground hover:text-foreground shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Children with continuous vertical line */}
        {hasKids && !isCollapsed && (
          <div className="relative">
            {/* Continuous vertical line spanning all children */}
            <div
              className="absolute border-l-2 border-muted-foreground/20"
              style={{
                left: `${(depth + 1) * 20 + 2}px`,
                top: 0,
                bottom: 0,
              }}
            />
            {children.map((child, idx) => {
              const isLast = idx === children.length - 1;
              return (
                <div key={child.id} className="relative">
                  {/* Clip the vertical line at last child */}
                  {isLast && (
                    <div
                      className="absolute bg-background"
                      style={{
                        left: `${(depth + 1) * 20 + 1}px`,
                        top: '50%',
                        bottom: -1,
                        width: 4,
                      }}
                    />
                  )}
                  {renderPageItem(child, depth + 1)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Páginas</h3>
          <span className="text-[9px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">{views.length}</span>
        </div>

        {/* Pages tree */}
        <div className="space-y-0.5 relative">
          {rootViews.map(v => renderPageItem(v))}
        </div>

        {/* Add root page */}
        {adding ? (
          <div className="flex items-center gap-1.5 px-1">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
              placeholder="Nome da página..."
              className="h-7 text-[11px]"
              autoFocus
            />
            <button onClick={() => handleAdd()} className="text-green-500 hover:text-green-400 shrink-0">
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
