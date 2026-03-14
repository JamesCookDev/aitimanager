/**
 * Free-form canvas types for the new Page Builder.
 * Canvas: 1080×1920 (Full HD vertical totem).
 */

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1920;

export type ElementType =
  | 'text'
  | 'image'
  | 'button'
  | 'shape'
  | 'icon'
  | 'video'
  | 'qrcode'
  | 'map'
  | 'social'
  | 'chat'
  | 'carousel'
  | 'clock'
  | 'weather'
  | 'countdown'
  | 'iframe'
  | 'avatar'
  | 'store'
  | 'list'
  | 'gallery'
  | 'animated-number'
  | 'catalog'
  | 'form'
  | 'ticket'
  | 'qrpix'
  | 'numpad'
  | 'bigcta'
  | 'feed';

/* ── Views ──────────────────────────────────── */

export interface CanvasView {
  id: string;
  name: string;
  isDefault?: boolean;
  /** Parent view ID for hierarchy. null/undefined = root level */
  parentId?: string | null;
}

export const DEFAULT_VIEW: CanvasView = { id: '__default__', name: 'Home', isDefault: true };

export type ButtonActionType = 'prompt' | 'url' | 'navigate';
export type PageTransition = 'none' | 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'zoom' | 'flip' | 'rotate' | 'blur';

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  name: string;
  /** View this element belongs to. null or '__global__' = always visible */
  viewId?: string | null;
  props: Record<string, any>;
}

export interface CanvasState {
  bgColor: string;
  elements: CanvasElement[];
  selectedId: string | null;
  /** Available views/pages for internal navigation */
  views?: CanvasView[];
  /** Active view being edited (editor-only, not persisted to hardware) */
  activeViewId?: string;
  /** Idle timeout in seconds — returns to default view after inactivity (0 = disabled) */
  viewIdleTimeout?: number;
  /** Per-page background colors (viewId → color). Falls back to bgColor if not set */
  pageBgColors?: Record<string, string>;
  /** Enable idle/screensaver screen that extracts content from the page */
  idleScreenEnabled?: boolean;
  /** Seconds of inactivity before idle screen activates (default 60) */
  idleScreenTimeout?: number;
}

export const DEFAULT_CANVAS_STATE: CanvasState = {
  bgColor: '#0f172a',
  elements: [],
  selectedId: null,
  views: [{ ...DEFAULT_VIEW }],
  activeViewId: '__default__',
  viewIdleTimeout: 30,
  pageBgColors: {},
  idleScreenEnabled: false,
  idleScreenTimeout: 60,
};

/* ── helpers ────────────────────────────────────── */

let _counter = 0;
const uid = () => `el_${Date.now()}_${++_counter}`;
export const viewUid = () => `view_${Date.now()}_${++_counter}`;

