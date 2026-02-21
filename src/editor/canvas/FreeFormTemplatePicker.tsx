import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  FREEFORM_TEMPLATES,
  FREEFORM_TEMPLATE_CATEGORIES,
  type FreeFormTemplate,
} from '../templates/freeFormTemplates';
import type { CanvasState } from '../types/canvas';

interface Props {
  onApply: (state: CanvasState) => void;
  trigger: React.ReactNode;
}

export function FreeFormTemplatePicker({ onApply, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [confirmTemplate, setConfirmTemplate] = useState<FreeFormTemplate | null>(null);

  const filtered = activeCategory === 'all'
    ? FREEFORM_TEMPLATES
    : FREEFORM_TEMPLATES.filter(t => t.category === activeCategory);

  const apply = (template: FreeFormTemplate) => {
    // Deep clone the state so templates can be re-applied
    const cloned = JSON.parse(JSON.stringify(template.state)) as CanvasState;
    cloned.selectedId = null;
    onApply(cloned);
    setOpen(false);
    setConfirmTemplate(null);
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>

      <AlertDialog open={open && !confirmTemplate} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <AlertDialogHeader>
            <AlertDialogTitle>Templates para Totem</AlertDialogTitle>
            <AlertDialogDescription>
              Escolha um template otimizado para tela vertical (1080×1920).
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Category pills */}
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setActiveCategory('all')}
              className={cn(
                'px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors',
                activeCategory === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              Todos
            </button>
            {FREEFORM_TEMPLATE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors',
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                )}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Template cards */}
          <ScrollArea className="flex-1 -mx-2 px-2">
            <div className="space-y-2 py-2">
              {filtered.map(template => (
                <button
                  key={template.id}
                  onClick={() => setConfirmTemplate(template)}
                  className="w-full text-left p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-primary/10 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0 mt-0.5">{template.icon}</span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {template.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                        {template.description}
                      </p>
                      <span className="text-[10px] text-muted-foreground/60 mt-1 inline-block">
                        {template.state.elements.length} elementos
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation */}
      <AlertDialog open={!!confirmTemplate} onOpenChange={() => setConfirmTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aplicar template?</AlertDialogTitle>
            <AlertDialogDescription>
              O template <strong>"{confirmTemplate?.name}"</strong> vai substituir todo o conteúdo atual do canvas. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmTemplate && apply(confirmTemplate)}>
              Aplicar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
