import { useState, useCallback, useEffect } from 'react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import {
  Eye, Edit3, Download, Upload, Save, Undo2, Redo2, Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

import { TextBlock } from './components/TextBlock';
import { ImageBlock } from './components/ImageBlock';
import { ButtonBlock } from './components/ButtonBlock';
import { ContainerBlock } from './components/ContainerBlock';
import { AvatarBlock } from './components/AvatarBlock';
import { SpacerBlock } from './components/SpacerBlock';
import { DividerBlock } from './components/DividerBlock';
import { MenuBlock } from './components/MenuBlock';
import { IconBlock } from './components/IconBlock';
import { BadgeBlock } from './components/BadgeBlock';
import { CardBlock } from './components/CardBlock';
import { CanvasDropArea } from './components/CanvasDropArea';
import { EditorToolbox } from './components/EditorToolbox';
import { EditorProperties } from './components/EditorProperties';
import { saveEditorState, loadEditorState, exportEditorJson, importEditorJson } from './utils/editorStorage';

const resolver = { TextBlock, ImageBlock, ButtonBlock, ContainerBlock, AvatarBlock, SpacerBlock, DividerBlock, MenuBlock, IconBlock, BadgeBlock, CardBlock, CanvasDropArea };

export function PageEditor() {
  const [previewMode, setPreviewMode] = useState(false);

  return (
    <Editor resolver={resolver} enabled={!previewMode}>
      <PageEditorInner previewMode={previewMode} setPreviewMode={setPreviewMode} />
    </Editor>
  );
}

function PageEditorInner({ previewMode, setPreviewMode }: { previewMode: boolean; setPreviewMode: (v: boolean) => void }) {
  const { actions, query, canUndo, canRedo } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  // Auto-save on changes
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const json = query.serialize();
        saveEditorState(json);
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [query]);

  // Load saved state on mount
  useEffect(() => {
    const saved = loadEditorState();
    if (saved) {
      try {
        actions.deserialize(saved);
        toast.info('Layout anterior restaurado');
      } catch {
        // ignore invalid state
      }
    }
  }, []);

  const handleExport = useCallback(() => {
    try {
      const json = query.serialize();
      exportEditorJson(json);
      toast.success('JSON exportado com sucesso');
    } catch {
      toast.error('Erro ao exportar');
    }
  }, [query]);

  const handleImport = useCallback(async () => {
    try {
      const json = await importEditorJson();
      actions.deserialize(json);
      toast.success('Layout importado com sucesso');
    } catch {
      toast.error('Erro ao importar arquivo');
    }
  }, [actions]);

  const handleSave = useCallback(() => {
    try {
      const json = query.serialize();
      saveEditorState(json);
      toast.success('Layout salvo');
    } catch {
      toast.error('Erro ao salvar');
    }
  }, [query]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Page Builder</h2>
          <div className="h-4 w-px bg-border mx-1" />
          <Button
            variant={previewMode ? 'default' : 'outline'}
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {previewMode ? 'Editar' : 'Visualizar'}
          </Button>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" disabled={!canUndo} onClick={() => actions.history.undo()} className="h-8 w-8">
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled={!canRedo} onClick={() => actions.history.redo()} className="h-8 w-8">
            <Redo2 className="w-4 h-4" />
          </Button>
          <div className="h-4 w-px bg-border mx-1" />
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleSave}>
            <Save className="w-3.5 h-3.5" /> Salvar
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExport}>
            <Download className="w-3.5 h-3.5" /> Exportar
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleImport}>
            <Upload className="w-3.5 h-3.5" /> Importar
          </Button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — blocks */}
        {!previewMode && (
          <div className="w-52 border-r border-border bg-card/30 shrink-0">
            <ScrollArea className="h-full p-3">
              <EditorToolbox />
            </ScrollArea>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-muted/20 flex items-stretch justify-center p-4">
          <div
            className="w-full rounded-xl border border-border/60 shadow-lg overflow-hidden"
            style={{
              maxWidth: 600,
              backgroundColor: '#0f172a',
            }}
          >
            <Frame>
              <Element is={CanvasDropArea} canvas bgColor="#0f172a">
                {/* Default content */}
              </Element>
            </Frame>
          </div>
        </div>

        {/* Right sidebar — properties */}
        {!previewMode && (
          <div className="w-72 border-l border-border bg-card/30 shrink-0">
            <Tabs defaultValue="properties" className="h-full flex flex-col">
              <TabsList className="w-full grid grid-cols-2 shrink-0 rounded-none border-b border-border">
                <TabsTrigger value="properties" className="text-xs gap-1 rounded-none">
                  <Edit3 className="w-3.5 h-3.5" /> Propriedades
                </TabsTrigger>
                <TabsTrigger value="layers" className="text-xs gap-1 rounded-none">
                  <Layers className="w-3.5 h-3.5" /> Camadas
                </TabsTrigger>
              </TabsList>
              <TabsContent value="properties" className="flex-1 mt-0 overflow-hidden">
                <EditorProperties />
              </TabsContent>
              <TabsContent value="layers" className="flex-1 mt-0 p-3">
                <EditorLayersList />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

function EditorLayersList() {
  const { nodes, actions } = useEditor((state) => ({
    nodes: state.nodes,
  }));

  const nodeIds = Object.keys(nodes).filter((id) => id !== 'ROOT');

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1">
        {nodeIds.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Arraste blocos para o canvas
          </p>
        )}
        {nodeIds.map((id) => {
          const node = nodes[id];
          if (!node) return null;
          return (
            <button
              key={id}
              onClick={() => actions.selectNode(id)}
              className="w-full text-left px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors touch-manipulation"
            >
              {node.data.displayName || node.data.name || 'Componente'}
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