/** Default size & props per element type */
const ELEMENT_DEFAULTS: Record<ElementType, { w: number; h: number; name: string; props: Record<string, any> }> = {
  text: { w: 400, h: 80, name: 'Texto', props: { text: 'Seu texto aqui', fontSize: 32, fontWeight: 'bold', color: '#ffffff', align: 'center', fontFamily: 'Inter' } },
  image: { w: 400, h: 300, name: 'Imagem', props: { src: '', fit: 'cover', borderRadius: 12 } },
  button: { w: 360, h: 64, name: 'Botão', props: { label: 'Toque aqui', bgColor: '#6366f1', textColor: '#ffffff', fontSize: 18, borderRadius: 999, actionType: 'prompt' as ButtonActionType, action: '', navigateTarget: '', navigateTransition: 'fade' as PageTransition } },
  shape: { w: 200, h: 200, name: 'Forma', props: { shapeType: 'rectangle', fill: '#6366f1', borderRadius: 16, borderColor: 'transparent', borderWidth: 0 } },
  icon: { w: 80, h: 80, name: 'Ícone', props: { icon: '⭐', size: 48, color: '#ffffff' } },
  video: { w: 480, h: 320, name: 'Vídeo', props: { url: '', autoplay: true, loop: true, muted: true, borderRadius: 12 } },
  qrcode: { w: 200, h: 200, name: 'QR Code', props: { value: 'https://example.com', fgColor: '#ffffff', bgColor: 'transparent' } },
  map: { w: 400, h: 500, name: 'Mapa', props: { lat: -23.5505, lng: -46.6333, zoom: 15, borderRadius: 12, label: '', labelColor: '#ffffff', labelSize: 14 } },
  social: { w: 420, h: 80, name: 'Redes Sociais', props: { links: [{ id: '1', platform: 'instagram', label: 'Instagram', url: '', color: '#E1306C' }, { id: '2', platform: 'facebook', label: 'Facebook', url: '', color: '#1877F2' }, { id: '3', platform: 'whatsapp', label: 'WhatsApp', url: '', color: '#25D366' }, { id: '4', platform: 'email', label: 'E-mail', url: '', color: '#EA4335' }], iconSize: 36, gap: 16, showLabels: true, layout: 'horizontal', bgEnabled: false, bgColor: 'rgba(0,0,0,0.3)', borderRadius: 16, padding: 12 } },
  chat: { w: 420, h: 500, name: 'Chat IA', props: { placeholder: 'Pergunte algo...', theme: 'dark' } },
  carousel: { w: 480, h: 360, name: 'Carrossel', props: { images: [], autoplay: true, interval: 5, borderRadius: 12, transition: 'fade' } },
  clock: { w: 240, h: 100, name: 'Relógio', props: { format: '24h', showDate: true, color: '#ffffff', fontSize: 36 } },
  weather: { w: 300, h: 160, name: 'Clima', props: { city: 'São Paulo', units: 'metric', color: '#ffffff' } },
  countdown: { w: 360, h: 120, name: 'Contagem', props: { targetDate: '', label: 'Faltam', color: '#ffffff', fontSize: 28 } },
  iframe: { w: 480, h: 400, name: 'Iframe', props: { url: '', borderRadius: 8 } },
  avatar: { w: 500, h: 500, name: 'Avatar 3D', props: { position: 'center', scale: 1.5, animation: 'idle', enabled: true, avatarUrl: '/models/avatar.glb', animationsUrl: '/models/animations.glb', colors: { shirt: '#1E3A8A', pants: '#1F2937', shoes: '#000000' }, frameY: 0, frameZoom: 50 } },
  store: { w: 480, h: 600, name: 'Diretório de Lojas', props: { title: 'Lojas', titleColor: '#ffffff', titleSize: 28, bgColor: 'rgba(0,0,0,0.6)', borderRadius: 16, stores: [{ id: '1', name: 'Loja Exemplo', logo: '', coverImage: '', gallery: [], floor: 'Piso 1', category: 'Moda', hours: '10h–22h', phone: '', description: 'Moda masculina e feminina', mapX: 50, mapY: 50, zone: '' }], columns: 1, gap: 12, cardBgColor: 'rgba(255,255,255,0.08)', cardBorderRadius: 12, accentColor: '#6366f1', showCategory: true, showHours: true, showPhone: true, showFloor: true, showCategoryFilter: false, showSearch: false } },
  list: { w: 420, h: 500, name: 'Lista', props: { listTitle: 'Menu', bgColor: 'rgba(0,0,0,0.4)', borderRadius: 16, titleSize: 18, titleColor: '#ffffff', priceColor: '#6366f1', showIcon: true, showPrice: true, showDivider: true, items: [{ id: '1', title: 'Item 1', subtitle: 'Descrição do item', price: 'R$ 29,90', icon: '🍔' }, { id: '2', title: 'Item 2', subtitle: 'Descrição do item', price: 'R$ 19,90', icon: '🍟' }, { id: '3', title: 'Item 3', subtitle: 'Descrição do item', price: 'R$ 14,90', icon: '🥤' }] } },
  gallery: { w: 420, h: 420, name: 'Galeria', props: { images: [], columns: 2, gap: 8, borderRadius: 12, aspectRatio: '1/1' } },
  'animated-number': { w: 320, h: 160, name: 'Número Animado', props: { value: 1234, prefix: '', suffix: '', label: 'Visitantes hoje', color: '#ffffff', labelColor: 'rgba(255,255,255,0.6)', fontSize: 64, labelSize: 18, duration: 2000, useGrouping: true } },
  catalog: { w: 480, h: 600, name: 'Catálogo', props: { title: 'Catálogo', titleColor: '#ffffff', titleSize: 24, bgColor: 'rgba(0,0,0,0.5)', borderRadius: 16, items: [{ id: '1', name: 'Produto 1', description: 'Descrição do produto', price: 'R$ 49,90', image: '', category: 'Geral', badge: '', badgeColor: '#6366f1' }], columns: 2, gap: 12, cardBgColor: 'rgba(255,255,255,0.08)', cardBorderRadius: 12, accentColor: '#6366f1', showPrice: true, showCategory: true, showSearch: false, showCategoryFilter: false, imageAspect: '4/3', priceColor: '#22c55e', nameSize: 14, priceSize: 16 } },
  form: { w: 420, h: 500, name: 'Formulário', props: { title: 'Check-in', titleColor: '#ffffff', titleSize: 22, bgColor: 'rgba(0,0,0,0.5)', borderRadius: 16, fields: [{ id: '1', type: 'text', label: 'Nome completo', placeholder: 'Digite seu nome', required: true }, { id: '2', type: 'email', label: 'E-mail', placeholder: 'seu@email.com', required: true }, { id: '3', type: 'select', label: 'Assunto', placeholder: 'Selecione...', options: 'Informações, Reserva, Reclamação', required: false }], submitLabel: 'Enviar', submitBgColor: '#6366f1', submitTextColor: '#ffffff', accentColor: '#6366f1', fieldBgColor: 'rgba(255,255,255,0.1)', fieldTextColor: '#ffffff', successMessage: 'Enviado com sucesso! ✅' } },
  ticket: { w: 360, h: 400, name: 'Senha', props: { prefix: 'A', currentNumber: 42, bgColor: 'rgba(0,0,0,0.5)', textColor: '#ffffff', accentColor: '#6366f1', fontSize: 72, borderRadius: 20, label: 'Sua senha', labelSize: 16, showPrint: true, printLabel: '🖨️ Retirar Senha' } },
  qrpix: { w: 360, h: 480, name: 'QR Pix', props: { pixKey: '12345678901', amount: 'R$ 0,00', recipientName: 'Empresa LTDA', bgColor: 'rgba(0,0,0,0.5)', textColor: '#ffffff', accentColor: '#32bcad', borderRadius: 20, showAmount: true, label: 'Pague com Pix' } },
  numpad: { w: 400, h: 600, name: 'Teclado Numérico', props: { label: 'Digite seu CPF', placeholder: '000.000.000-00', bgColor: 'rgba(0,0,0,0.5)', textColor: '#ffffff', accentColor: '#6366f1', borderRadius: 20, maxLength: 11, mask: 'cpf', buttonLabel: 'Confirmar' } },
  bigcta: { w: 600, h: 180, name: 'CTA Grande', props: { label: 'Toque para começar', sublabel: '', icon: '👆', bgColor: '#6366f1', textColor: '#ffffff', fontSize: 28, sublabelSize: 14, borderRadius: 24, pulse: true } },
  feed: { w: 480, h: 700, name: 'Feed', props: { posts: [], layout: 'vertical', bgColor: 'transparent', cardBgColor: 'rgba(0,0,0,0.6)', textColor: '#ffffff', accentColor: '#ef4444', borderRadius: 16, cardBorderRadius: 12, gap: 16, showAuthor: true, showLikes: true, showComments: true } },
};

