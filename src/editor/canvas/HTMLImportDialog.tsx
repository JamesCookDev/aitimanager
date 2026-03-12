import { useState, useCallback, useRef } from 'react';
import {
  Upload, FileCode2, Check, X, Eye, Layers, AlertTriangle,
  Type, Image, MousePointer2, Square, List, FileText, Globe, Play,
  LayoutGrid, MessageSquare, Hash, Clock, Share2, Sparkles,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { parseHTMLToCanvas } from '../utils/htmlToCanvas';
import type { CanvasElement, ElementType } from '../types/canvas';
import type { LucideIcon } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (elements: CanvasElement[], bgColor: string) => void;
}

const ELEMENT_ICONS: Record<ElementType, LucideIcon> = {
  text: Type, image: Image, button: MousePointer2, shape: Square,
  icon: Sparkles, video: Play, qrcode: Hash, map: Globe,
  social: Share2, chat: MessageSquare, carousel: LayoutGrid,
  clock: Clock, weather: Clock, countdown: Clock, iframe: Globe,
  avatar: Sparkles, store: LayoutGrid, list: List,
  gallery: LayoutGrid, 'animated-number': Hash, catalog: LayoutGrid,
  form: FileText, ticket: FileText, qrpix: Hash, numpad: Hash,
  bigcta: MousePointer2, feed: LayoutGrid,
};

const ELEMENT_COLORS: Partial<Record<ElementType, string>> = {
  text: '#3b82f6', image: '#ec4899', button: '#ef4444', shape: '#14b8a6',
  icon: '#f97316', video: '#ef4444', form: '#84cc16', list: '#f59e0b',
  iframe: '#64748b', 'animated-number': '#10b981', social: '#3b82f6',
  carousel: '#8b5cf6', gallery: '#06b6d4',
};

type Step = 'upload' | 'preview';

