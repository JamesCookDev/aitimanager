import { useState, useCallback } from 'react';
import { FileCode2, Upload, ClipboardPaste, AlertTriangle, Eye, Code2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { parseSVGToCanvas } from '../utils/svgToCanvas';
import { parseHTMLToCanvas } from '../utils/htmlToCanvas';
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
        style={{ width: previewW, height: previewH, backgroundColor: bgColor }}
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

type ImportMode = 'svg' | 'html';

export function SVGImportDialog({ open, onOpenChange, onImport }: SVGImportDialogProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<ImportMode>('html');
  const [parsedResult, setParsedResult] = useState<{ elements: CanvasElement[]; bgColor: string } | null>(null);

  const reset = () => {
    setCode('');
    setError('');
    setParsedResult(null);
  };

  const processImport = useCallback((input: string, importMode: ImportMode) => {
    setError('');
    setParsedResult(null);
    try {
      let result: { elements: CanvasElement[]; bgColor: string };

      if (importMode === 'svg') {
        const svgResult = parseSVGToCanvas(input);
        result = { elements: svgResult.elements, bgColor: svgResult.bgColor };
      } else {
        result = parseHTMLToCanvas(input);
      }

      if (result.elements.length === 0) {
        setError(
          importMode === 'svg'
            ? 'Nenhum elemento reconhecido no SVG. Tente um SVG com retângulos, textos ou imagens.'
            : 'Nenhum elemento reconhecido no HTML. Verifique se o código contém elementos visíveis.'
        );
        return;
      }
      setParsedResult(result);
      setCode(input);
    } catch (err: any) {
      setError(err.message || `Erro ao processar ${importMode.toUpperCase()}`);
    }
  }, []);

  const handleFileUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = mode === 'svg' ? '.svg' : '.html,.htm';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        processImport(text, mode);
      } catch {
        setError('Erro ao ler arquivo');
      }
    };
    input.click();
  }, [processImport, mode]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (mode === 'svg' && !text.includes('<svg')) {
        setError('O conteúdo da área de transferência não parece ser um SVG válido');
        return;
      }
      processImport(text, mode);
    } catch {
      setError('Não foi possível acessar a área de transferência');
    }
  }, [processImport, mode]);

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
    toast.success(`${parsedResult.elements.length} elementos importados`);
    reset();
    onOpenChange(false);
  }, [parsedResult, onImport, onOpenChange]);

  const modeLabel = mode === 'svg' ? 'SVG' : 'HTML';
  const placeholder = mode === 'svg'
    ? '<svg viewBox="0 0 1080 1920" ...>\n  ...\n</svg>'
    : '<div style="background:#0f172a; width:1080px; min-height:1920px">\n  <h1 style="color:white">Título</h1>\n  <img src="..." />\n  <button>Clique aqui</button>\n</div>';

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className={parsedResult ? "sm:max-w-2xl" : "sm:max-w-lg"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" />
            Importar Design
          </DialogTitle>
          <DialogDescription>
            Cole código HTML ou SVG para converter em elementos editáveis do canvas.
          </DialogDescription>
        </DialogHeader>

        {/* ── Mode selector ── */}
        <div className="flex gap-1 p-0.5 rounded-lg bg-muted/60 w-fit">
          <button
            onClick={() => { setMode('html'); reset(); }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'html' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Code2 className="w-3.5 h-3.5 inline mr-1.5" />
            HTML
          </button>
          <button
            onClick={() => { setMode('svg'); reset(); }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'svg' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <FileCode2 className="w-3.5 h-3.5 inline mr-1.5" />
            SVG
          </button>
        </div>

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
                  placeholder={placeholder}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError('');
                    setParsedResult(null);
                  }}
                  className="font-mono text-xs min-h-[200px] resize-none"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePaste} className="text-xs gap-1.5">
                    <ClipboardPaste className="w-3.5 h-3.5" /> Colar
                  </Button>
                  {code && !parsedResult && (
                    <Button variant="secondary" size="sm" onClick={() => processImport(code, mode)} className="text-xs">
                      Analisar {modeLabel}
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
                    Arquivo {mode === 'svg' ? '.svg' : '.html'}
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

            {mode === 'html' && !parsedResult && !code && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  💡 <strong>Dica:</strong> Cole HTML do Figma (Export → HTML), de um e-mail marketing, ou crie seu layout com divs, imagens e textos. 
                  Os elementos serão convertidos em widgets editáveis do canvas.
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
            <Code2 className="w-3.5 h-3.5" /> Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
