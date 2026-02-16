// New modular ui_config contract for the Totem Page Builder

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
  opacity: number;  // 0-1
  blur: number;     // 0-20 px
}

export interface ChatInterfaceComponent {
  enabled: boolean;
  position: 'bottom_left' | 'bottom_right' | 'top_left' | 'top_right';
  header: ChatHeader;
  menu: ChatMenu;
  style: ChatStyle;
}

export interface LogoComponent {
  enabled: boolean;
  url: string;
  position: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'center_top';
  scale: number;  // 0.5-3
}

export interface TextBannerItem {
  id: string;
  text: string;
  position: 'top_left' | 'top_center' | 'top_right' | 'center' | 'bottom_left' | 'bottom_center' | 'bottom_right';
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

export interface PageBuilderComponents {
  avatar: AvatarComponent;
  chat_interface: ChatInterfaceComponent;
  logo: LogoComponent;
  text_banners: TextBannerComponent;
}

export interface PageBuilderConfig {
  canvas: CanvasConfig;
  components: PageBuilderComponents;
}

// Default config
export const DEFAULT_PAGE_BUILDER_CONFIG: PageBuilderConfig = {
  canvas: {
    orientation: 'vertical',
    background: {
      type: 'solid',
      color: '#0f3460',
    },
    environment: {
      show_floor: true,
      show_particles: true,
      floor_color: '#1a1a2e',
    },
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
          {
            title: 'Geral',
            icon: '⚡',
            buttons: [
              { emoji: 'ℹ️', label: 'Informações', prompt: 'Quem é você?', color: 'from-teal-400 to-cyan-400' },
            ],
          },
        ],
      },
    },
    logo: {
      enabled: false,
      url: '',
      position: 'top_left',
      scale: 1,
    },
    text_banners: {
      enabled: false,
      items: [],
    },
  },
};

// Migration helper: convert old ui_config to new format
export function migrateUiConfig(old: Record<string, any> | null): PageBuilderConfig {
  if (!old) return { ...DEFAULT_PAGE_BUILDER_CONFIG };

  // If already new format - fill missing new fields
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
        colors: {
          shirt: '#1E3A8A',
          pants: '#1F2937',
          shoes: '#000000',
        },
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
              emoji: btn.emoji,
              label: btn.label,
              prompt: btn.prompt,
              color: btn.color,
            })),
          })),
        },
      },
      logo: {
        enabled: false,
        url: '',
        position: 'top_left',
        scale: 1,
      },
      text_banners: {
        enabled: false,
        items: [],
      },
    },
  };
}
