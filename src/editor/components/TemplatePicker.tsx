import { useState } from 'react';
import { useEditor } from '@craftjs/core';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CRAFT_TEMPLATES, TEMPLATE_CATEGORIES, type CraftTemplate } from '../templates/craftTemplates';
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

interface TemplatePickerProps {
  onApplied?: () => void;
}

export function TemplatePicker({ onApplied }: TemplatePickerProps) {
  const { actions } = useEditor();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [confirmTemplate, setConfirmTemplate] = useState<CraftTemplate | null>(null);

  const filtered = activeCategory === 'all'
    ? CRAFT_TEMPLATES
    : CRAFT_TEMPLATES.filter((t) => t.category === activeCategory);

  const applyTemplate = (template: CraftTemplate) => {
    try {
      actions.deserialize(template.json);
      toast.success(`Template "${template.name}" aplicado`);
      onApplied?.();
    } catch (err) {
      console.error('Error applying template:', err);
      toast.error('Erro ao aplicar template');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category pills */}
      <div className="flex gap-1 p-2 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn(
            'px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors',
            activeCategory === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          )}
        >
          Todos
        </button>
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors',
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
      <ScrollArea className="flex-1 px-2 pb-2">
        <div className="space-y-2">
          {filtered.map((template) => (
            <button
              key={template.id}
              onClick={() => setConfirmTemplate(template)}
              className="w-full text-left p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-primary/10 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start gap-2.5">
                <span className="text-xl shrink-0 mt-0.5">{template.icon}</span>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {template.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                    {template.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Confirmation dialog */}
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
            <AlertDialogAction onClick={() => { if (confirmTemplate) applyTemplate(confirmTemplate); setConfirmTemplate(null); }}>
              Aplicar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
