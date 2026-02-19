// ============= Page Builder Types =============

// ── Snap Position (9-point grid) ──────────────────────────────────────
export type SnapPosition =
  | 'top_left' | 'top_center' | 'top_right'
  | 'center_left' | 'center' | 'center_right'
  | 'bottom_left' | 'bottom_center' | 'bottom_right';

// ── Canvas ────────────────────────────────────────────────────────────
export interface CanvasBackground {
  type: 'solid' | 'gradient' | 'image';
  color: string;
  gradient?: string;
  image_url?: string;
}

export interface CanvasEnvironment {
  show_floor: boolean;
  show_particles: boolean;
  floor_color?: string;
}

export interface CanvasConfig {
  orientation: 'vertical' | 'horizontal';
  background: CanvasBackground;
  environment: CanvasEnvironment;
}

// ── Avatar ────────────────────────────────────────────────────────────
export interface AvatarColors {
  shirt: string;
  pants: string;
  shoes?: string;
}

export interface AvatarComponent {
  enabled: boolean;
  position: 'left' | 'center' | 'right';
  scale: number;
  animation?: string;
  colors: AvatarColors;
}

// ── Chat Interface ────────────────────────────────────────────────────
export interface ChatHeader {
  show: boolean;
  icon: string;
  title: string;
  subtitle: string;
}

export interface MenuButton {
  emoji: string;
  label: string;
  prompt: string;
  color: string;
}

export interface MenuCategory {
  title: string;
  icon: string;
  buttons: MenuButton[];
}

export interface ChatMenu {
  cta_icon: string;
  cta_text: string;
  categories: MenuCategory[];
}

export interface ChatStyle {
  opacity: number;
  blur: number;
}

export interface ChatInterfaceComponent {
  enabled: boolean;
  position: 'bottom_left' | 'bottom_right' | 'top_left' | 'top_right';
  header: ChatHeader;
  menu: ChatMenu;
  style: ChatStyle;
}

// ── Logo ──────────────────────────────────────────────────────────────
export interface LogoComponent {
  enabled: boolean;
  url: string;
  position: SnapPosition;
  scale: number;
}

// ── Text Banners ──────────────────────────────────────────────────────
export interface TextBannerItem {
  id: string;
  text: string;
  position: SnapPosition;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  color: string;
  bgColor: string;
  bgEnabled: boolean;
  bold: boolean;
}

export interface TextBannerComponent {
  enabled: boolean;
  items: TextBannerItem[];
}

// ── Generic Layers ────────────────────────────────────────────────────
export interface BaseLayer {
  id: string;
  type: string;
  position: SnapPosition;
  visible: boolean;
  label: string;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  url: string;
  scale: number;
  opacity: number;
  borderRadius: number;
}

export interface VideoLayer extends BaseLayer {
  type: 'video';
  url: string;
  scale: number;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shape: 'rectangle' | 'circle' | 'divider';
  color: string;
  width: number;
  height: number;
  opacity: number;
}

export interface ClockLayer extends BaseLayer {
  type: 'clock';
  format: '12h' | '24h';
  showDate: boolean;
  color: string;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
}

export type Layer = ImageLayer | VideoLayer | ShapeLayer | ClockLayer;

// ── Button ────────────────────────────────────────────────────────────
export interface ButtonComponent {
  label: string;
  bgColor: string;
  textColor: string;
  fontSize: number;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
  fullWidth: boolean;
  action: string;
  borderColor?: string;
  borderWidth?: number;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  opacity?: number;
  fontWeight?: 'normal' | 'semibold' | 'bold';
  icon?: string;
  iconPosition?: 'left' | 'right';
}

// ── Social Links ──────────────────────────────────────────────────────
export interface SocialLinkItem {
  id: string;
  icon: string;
  label: string;
  url: string;
  color: string;
}

export interface SocialLinksComponent {
  links: SocialLinkItem[];
  layout: 'horizontal' | 'vertical';
  iconSize: number;
  gap: number;
  showLabels: boolean;
  bgEnabled: boolean;
  bgColor: string;
  borderRadius: number;
  padding: number;
}