export function HTMLImportDialog({ open, onOpenChange, onImport }: Props) {
  const [step, setStep] = useState<Step>('upload');
  const [parsedElements, setParsedElements] = useState<CanvasElement[]>([]);
  const [bgColor, setBgColor] = useState('#0f172a');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [htmlPreview, setHtmlPreview] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep('upload');
    setParsedElements([]);
    setSelectedIds(new Set());
    setHtmlPreview('');
    setFileName('');
    setBgColor('#0f172a');
  }, []);

  const analyzeHTML = useCallback((html: string, name: string) => {
    const result = parseHTMLToCanvas(html);
    if (result.elements.length === 0) {
      toast.error('Nenhum elemento reconhecido no HTML. Verifique se o arquivo contém elementos visuais.');
      return;
    }
    setParsedElements(result.elements);
    setBgColor(result.bgColor);
    setSelectedIds(new Set(result.elements.map(e => e.id)));
    setHtmlPreview(html.slice(0, 500));
    setFileName(name);
    setStep('preview');
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm') && file.type !== 'text/html') {
      toast.error('Selecione um arquivo HTML (.html ou .htm)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      analyzeHTML(reader.result as string, file.name);
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [analyzeHTML]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.html') || file.name.endsWith('.htm') || file.type === 'text/html')) {
      const reader = new FileReader();
      reader.onload = () => analyzeHTML(reader.result as string, file.name);
      reader.readAsText(file);
    } else {
      toast.error('Arraste um arquivo HTML');
    }
  }, [analyzeHTML]);

  const handleImport = useCallback(() => {
    const selected = parsedElements.filter(e => selectedIds.has(e.id));
    if (selected.length === 0) {
      toast.error('Selecione pelo menos um elemento');
      return;
    }
    onImport(selected, bgColor);
    toast.success(`${selected.length} elementos importados com sucesso!`);
    reset();
    onOpenChange(false);
  }, [parsedElements, selectedIds, bgColor, onImport, onOpenChange, reset]);

  const toggleElement = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(parsedElements.map(e => e.id)));
  const deselectAll = () => setSelectedIds(new Set());

  // Group elements by type for better visualization
  const grouped = parsedElements.reduce((acc, el) => {
    if (!acc[el.type]) acc[el.type] = [];
    acc[el.type].push(el);
    return acc;
  }, {} as Record<string, CanvasElement[]>);

  const typeLabels: Record<string, string> = {
    text: 'Textos', image: 'Imagens', button: 'Botões', shape: 'Formas',
    icon: 'Ícones', video: 'Vídeos', form: 'Formulários', list: 'Listas',
    iframe: 'Iframes', 'animated-number': 'Indicadores', social: 'Redes Sociais',
    carousel: 'Carrosséis', gallery: 'Galerias', chat: 'Chat', clock: 'Relógios',
    map: 'Mapas', qrcode: 'QR Codes', avatar: 'Avatares', store: 'Lojas',
    catalog: 'Catálogos', ticket: 'Senhas', qrpix: 'Pix', numpad: 'Teclados',
    bigcta: 'CTAs', feed: 'Feeds', weather: 'Clima', countdown: 'Contagens',
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileCode2 className="w-5 h-5 text-primary" />
            Importar HTML
          </DialogTitle>
          <DialogDescription className="text-sm">
            {step === 'upload'
              ? 'Faça upload de um arquivo HTML para analisar e importar os elementos como blocos editáveis.'
              : `${parsedElements.length} elementos detectados em "${fileName}". Selecione quais importar.`
            }
          </DialogDescription>
        </DialogHeader>

        <Separator />

        {step === 'upload' && (
          <div className="flex-1 p-6">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/60 hover:border-primary/50 rounded-2xl p-12 text-center cursor-pointer transition-all hover:bg-primary/5 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">
                Clique ou arraste um arquivo HTML aqui
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Suporta .html e .htm — O sistema analisa e decompõe cada elemento
              </p>
              <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground/60">
                <span className="flex items-center gap-1"><Type className="w-3 h-3" /> Textos</span>
                <span className="flex items-center gap-1"><Image className="w-3 h-3" /> Imagens</span>
                <span className="flex items-center gap-1"><MousePointer2 className="w-3 h-3" /> Botões</span>
                <span className="flex items-center gap-1"><List className="w-3 h-3" /> Listas</span>
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Formulários</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {step === 'preview' && (
          <>
            {/* Summary bar */}
            <div className="flex items-center justify-between px-6 py-3 bg-muted/30">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs gap-1">
                  <Layers className="w-3 h-3" />
                  {parsedElements.length} elementos
                </Badge>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: bgColor }} />
                  <span className="text-[10px] text-muted-foreground">Fundo: {bgColor}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-[10px] h-6" onClick={selectAll}>
                  Selecionar tudo
                </Button>
                <Button variant="ghost" size="sm" className="text-[10px] h-6" onClick={deselectAll}>
                  Limpar
                </Button>
              </div>
            </div>

            <Separator />

            {/* Element list */}
            <ScrollArea className="flex-1 max-h-[400px]">
              <div className="p-4 space-y-4">
                {Object.entries(grouped).map(([type, elements]) => {
                  const Icon = ELEMENT_ICONS[type as ElementType] || Square;
                  const color = ELEMENT_COLORS[type as ElementType] || '#6366f1';
                  const allSelected = elements.every(e => selectedIds.has(e.id));
                  const someSelected = elements.some(e => selectedIds.has(e.id));

                  return (
                    <div key={type} className="space-y-1.5">
                      {/* Category header */}
                      <div className="flex items-center gap-2 px-1">
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${color}20` }}
                        >
                          <Icon className="w-3 h-3" style={{ color }} />
                        </div>
                        <span className="text-xs font-semibold text-foreground/80 flex-1">
                          {typeLabels[type] || type} ({elements.length})
                        </span>
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={() => {
                            if (allSelected) {
                              setSelectedIds(prev => {
                                const next = new Set(prev);
                                elements.forEach(e => next.delete(e.id));
                                return next;
                              });
                            } else {
                              setSelectedIds(prev => {
                                const next = new Set(prev);
                                elements.forEach(e => next.add(e.id));
                                return next;
                              });
                            }
                          }}
                          className="h-3.5 w-3.5"
                        />
                      </div>

                      {/* Individual elements */}
                      <div className="space-y-0.5 pl-7">
                        {elements.map(el => {
                          const isSelected = selectedIds.has(el.id);
                          const preview = getElementPreview(el);

                          return (
                            <button
                              key={el.id}
                              onClick={() => toggleElement(el.id)}
                              className={cn(
                                "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all",
                                isSelected
                                  ? "bg-primary/10 border border-primary/20"
                                  : "hover:bg-muted/30 border border-transparent"
                              )}
                            >
                              <Checkbox checked={isSelected} className="h-3 w-3 shrink-0 pointer-events-none" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-medium text-foreground/80 truncate">
                                  {el.name}
                                </p>
                                {preview && (
                                  <p className="text-[9px] text-muted-foreground truncate mt-0.5">
                                    {preview}
                                  </p>
                                )}
                              </div>
                              <span className="text-[8px] text-muted-foreground/50 font-mono shrink-0">
                                {el.width}×{el.height}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <Separator />

            {/* Actions */}
            <div className="flex items-center justify-between px-6 py-4">
              <Button variant="ghost" size="sm" onClick={() => setStep('upload')} className="text-xs gap-1.5">
                <X className="w-3.5 h-3.5" /> Voltar
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">
                  {selectedIds.size} de {parsedElements.length} selecionados
                </span>
                <Button
                  size="sm"
                  onClick={handleImport}
                  disabled={selectedIds.size === 0}
                  className="gap-1.5 font-semibold shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  Importar {selectedIds.size} elementos
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getElementPreview(el: CanvasElement): string {
  const p = el.props;
  switch (el.type) {
    case 'text': return p.text?.slice(0, 60) || '';
    case 'button': return p.label?.slice(0, 40) || '';
    case 'image': return p.src ? `📷 ${p.src.split('/').pop()?.slice(0, 30)}` : 'Sem imagem';
    case 'form': return `${p.fields?.length || 0} campos — ${p.title || ''}`;
    case 'list': return `${p.items?.length || 0} itens`;
    case 'video': return p.url || 'Sem URL';
    case 'iframe': return p.url || 'Sem URL';
    case 'shape': return `${p.shapeType || 'retângulo'} — ${p.fill || ''}`;
    default: return '';
  }
}
