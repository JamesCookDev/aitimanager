import { useState } from 'react';
import { Plus, X, Pencil, Check, Home, Clock, Globe, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import type { CanvasView } from '../types/canvas';

interface Props {
  views: CanvasView[];
  activeViewId: string;
  viewIdleTimeout: number;
  elementCounts: Record<string, number>;
  onSelectView: (id: string) => void;
  onAddView: (name: string) => void;
  onRenameView: (id: string, name: string) => void;
  onDeleteView: (id: string) => void;
  onSetDefault: (id: string) => void;
  onSetIdleTimeout: (seconds: number) => void;
  idleScreenEnabled?: boolean;
  idleScreenTimeout?: number;
  onSetIdleScreen?: (enabled: boolean) => void;
  onSetIdleScreenTimeout?: (seconds: number) => void;
}

export function ViewsManager({
  views, activeViewId, viewIdleTimeout, elementCounts,
  onSelectView, onAddView, onRenameView, onDeleteView, onSetDefault, onSetIdleTimeout,
  idleScreenEnabled, idleScreenTimeout, onSetIdleScreen, onSetIdleScreenTimeout,
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
    <div
      className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-card/90 backdrop-blur-sm border border-border rounded-xl px-2 py-1 shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Global indicator */}
      <button
        onClick={() => onSelectView('__default__')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
          activeViewId === '__default__'
            ? 'bg-primary/20 text-primary border border-primary/30'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
        title="View padrão (global)"
      >
        <Globe className="w-3 h-3" />
        Global
        <span className="text-[9px] opacity-60">({elementCounts['__global__'] || 0})</span>
      </button>

      <div className="w-px h-5 bg-border mx-0.5" />

      {/* View tabs */}
      {views.map((v) => (
        <div key={v.id} className="flex items-center">
          {editing === v.id ? (
            <div className="flex items-center gap-1">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(null); }}
                className="h-6 w-20 text-[10px] px-1.5"
                autoFocus
              />
              <button onClick={saveEdit} className="text-green-500 hover:text-green-400">
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onSelectView(v.id)}
              onDoubleClick={() => startEdit(v)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all group relative ${
                activeViewId === v.id
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              title={`View: ${v.name}${v.isDefault ? ' (padrão)' : ''} — duplo clique para renomear`}
            >
              {v.isDefault && <Home className="w-3 h-3" />}
              {v.name}
              <span className="text-[9px] opacity-60">({elementCounts[v.id] || 0})</span>

              {/* Delete button (not for last view) */}
              {views.length > 1 && (
                <span
                  onClick={(e) => { e.stopPropagation(); onDeleteView(v.id); }}
                  className="opacity-0 group-hover:opacity-100 ml-0.5 hover:text-destructive transition-opacity"
                  title="Excluir view"
                >
                  <X className="w-2.5 h-2.5" />
                </span>
              )}
            </button>
          )}
        </div>
      ))}

      {/* Add view */}
      {adding ? (
        <div className="flex items-center gap-1">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
            placeholder="Nome..."
            className="h-6 w-20 text-[10px] px-1.5"
            autoFocus
          />
          <button onClick={handleAdd} className="text-green-500 hover:text-green-400">
            <Check className="w-3 h-3" />
          </button>
          <button onClick={() => setAdding(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          title="Adicionar nova view"
        >
          <Plus className="w-3 h-3" />
        </button>
      )}

      <div className="w-px h-5 bg-border mx-0.5" />

      {/* Timeout config */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            title="Timeout para retornar à view padrão"
          >
            <Clock className="w-3 h-3" />
            {viewIdleTimeout > 0 ? `${viewIdleTimeout}s` : 'Off'}
          </button>
        </PopoverTrigger>
        <PopoverContent side="bottom" className="w-56 p-3" onClick={(e) => e.stopPropagation()}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-semibold">Auto-retorno</Label>
              <span className="text-[10px] font-mono text-muted-foreground">
                {viewIdleTimeout > 0 ? `${viewIdleTimeout}s` : 'Desativado'}
              </span>
            </div>
            <Slider
              value={[viewIdleTimeout]}
              onValueChange={([v]) => onSetIdleTimeout(v)}
              min={0} max={120} step={5}
            />
            <p className="text-[9px] text-muted-foreground">
              Após inatividade, retorna à view padrão ({defaultView?.name || 'Home'}).
              0 = desativado.
            </p>

            <div className="pt-2 border-t border-border">
              <Label className="text-[10px] font-semibold">View padrão (home)</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {views.map(v => (
                  <button
                    key={v.id}
                    onClick={() => onSetDefault(v.id)}
                    className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                      v.isDefault
                        ? 'bg-primary/20 border-primary/30 text-primary'
                        : 'border-border/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Idle Screen config */}
      {onSetIdleScreen && (
        <>
          <div className="w-px h-5 bg-border mx-0.5" />
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                  idleScreenEnabled
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                title="Tela de descanso"
              >
                <Moon className="w-3 h-3" />
                {idleScreenEnabled ? `${idleScreenTimeout || 60}s` : 'Off'}
              </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" className="w-56 p-3" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-semibold">Tela de Descanso</Label>
                  <Switch
                    checked={idleScreenEnabled ?? false}
                    onCheckedChange={(v) => onSetIdleScreen(v)}
                  />
                </div>
                {idleScreenEnabled && onSetIdleScreenTimeout && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Ativar após</span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {idleScreenTimeout || 60}s
                      </span>
                    </div>
                    <Slider
                      value={[idleScreenTimeout || 60]}
                      onValueChange={([v]) => onSetIdleScreenTimeout(v)}
                      min={15} max={300} step={5}
                    />
                  </>
                )}
                <p className="text-[9px] text-muted-foreground">
                  Exibe um screensaver com imagens e textos extraídos do layout ao ficar inativo.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );
}
