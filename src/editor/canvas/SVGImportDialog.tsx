import { useState, useCallback } from 'react';
import { FileCode2, Upload, ClipboardPaste, AlertTriangle } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { parseSVGToCanvas } from '../utils/svgToCanvas';
import type { CanvasState } from '../types/canvas';

interface SVGImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (state: CanvasState) => void;
}

export function SVGImportDialog({ open, onOpenChange, onImport }: SVGImportDialogProps) {
  const [svgCode, setSvgCode] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<{ count: number; bg: string } | null>(null);

  const reset = () => {
    setSvgCode('');
    setError('');
    setPreview(null);
  };

  const processImport = useCallback((svg: string) => {
    setError('');
    setPreview(null);
    try {
      const result = parseSVGToCanvas(svg);
      if (result.elements.length === 0) {
        setError('Nenhum elemento reconhecido no SVG. Tente um SVG com retângulos, textos ou imagens.');
        return;
      }
      setPreview({ count: result.elements.length, bg: result.bgColor });
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
    try {
      const result = parseSVGToCanvas(svgCode);
      const state: CanvasState = {
        bgColor: result.bgColor,
        elements: result.elements,
        selectedId: null,
        views: [{ id: '__default__', name: 'Home', isDefault: true }],
        activeViewId: '__default__',
        viewIdleTimeout: 30,
        pageBgColors: {},
      };
      onImport(state);
      toast.success(`${result.elements.length} elementos importados do SVG`);
      reset();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao importar');
    }
  }, [svgCode, onImport, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-primary" />
            Importar SVG
          </DialogTitle>
          <DialogDescription>
            Cole o código SVG ou faça upload de um arquivo .svg para converter em elementos do canvas.
          </DialogDescription>
        </DialogHeader>

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
                setPreview(null);
              }}
              className="font-mono text-xs min-h-[160px] resize-none"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePaste} className="text-xs gap-1.5">
                <ClipboardPaste className="w-3.5 h-3.5" /> Colar da área de transferência
              </Button>
              {svgCode && !preview && (
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

        {preview && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-primary font-medium">
              ✅ {preview.count} elementos reconhecidos — Fundo: {preview.bg}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Elementos serão mapeados para o canvas 1080×1920 automaticamente.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => { reset(); onOpenChange(false); }}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={!preview} className="gap-1.5">
            <FileCode2 className="w-3.5 h-3.5" /> Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
