import { useState, useCallback } from 'react';
import { Code2, Upload, Sparkles, Save, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { parseHtmlToElements, extractBgColor } from '../utils/htmlToCanvas';
import type { CanvasElement, CanvasState } from '../types/canvas';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportToCanvas: (elements: CanvasElement[], bgColor?: string) => void;
  onSaveAsTemplate?: (name: string, elements: CanvasElement[], bgColor: string) => void;
}

export function HtmlImportDialog({ open, onOpenChange, onImportToCanvas, onSaveAsTemplate }: Props) {
  const [html, setHtml] = useState('');
  const [preview, setPreview] = useState<CanvasElement[]>([]);
  const [bgColor, setBgColor] = useState<string | null>(null);
  const [parsed, setParsed] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const handleParse = useCallback(() => {
    if (!html.trim()) {
      toast.error('Cole o HTML/CSS exportado do Figma');
      return;
    }
    try {
      const elements = parseHtmlToElements(html);
      const bg = extractBgColor(html);
      if (elements.length === 0) {
        toast.error('Nenhum elemento visual encontrado no HTML');
        return;
      }
      setPreview(elements);
      setBgColor(bg);
      setParsed(true);
      toast.success(`${elements.length} elementos detectados`);
    } catch (err) {
      console.error('Parse error:', err);
      toast.error('Erro ao processar o HTML');
    }
  }, [html]);

  const handleImport = useCallback(() => {
    if (preview.length === 0) return;
    onImportToCanvas(preview, bgColor || undefined);
    toast.success(`${preview.length} elementos importados no canvas`);

    if (saveAsTemplate && templateName.trim() && onSaveAsTemplate) {
      onSaveAsTemplate(templateName.trim(), preview, bgColor || '#0f172a');
    }

    // Reset
    setHtml('');
    setPreview([]);
    setParsed(false);
    setSaveAsTemplate(false);
    setTemplateName('');
    onOpenChange(false);
  }, [preview, bgColor, saveAsTemplate, templateName, onImportToCanvas, onSaveAsTemplate, onOpenChange]);

  const handleReset = () => {
    setPreview([]);
    setParsed(false);
    setBgColor(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" />
            Importar HTML/CSS do Figma
          </DialogTitle>
          <DialogDescription>
            Cole o código HTML/CSS exportado de plugins como Anima, Locofy ou similar.
            O parser converte automaticamente para elementos do canvas.
          </DialogDescription>
        </DialogHeader>

        {!parsed ? (
          /* ── Step 1: Paste HTML ── */
          <div className="flex-1 flex flex-col gap-3">
            <Textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder={`<!-- Cole seu HTML aqui -->\n<div style="background: #1a1a2e; width: 1080px; height: 1920px;">\n  <h1 style="color: white; font-size: 48px; position: absolute; top: 100px; left: 60px;">\n    Bem-vindo\n  </h1>\n  <img src="logo.png" style="position: absolute; top: 40px; right: 40px; width: 120px;" />\n  <button style="background: #6366f1; color: white; padding: 16px 32px; border-radius: 999px; position: absolute; bottom: 200px; left: 50%;">\n    Começar\n  </button>\n</div>`}
              className="flex-1 min-h-[280px] font-mono text-xs leading-relaxed resize-none"
            />

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Sparkles className="w-3 h-3" />
              <span>Suporta: elementos posicionados (absolute), tamanhos em px/rem/vw/vh, cores RGB/HEX, imagens, botões e textos</span>
            </div>
          </div>
        ) : (
          /* ── Step 2: Preview & Options ── */
          <div className="flex-1 flex flex-col gap-4">
            {/* Preview summary */}
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {preview.length} elementos detectados
              </h4>
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                {preview.map((el, i) => (
                  <div key={el.id} className="flex items-center gap-2 text-xs bg-background/50 rounded-md px-2.5 py-1.5 border border-border/30">
                    <span className="w-2 h-2 rounded-full" style={{
                      backgroundColor: el.type === 'text' ? '#60a5fa' : el.type === 'image' ? '#34d399' : el.type === 'button' ? '#a78bfa' : el.type === 'shape' ? '#f97316' : '#94a3b8'
                    }} />
                    <span className="text-muted-foreground capitalize">{el.type}</span>
                    <span className="text-foreground font-medium truncate flex-1">{el.name}</span>
                    <span className="text-[9px] text-muted-foreground/50 font-mono">{el.width}×{el.height}</span>
                  </div>
                ))}
              </div>
              {bgColor && (
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <div className="w-4 h-4 rounded border border-border/50" style={{ backgroundColor: bgColor }} />
                  Background detectado: <code className="text-primary">{bgColor}</code>
                </div>
              )}
            </div>

            {/* Save as template option */}
            <div className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium flex items-center gap-2">
                  <Save className="w-3.5 h-3.5" />
                  Salvar também como template
                </Label>
                <Switch checked={saveAsTemplate} onCheckedChange={setSaveAsTemplate} />
              </div>
              {saveAsTemplate && (
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Nome do template (ex: Layout Restaurante v2)"
                  className="text-xs h-8"
                />
              )}
            </div>

            <Button variant="outline" size="sm" onClick={handleReset} className="self-start text-xs">
              ← Editar HTML
            </Button>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-xs">
            Cancelar
          </Button>
          {!parsed ? (
            <Button onClick={handleParse} disabled={!html.trim()} className="text-xs gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Analisar HTML
            </Button>
          ) : (
            <Button onClick={handleImport} className="text-xs gap-1.5">
              <ArrowRight className="w-3.5 h-3.5" />
              Importar {preview.length} elementos
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