// ── Video Embed ───────────────────────────────────────────────────────
export interface VideoEmbedComponent {
  url: string;
  aspectRatio: '16:9' | '9:16' | '4:3' | '1:1';
  borderRadius: number;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  opacity: number;
}

// ── QR Code ───────────────────────────────────────────────────────────
export interface QRCodeComponent {
  content: string;
  size: number;
  fgColor: string;
  bgColor: string;
  borderRadius: number;
  padding: number;
  label: string;
  labelColor: string;
  labelSize: number;
}

// ── Components ────────────────────────────────────────────────────────
export interface PageBuilderComponents {
  avatar: AvatarComponent;
  chat_interface: ChatInterfaceComponent;
  logo: LogoComponent;
  text_banners: TextBannerComponent;
  buttons?: ButtonComponent[];
  social_links?: SocialLinksComponent[];
  videos?: VideoEmbedComponent[];
  qr_codes?: QRCodeComponent[];
}

// ── Full Config ───────────────────────────────────────────────────────
export interface PageBuilderConfig {
  canvas: CanvasConfig;
  components: PageBuilderComponents;
  layers?: Layer[];
  craft_blocks?: string; // Serialized craft.js state (JSON string)
}

// ── Defaults ──────────────────────────────────────────────────────────
export const DEFAULT_PAGE_BUILDER_CONFIG: PageBuilderConfig = {
  canvas: {
    orientation: 'vertical',
    background: { type: 'solid', color: '#0f3460' },
    environment: { show_floor: true, show_particles: true, floor_color: '#1a1a2e' },
  },
  components: {
    avatar: {
      enabled: true,
      position: 'center',
      scale: 1.5,
      animation: 'idle',
      colors: { shirt: '#1E3A8A', pants: '#1F2937', shoes: '#000000' },
    },
    chat_interface: {
      enabled: true,
      position: 'bottom_right',
      style: { opacity: 0.85, blur: 12 },
      header: { show: true, icon: '📍', title: 'Assistente', subtitle: 'Totem Interativo' },
      menu: {
        cta_icon: '💬',
        cta_text: 'Posso ajudar?',
        categories: [
          { title: 'Geral', icon: '⚡', buttons: [{ emoji: 'ℹ️', label: 'Informações', prompt: 'Quem é você?', color: 'from-teal-400 to-cyan-400' }] },
        ],
      },
    },
    logo: { enabled: false, url: '', position: 'top_left', scale: 1 },
    text_banners: { enabled: false, items: [] },
  },
  layers: [],
};

