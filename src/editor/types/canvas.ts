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
  | 'avatar';

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
  props: Record<string, any>;
}

export interface CanvasState {
  bgColor: string;
  elements: CanvasElement[];
  selectedId: string | null;
}

export const DEFAULT_CANVAS_STATE: CanvasState = {
  bgColor: '#0f172a',
  elements: [],
  selectedId: null,
};

/* ── helpers ────────────────────────────────────── */

let _counter = 0;
const uid = () => `el_${Date.now()}_${++_counter}`;

/** Default size & props per element type */
const ELEMENT_DEFAULTS: Record<ElementType, { w: number; h: number; name: string; props: Record<string, any> }> = {
  text: { w: 400, h: 80, name: 'Texto', props: { text: 'Seu texto aqui', fontSize: 32, fontWeight: 'bold', color: '#ffffff', align: 'center', fontFamily: 'Inter' } },
  image: { w: 400, h: 300, name: 'Imagem', props: { src: '', fit: 'cover', borderRadius: 12 } },
  button: { w: 360, h: 64, name: 'Botão', props: { label: 'Toque aqui', bgColor: '#6366f1', textColor: '#ffffff', fontSize: 18, borderRadius: 999, action: '' } },
  shape: { w: 200, h: 200, name: 'Forma', props: { shapeType: 'rectangle', fill: '#6366f1', borderRadius: 16, borderColor: 'transparent', borderWidth: 0 } },
  icon: { w: 80, h: 80, name: 'Ícone', props: { icon: '⭐', size: 48, color: '#ffffff' } },
  video: { w: 480, h: 320, name: 'Vídeo', props: { url: '', autoplay: true, loop: true, muted: true } },
  qrcode: { w: 200, h: 200, name: 'QR Code', props: { value: 'https://example.com', fgColor: '#ffffff', bgColor: 'transparent' } },
  map: { w: 480, h: 360, name: 'Mapa', props: { lat: -23.5505, lng: -46.6333, zoom: 15, style: 'dark' } },
  social: { w: 360, h: 60, name: 'Redes Sociais', props: { links: [{ platform: 'instagram', url: '' }, { platform: 'facebook', url: '' }], iconSize: 32, gap: 16, color: '#ffffff' } },
  chat: { w: 420, h: 500, name: 'Chat IA', props: { placeholder: 'Pergunte algo...', theme: 'dark' } },
  carousel: { w: 480, h: 360, name: 'Carrossel', props: { images: [], autoplay: true, interval: 5 } },
  clock: { w: 240, h: 100, name: 'Relógio', props: { format: '24h', showDate: true, color: '#ffffff', fontSize: 36 } },
  weather: { w: 300, h: 160, name: 'Clima', props: { city: 'São Paulo', units: 'metric', color: '#ffffff' } },
  countdown: { w: 360, h: 120, name: 'Contagem', props: { targetDate: '', label: 'Faltam', color: '#ffffff', fontSize: 28 } },
  iframe: { w: 480, h: 400, name: 'Iframe', props: { url: '', borderRadius: 8 } },
  avatar: { w: 500, h: 900, name: 'Avatar 3D', props: { position: 'center', scale: 1.5, animation: 'idle', enabled: true, avatarUrl: '/models/avatar.glb', animationsUrl: '/models/animations.glb', colors: { shirt: '#1E3A8A', pants: '#1F2937', shoes: '#000000' }, frameY: 0, frameZoom: 50 } },
};

export function createElement(type: ElementType, x = 100, y = 100): CanvasElement {
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
  | { type: 'LOAD'; state: CanvasState };

export function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case 'ADD_ELEMENT': {
      const maxZ = state.elements.reduce((m, e) => Math.max(m, e.zIndex), 0);
      return {
        ...state,
        elements: [...state.elements, { ...action.payload, zIndex: maxZ + 1 }],
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
        payload: { ...el, ...dup, id: dup.id, x: el.x + 30, y: el.y + 30, name: `${el.name} (cópia)` },
      });
    }
    case 'LOAD':
      return action.state;
    default:
      return state;
  }
}
