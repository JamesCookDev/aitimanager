import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navigation } from 'lucide-react';
import type { CanvasView } from '../../types/canvas';
import { Section, PropInput, ImageUploadField } from './shared';
import { MapPropsPanel } from './MapPropsPanel';
import { CarouselPropsPanel } from './CarouselPropsPanel';
import { SocialPropsPanel } from './SocialPropsPanel';
import { StorePropsPanel } from './StorePropsPanel';
import { ListPropsPanel } from './ListPropsPanel';
import { GalleryPropsPanel } from './GalleryPropsPanel';
import { AnimatedNumberPropsPanel } from './AnimatedNumberPropsPanel';
import { CatalogPropsPanel } from './CatalogPropsPanel';
import { FormPropsPanel } from './FormPropsPanel';

/* Reusable navigation action panel for any element */
function NavigationActionSection({ props, onChange, views }: { props: Record<string, any>; onChange: (p: Record<string, any>) => void; views?: CanvasView[] }) {
  if (!views || views.length === 0) return null;
  const set = (key: string) => (val: any) => onChange({ [key]: val });
  return (
    <div className="pt-2 border-t border-border space-y-2">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase">Ação ao toque</p>
      <div>
        <Label className="text-[11px]">Tipo de ação</Label>
        <Select value={props.actionType || 'none'} onValueChange={set('actionType')}>
          <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma</SelectItem>
            <SelectItem value="navigate">📄 Navegar para Página</SelectItem>
            <SelectItem value="url">🔗 Abrir URL</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {props.actionType === 'url' && (
        <PropInput label="URL" value={props.action || ''} onChange={set('action')} />
      )}
      {props.actionType === 'navigate' && (
        <>
          <div>
            <Label className="text-[11px]">Página de destino</Label>
            <Select value={props.navigateTarget || ''} onValueChange={set('navigateTarget')}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {views.map(v => (
                  <SelectItem key={v.id} value={v.id}>
                    <span className="flex items-center gap-1.5">
                      <Navigation className="w-3 h-3" /> {v.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px]">Transição</Label>
            <Select value={props.navigateTransition || 'fade'} onValueChange={set('navigateTransition')}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem transição</SelectItem>
                <SelectItem value="fade">✨ Fade</SelectItem>
                <SelectItem value="slide-left">⬅ Slide Esquerda</SelectItem>
                <SelectItem value="slide-right">➡ Slide Direita</SelectItem>
                <SelectItem value="slide-up">⬆ Slide Cima</SelectItem>
                <SelectItem value="zoom">🔍 Zoom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}

export function TypeProps({ type, props, onChange, views }: { type: string; props: Record<string, any>; onChange: (p: Record<string, any>) => void; views?: CanvasView[] }) {
  const set = (key: string) => (val: any) => onChange({ [key]: val });

  switch (type) {
    case 'text':
      return (
        <Section title="Texto">
          <PropInput label="Conteúdo" value={props.text} onChange={set('text')} type="textarea" />
          <PropInput label="Tamanho" value={props.fontSize} onChange={set('fontSize')} type="number" />
          <PropInput label="Cor" value={props.color} onChange={set('color')} type="color" />
          <div>
            <Label className="text-[11px]">Peso</Label>
            <Select value={props.fontWeight || 'normal'} onValueChange={set('fontWeight')}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="semibold">Semi-bold</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px]">Alinhamento</Label>
            <Select value={props.align || 'left'} onValueChange={set('align')}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Esquerda</SelectItem>
                <SelectItem value="center">Centro</SelectItem>
                <SelectItem value="right">Direita</SelectItem>
              </SelectContent>
            </Select>
           </div>
          <NavigationActionSection props={props} onChange={onChange} views={views} />
        </Section>
      );
    case 'image':
      return (
        <Section title="Imagem">
          <ImageUploadField value={props.src} onChange={set('src')} />
          <div>
            <Label className="text-[11px]">Ajuste</Label>
            <Select value={props.fit || 'cover'} onValueChange={set('fit')}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">Cover</SelectItem>
                <SelectItem value="contain">Contain</SelectItem>
                <SelectItem value="fill">Fill</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <PropInput label="Border Radius" value={props.borderRadius} onChange={set('borderRadius')} type="number" />
          <NavigationActionSection props={props} onChange={onChange} views={views} />
        </Section>
      );
    case 'button':
      return (
        <Section title="Botão">
          <PropInput label="Texto" value={props.label} onChange={set('label')} />
          <PropInput label="Cor de fundo" value={props.bgColor} onChange={set('bgColor')} type="color" />
          <PropInput label="Cor do texto" value={props.textColor} onChange={set('textColor')} type="color" />
          <PropInput label="Tamanho da fonte" value={props.fontSize} onChange={set('fontSize')} type="number" />
          <PropInput label="Border Radius" value={props.borderRadius} onChange={set('borderRadius')} type="number" />
          <div className="pt-2 border-t border-border space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Ação do botão</p>
            <div>
              <Label className="text-[11px]">Tipo de ação</Label>
              <Select value={props.actionType || 'prompt'} onValueChange={set('actionType')}>
                <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="prompt">💬 Prompt IA</SelectItem>
                  <SelectItem value="url">🔗 Abrir URL</SelectItem>
                  <SelectItem value="navigate">📄 Navegar para Página</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(props.actionType || 'prompt') === 'prompt' && (
              <PropInput label="Prompt" value={props.action || ''} onChange={set('action')} />
            )}
            {props.actionType === 'url' && (
              <PropInput label="URL" value={props.action || ''} onChange={set('action')} />
            )}
            {props.actionType === 'navigate' && views && views.length > 0 && (
              <>
                <div>
                  <Label className="text-[11px]">Página de destino</Label>
                  <Select value={props.navigateTarget || ''} onValueChange={set('navigateTarget')}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {views.map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          <span className="flex items-center gap-1.5">
                            <Navigation className="w-3 h-3" /> {v.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[9px] text-muted-foreground mt-1">Ao tocar, navega para esta página no totem</p>
                </div>
                <div>
                  <Label className="text-[11px]">Transição</Label>
                  <Select value={props.navigateTransition || 'fade'} onValueChange={set('navigateTransition')}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem transição</SelectItem>
                      <SelectItem value="fade">✨ Fade</SelectItem>
                      <SelectItem value="slide-left">⬅ Slide Esquerda</SelectItem>
                      <SelectItem value="slide-right">➡ Slide Direita</SelectItem>
                      <SelectItem value="slide-up">⬆ Slide Cima</SelectItem>
                      <SelectItem value="zoom">🔍 Zoom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </Section>
      );
    case 'shape':
      return (
        <Section title="Forma">
          <div>
            <Label className="text-[11px]">Tipo</Label>
            <Select value={props.shapeType || 'rectangle'} onValueChange={set('shapeType')}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rectangle">Retângulo</SelectItem>
                <SelectItem value="circle">Círculo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <PropInput label="Cor" value={props.fill} onChange={set('fill')} type="color" />
          <PropInput label="Border Radius" value={props.borderRadius} onChange={set('borderRadius')} type="number" />
          <NavigationActionSection props={props} onChange={onChange} views={views} />
        </Section>
      );
    case 'icon':
      return (
        <Section title="Ícone">
          <PropInput label="Emoji / Ícone" value={props.icon} onChange={set('icon')} />
          <PropInput label="Tamanho" value={props.size} onChange={set('size')} type="number" />
          <PropInput label="Cor" value={props.color} onChange={set('color')} type="color" />
          <NavigationActionSection props={props} onChange={onChange} views={views} />
        </Section>
      );
    case 'qrcode':
      return (
        <Section title="QR Code">
          <PropInput label="URL / Valor" value={props.value} onChange={set('value')} />
          <PropInput label="Cor do QR" value={props.fgColor} onChange={set('fgColor')} type="color" />
          <PropInput label="Cor de fundo" value={props.bgColor || 'transparent'} onChange={set('bgColor')} type="color" />
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">Correção de erro</label>
            <select
              value={props.errorCorrectionLevel || 'M'}
              onChange={(e) => set('errorCorrectionLevel')(e.target.value)}
              className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
            >
              <option value="L">L – Baixa (7%)</option>
              <option value="M">M – Média (15%)</option>
              <option value="Q">Q – Alta (25%)</option>
              <option value="H">H – Máxima (30%)</option>
            </select>
          </div>
          <PropInput label="Margem" value={props.margin ?? 1} onChange={set('margin')} type="number" />
          <PropInput label="Legenda" value={props.label || ''} onChange={set('label')} />
          <PropInput label="Cor da legenda" value={props.labelColor || '#ffffff'} onChange={set('labelColor')} type="color" />
          <PropInput label="Tamanho legenda" value={props.labelSize || 14} onChange={set('labelSize')} type="number" />
        </Section>
      );
    case 'clock':
      return (
        <Section title="Relógio">
          <PropInput label="Cor" value={props.color} onChange={set('color')} type="color" />
          <PropInput label="Tamanho" value={props.fontSize} onChange={set('fontSize')} type="number" />
        </Section>
      );
    case 'avatar':
      return (
        <Section title="Avatar 3D">
          <PropInput label="URL do modelo" value={props.avatarUrl} onChange={set('avatarUrl')} />
          <PropInput label="URL das animações" value={props.animationsUrl} onChange={set('animationsUrl')} />
          <PropInput label="Escala" value={props.scale} onChange={set('scale')} type="number" />
          <PropInput label="Cor da camisa" value={props.colors?.shirt || '#1E3A8A'} onChange={(v) => onChange({ colors: { ...(props.colors || {}), shirt: v } })} type="color" />
          <PropInput label="Cor da calça" value={props.colors?.pants || '#1F2937'} onChange={(v) => onChange({ colors: { ...(props.colors || {}), pants: v } })} type="color" />
          <PropInput label="Cor dos sapatos" value={props.colors?.shoes || '#000000'} onChange={(v) => onChange({ colors: { ...(props.colors || {}), shoes: v } })} type="color" />
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pt-2">Enquadramento</p>
          <div>
            <Label className="text-[11px]">↕ Vertical: {props.frameY ?? 0}</Label>
            <Slider value={[props.frameY ?? 0]} onValueChange={([v]) => onChange({ frameY: v })} min={-100} max={100} step={1} />
            <span className="text-[9px] text-muted-foreground">Negativo = sobe · Positivo = desce</span>
          </div>
          <div>
            <Label className="text-[11px]">🔍 Zoom: {props.frameZoom ?? 50}</Label>
            <Slider value={[props.frameZoom ?? 50]} onValueChange={([v]) => onChange({ frameZoom: v })} min={10} max={100} step={1} />
            <span className="text-[9px] text-muted-foreground">10 = longe · 100 = perto</span>
          </div>
        </Section>
      );
    case 'carousel':
      return <CarouselPropsPanel props={props} onChange={onChange} />;
    case 'video':
      return (
        <Section title="Vídeo">
          <PropInput label="URL do vídeo" value={props.url} onChange={set('url')} />
          <p className="text-[9px] text-muted-foreground -mt-1">YouTube, Vimeo ou link direto (.mp4)</p>
          <PropInput label="Border Radius" value={props.borderRadius} onChange={set('borderRadius')} type="number" />
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Autoplay</Label>
            <Switch checked={props.autoplay !== false} onCheckedChange={set('autoplay')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Mudo</Label>
            <Switch checked={props.muted !== false} onCheckedChange={set('muted')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Loop</Label>
            <Switch checked={props.loop !== false} onCheckedChange={set('loop')} />
          </div>
        </Section>
      );
    case 'iframe':
      return (
        <Section title="Iframe">
          <PropInput label="URL do site" value={props.url} onChange={set('url')} />
          <p className="text-[9px] text-muted-foreground -mt-1">Cole o endereço completo (https://...)</p>
          <PropInput label="Border Radius" value={props.borderRadius} onChange={set('borderRadius')} type="number" />
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Scrolling</Label>
            <Switch checked={props.scrolling !== false} onCheckedChange={set('scrolling')} />
          </div>
        </Section>
      );
    case 'map':
      return <MapPropsPanel props={props} onChange={onChange} />;
    case 'chat':
      return (
        <Section title="Chat IA">
          <PropInput label="Placeholder" value={props.placeholder || 'Pergunte algo...'} onChange={set('placeholder')} />
          <div>
            <Label className="text-[11px]">Tema</Label>
            <Select value={props.theme || 'dark'} onValueChange={set('theme')}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="light">Claro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <PropInput label="Cor de destaque" value={props.accentColor || '#6366f1'} onChange={set('accentColor')} type="color" />
          <PropInput label="Border Radius" value={props.borderRadius || 16} onChange={set('borderRadius')} type="number" />
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Avatar fala resposta</Label>
            <Switch checked={props.speakResponse !== false} onCheckedChange={set('speakResponse')} />
          </div>
          <p className="text-[9px] text-muted-foreground -mt-1">Quando ativo, o avatar fala a resposta do chat via Web Speech API</p>
        </Section>
      );
    case 'social':
      return <SocialPropsPanel props={props} onChange={onChange} />;
    case 'store':
      return <StorePropsPanel props={props} onChange={onChange} views={views} />;
    case 'list':
      return <ListPropsPanel props={props} onChange={onChange} views={views} />;
    case 'gallery':
      return <GalleryPropsPanel props={props} onChange={onChange} />;
    case 'animated-number':
      return <AnimatedNumberPropsPanel props={props} onChange={onChange} />;
    case 'catalog':
      return <CatalogPropsPanel props={props} onChange={onChange} views={views} />;
    case 'form':
      return <FormPropsPanel props={props} onChange={onChange} views={views} />;
    default:
      return (
        <Section title="Propriedades">
          <p className="text-[11px] text-muted-foreground">Sem propriedades editáveis.</p>
        </Section>
      );
  }
}