export function createElement(type: ElementType, x = 100, y = 100, viewId?: string): CanvasElement {
  const def = ELEMENT_DEFAULTS[type];
  return {
    id: uid(),
    type,
    x,
    y,
    width: def.w,
    height: def.h,
    rotation: 0,
    zIndex: 1,
    opacity: 1,
    locked: false,
    visible: true,
    name: def.name,
    viewId: viewId || '__default__',
    props: { ...def.props },
  };
}

/* ── reducer ────────────────────────────────────── */

export type CanvasAction =
  | { type: 'ADD_ELEMENT'; payload: CanvasElement }
  | { type: 'UPDATE_ELEMENT'; id: string; patch: Partial<CanvasElement> }
  | { type: 'UPDATE_PROPS'; id: string; props: Record<string, any> }
  | { type: 'DELETE_ELEMENT'; id: string }
  | { type: 'SELECT'; id: string | null }
  | { type: 'MOVE'; id: string; x: number; y: number }
  | { type: 'RESIZE'; id: string; x: number; y: number; width: number; height: number }
  | { type: 'BRING_FORWARD'; id: string }
  | { type: 'SEND_BACKWARD'; id: string }
  | { type: 'SET_BG_COLOR'; color: string }
  | { type: 'DUPLICATE'; id: string }
  | { type: 'LOAD'; state: CanvasState }
  // View/Page actions
  | { type: 'ADD_VIEW'; view: CanvasView }
  | { type: 'UPDATE_VIEW'; id: string; patch: Partial<CanvasView> }
  | { type: 'DELETE_VIEW'; id: string }
  | { type: 'SET_ACTIVE_VIEW'; id: string }
  | { type: 'SET_VIEW_IDLE_TIMEOUT'; seconds: number }
  | { type: 'ASSIGN_ELEMENT_VIEW'; elementId: string; viewId: string | null }
  | { type: 'SET_PAGE_BG_COLOR'; viewId: string; color: string }
  | { type: 'DUPLICATE_VIEW'; id: string }
  | { type: 'SET_IDLE_SCREEN'; enabled: boolean }
  | { type: 'SET_IDLE_SCREEN_TIMEOUT'; seconds: number };