// ── Migration helper ──────────────────────────────────────────────────
export function migrateUiConfig(old: Record<string, any> | null): PageBuilderConfig {
  if (!old) return { ...DEFAULT_PAGE_BUILDER_CONFIG };

  // Already new format
  if (old.canvas && old.components) {
    const config = old as PageBuilderConfig;
    if (!config.components.chat_interface.style) {
      config.components.chat_interface.style = { opacity: 0.85, blur: 12 };
    }
    if (!config.components.logo) {
      config.components.logo = { enabled: false, url: '', position: 'top_left', scale: 1 };
    }
    if (!config.components.text_banners) {
      config.components.text_banners = { enabled: false, items: [] };
    }
    if (!config.layers) {
      config.layers = [];
    }
    // Preserve craft_blocks if present
    if (old.craft_blocks && !config.craft_blocks) {
      config.craft_blocks = old.craft_blocks;
    }
    return config;
  }

  // Migrate from old layout-based format
  const layout = old.layout || {};
  return {
    canvas: {
      orientation: 'vertical',
      background: {
        type: layout.bg_type || 'solid',
        color: layout.bg_color || '#0f3460',
        gradient: layout.bg_gradient || undefined,
        image_url: layout.bg_image || undefined,
      },
      environment: {
        show_floor: layout.show_floor ?? true,
        show_particles: layout.show_particles ?? true,
        floor_color: layout.floor_color || '#1a1a2e',
      },
    },
    components: {
      avatar: {
        enabled: true,
        position: layout.avatar_position || 'center',
        scale: layout.avatar_scale || 1.5,
        animation: 'idle',
        colors: { shirt: '#1E3A8A', pants: '#1F2937', shoes: '#000000' },
      },
      chat_interface: {
        enabled: layout.show_chat_menu !== false,
        position: layout.chat_position === 'left' ? 'bottom_left' : 'bottom_right',
        style: { opacity: 0.85, blur: 12 },
        header: {
          show: layout.show_header !== false,
          icon: old.header_icon || '📍',
          title: old.title || 'Assistente',
          subtitle: old.subtitle || 'Totem Interativo',
        },
        menu: {
          cta_icon: old.cta_icon || '💬',
          cta_text: old.cta_text || 'Posso ajudar?',
          categories: (old.menu_categories || []).map((cat: any) => ({
            title: cat.category_title || cat.title || 'Geral',
            icon: cat.category_icon || cat.icon || '⚡',
            buttons: (cat.buttons || []).map((btn: any) => ({
              emoji: btn.emoji, label: btn.label, prompt: btn.prompt, color: btn.color,
            })),
          })),
        },
      },
      logo: { enabled: false, url: '', position: 'top_left', scale: 1 },
      text_banners: { enabled: false, items: [] },
    },
    layers: [],
  };
}

// ── Helpers ───────────────────────────────────────────────────────────
export function getSnapFromRelative(relX: number, relY: number): SnapPosition {
  const col = relX < 0.33 ? 'left' : relX > 0.66 ? 'right' : 'center';
  const row = relY < 0.33 ? 'top' : relY > 0.66 ? 'bottom' : 'center';
  if (row === 'center' && col === 'center') return 'center';
  if (row === 'center') return `center_${col}` as SnapPosition;
  if (col === 'center') return `${row}_center` as SnapPosition;
  return `${row}_${col}` as SnapPosition;
}

export function snapPositionToStyle(pos: SnapPosition): React.CSSProperties {
  const s: React.CSSProperties = { position: 'absolute', zIndex: 15 };
  // Vertical
  if (pos.startsWith('top')) s.top = '6%';
  else if (pos.startsWith('bottom')) s.bottom = '14%';
  else if (pos === 'center' || pos.startsWith('center')) { s.top = '50%'; }
  // Horizontal
  if (pos.endsWith('left')) s.left = '4%';
  else if (pos.endsWith('right')) s.right = '4%';
  else { s.left = '50%'; }
  // Transform
  const transforms: string[] = [];
  if (pos === 'center') { transforms.push('translate(-50%, -50%)'); }
  else if (pos === 'center_left' || pos === 'center_right') { transforms.push('translateY(-50%)'); }
  else if (pos.endsWith('center') || pos === 'top_center' || pos === 'bottom_center') { transforms.push('translateX(-50%)'); }
  // Fix: center_left and center_right don't need translateX
  if (transforms.length > 0) s.transform = transforms.join(' ');
  return s;
}

export function createLayer(type: Layer['type']): Layer {
  const id = `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const base = { id, position: 'center' as SnapPosition, visible: true };

  switch (type) {
    case 'image':
      return { ...base, type: 'image', label: 'Imagem', url: '', scale: 1, opacity: 1, borderRadius: 0 };
    case 'video':
      return { ...base, type: 'video', label: 'Vídeo', url: '', scale: 1, autoplay: true, loop: true, muted: true };
    case 'shape':
      return { ...base, type: 'shape', label: 'Forma', shape: 'rectangle', color: '#ffffff', width: 80, height: 40, opacity: 0.8 };
    case 'clock':
      return { ...base, type: 'clock', label: 'Relógio', format: '24h', showDate: true, color: '#ffffff', fontSize: 'lg' };
  }
}
