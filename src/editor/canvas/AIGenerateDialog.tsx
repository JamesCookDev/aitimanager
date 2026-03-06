import { useState } from 'react';
import { Sparkles, Loader2, Wand2, FileText, Layers, RefreshCw } from 'lucide-react';
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

interface GeneratedPage {
  name: string;
  html: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (html: string) => void;
  views?: CanvasView[];
  activeViewId?: string;
  /** Called for multi-page: creates a new view and adds the html element to it */
  onGenerateMultiPage?: (pages: GeneratedPage[]) => void;
  /** HTML of the currently selected element for refinement */
  existingHtml?: string;
  onRefined?: (html: string) => void;
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
  '🏋️ Academia: Home + Aulas + Planos + Personal + Horários',
  '🐾 Pet Shop: Home + Serviços + Produtos + Banho & Tosa',
];

const REFINEMENT_SUGGESTIONS = [
  '🎨 Mude as cores para tons de azul',
  '➕ Adicione mais itens ao cardápio',
  '🌙 Converta para tema escuro',
  '📱 Aumente o tamanho das fontes',
  '✨ Adicione animações nos cards',
  '🖼️ Troque as imagens por outras',
];

async function callGenerate(prompt: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('generate-html', {
    body: { prompt: prompt.trim() },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  if (!data?.html) throw new Error('Nenhum HTML gerado');
  return data.html;
}

async function callRefine(existingHtml: string, refinementPrompt: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('generate-html', {
    body: { existingHtml, refinementPrompt: refinementPrompt.trim() },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  if (!data?.html) throw new Error('Nenhum HTML gerado');
  return data.html;
}

export function AIGenerateDialog({ open, onOpenChange, onGenerated, views, activeViewId, onGenerateMultiPage, existingHtml, onRefined }: Props) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<string>(existingHtml ? 'refine' : 'single');
  const [multiPrompt, setMultiPrompt] = useState('');
  const [refinePrompt, setRefinePrompt] = useState('');
  const [progress, setProgress] = useState('');
  const [generatedCount, setGeneratedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const hasExisting = !!existingHtml;

  const generateSingle = async () => {
    if (!prompt.trim()) { toast.error('Descreva o que deseja gerar'); return; }
    setLoading(true);
    setProgress('Gerando layout para totem...');
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
    
    setLoading(true);
    const lines = multiPrompt.split('\n').map(l => l.trim()).filter(Boolean);
    setTotalCount(lines.length);
    setGeneratedCount(0);

    const pages: GeneratedPage[] = [];

    try {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const pageName = line.split(':')[0]?.replace(/^[-•*\d.)\s]+/, '').trim() || `Página ${i + 1}`;
        setProgress(`Gerando "${pageName}" (${i + 1}/${lines.length})...`);
        setGeneratedCount(i);

        const html = await callGenerate(line);
        pages.push({ name: pageName, html });

        // Delay between requests to avoid rate limiting
        if (i < lines.length - 1) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      setGeneratedCount(lines.length);

      if (onGenerateMultiPage) {
        onGenerateMultiPage(pages);
      } else {
        // Fallback: add all to current view
        pages.forEach(p => onGenerated(p.html));
      }

      onOpenChange(false);
      setMultiPrompt('');
      toast.success(`${pages.length} páginas geradas com IA!`);
    } catch (e: any) {
      console.error('Multi-page generation error:', e);
      toast.error(e.message || 'Erro ao gerar páginas');
      // Still add pages that were generated successfully
      if (pages.length > 0 && onGenerateMultiPage) {
        onGenerateMultiPage(pages);
        toast.info(`${pages.length} página(s) foram geradas antes do erro.`);
      }
    } finally {
      setLoading(false);
      setProgress('');
      setGeneratedCount(0);
      setTotalCount(0);
    }
  };

  const refineExisting = async () => {
    if (!refinePrompt.trim()) { toast.error('Descreva o ajuste desejado'); return; }
    if (!existingHtml || !onRefined) { toast.error('Nenhum HTML selecionado para refinar'); return; }
    setLoading(true);
    setProgress('Refinando layout...');
    try {
      const html = await callRefine(existingHtml, refinePrompt);
      onRefined(html);
      onOpenChange(false);
      setRefinePrompt('');
      toast.success('Layout refinado com IA!');
    } catch (e: any) {
      console.error('AI refinement error:', e);
      toast.error(e.message || 'Erro ao refinar layout');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const handleAction = () => {
    if (tab === 'refine') refineExisting();
    else if (tab === 'multi') generateMultiPage();
    else generateSingle();
  };

  const isDisabled = loading || (
    tab === 'single' ? !prompt.trim() :
    tab === 'multi' ? !multiPrompt.trim() :
    !refinePrompt.trim()
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
              <Sparkles className="w-4 h-4 text-violet-500" />
            </div>
            {tab === 'refine' ? 'Refinar Layout com IA' : 'Gerar Layout com IA'}
            <Badge variant="secondary" className="text-[9px] ml-1">Groq</Badge>
          </AlertDialogTitle>
          <AlertDialogDescription>
            {tab === 'refine'
              ? 'Descreva os ajustes que deseja aplicar ao layout atual.'
              : tab === 'multi'
              ? 'Cada linha gera uma página separada no canvas. A IA cria automaticamente as páginas/views.'
              : 'A IA gera HTML puro otimizado para tela de totem vertical (1080×1920px).'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className={`grid w-full h-8 ${hasExisting ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="single" className="text-xs gap-1.5">
              <FileText className="w-3 h-3" />
              Página Única
            </TabsTrigger>
            <TabsTrigger value="multi" className="text-xs gap-1.5">
              <Layers className="w-3 h-3" />
              Múltiplas Páginas
            </TabsTrigger>
            {hasExisting && (
              <TabsTrigger value="refine" className="text-xs gap-1.5">
                <RefreshCw className="w-3 h-3" />
                Refinar
              </TabsTrigger>
            )}
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
                  <button key={s} onClick={() => setPrompt(s)} disabled={loading}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/40">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="multi" className="space-y-3 mt-3">
            <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 text-[11px] text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">📄 Como funciona:</p>
              <p>• Escreva <strong>uma página por linha</strong> no formato <code className="bg-muted px-1 rounded">Nome: Descrição</code></p>
              <p>• Cada linha será gerada como uma <strong>página/view separada</strong> no canvas</p>
              <p>• A primeira página substitui a view ativa, as demais criam novas views</p>
            </div>

            <Textarea
              placeholder={"Home: Tela principal com logo, horário e destaques\nCardápio: Lista de pratos com categorias e preços\nBebidas: Menu de drinks e sucos com fotos\nSobremesas: Vitrine de doces e sobremesas\nContato: Informações, QR Code e redes sociais"}
              value={multiPrompt}
              onChange={e => setMultiPrompt(e.target.value)}
              className="min-h-[160px] resize-none text-sm font-mono"
              disabled={loading}
            />

            <div className="space-y-1.5">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Templates prontos</p>
              <div className="flex flex-wrap gap-1.5">
                {MULTI_PAGE_SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => {
                    const parts = s.split(':')[1]?.split('+').map(p => p.trim()) || [];
                    const context = s.split(':')[0]?.replace(/^[^\s]+\s/, '').trim() || '';
                    const lines = parts.map(p =>
                      `${p}: Tela de ${p.toLowerCase()} para ${context.toLowerCase()} — layout premium para totem vertical`
                    );
                    setMultiPrompt(lines.join('\n'));
                  }} disabled={loading}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/40">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {hasExisting && (
            <TabsContent value="refine" className="space-y-3 mt-3">
              <div className="bg-muted/30 border border-border/50 rounded-lg px-3 py-2 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  Layout selecionado no canvas será usado como base para o refinamento.
                </p>
              </div>

              <Textarea
                placeholder="Ex: Mude as cores para azul, adicione mais itens ao cardápio, aumente o tamanho dos títulos..."
                value={refinePrompt}
                onChange={e => setRefinePrompt(e.target.value)}
                className="min-h-[120px] resize-none text-sm"
                disabled={loading}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) refineExisting(); }}
              />

              <div className="space-y-1.5">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Ajustes rápidos</p>
                <div className="flex flex-wrap gap-1.5">
                  {REFINEMENT_SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => setRefinePrompt(s)} disabled={loading}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/40">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>

        {progress && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
              <Loader2 className="w-3 h-3 animate-spin" />
              {progress}
            </div>
            {totalCount > 1 && (
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${(generatedCount / totalCount) * 100}%` }}
                />
              </div>
            )}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground">
          💡 {tab === 'refine'
            ? 'A IA mantém a estrutura e aplica apenas os ajustes solicitados.'
            : tab === 'multi'
            ? 'Cada página é gerada individualmente com layout premium otimizado para totem 1080×1920.'
            : 'HTML otimizado para totem vertical 1080×1920px. Duplo-clique para editar no canvas.'}
        </p>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <Button onClick={handleAction} disabled={isDisabled} className="gap-2">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Gerando...</>
            ) : tab === 'refine' ? (
              <><RefreshCw className="w-4 h-4" />Refinar Layout</>
            ) : tab === 'multi' ? (
              <><Layers className="w-4 h-4" />Gerar {multiPrompt.split('\n').filter(l => l.trim()).length || ''} Páginas</>
            ) : (
              <><Wand2 className="w-4 h-4" />Gerar Layout</>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
