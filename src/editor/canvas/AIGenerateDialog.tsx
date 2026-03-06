import { useState } from 'react';
import { Sparkles, Loader2, Wand2, Plus, FileText, Layers } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CanvasView } from '../types/canvas';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (html: string) => void;
  views?: CanvasView[];
  activeViewId?: string;
  onGenerateForView?: (viewId: string, html: string) => void;
}

const SUGGESTIONS = [
  '🍕 Cardápio de pizzaria com categorias e preços',
  '🏨 Lobby de hotel com serviços e informações',
  '📋 Agenda de eventos com horários e palestrantes',
  '🏥 Painel de senhas para clínica médica',
  '🛍️ Vitrine de promoções de loja',
  '🎬 Programação de cinema com horários',
  '🍽️ Menu de restaurante sofisticado com drinks e sobremesas',
  '🏢 Diretório de salas e escritórios de um prédio comercial',
];

const MULTI_PAGE_SUGGESTIONS = [
  '🛒 Shopping: Home + Lojas + Alimentação + Cinema + Eventos',
  '🏨 Hotel: Recepção + Quartos + Restaurante + Spa + Eventos',
  '🏥 Hospital: Recepção + Especialidades + Exames + Emergência',
  '🍽️ Restaurante: Cardápio + Bebidas + Sobremesas + Promoções',
];

async function callGenerate(prompt: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('generate-html', {
    body: { prompt: prompt.trim() },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  const html = data?.html;
  if (!html) throw new Error('Nenhum HTML gerado');
  return html;
}

export function AIGenerateDialog({ open, onOpenChange, onGenerated, views, activeViewId, onGenerateForView }: Props) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<string>('single');
  const [multiPrompt, setMultiPrompt] = useState('');
  const [progress, setProgress] = useState('');

  const generateSingle = async () => {
    if (!prompt.trim()) { toast.error('Descreva o que deseja gerar'); return; }
    setLoading(true);
    setProgress('Gerando layout...');
    try {
      const html = await callGenerate(prompt);
      onGenerated(html);
      onOpenChange(false);
      setPrompt('');
      toast.success('Layout gerado com IA!');
    } catch (e: any) {
      console.error('AI generation error:', e);
      toast.error(e.message || 'Erro ao gerar layout');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const generateMultiPage = async () => {
    if (!multiPrompt.trim()) { toast.error('Descreva as páginas que deseja gerar'); return; }
    if (!onGenerateForView || !views) {
      toast.error('Sistema de páginas não disponível');
      return;
    }

    setLoading(true);
    const lines = multiPrompt.split('\n').map(l => l.trim()).filter(Boolean);

    try {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const pageName = line.split(':')[0]?.replace(/^[-•*\d.)\s]+/, '').trim() || `Página ${i + 1}`;
        setProgress(`Gerando ${pageName} (${i + 1}/${lines.length})...`);

        const html = await callGenerate(line);

        if (i === 0 && activeViewId) {
          // First page goes to active view
          onGenerateForView(activeViewId, html);
        } else {
          // Create new view and add element
          onGenerated(html); // For now, add to current view
        }

        // Small delay between requests to avoid rate limiting
        if (i < lines.length - 1) {
          await new Promise(r => setTimeout(r, 1500));
        }
      }

      onOpenChange(false);
      setMultiPrompt('');
      toast.success(`${lines.length} páginas geradas com IA!`);
    } catch (e: any) {
      console.error('Multi-page generation error:', e);
      toast.error(e.message || 'Erro ao gerar páginas');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
              <Sparkles className="w-4 h-4 text-violet-500" />
            </div>
            Gerar Layout com IA
            <Badge variant="secondary" className="text-[9px] ml-1">Groq</Badge>
          </AlertDialogTitle>
          <AlertDialogDescription>
            A IA gera HTML puro editável que é importado diretamente no canvas como layout completo.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="single" className="text-xs gap-1.5">
              <FileText className="w-3 h-3" />
              Página Única
            </TabsTrigger>
            <TabsTrigger value="multi" className="text-xs gap-1.5">
              <Layers className="w-3 h-3" />
              Múltiplas Páginas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-3 mt-3">
            <Textarea
              placeholder="Ex: Cardápio de restaurante japonês com categorias sushi, ramen e sobremesas, tema escuro com detalhes dourados..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none text-sm"
              disabled={loading}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generateSingle(); }}
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
          </TabsContent>

          <TabsContent value="multi" className="space-y-3 mt-3">
            <Textarea
              placeholder={"Escreva uma página por linha:\nHome: Tela principal do shopping com logo e horários\nLojas: Diretório de lojas por categoria\nAlimentação: Praça de alimentação com cardápio\nCinema: Programação do cinema com horários\nEventos: Agenda de eventos do mês"}
              value={multiPrompt}
              onChange={e => setMultiPrompt(e.target.value)}
              className="min-h-[160px] resize-none text-sm font-mono"
              disabled={loading}
            />

            <div className="space-y-1.5">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Templates multi-página</p>
              <div className="flex flex-wrap gap-1.5">
                {MULTI_PAGE_SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      const parts = s.split(':')[1]?.split('+').map(p => p.trim()) || [];
                      const context = s.split(':')[0]?.replace(/^[^\s]+\s/, '').trim() || '';
                      const lines = parts.map(p => `${p}: Tela de ${p.toLowerCase()} para ${context.toLowerCase()}`);
                      setMultiPrompt(lines.join('\n'));
                    }}
                    disabled={loading}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {progress && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
            <Loader2 className="w-3 h-3 animate-spin" />
            {progress}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground">
          💡 O HTML gerado é importado como layout completo editável (HTML Puro). Duplo-clique para editar textos e imagens no canvas.
        </p>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <Button
            onClick={tab === 'single' ? generateSingle : generateMultiPage}
            disabled={loading || (tab === 'single' ? !prompt.trim() : !multiPrompt.trim())}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                {tab === 'single' ? 'Gerar Layout' : 'Gerar Páginas'}
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
