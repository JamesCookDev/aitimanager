import { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navigation, Type, ImageIcon, ChevronDown, Code2, Link2, MousePointerClick, Palette, Pencil, Move, Eye, Paintbrush } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import { FeedPropsPanel } from './FeedPropsPanel';
import { extractEditableFields, applyFieldOverrides, type EditableField } from '../../utils/htmlEditableFields';

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
                  <SelectItem value="phone">📞 Ligar</SelectItem>
                  <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                  <SelectItem value="email">📧 Enviar E-mail</SelectItem>
                  <SelectItem value="print">🖨️ Imprimir</SelectItem>
                  <SelectItem value="webhook">🔌 Webhook / API</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(props.actionType || 'prompt') === 'prompt' && (
              <PropInput label="Prompt" value={props.action || ''} onChange={set('action')} />
            )}
            {props.actionType === 'url' && (
              <PropInput label="URL" value={props.action || ''} onChange={set('action')} />
            )}
            {props.actionType === 'phone' && (
              <>
                <PropInput label="Número de telefone" value={props.phoneNumber || ''} onChange={set('phoneNumber')} />
                <p className="text-[9px] text-muted-foreground">Ex: +5511999990000 (com código do país)</p>
              </>
            )}
            {props.actionType === 'whatsapp' && (
              <>
                <PropInput label="Número WhatsApp" value={props.whatsappNumber || ''} onChange={set('whatsappNumber')} />
                <PropInput label="Mensagem pré-definida" value={props.whatsappMessage || ''} onChange={set('whatsappMessage')} type="textarea" />
                <p className="text-[9px] text-muted-foreground">Ex: 5511999990000 (sem +, sem espaços)</p>
              </>
            )}
            {props.actionType === 'email' && (
              <>
                <PropInput label="E-mail destino" value={props.emailTo || ''} onChange={set('emailTo')} />
                <PropInput label="Assunto" value={props.emailSubject || ''} onChange={set('emailSubject')} />
                <PropInput label="Corpo da mensagem" value={props.emailBody || ''} onChange={set('emailBody')} type="textarea" />
              </>
            )}
            {props.actionType === 'webhook' && (
              <>
                <PropInput label="URL do Webhook" value={props.webhookUrl || ''} onChange={set('webhookUrl')} />
                <div>
                  <Label className="text-[11px]">Método HTTP</Label>
                  <Select value={props.webhookMethod || 'POST'} onValueChange={set('webhookMethod')}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <PropInput label="Payload JSON (opcional)" value={props.webhookPayload || ''} onChange={set('webhookPayload')} type="textarea" />
                <PropInput label="Mensagem de sucesso" value={props.webhookSuccessMsg || 'Ação realizada!'} onChange={set('webhookSuccessMsg')} />
                <p className="text-[9px] text-muted-foreground">Use {'{{variavel}}'} para interpolar dados do formulário</p>
              </>
            )}
            {props.actionType === 'print' && (
              <>
                <PropInput label="Conteúdo a imprimir" value={props.printContent || ''} onChange={set('printContent')} type="textarea" />
                <p className="text-[9px] text-muted-foreground">Use {'{{variavel}}'} para dados dinâmicos. Suporte a impressoras térmicas (ESC/POS).</p>
              </>
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
          {/* Confirmation dialog */}
          <div className="pt-2 border-t border-border space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px]">Confirmação antes da ação</Label>
              <Switch checked={props.confirmBeforeAction === true} onCheckedChange={set('confirmBeforeAction')} />
            </div>
            {props.confirmBeforeAction && (
              <PropInput label="Mensagem de confirmação" value={props.confirmMessage || 'Tem certeza?'} onChange={set('confirmMessage')} />
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
          <div>
            <Label className="text-[11px]">Fuso horário</Label>
            <Select value={props.timezone || 'auto'} onValueChange={set('timezone')}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automático (local)</SelectItem>
                <SelectItem value="America/Sao_Paulo">São Paulo (BRT)</SelectItem>
                <SelectItem value="America/Manaus">Manaus (AMT)</SelectItem>
                <SelectItem value="America/Recife">Recife (BRT)</SelectItem>
                <SelectItem value="America/Cuiaba">Cuiabá (AMT)</SelectItem>
                <SelectItem value="America/Rio_Branco">Rio Branco (ACT)</SelectItem>
                <SelectItem value="America/New_York">Nova York (EST)</SelectItem>
                <SelectItem value="Europe/Lisbon">Lisboa (WET)</SelectItem>
                <SelectItem value="Europe/London">Londres (GMT)</SelectItem>
                <SelectItem value="Asia/Tokyo">Tóquio (JST)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px]">Formato</Label>
            <Select value={props.format || '24h'} onValueChange={set('format')}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 horas</SelectItem>
                <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Mostrar data</Label>
            <Switch checked={props.showDate !== false} onCheckedChange={set('showDate')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Mostrar segundos</Label>
            <Switch checked={props.showSeconds !== false} onCheckedChange={set('showSeconds')} />
          </div>
          <NavigationActionSection props={props} onChange={onChange} views={views} />
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
            <Label className="text-[11px]">↔ Horizontal: {props.frameX ?? 0}</Label>
            <Slider value={[props.frameX ?? 0]} onValueChange={([v]) => onChange({ frameX: v })} min={-100} max={100} step={1} />
            <span className="text-[9px] text-muted-foreground">Negativo = esquerda · Positivo = direita</span>
          </div>
          <div>
            <Label className="text-[11px]">🔍 Zoom: {props.frameZoom ?? 50}</Label>
            <Slider value={[props.frameZoom ?? 50]} onValueChange={([v]) => onChange({ frameZoom: v })} min={10} max={100} step={1} />
            <span className="text-[9px] text-muted-foreground">10 = longe · 100 = perto</span>
          </div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pt-2">Comportamento</p>
          <div
            className={`flex items-center justify-between p-2.5 rounded-lg border-2 transition-all ${
              props.fixedOnScreen === true
                ? 'border-amber-500/60 bg-amber-500/10'
                : 'border-border bg-muted/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{props.fixedOnScreen === true ? '📌' : '📍'}</span>
              <div>
                <Label className="text-[11px] font-semibold">{props.fixedOnScreen === true ? 'Fixo na tela' : 'Fixo na página'}</Label>
                <span className="text-[9px] text-muted-foreground block">
                  {props.fixedOnScreen === true
                    ? 'Avatar acompanha o scroll (sobrepõe conteúdo)'
                    : 'Avatar fica preso na posição do canvas'}
                </span>
              </div>
            </div>
            <Switch checked={props.fixedOnScreen === true} onCheckedChange={set('fixedOnScreen')} />
          </div>
          <NavigationActionSection props={props} onChange={onChange} views={views} />
        </Section>
      );
    case 'carousel':
      return <><CarouselPropsPanel props={props} onChange={onChange} /><NavigationActionSection props={props} onChange={onChange} views={views} /></>;
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
          <NavigationActionSection props={props} onChange={onChange} views={views} />
        </Section>
      );
    case 'iframe':
      return <IframePropsPanel props={props} onChange={onChange} views={views} />;
    case 'map':
      return <MapPropsPanel props={props} onChange={onChange} />;
    case 'chat':
      return (
        <>
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
          </Section>
          <Section title="⚙️ Configuração da IA">
            <PropInput label="Mensagem de boas-vindas" value={props.welcomeMessage || ''} onChange={set('welcomeMessage')} type="textarea" />
            <p className="text-[9px] text-muted-foreground -mt-1">Exibida antes do usuário enviar a primeira mensagem</p>
            <PropInput label="System Prompt (contexto)" value={props.systemPrompt || ''} onChange={set('systemPrompt')} type="textarea" />
            <p className="text-[9px] text-muted-foreground -mt-1">Instrução invisível enviada à IA para definir tom, regras e contexto do negócio</p>
            <PropInput label="Base de conhecimento" value={props.knowledgeBase || ''} onChange={set('knowledgeBase')} type="textarea" />
            <p className="text-[9px] text-muted-foreground -mt-1">Informações do negócio: horários, preços, FAQ, políticas etc.</p>
            <div>
              <Label className="text-[11px]">Modelo de IA</Label>
              <Select value={props.aiModel || 'auto'} onValueChange={set('aiModel')}>
                <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automático (recomendado)</SelectItem>
                  <SelectItem value="gemini-flash">Gemini Flash (rápido)</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro (preciso)</SelectItem>
                  <SelectItem value="gpt-5-mini">GPT-5 Mini (balanceado)</SelectItem>
                  <SelectItem value="local">Modelo local (LLM offline)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <PropInput label="Máx. mensagens no histórico" value={props.maxHistory || 20} onChange={set('maxHistory')} type="number" />
            <PropInput label="Temperatura (criatividade)" value={props.temperature || 0.3} onChange={set('temperature')} type="number" />
          </Section>
          <Section title="🔗 Sugestões rápidas">
            <p className="text-[9px] text-muted-foreground mb-1">Botões de sugestão exibidos acima do campo de texto</p>
            <PropInput label="Sugestões (separadas por |)" value={props.quickSuggestions || ''} onChange={set('quickSuggestions')} type="textarea" />
            <p className="text-[9px] text-muted-foreground -mt-1">Ex: Horários de funcionamento|Como chegar?|Preços</p>
          </Section>
          <Section title="🔒 Privacidade & Limites">
            <div className="flex items-center justify-between">
              <Label className="text-[11px]">Salvar histórico</Label>
              <Switch checked={props.saveHistory !== false} onCheckedChange={set('saveHistory')} />
            </div>
            <p className="text-[9px] text-muted-foreground -mt-1">Salva conversas para análise posterior</p>
            <PropInput label="Máx. caracteres por msg" value={props.maxCharacters || 500} onChange={set('maxCharacters')} type="number" />
            <div className="flex items-center justify-between">
              <Label className="text-[11px]">Mostrar aviso LGPD</Label>
              <Switch checked={props.showLgpdNotice === true} onCheckedChange={set('showLgpdNotice')} />
            </div>
            {props.showLgpdNotice && (
              <PropInput label="Texto do aviso" value={props.lgpdText || 'Ao utilizar o chat, você concorda com nossa política de privacidade.'} onChange={set('lgpdText')} type="textarea" />
            )}
          </Section>
        </>
      );
    case 'social':
      return <><SocialPropsPanel props={props} onChange={onChange} /><NavigationActionSection props={props} onChange={onChange} views={views} /></>;
    case 'store':
      return <StorePropsPanel props={props} onChange={onChange} views={views} />;
    case 'list':
      return <ListPropsPanel props={props} onChange={onChange} views={views} />;
    case 'gallery':
      return <><GalleryPropsPanel props={props} onChange={onChange} /><NavigationActionSection props={props} onChange={onChange} views={views} /></>;
    case 'animated-number':
      return <><AnimatedNumberPropsPanel props={props} onChange={onChange} /><NavigationActionSection props={props} onChange={onChange} views={views} /></>;
    case 'catalog':
      return <CatalogPropsPanel props={props} onChange={onChange} views={views} />;
    case 'form':
      return <FormPropsPanel props={props} onChange={onChange} views={views} />;
    case 'ticket':
      return (
        <>
          <Section title="Senha / Ticket">
            <PropInput label="Prefixo" value={props.prefix || 'A'} onChange={set('prefix')} />
            <PropInput label="Número atual" value={props.currentNumber || 42} onChange={set('currentNumber')} type="number" />
            <PropInput label="Rótulo" value={props.label || 'Sua senha'} onChange={set('label')} />
            <PropInput label="Texto do botão" value={props.printLabel || '🖨️ Retirar Senha'} onChange={set('printLabel')} />
            <div className="flex items-center justify-between">
              <Label className="text-[11px]">Mostrar botão</Label>
              <Switch checked={props.showPrint !== false} onCheckedChange={set('showPrint')} />
            </div>
          </Section>
          <Section title="⚙️ Configuração da fila">
            <div>
              <Label className="text-[11px]">Tipo de senha</Label>
              <Select value={props.queueType || 'sequential'} onValueChange={set('queueType')}>
                <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequential">Sequencial (A001, A002...)</SelectItem>
                  <SelectItem value="priority">Prioridade (P001, P002...)</SelectItem>
                  <SelectItem value="department">Por departamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {props.queueType === 'department' && (
              <PropInput label="Departamentos (separados por |)" value={props.departments || 'Consulta|Exames|Vacinas|Farmácia'} onChange={set('departments')} type="textarea" />
            )}
            <PropInput label="Prefixo prioridade" value={props.priorityPrefix || 'P'} onChange={set('priorityPrefix')} />
            <div className="flex items-center justify-between">
              <Label className="text-[11px]">Auto incrementar</Label>
              <Switch checked={props.autoIncrement !== false} onCheckedChange={set('autoIncrement')} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-[11px]">Resetar diariamente</Label>
              <Switch checked={props.dailyReset !== false} onCheckedChange={set('dailyReset')} />
            </div>
            <PropInput label="Hora do reset (HH:MM)" value={props.resetTime || '00:00'} onChange={set('resetTime')} />
          </Section>
          <Section title="🖨️ Impressora">
            <div>
              <Label className="text-[11px]">Tipo de impressora</Label>
              <Select value={props.printerType || 'browser'} onValueChange={set('printerType')}>
                <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="browser">Navegador (padrão)</SelectItem>
                  <SelectItem value="thermal">Térmica (ESC/POS)</SelectItem>
                  <SelectItem value="webhook">Via Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {props.printerType === 'thermal' && (
              <>
                <PropInput label="IP da impressora" value={props.printerIp || ''} onChange={set('printerIp')} />
                <PropInput label="Porta" value={props.printerPort || '9100'} onChange={set('printerPort')} />
                <PropInput label="Largura do papel (mm)" value={props.paperWidth || 80} onChange={set('paperWidth')} type="number" />
              </>
            )}
            {props.printerType === 'webhook' && (
              <>
                <PropInput label="URL do Webhook" value={props.printWebhookUrl || ''} onChange={set('printWebhookUrl')} />
                <p className="text-[9px] text-muted-foreground">Envia POST com {'{prefix, number, department, timestamp}'}</p>
              </>
            )}
            <PropInput label="Template da senha" value={props.ticketTemplate || ''} onChange={set('ticketTemplate')} type="textarea" />
            <p className="text-[9px] text-muted-foreground -mt-1">Use {'{{senha}}'}, {'{{data}}'}, {'{{hora}}'}, {'{{departamento}}'}</p>
          </Section>
          <Section title="🎨 Aparência">
            <PropInput label="Cor de destaque" value={props.accentColor || '#6366f1'} onChange={set('accentColor')} type="color" />
            <PropInput label="Cor de fundo" value={props.bgColor || 'rgba(0,0,0,0.5)'} onChange={set('bgColor')} type="color" />
            <PropInput label="Cor do texto" value={props.textColor || '#ffffff'} onChange={set('textColor')} type="color" />
            <PropInput label="Tamanho da fonte" value={props.fontSize || 72} onChange={set('fontSize')} type="number" />
            <PropInput label="Border Radius" value={props.borderRadius || 20} onChange={set('borderRadius')} type="number" />
          </Section>
          <Section title="🔔 Notificações">
            <div className="flex items-center justify-between">
              <Label className="text-[11px]">Som ao retirar senha</Label>
              <Switch checked={props.playSound !== false} onCheckedChange={set('playSound')} />
            </div>
            <PropInput label="URL do som" value={props.soundUrl || ''} onChange={set('soundUrl')} />
            <div className="flex items-center justify-between">
              <Label className="text-[11px]">Enviar via webhook</Label>
              <Switch checked={props.notifyWebhook === true} onCheckedChange={set('notifyWebhook')} />
            </div>
            {props.notifyWebhook && (
              <PropInput label="URL do webhook" value={props.notifyWebhookUrl || ''} onChange={set('notifyWebhookUrl')} />
            )}
          </Section>
          <NavigationActionSection props={props} onChange={onChange} views={views} />
        </>
      );
    case 'qrpix':
      return (
        <>
          <Section title="💰 Dados do Pix">
            <div>
              <Label className="text-[11px]">Tipo de chave Pix</Label>
              <Select value={props.pixKeyType || 'cpf'} onValueChange={set('pixKeyType')}>
                <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpf">CPF</SelectItem>
                  <SelectItem value="cnpj">CNPJ</SelectItem>
                  <SelectItem value="phone">Telefone</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="random">Chave aleatória</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <PropInput label="Chave Pix" value={props.pixKey || ''} onChange={set('pixKey')} />
            <PropInput label="Nome do recebedor" value={props.recipientName || ''} onChange={set('recipientName')} />
            <PropInput label="CNPJ/CPF do recebedor" value={props.recipientDocument || ''} onChange={set('recipientDocument')} />
            <PropInput label="Cidade do recebedor" value={props.merchantCity || 'SAO PAULO'} onChange={set('merchantCity')} />
            <PropInput label="Valor" value={props.amount || 'R$ 0,00'} onChange={set('amount')} />
            <PropInput label="Descrição da transação" value={props.txDescription || ''} onChange={set('txDescription')} />
            <PropInput label="ID da transação" value={props.txId || ''} onChange={set('txId')} />
            <p className="text-[9px] text-muted-foreground -mt-1">Identificador único para conciliação (até 25 caracteres)</p>
          </Section>
          <Section title="⚙️ Comportamento">
            <div>
              <Label className="text-[11px]">Tipo do QR</Label>
              <Select value={props.pixType || 'static'} onValueChange={set('pixType')}>
                <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">Estático (valor fixo)</SelectItem>
                  <SelectItem value="dynamic">Dinâmico (via API)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {props.pixType === 'dynamic' && (
              <>
                <PropInput label="URL da API Pix" value={props.pixApiUrl || ''} onChange={set('pixApiUrl')} />
                <PropInput label="Token de autenticação" value={props.pixApiToken || ''} onChange={set('pixApiToken')} />
                <p className="text-[9px] text-muted-foreground -mt-1">Token Bearer para autenticação na API do PSP</p>
              </>
            )}
            <div className="flex items-center justify-between">
              <Label className="text-[11px]">Mostrar valor</Label>
              <Switch checked={props.showAmount !== false} onCheckedChange={set('showAmount')} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-[11px]">Copiar código ao tocar</Label>
              <Switch checked={props.copyOnTap !== false} onCheckedChange={set('copyOnTap')} />
            </div>
            <PropInput label="Validade (minutos)" value={props.expirationMinutes || 30} onChange={set('expirationMinutes')} type="number" />
          </Section>
          <Section title="✅ Confirmação de Pagamento">
            <div className="flex items-center justify-between">
              <Label className="text-[11px]">Verificar pagamento</Label>
              <Switch checked={props.checkPayment === true} onCheckedChange={set('checkPayment')} />
            </div>
            {props.checkPayment && (
              <>
                <PropInput label="URL de verificação" value={props.checkPaymentUrl || ''} onChange={set('checkPaymentUrl')} />
                <PropInput label="Intervalo de checagem (s)" value={props.checkInterval || 5} onChange={set('checkInterval')} type="number" />
                <PropInput label="Mensagem de sucesso" value={props.paymentSuccessMsg || 'Pagamento confirmado! ✅'} onChange={set('paymentSuccessMsg')} />
                {views && views.length > 0 && (
                  <div>
                    <Label className="text-[11px]">Navegar após pagamento</Label>
                    <Select value={props.paymentNavigateTarget || '__none__'} onValueChange={(v) => onChange({ paymentNavigateTarget: v === '__none__' ? '' : v })}>
                      <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Nenhuma</SelectItem>
                        {views.map(v => (
                          <SelectItem key={v.id} value={v.id}>
                            <span className="flex items-center gap-1.5"><Navigation className="w-3 h-3" /> {v.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
          </Section>
          <Section title="🎨 Aparência">
            <PropInput label="Rótulo" value={props.label || 'Pague com Pix'} onChange={set('label')} />
            <PropInput label="Cor de destaque" value={props.accentColor || '#32bcad'} onChange={set('accentColor')} type="color" />
            <PropInput label="Cor de fundo" value={props.bgColor || 'rgba(0,0,0,0.5)'} onChange={set('bgColor')} type="color" />
            <PropInput label="Border Radius" value={props.borderRadius || 20} onChange={set('borderRadius')} type="number" />
          </Section>
        </>
      );
    case 'numpad':
      return (
        <>
          <Section title="Teclado Numérico">
            <PropInput label="Rótulo" value={props.label || 'Digite seu CPF'} onChange={set('label')} />
            <PropInput label="Placeholder" value={props.placeholder || '000.000.000-00'} onChange={set('placeholder')} />
            <div>
              <Label className="text-[11px]">Máscara</Label>
              <Select value={props.mask || 'cpf'} onValueChange={set('mask')}>
                <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem máscara</SelectItem>
                  <SelectItem value="cpf">CPF (000.000.000-00)</SelectItem>
                  <SelectItem value="cnpj">CNPJ (00.000.000/0000-00)</SelectItem>
                  <SelectItem value="phone">Telefone ((00) 00000-0000)</SelectItem>
                  <SelectItem value="cep">CEP (00000-000)</SelectItem>
                  <SelectItem value="date">Data (DD/MM/AAAA)</SelectItem>
                  <SelectItem value="custom">Personalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {props.mask === 'custom' && (
              <>
                <PropInput label="Padrão da máscara" value={props.customMask || '000-000'} onChange={set('customMask')} />
                <p className="text-[9px] text-muted-foreground -mt-1">Use 0 para dígitos. Ex: 000.000-00</p>
              </>
            )}
            <PropInput label="Máx. dígitos" value={props.maxLength || 11} onChange={set('maxLength')} type="number" />
            <PropInput label="Texto do botão" value={props.buttonLabel || 'Confirmar'} onChange={set('buttonLabel')} />
          </Section>
          <Section title="⚙️ Ação ao confirmar">
            <div>
              <Label className="text-[11px]">Tipo de ação</Label>
              <Select value={props.submitAction || 'none'} onValueChange={set('submitAction')}>
                <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="navigate">📄 Navegar para página</SelectItem>
                  <SelectItem value="webhook">🔌 Enviar via webhook</SelectItem>
                  <SelectItem value="validate">✅ Validar (consultar API)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {props.submitAction === 'navigate' && views && views.length > 0 && (
              <div>
                <Label className="text-[11px]">Página de destino</Label>
                <Select value={props.submitNavigateTarget || ''} onValueChange={set('submitNavigateTarget')}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {views.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        <span className="flex items-center gap-1.5"><Navigation className="w-3 h-3" /> {v.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {props.submitAction === 'webhook' && (
              <>
                <PropInput label="URL do Webhook" value={props.numpadWebhookUrl || ''} onChange={set('numpadWebhookUrl')} />
                <PropInput label="Mensagem de sucesso" value={props.numpadSuccessMsg || 'Enviado com sucesso!'} onChange={set('numpadSuccessMsg')} />
              </>
            )}
            {props.submitAction === 'validate' && (
              <>
                <PropInput label="URL da API de validação" value={props.validateApiUrl || ''} onChange={set('validateApiUrl')} />
                <PropInput label="Mensagem de erro" value={props.validateErrorMsg || 'Dado não encontrado'} onChange={set('validateErrorMsg')} />
                <PropInput label="Mensagem de sucesso" value={props.validateSuccessMsg || 'Validado com sucesso! ✅'} onChange={set('validateSuccessMsg')} />
                <p className="text-[9px] text-muted-foreground">GET para a URL com ?value=VALOR_DIGITADO. Espera status 200 para sucesso.</p>
              </>
            )}
            <PropInput label="Nome da variável" value={props.variableName || 'numpad_value'} onChange={set('variableName')} />
            <p className="text-[9px] text-muted-foreground -mt-1">Acessível em outros elementos via {'{{numpad_value}}'}</p>
          </Section>
          <Section title="🎨 Aparência">
            <PropInput label="Cor de destaque" value={props.accentColor || '#6366f1'} onChange={set('accentColor')} type="color" />
            <PropInput label="Cor de fundo" value={props.bgColor || 'rgba(0,0,0,0.5)'} onChange={set('bgColor')} type="color" />
            <PropInput label="Border Radius" value={props.borderRadius || 20} onChange={set('borderRadius')} type="number" />
          </Section>
        </>
      );
    case 'bigcta':
      return (
        <>
          <Section title="CTA Grande">
            <PropInput label="Texto principal" value={props.label || 'Toque para começar'} onChange={set('label')} />
            <PropInput label="Subtítulo" value={props.sublabel || ''} onChange={set('sublabel')} />
            <PropInput label="Ícone (emoji)" value={props.icon || '👆'} onChange={set('icon')} />
            <PropInput label="Tamanho da fonte" value={props.fontSize || 28} onChange={set('fontSize')} type="number" />
            <PropInput label="Cor de fundo" value={props.bgColor || '#6366f1'} onChange={set('bgColor')} type="color" />
            <PropInput label="Cor do texto" value={props.textColor || '#ffffff'} onChange={set('textColor')} type="color" />
            <PropInput label="Border Radius" value={props.borderRadius || 24} onChange={set('borderRadius')} type="number" />
            <div className="flex items-center justify-between">
              <Label className="text-[11px]">Animação de pulso</Label>
              <Switch checked={props.pulse !== false} onCheckedChange={set('pulse')} />
            </div>
          </Section>
          <Section title="⚙️ Ação ao tocar">
            <div>
              <Label className="text-[11px]">Tipo de ação</Label>
              <Select value={props.actionType || 'navigate'} onValueChange={set('actionType')}>
                <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="navigate">📄 Navegar para Página</SelectItem>
                  <SelectItem value="prompt">💬 Prompt IA</SelectItem>
                  <SelectItem value="url">🔗 Abrir URL</SelectItem>
                  <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                  <SelectItem value="phone">📞 Ligar</SelectItem>
                  <SelectItem value="webhook">🔌 Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {props.actionType === 'navigate' && views && views.length > 0 && (
              <>
                <div>
                  <Label className="text-[11px]">Página de destino</Label>
                  <Select value={props.navigateTarget || ''} onValueChange={set('navigateTarget')}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {views.map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          <span className="flex items-center gap-1.5"><Navigation className="w-3 h-3" /> {v.name}</span>
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
                      <SelectItem value="fade">✨ Fade</SelectItem>
                      <SelectItem value="slide-left">⬅ Slide</SelectItem>
                      <SelectItem value="zoom">🔍 Zoom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {props.actionType === 'prompt' && (
              <PropInput label="Prompt" value={props.action || ''} onChange={set('action')} />
            )}
            {props.actionType === 'url' && (
              <PropInput label="URL" value={props.action || ''} onChange={set('action')} />
            )}
            {props.actionType === 'whatsapp' && (
              <>
                <PropInput label="Número WhatsApp" value={props.whatsappNumber || ''} onChange={set('whatsappNumber')} />
                <PropInput label="Mensagem" value={props.whatsappMessage || ''} onChange={set('whatsappMessage')} type="textarea" />
              </>
            )}
            {props.actionType === 'phone' && (
              <PropInput label="Número" value={props.phoneNumber || ''} onChange={set('phoneNumber')} />
            )}
            {props.actionType === 'webhook' && (
              <>
                <PropInput label="URL do Webhook" value={props.webhookUrl || ''} onChange={set('webhookUrl')} />
                <PropInput label="Payload JSON" value={props.webhookPayload || ''} onChange={set('webhookPayload')} type="textarea" />
              </>
            )}
          </Section>
        </>
      );
    case 'feed':
      return <><FeedPropsPanel props={props} onChange={onChange} /><NavigationActionSection props={props} onChange={onChange} views={views} /></>;
    default:
      return (
        <Section title="Propriedades">
          <p className="text-[11px] text-muted-foreground">Sem propriedades editáveis.</p>
        </Section>
      );
  }
}

/* ── Iframe / HTML Editable Panel ── */
function IframePropsPanel({ props, onChange, views }: { props: Record<string, any>; onChange: (p: Record<string, any>) => void; views?: CanvasView[] }) {
  const set = (key: string) => (val: any) => onChange({ [key]: val });
  const isHtmlMode = props._iframeMode === 'html' || (!props._iframeMode && !!props.htmlContent);
  const [showCode, setShowCode] = useState(false);
  const [expandedHtml, setExpandedHtml] = useState<string | null>(null);
  const [fieldFilter, setFieldFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const editableFields = useMemo(() => {
    if (!props.htmlContent) return [];
    return extractEditableFields(props.htmlContent);
  }, [props.htmlContent]);

  const overrides: Record<string, string> = props.fieldOverrides || {};

  const handleFieldChange = (fieldId: string, newValue: string) => {
    const currentHtml = props.htmlContent || '';
    if (!currentHtml) {
      const updated = { ...overrides, [fieldId]: newValue };
      onChange({ fieldOverrides: updated });
      return;
    }

    // For __html overrides, do direct string replacement of the element's outerHTML
    if (fieldId.endsWith('__html')) {
      const baseId = fieldId.replace('__html', '');
      const field = editableFields.find(f => f.id === baseId);
      if (field?.html) {
        const oldHtml = field.html;
        if (currentHtml.includes(oldHtml)) {
          onChange({ htmlContent: currentHtml.replace(oldHtml, newValue) });
          return;
        }
        const trimmedOld = oldHtml.trim();
        if (currentHtml.includes(trimmedOld)) {
          onChange({ htmlContent: currentHtml.replace(trimmedOld, newValue) });
          return;
        }
      }
    }

    // For all other changes, use applyFieldOverrides
    try {
      const updatedHtml = applyFieldOverrides(currentHtml, { [fieldId]: newValue });
      if (updatedHtml !== currentHtml) {
        onChange({ htmlContent: updatedHtml });
      } else {
        const updated = { ...overrides, [fieldId]: newValue };
        onChange({ fieldOverrides: updated });
      }
    } catch {
      const updated = { ...overrides, [fieldId]: newValue };
      onChange({ fieldOverrides: updated });
    }
  };

  const textFields = editableFields.filter(f => f.type === 'text');
  const imageFields = editableFields.filter(f => f.type === 'image');
  const buttonFields = editableFields.filter(f => f.type === 'button');
  const linkFields = editableFields.filter(f => f.type === 'link');
  const colorFields = editableFields.filter(f => f.type === 'color');

  const filterTabs = [
    { id: 'all', label: 'Todos', emoji: '📋', count: editableFields.length },
    { id: 'text', label: 'Textos', emoji: '✏️', count: textFields.length },
    { id: 'image', label: 'Imagens', emoji: '🖼️', count: imageFields.length },
    { id: 'button', label: 'Botões', emoji: '🔘', count: buttonFields.length },
    { id: 'link', label: 'Links', emoji: '🔗', count: linkFields.length },
    { id: 'color', label: 'Cores', emoji: '🎨', count: colorFields.length },
  ].filter(t => t.count > 0 || t.id === 'all');

  let filteredFields = fieldFilter === 'all' ? editableFields : editableFields.filter(f => f.type === fieldFilter);
  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    filteredFields = filteredFields.filter(f => f.label.toLowerCase().includes(q) || f.value.toLowerCase().includes(q));
  }

  return (
    <>
      {/* Mode toggle — simplified */}
      {!isHtmlMode && (
        <Section title="Configuração">
          <div>
            <Label className="text-[11px]">Modo</Label>
            <Select value="url" onValueChange={(v) => onChange({ _iframeMode: v })}>
              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="url">🔗 URL externa</SelectItem>
                <SelectItem value="html">📝 HTML personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <PropInput label="URL do site" value={props.url} onChange={set('url')} />
          <PropInput label="Arredondamento" value={props.borderRadius} onChange={set('borderRadius')} type="number" />
        </Section>
      )}

      {isHtmlMode && (
        <>
          {/* ── Friendly header ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Pencil className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-foreground">Editor de Conteúdo</h3>
                <p className="text-[9px] text-muted-foreground/60">Edite textos, imagens e cores abaixo</p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'Textos', count: textFields.length, emoji: '✏️', color: 'bg-indigo-500/10 text-indigo-400' },
                { label: 'Imagens', count: imageFields.length, emoji: '🖼️', color: 'bg-emerald-500/10 text-emerald-400' },
                { label: 'Botões', count: buttonFields.length, emoji: '🔘', color: 'bg-amber-500/10 text-amber-400' },
              ].filter(s => s.count > 0).map(s => (
                <div key={s.label} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg ${s.color}`}>
                  <span className="text-sm">{s.emoji}</span>
                  <div>
                    <p className="text-[11px] font-bold">{s.count}</p>
                    <p className="text-[8px] opacity-70">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Advanced edit on canvas button */}
            <button
              onClick={() => {
                const entering = !props.editMode;
                onChange({ editMode: entering, _activeTool: entering ? 'text' : 'off' });
              }}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                props.editMode
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 shadow-lg'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground border border-border/50'
              }`}
            >
              <Move className="w-3.5 h-3.5" />
              {props.editMode ? '✓ Editando no canvas — clique para sair' : 'Edição avançada no canvas'}
            </button>
          </div>

          {/* ── Search & Filter ── */}
          {editableFields.length > 0 && (
            <div className="space-y-2">
              {editableFields.length > 5 && (
                <input
                  type="text"
                  placeholder="🔍 Buscar campo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-8 rounded-lg border border-border/50 bg-muted/30 px-3 text-[11px] placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              )}

              <div className="flex flex-wrap gap-1">
                {filterTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFieldFilter(tab.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                      fieldFilter === tab.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'
                    }`}
                  >
                    <span>{tab.emoji}</span>
                    <span>{tab.label}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                      fieldFilter === tab.id ? 'bg-primary-foreground/20' : 'bg-muted-foreground/10'
                    }`}>{tab.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Editable Fields ── */}
          <div className="space-y-2">
            {filteredFields.map((field) => (
              <SimpleFieldCard
                key={field.id}
                field={field}
                overrides={overrides}
                expandedHtml={expandedHtml}
                setExpandedHtml={setExpandedHtml}
                onChange={handleFieldChange}
                views={views}
              />
            ))}
            {filteredFields.length === 0 && editableFields.length > 0 && (
              <div className="text-center py-6">
                <p className="text-[11px] text-muted-foreground/50">Nenhum campo encontrado</p>
                <button onClick={() => { setFieldFilter('all'); setSearchTerm(''); }} className="text-[10px] text-primary hover:underline mt-1">
                  Ver todos
                </button>
              </div>
            )}
            {editableFields.length === 0 && (
              <div className="text-center py-8 space-y-2">
                <span className="text-2xl">📄</span>
                <p className="text-[11px] text-muted-foreground/50">Cole ou importe um HTML para começar a editar</p>
              </div>
            )}
          </div>

          {/* ── Advanced: raw HTML code ── */}
          <Collapsible open={showCode} onOpenChange={setShowCode}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors">
                <Code2 className="w-3 h-3 text-muted-foreground/40" />
                <span className="text-[9px] font-semibold text-muted-foreground/50 flex-1 text-left">Código HTML (avançado)</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground/30 transition-transform data-[state=open]:rotate-180" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <textarea
                value={props.htmlContent || ''}
                onChange={(e) => set('htmlContent')(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-[10px] font-mono min-h-[160px] resize-y focus:outline-none focus:ring-1 focus:ring-primary mt-1"
                placeholder="<div>Seu HTML aqui...</div>"
                spellCheck={false}
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Settings */}
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors">
                <span className="text-[9px] font-semibold text-muted-foreground/50 flex-1 text-left">⚙️ Configurações</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground/30 transition-transform data-[state=open]:rotate-180" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-1">
              <div>
                <Label className="text-[10px]">Modo</Label>
                <Select value="html" onValueChange={(v) => onChange({ _iframeMode: v })}>
                  <SelectTrigger className="h-7 text-[10px] mt-0.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="url">🔗 URL externa</SelectItem>
                    <SelectItem value="html">📝 HTML personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <PropInput label="Arredondamento" value={props.borderRadius} onChange={set('borderRadius')} type="number" />
              <div className="flex items-center justify-between">
                <Label className="text-[10px]">Rolagem</Label>
                <Switch checked={props.scrolling !== false} onCheckedChange={set('scrolling')} />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </>
      )}

      <NavigationActionSection props={props} onChange={onChange} views={views} />
    </>
  );
}

/* ── Simplified HTML Field Card — User-friendly ── */
function SimpleFieldCard({ field, overrides, expandedHtml, setExpandedHtml, onChange, views }: {
  field: import('../../utils/htmlEditableFields').EditableField;
  overrides: Record<string, string>;
  expandedHtml: string | null;
  setExpandedHtml: (id: string | null) => void;
  onChange: (fieldId: string, value: string) => void;
  views?: CanvasView[];
}) {
  const typeConfig: Record<string, { emoji: string; color: string; bgColor: string; actionLabel: string }> = {
    button: { emoji: '🔘', color: 'border-l-amber-500', bgColor: 'bg-amber-500/5', actionLabel: 'Editar botão' },
    text: { emoji: '✏️', color: 'border-l-indigo-500', bgColor: 'bg-indigo-500/5', actionLabel: 'Editar texto' },
    image: { emoji: '🖼️', color: 'border-l-emerald-500', bgColor: 'bg-emerald-500/5', actionLabel: 'Trocar imagem' },
    link: { emoji: '🔗', color: 'border-l-blue-500', bgColor: 'bg-blue-500/5', actionLabel: 'Editar link' },
    color: { emoji: '🎨', color: 'border-l-pink-500', bgColor: 'bg-pink-500/5', actionLabel: 'Trocar cor' },
  };

  const config = typeConfig[field.type] || { emoji: '📄', color: 'border-l-muted', bgColor: 'bg-muted/5', actionLabel: 'Editar' };

  // Friendly label — remove tag info, just show content
  const friendlyLabel = field.type === 'text'
    ? `"${(overrides[field.id] || field.value).slice(0, 40)}${(overrides[field.id] || field.value).length > 40 ? '…' : ''}"`
    : field.label;

  return (
    <div className={`rounded-xl border border-border/40 border-l-[3px] ${config.color} ${config.bgColor} overflow-hidden transition-all hover:border-border/60`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="text-sm">{config.emoji}</span>
        <span className="text-[10px] font-semibold text-foreground/80 truncate flex-1">
          {friendlyLabel}
        </span>
      </div>

      {/* Content area */}
      <div className="px-3 pb-2.5 space-y-2">
        {/* TEXT */}
        {field.type === 'text' && (
          (overrides[field.id] || field.value).length > 60 ? (
            <textarea
              value={overrides[field.id] ?? field.value}
              onChange={(e) => onChange(field.id, e.target.value)}
              className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-[11px] min-h-[60px] resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              placeholder="Digite o texto..."
            />
          ) : (
            <input
              type="text"
              value={overrides[field.id] ?? field.value}
              onChange={(e) => onChange(field.id, e.target.value)}
              className="w-full h-9 rounded-lg border border-border/50 bg-background px-3 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              placeholder="Digite o texto..."
            />
          )
        )}

        {/* BUTTON */}
        {field.type === 'button' && (
          <>
            <div>
              <label className="text-[9px] font-medium text-muted-foreground/70 mb-0.5 block">Texto do botão</label>
              <input
                type="text"
                value={overrides[field.id] ?? field.value}
                onChange={(e) => onChange(field.id, e.target.value)}
                className="w-full h-9 rounded-lg border border-border/50 bg-background px-3 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Texto do botão..."
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-medium text-muted-foreground/70 mb-0.5 block">Cor do fundo</label>
                <div className="flex gap-1.5 items-center">
                  <input type="color" value={overrides[`${field.id}__bgColor`] ?? (field.extras?.bgColor || '#333333')} onChange={(e) => onChange(`${field.id}__bgColor`, e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border border-border/30" />
                  <input type="text" value={overrides[`${field.id}__bgColor`] ?? (field.extras?.bgColor || '')} onChange={(e) => onChange(`${field.id}__bgColor`, e.target.value)} className="flex-1 h-7 rounded-lg border border-border/50 bg-background px-2 text-[9px] font-mono focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-medium text-muted-foreground/70 mb-0.5 block">Cor do texto</label>
                <div className="flex gap-1.5 items-center">
                  <input type="color" value={overrides[`${field.id}__textColor`] ?? (field.extras?.textColor || '#ffffff')} onChange={(e) => onChange(`${field.id}__textColor`, e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border border-border/30" />
                  <input type="text" value={overrides[`${field.id}__textColor`] ?? (field.extras?.textColor || '')} onChange={(e) => onChange(`${field.id}__textColor`, e.target.value)} className="flex-1 h-7 rounded-lg border border-border/50 bg-background px-2 text-[9px] font-mono focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
              </div>
            </div>
            {views && views.length > 0 && (
              <div>
                <label className="text-[9px] font-medium text-muted-foreground/70 mb-0.5 flex items-center gap-1 block">
                  🔗 Ao clicar, ir para:
                </label>
                <Select
                  value={overrides[`${field.id}__navigate`] || '__none__'}
                  onValueChange={(v) => onChange(`${field.id}__navigate`, v === '__none__' ? '' : v)}
                >
                  <SelectTrigger className="h-8 text-[10px]"><SelectValue placeholder="Nenhuma página" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Nenhuma</SelectItem>
                    {views.map(v => (<SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}

        {/* LINK */}
        {field.type === 'link' && (
          <>
            <div>
              <label className="text-[9px] font-medium text-muted-foreground/70 mb-0.5 block">Texto do link</label>
              <input type="text" value={overrides[`${field.id}__text`] ?? (field.extras?.text || '')} onChange={(e) => onChange(`${field.id}__text`, e.target.value)} className="w-full h-9 rounded-lg border border-border/50 bg-background px-3 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Texto do link..." />
            </div>
            <div>
              <label className="text-[9px] font-medium text-muted-foreground/70 mb-0.5 block">Endereço (URL)</label>
              <input type="text" value={overrides[field.id] ?? field.value} onChange={(e) => onChange(field.id, e.target.value)} className="w-full h-9 rounded-lg border border-border/50 bg-background px-3 text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="https://..." />
            </div>
            {views && views.length > 0 && (
              <div>
                <label className="text-[9px] font-medium text-muted-foreground/70 mb-0.5 flex items-center gap-1 block">🔗 Ao clicar, ir para:</label>
                <Select value={overrides[`${field.id}__navigate`] || '__none__'} onValueChange={(v) => onChange(`${field.id}__navigate`, v === '__none__' ? '' : v)}>
                  <SelectTrigger className="h-8 text-[10px]"><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Nenhuma</SelectItem>
                    {views.map(v => (<SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}

        {/* IMAGE */}
        {field.type === 'image' && (
          <>
            {(overrides[field.id] || field.value) && (
              <div className="w-full h-20 rounded-lg border border-border/40 overflow-hidden bg-muted/20">
                <img
                  src={overrides[field.id] ?? field.value}
                  alt={field.label}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            <ImageUploadField value={overrides[field.id] ?? field.value} onChange={(v) => onChange(field.id, v)} />
          </>
        )}

        {/* COLOR */}
        {field.type === 'color' && (
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={overrides[field.id] ?? field.value}
              onChange={(e) => onChange(field.id, e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border border-border/30"
            />
            <input
              type="text"
              value={overrides[field.id] ?? field.value}
              onChange={(e) => onChange(field.id, e.target.value)}
              className="flex-1 h-9 rounded-lg border border-border/50 bg-background px-3 text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="#000000"
            />
          </div>
        )}

        {/* HTML code — hidden by default, for advanced users */}
        <Collapsible open={expandedHtml === field.id} onOpenChange={(open) => setExpandedHtml(open ? field.id : null)}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center gap-1 py-0.5 cursor-pointer text-[8px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors">
              <Code2 className="w-2.5 h-2.5" />
              <span>Código HTML</span>
              <ChevronDown className="w-2 h-2 ml-auto transition-transform data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <textarea
              value={field.html || ''}
              onChange={(e) => onChange(`${field.id}__html`, e.target.value)}
              className="w-full rounded-lg border border-border/50 bg-background px-2 py-1.5 text-[9px] font-mono min-h-[60px] resize-y focus:outline-none focus:ring-1 focus:ring-primary/30 mt-1"
              spellCheck={false}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}