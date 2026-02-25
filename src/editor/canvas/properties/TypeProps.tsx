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
                    <Select value={props.paymentNavigateTarget || ''} onValueChange={set('paymentNavigateTarget')}>
                      <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhuma</SelectItem>
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
    default:
      return (
        <Section title="Propriedades">
          <p className="text-[11px] text-muted-foreground">Sem propriedades editáveis.</p>
        </Section>
      );
  }
}
