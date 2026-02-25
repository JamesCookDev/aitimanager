import { useState, useCallback, useMemo } from 'react';
import { FileCode2, Upload, ClipboardPaste, AlertTriangle, Eye } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { parseSVGToCanvas } from '../utils/svgToCanvas';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../types/canvas';
import type { CanvasState, CanvasElement } from '../types/canvas';
import { ElementRenderer } from './renderers/ElementRenderer';

interface SVGImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (state: CanvasState) => void;
}

/* ── Mini canvas preview of parsed elements ── */
function CanvasPreview({ elements, bgColor }: { elements: CanvasElement[]; bgColor: string }) {
  // Scale the 1080×1920 canvas to fit inside a small preview box
  const previewW = 200;
  const scale = previewW / CANVAS_WIDTH;
  const previewH = CANVAS_HEIGHT * scale;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
        <Eye className="w-3 h-3" /> Pré-visualização do canvas
      </div>
      <div
        className="relative rounded-lg overflow-hidden border border-border/60 shadow-md"
        style={{
          width: previewW,
          height: previewH,
          backgroundColor: bgColor,
        }}
      >
        {elements.map((el) => (
          <div
            key={el.id}
            style={{
              position: 'absolute',
              left: el.x * scale,
              top: el.y * scale,
              width: el.width * scale,
              height: el.height * scale,
              opacity: el.opacity,
              zIndex: el.zIndex,
              overflow: 'hidden',
              pointerEvents: 'none',
            }}
          >
            <ElementRenderer element={el} />
          </div>
        ))}
      </div>
      <span className="text-[9px] text-muted-foreground/50">1080 × 1920</span>
    </div>
  );
}

export function SVGImportDialog({ open, onOpenChange, onImport }: SVGImportDialogProps) {
  const [svgCode, setSvgCode] = useState('');
  const [error, setError] = useState('');
  const [parsedResult, setParsedResult] = useState<{ elements: CanvasElement[]; bgColor: string } | null>(null);

  const reset = () => {
    setSvgCode('');
    setError('');
    setParsedResult(null);
  };

  const processImport = useCallback((svg: string) => {
    setError('');
    setParsedResult(null);
    try {
      const result = parseSVGToCanvas(svg);
      if (result.elements.length === 0) {
        setError('Nenhum elemento reconhecido no SVG. Tente um SVG com retângulos, textos ou imagens.');
        return;
      }
      setParsedResult({ elements: result.elements, bgColor: result.bgColor });
      setSvgCode(svg);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar SVG');
    }
  }, []);

  const handleFileUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.svg';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        processImport(text);
      } catch {
        setError('Erro ao ler arquivo');
      }
    };
    input.click();
  }, [processImport]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.includes('<svg')) {
        processImport(text);
      } else {
        setError('O conteúdo da área de transferência não parece ser um SVG válido');
      }
    } catch {
      setError('Não foi possível acessar a área de transferência');
    }
  }, [processImport]);

  const handleConfirm = useCallback(() => {
    if (!parsedResult) return;
    const state: CanvasState = {
      bgColor: parsedResult.bgColor,
      elements: parsedResult.elements,
      selectedId: null,
      views: [{ id: '__default__', name: 'Home', isDefault: true }],
      activeViewId: '__default__',
      viewIdleTimeout: 30,
      pageBgColors: {},
    };
    onImport(state);
    toast.success(`${parsedResult.elements.length} elementos importados do SVG`);
    reset();
    onOpenChange(false);
  }, [parsedResult, onImport, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className={parsedResult ? "sm:max-w-2xl" : "sm:max-w-lg"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-primary" />
            Importar SVG
          </DialogTitle>
          <DialogDescription>
            Cole o código SVG ou faça upload de um arquivo .svg para converter em elementos do canvas.
          </DialogDescription>
        </DialogHeader>

        <div className={parsedResult ? "flex gap-5" : ""}>
          {/* Left: Input area */}
          <div className="flex-1 space-y-3">
            <Tabs defaultValue="paste" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="paste" className="text-xs gap-1.5">
                  <ClipboardPaste className="w-3.5 h-3.5" /> Colar código
                </TabsTrigger>
                <TabsTrigger value="upload" className="text-xs gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> Upload arquivo
                </TabsTrigger>
              </TabsList>

              <TabsContent value="paste" className="space-y-3 mt-3">
                <Textarea
                  placeholder={'<svg viewBox="0 0 1080 1920" ...>\n  ...\n</svg>'}
                  value={svgCode}
                  onChange={(e) => {
                    setSvgCode(e.target.value);
                    setError('');
                    setParsedResult(null);
                  }}
                  className="font-mono text-xs min-h-[160px] resize-none"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePaste} className="text-xs gap-1.5">
                    <ClipboardPaste className="w-3.5 h-3.5" /> Colar
                  </Button>
                  {svgCode && !parsedResult && (
                    <Button variant="secondary" size="sm" onClick={() => processImport(svgCode)} className="text-xs">
                      Analisar SVG
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="upload" className="mt-3">
                <button
                  onClick={handleFileUpload}
                  className="w-full border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground text-center">
                    <span className="font-medium text-foreground">Clique para selecionar</span>
                    <br />
                    Arquivo .svg
                  </div>
                </button>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            {parsedResult && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs text-primary font-medium">
                  ✅ {parsedResult.elements.length} elementos reconhecidos — Fundo: {parsedResult.bgColor}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Elementos mapeados para o canvas 1080×1920.
                </p>
              </div>
            )}
          </div>

          {/* Right: Canvas preview */}
          {parsedResult && (
            <div className="flex items-center justify-center shrink-0">
              <CanvasPreview elements={parsedResult.elements} bgColor={parsedResult.bgColor} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => { reset(); onOpenChange(false); }}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={!parsedResult} className="gap-1.5">
            <FileCode2 className="w-3.5 h-3.5" /> Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}