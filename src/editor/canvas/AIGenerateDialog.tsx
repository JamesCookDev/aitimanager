import { useState } from 'react';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (html: string) => void;
}

const SUGGESTIONS = [
  '🍕 Cardápio de pizzaria com categorias e preços',
  '🏨 Lobby de hotel com serviços e informações',
  '📋 Agenda de eventos com horários e palestrantes',
  '🏥 Painel de senhas para clínica médica',
  '🛍️ Vitrine de promoções de loja',
  '🎬 Programação de cinema com horários',
];

export function AIGenerateDialog({ open, onOpenChange, onGenerated }: Props) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) { toast.error('Descreva o que deseja gerar'); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-html', {
        body: { prompt: prompt.trim() },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      const html = data?.html;
      if (!html) { toast.error('Nenhum HTML gerado'); return; }

      onGenerated(html);
      onOpenChange(false);
      setPrompt('');
      toast.success('Layout gerado com IA!');
    } catch (e: any) {
      console.error('AI generation error:', e);
      toast.error(e.message || 'Erro ao gerar layout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
              <Sparkles className="w-4 h-4 text-violet-500" />
            </div>
            Gerar Layout com IA
          </AlertDialogTitle>
          <AlertDialogDescription>
            Descreva o layout que deseja e a IA criará um HTML editável no canvas.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <Textarea
            placeholder="Ex: Cardápio de restaurante japonês com categorias sushi, ramen e sobremesas, tema escuro com detalhes dourados..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className="min-h-[120px] resize-none text-sm"
            disabled={loading}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate(); }}
          />

          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Sugestões rápidas</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  disabled={loading}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/40"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground">
            💡 Dica: Ctrl+Enter para gerar. Seja específico sobre cores, estilo e conteúdo.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <Button onClick={generate} disabled={loading || !prompt.trim()} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Gerar Layout
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
