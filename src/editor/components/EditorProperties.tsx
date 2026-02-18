import { useEditor } from '@craftjs/core';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export function EditorProperties() {
  const { selected, relatedSettings } = useEditor((state, query) => {
    const currentNodeId = query.getEvent('selected').last();
    let selected: { id: string; name: string; isDeletable: boolean } | undefined;
    let relatedSettings: React.ElementType | undefined;

    if (currentNodeId) {
      const node = state.nodes[currentNodeId];
      if (node) {
        selected = {
          id: currentNodeId,
          name: node.data.displayName || node.data.name || 'Componente',
          isDeletable: query.node(currentNodeId).isDeletable(),
        };

        const settingsComponent = node.related?.settings;
        if (settingsComponent) {
          relatedSettings = settingsComponent;
        }
      }
    }

    return { selected, relatedSettings };
  });

  const { actions } = useEditor();

  if (!selected) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
          <span className="text-xl">👆</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Selecione um bloco no canvas para editar suas propriedades
        </p>
      </div>
    );
  }

  const SettingsComponent = relatedSettings;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {selected.name}
        </h3>
      </div>
      <ScrollArea className="flex-1 p-3">
        {SettingsComponent ? (
          <SettingsComponent />
        ) : (
          <p className="text-xs text-muted-foreground">Sem propriedades editáveis</p>
        )}
      </ScrollArea>
      {selected.isDeletable && (
        <div className="p-3 border-t border-border/50">
          <Button
            variant="destructive"
            size="sm"
            className="w-full gap-2"
            onClick={() => actions.delete(selected!.id)}
          >
            <Trash2 className="w-3.5 h-3.5" /> Remover Bloco
          </Button>
        </div>
      )}
    </div>
  );
}