export function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case 'ADD_ELEMENT': {
      const maxZ = state.elements.reduce((m, e) => Math.max(m, e.zIndex), 0);
      const viewId = action.payload.viewId || state.activeViewId || '__default__';
      return {
        ...state,
        elements: [...state.elements, { ...action.payload, zIndex: maxZ + 1, viewId }],
        selectedId: action.payload.id,
      };
    }
    case 'UPDATE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map(e => e.id === action.id ? { ...e, ...action.patch } : e),
      };
    case 'UPDATE_PROPS':
      return {
        ...state,
        elements: state.elements.map(e =>
          e.id === action.id ? { ...e, props: { ...e.props, ...action.props } } : e
        ),
      };
    case 'DELETE_ELEMENT':
      return {
        ...state,
        elements: state.elements.filter(e => e.id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      };
    case 'SELECT':
      return { ...state, selectedId: action.id };
    case 'MOVE':
      return {
        ...state,
        elements: state.elements.map(e =>
          e.id === action.id ? { ...e, x: action.x, y: action.y } : e
        ),
      };
    case 'RESIZE':
      return {
        ...state,
        elements: state.elements.map(e =>
          e.id === action.id ? { ...e, x: action.x, y: action.y, width: action.width, height: action.height } : e
        ),
      };
    case 'BRING_FORWARD': {
      const maxZ = state.elements.reduce((m, e) => Math.max(m, e.zIndex), 0);
      return {
        ...state,
        elements: state.elements.map(e =>
          e.id === action.id ? { ...e, zIndex: maxZ + 1 } : e
        ),
      };
    }
    case 'SEND_BACKWARD': {
      const minZ = state.elements.reduce((m, e) => Math.min(m, e.zIndex), Infinity);
      return {
        ...state,
        elements: state.elements.map(e =>
          e.id === action.id ? { ...e, zIndex: Math.max(0, minZ - 1) } : e
        ),
      };
    }
    case 'SET_BG_COLOR':
      return { ...state, bgColor: action.color };
    case 'DUPLICATE': {
      const el = state.elements.find(e => e.id === action.id);
      if (!el) return state;
      const dup = createElement(el.type);
      return canvasReducer(state, {
        type: 'ADD_ELEMENT',
        payload: { ...el, ...dup, id: dup.id, x: el.x + 30, y: el.y + 30, name: `${el.name} (cópia)`, viewId: el.viewId },
      });
    }
    case 'LOAD': {
      const rawViews = action.state.views?.length ? action.state.views : [{ ...DEFAULT_VIEW }];
      // Deduplicate views by id (keep first occurrence)
      const seenIds = new Set<string>();
      const views = rawViews.filter(v => {
        if (seenIds.has(v.id)) return false;
        seenIds.add(v.id);
        return true;
      });
      // Remove orphan views (no elements assigned and not default)
      const usedViewIds = new Set((action.state.elements || []).map(e => e.viewId).filter(Boolean));
      usedViewIds.add('__default__');
      const cleanViews = views.filter(v => v.isDefault || usedViewIds.has(v.id));
      const finalViews = cleanViews.length ? cleanViews : [{ ...DEFAULT_VIEW }];
      const defaultViewId = finalViews.find(v => v.isDefault)?.id || finalViews[0]?.id || '__default__';
      // Migrate orphaned elements (viewId null/undefined/__global__) to the default page
      const elements = (action.state.elements || []).map(e =>
        (!e.viewId || e.viewId === '__global__') ? { ...e, viewId: defaultViewId } : e
      );
      return {
        ...action.state,
        elements,
        views: finalViews,
        activeViewId: action.state.activeViewId || defaultViewId,
        viewIdleTimeout: action.state.viewIdleTimeout ?? 30,
      };
    }

    // ── View actions ──
    case 'ADD_VIEW':
      return { ...state, views: [...(state.views || []), action.view] };
    case 'UPDATE_VIEW':
      return { ...state, views: (state.views || []).map(v => v.id === action.id ? { ...v, ...action.patch } : v) };
    case 'DELETE_VIEW': {
      // Remove view and reassign elements to global
      const newViews = (state.views || []).filter(v => v.id !== action.id);
      const newElements = state.elements.map(e => e.viewId === action.id ? { ...e, viewId: null } : e);
      return {
        ...state,
        views: newViews.length ? newViews : [{ ...DEFAULT_VIEW }],
        elements: newElements,
        activeViewId: state.activeViewId === action.id ? '__default__' : state.activeViewId,
      };
    }
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeViewId: action.id, selectedId: null };
    case 'SET_VIEW_IDLE_TIMEOUT':
      return { ...state, viewIdleTimeout: action.seconds };
    case 'ASSIGN_ELEMENT_VIEW':
      return {
        ...state,
        elements: state.elements.map(e => e.id === action.elementId ? { ...e, viewId: action.viewId } : e),
      };
    case 'SET_PAGE_BG_COLOR':
      return {
        ...state,
        pageBgColors: { ...(state.pageBgColors || {}), [action.viewId]: action.color },
      };
    case 'DUPLICATE_VIEW': {
      const srcView = (state.views || []).find(v => v.id === action.id);
      if (!srcView) return state;
      const newId = viewUid();
      const newView: CanvasView = { id: newId, name: `${srcView.name} (cópia)`, isDefault: false };
      // Duplicate elements belonging to this view
      const duped = state.elements
        .filter(e => e.viewId === action.id)
        .map(e => ({ ...e, id: `el_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, viewId: newId }));
      return {
        ...state,
        views: [...(state.views || []), newView],
        elements: [...state.elements, ...duped],
        activeViewId: newId,
        pageBgColors: {
          ...(state.pageBgColors || {}),
          [newId]: (state.pageBgColors || {})[action.id] || state.bgColor,
        },
      };
    }

    default:
      return state;
  }
}
