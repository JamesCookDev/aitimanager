/**
 * Pre-configured free-form canvas templates for vertical totems (1080×1920).
 */
import type { CanvasState, CanvasElement } from '../types/canvas';

export interface FreeFormTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'welcome' | 'info' | 'promo' | 'menu' | 'corporate';
  state: CanvasState;
}

export const FREEFORM_TEMPLATE_CATEGORIES = [
  { id: 'welcome', label: 'Boas-vindas', icon: '👋' },
  { id: 'info', label: 'Informativo', icon: '📋' },
  { id: 'promo', label: 'Promoção', icon: '🎯' },
  { id: 'menu', label: 'Menu', icon: '📂' },
  { id: 'corporate', label: 'Corporativo', icon: '🏢' },
];

let _id = 0;
const eid = () => `tpl_${++_id}`;

function el(
  type: CanvasElement['type'],
  x: number, y: number, w: number, h: number,
  props: Record<string, any>,
  extra?: Partial<CanvasElement>,
): CanvasElement {
  return {
    id: eid(),
    type,
    x, y,
    width: w,
    height: h,
    rotation: 0,
    zIndex: (_id),
    opacity: 1,
    locked: false,
    visible: true,
    name: type.charAt(0).toUpperCase() + type.slice(1),
    props,
    ...extra,
  };
}

// ═══════════════════════════════════════════════════
// 1. Boas-vindas com Avatar
// ═══════════════════════════════════════════════════
const welcomeAvatar: CanvasState = (() => {
  _id = 0;
  return {
    bgColor: '#0f172a',
    elements: [
      // Logo placeholder top-center
      el('shape', 440, 60, 200, 200, {
        shapeType: 'circle', fill: 'rgba(99,102,241,0.15)', borderRadius: 100,
        borderColor: 'rgba(99,102,241,0.3)', borderWidth: 2,
      }),
      el('icon', 480, 100, 120, 120, { icon: '🏢', size: 64, color: '#ffffff' }),
      // Title
      el('text', 140, 300, 800, 80, {
        text: 'Bem-vindo!', fontSize: 56, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      // Subtitle
      el('text', 140, 390, 800, 60, {
        text: 'Toque na tela para começar', fontSize: 24, fontWeight: 'normal',
        color: 'rgba(255,255,255,0.5)', align: 'center', fontFamily: 'Inter',
      }),
      // Avatar 3D center
      el('avatar', 290, 500, 500, 600, {
        position: 'center', scale: 1.5, animation: 'idle', enabled: true,
        avatarUrl: '/models/avatar.glb', animationsUrl: '/models/animations.glb',
        colors: { shirt: '#6366f1', pants: '#1e293b', shoes: '#000000' },
        frameY: 0, frameZoom: 50,
      }),
      // CTA button
      el('button', 240, 1200, 600, 80, {
        label: '💬 Falar com Assistente', bgColor: '#6366f1',
        textColor: '#ffffff', fontSize: 22, borderRadius: 999, action: 'Olá, como posso ajudar?',
      }),
      // Info buttons row
      el('button', 140, 1340, 360, 64, {
        label: 'ℹ️ Informações', bgColor: 'rgba(255,255,255,0.08)',
        textColor: '#ffffff', fontSize: 18, borderRadius: 16, action: 'Informações gerais',
      }),
      el('button', 540, 1340, 360, 64, {
        label: '📍 Localização', bgColor: 'rgba(255,255,255,0.08)',
        textColor: '#ffffff', fontSize: 18, borderRadius: 16, action: 'Onde estamos?',
      }),
      // Footer divider
      el('shape', 140, 1500, 800, 2, {
        shapeType: 'rectangle', fill: 'rgba(255,255,255,0.08)', borderRadius: 1,
        borderColor: 'transparent', borderWidth: 0,
      }),
      // Clock bottom
      el('clock', 380, 1560, 320, 100, {
        format: '24h', showDate: true, color: 'rgba(255,255,255,0.4)', fontSize: 28,
      }),
      // QR bottom-right
      el('qrcode', 840, 1700, 160, 160, {
        value: 'https://example.com', fgColor: 'rgba(255,255,255,0.3)', bgColor: 'transparent',
      }),
    ],
    selectedId: null,
  };
})();

// ═══════════════════════════════════════════════════
// 2. Shopping / Diretório de Lojas
// ═══════════════════════════════════════════════════
const shoppingDirectory: CanvasState = (() => {
  _id = 0;
  return {
    bgColor: '#0c0a1a',
    elements: [
      // Header gradient bar
      el('shape', 0, 0, 1080, 280, {
        shapeType: 'rectangle', fill: '#1e1b4b', borderRadius: 0,
        borderColor: 'transparent', borderWidth: 0,
      }, { opacity: 0.8 }),
      // Title
      el('text', 60, 60, 960, 80, {
        text: '🏪 Shopping Center', fontSize: 48, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      el('text', 60, 150, 960, 50, {
        text: 'Diretório de Lojas e Serviços', fontSize: 20, fontWeight: 'normal',
        color: 'rgba(255,255,255,0.5)', align: 'center', fontFamily: 'Inter',
      }),
      // Category buttons (2 cols × 4 rows)
      ...[
        { emoji: '🍔', label: 'Alimentação', color: '#ef4444', prompt: 'Lojas de alimentação' },
        { emoji: '👕', label: 'Moda', color: '#8b5cf6', prompt: 'Lojas de moda' },
        { emoji: '💊', label: 'Saúde', color: '#10b981', prompt: 'Farmácias e saúde' },
        { emoji: '🎬', label: 'Entretenimento', color: '#f59e0b', prompt: 'Cinema e diversão' },
        { emoji: '📱', label: 'Tecnologia', color: '#3b82f6', prompt: 'Lojas de tecnologia' },
        { emoji: '💈', label: 'Beleza', color: '#ec4899', prompt: 'Salões e beleza' },
        { emoji: '🏠', label: 'Casa & Decor', color: '#14b8a6', prompt: 'Casa e decoração' },
        { emoji: '🎁', label: 'Presentes', color: '#f97316', prompt: 'Lojas de presentes' },
      ].map((item, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        return el('button', 80 + col * 480, 340 + row * 140, 440, 110, {
          label: `${item.emoji}  ${item.label}`, bgColor: item.color + '22',
          textColor: '#ffffff', fontSize: 22, borderRadius: 20, action: item.prompt,
        });
      }),
      // Separator
      el('shape', 80, 920, 920, 2, {
        shapeType: 'rectangle', fill: 'rgba(255,255,255,0.06)', borderRadius: 1,
        borderColor: 'transparent', borderWidth: 0,
      }),
      // Chat IA
      el('chat', 80, 960, 920, 500, {
        placeholder: 'Pergunte sobre lojas, horários, promoções...', theme: 'dark',
      }),
      // Footer
      el('text', 60, 1520, 960, 40, {
        text: 'Toque nos botões ou pergunte ao assistente virtual', fontSize: 16,
        fontWeight: 'normal', color: 'rgba(255,255,255,0.3)', align: 'center', fontFamily: 'Inter',
      }),
      // Clock
      el('clock', 380, 1600, 320, 100, {
        format: '24h', showDate: true, color: 'rgba(255,255,255,0.3)', fontSize: 24,
      }),
      // QR code
      el('qrcode', 440, 1720, 200, 160, {
        value: 'https://example.com', fgColor: 'rgba(255,255,255,0.2)', bgColor: 'transparent',
      }),
    ],
    selectedId: null,
  };
})();

// ═══════════════════════════════════════════════════
// 3. Promoções / Black Friday
// ═══════════════════════════════════════════════════
const promoBlackFriday: CanvasState = (() => {
  _id = 0;
  return {
    bgColor: '#0a0a0a',
    elements: [
      // Top accent bar
      el('shape', 0, 0, 1080, 8, {
        shapeType: 'rectangle', fill: '#ef4444', borderRadius: 0,
        borderColor: 'transparent', borderWidth: 0,
      }),
      // Badge
      el('shape', 340, 80, 400, 60, {
        shapeType: 'rectangle', fill: '#ef4444', borderRadius: 999,
        borderColor: 'transparent', borderWidth: 0,
      }),
      el('text', 340, 88, 400, 44, {
        text: '🔥 OFERTA ESPECIAL', fontSize: 20, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      // Hero image area
      el('image', 60, 180, 960, 500, {
        src: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=960&h=500&fit=crop',
        fit: 'cover', borderRadius: 24,
      }),
      // Price / Headline
      el('text', 60, 720, 960, 100, {
        text: 'Até 70% OFF', fontSize: 72, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      el('text', 60, 830, 960, 50, {
        text: 'Em lojas selecionadas • Válido até 28/02', fontSize: 20,
        fontWeight: 'normal', color: 'rgba(255,255,255,0.5)', align: 'center', fontFamily: 'Inter',
      }),
      // Highlight cards
      ...[
        { emoji: '👟', name: 'Calçados', discount: '50% OFF', color: '#f59e0b' },
        { emoji: '👕', name: 'Moda', discount: '40% OFF', color: '#8b5cf6' },
        { emoji: '📱', name: 'Tech', discount: '30% OFF', color: '#3b82f6' },
      ].map((item, i) => [
        el('shape', 60 + i * 330, 930, 300, 160, {
          shapeType: 'rectangle', fill: item.color + '18', borderRadius: 20,
          borderColor: item.color + '40', borderWidth: 1,
        }),
        el('text', 60 + i * 330, 950, 300, 60, {
          text: `${item.emoji} ${item.name}`, fontSize: 22, fontWeight: 'bold',
          color: '#ffffff', align: 'center', fontFamily: 'Inter',
        }),
        el('text', 60 + i * 330, 1020, 300, 50, {
          text: item.discount, fontSize: 28, fontWeight: 'bold',
          color: item.color, align: 'center', fontFamily: 'Inter',
        }),
      ]).flat(),
      // CTA
      el('button', 160, 1160, 760, 90, {
        label: '🛒 Ver Todas as Promoções', bgColor: '#ef4444',
        textColor: '#ffffff', fontSize: 24, borderRadius: 999, action: 'Mostrar todas as promoções',
      }),
      // Secondary buttons
      el('button', 160, 1290, 360, 64, {
        label: '🎁 Cupons', bgColor: 'rgba(255,255,255,0.08)',
        textColor: '#ffffff', fontSize: 18, borderRadius: 16, action: 'Mostrar cupons',
      }),
      el('button', 560, 1290, 360, 64, {
        label: '📍 Lojas', bgColor: 'rgba(255,255,255,0.08)',
        textColor: '#ffffff', fontSize: 18, borderRadius: 16, action: 'Listar lojas com desconto',
      }),
      // QR code with label
      el('text', 340, 1460, 400, 40, {
        text: 'Escaneie para ver no celular', fontSize: 14,
        fontWeight: 'normal', color: 'rgba(255,255,255,0.3)', align: 'center', fontFamily: 'Inter',
      }),
      el('qrcode', 440, 1510, 200, 200, {
        value: 'https://example.com/promo', fgColor: 'rgba(255,255,255,0.25)', bgColor: 'transparent',
      }),
      // Clock
      el('clock', 60, 1760, 280, 80, {
        format: '24h', showDate: true, color: 'rgba(255,255,255,0.25)', fontSize: 20,
      }),
    ],
    selectedId: null,
  };
})();

// ═══════════════════════════════════════════════════
// 4. Cardápio / Restaurante
// ═══════════════════════════════════════════════════
const restaurantMenu: CanvasState = (() => {
  _id = 0;
  return {
    bgColor: '#1a0f0a',
    elements: [
      // Warm header
      el('shape', 0, 0, 1080, 300, {
        shapeType: 'rectangle', fill: '#7c2d12', borderRadius: 0,
        borderColor: 'transparent', borderWidth: 0,
      }, { opacity: 0.5 }),
      el('icon', 460, 40, 160, 100, { icon: '🍕', size: 64, color: '#ffffff' }),
      el('text', 60, 140, 960, 80, {
        text: 'Nosso Cardápio', fontSize: 48, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      el('text', 60, 220, 960, 40, {
        text: 'Toque para mais detalhes', fontSize: 18,
        fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'center', fontFamily: 'Inter',
      }),
      // Menu sections
      ...[
        { cat: '🥗 Entradas', items: ['Bruschetta • R$18', 'Carpaccio • R$28', 'Salada Caesar • R$22'] },
        { cat: '🍝 Pratos Principais', items: ['Filé Mignon • R$58', 'Salmão Grelhado • R$52', 'Risoto de Funghi • R$42'] },
        { cat: '🍰 Sobremesas', items: ['Tiramisù • R$24', 'Petit Gâteau • R$28', 'Sorbet de Frutas • R$18'] },
        { cat: '🥤 Bebidas', items: ['Suco Natural • R$12', 'Refrigerante • R$8', 'Água com Gás • R$6'] },
      ].flatMap((section, si) => {
        const baseY = 340 + si * 340;
        return [
          // Section title
          el('text', 80, baseY, 920, 50, {
            text: section.cat, fontSize: 26, fontWeight: 'bold',
            color: '#f97316', align: 'left', fontFamily: 'Inter',
          }),
          // Divider
          el('shape', 80, baseY + 55, 920, 1, {
            shapeType: 'rectangle', fill: 'rgba(249,115,22,0.2)', borderRadius: 0,
            borderColor: 'transparent', borderWidth: 0,
          }),
          // Items
          ...section.items.map((item, ii) =>
            el('text', 100, baseY + 75 + ii * 50, 880, 44, {
              text: item, fontSize: 20, fontWeight: 'normal',
              color: 'rgba(255,255,255,0.8)', align: 'left', fontFamily: 'Inter',
            })
          ),
        ];
      }),
      // CTA
      el('button', 200, 1720, 680, 80, {
        label: '📲 Peça pelo App', bgColor: '#f97316',
        textColor: '#ffffff', fontSize: 22, borderRadius: 999, action: 'Como faço pedido?',
      }),
      // QR bottom
      el('qrcode', 460, 1830, 160, 80, {
        value: 'https://example.com/menu', fgColor: 'rgba(255,255,255,0.2)', bgColor: 'transparent',
      }),
    ],
    selectedId: null,
  };
})();

// ═══════════════════════════════════════════════════
// 5. Recepção Corporativa
// ═══════════════════════════════════════════════════
const corporateReception: CanvasState = (() => {
  _id = 0;
  return {
    bgColor: '#0f172a',
    elements: [
      // Top bar accent
      el('shape', 0, 0, 1080, 6, {
        shapeType: 'rectangle', fill: '#3b82f6', borderRadius: 0,
        borderColor: 'transparent', borderWidth: 0,
      }),
      // Logo circle
      el('shape', 390, 80, 300, 300, {
        shapeType: 'circle', fill: 'rgba(59,130,246,0.1)', borderRadius: 150,
        borderColor: 'rgba(59,130,246,0.2)', borderWidth: 2,
      }),
      el('icon', 440, 140, 200, 180, { icon: '🏢', size: 80, color: '#3b82f6' }),
      // Company name
      el('text', 60, 420, 960, 80, {
        text: 'Empresa S.A.', fontSize: 44, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      el('text', 60, 510, 960, 50, {
        text: 'Bem-vindo à nossa sede', fontSize: 22,
        fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'center', fontFamily: 'Inter',
      }),
      // Separator
      el('shape', 340, 590, 400, 2, {
        shapeType: 'rectangle', fill: 'rgba(59,130,246,0.2)', borderRadius: 1,
        borderColor: 'transparent', borderWidth: 0,
      }),
      // Action buttons (vertical stack)
      ...[
        { label: '📋 Check-in de Visitante', color: '#3b82f6', action: 'Fazer check-in' },
        { label: '📍 Mapa do Prédio', color: '#6366f1', action: 'Mostrar mapa' },
        { label: '📞 Ligar para Recepção', color: '#10b981', action: 'Contato recepção' },
        { label: '📅 Agenda de Reuniões', color: '#f59e0b', action: 'Ver agenda de hoje' },
        { label: '🅿️ Estacionamento', color: '#64748b', action: 'Info estacionamento' },
      ].map((item, i) =>
        el('button', 140, 650 + i * 110, 800, 80, {
          label: item.label, bgColor: item.color + '20',
          textColor: '#ffffff', fontSize: 20, borderRadius: 16, action: item.action,
        })
      ),
      // Chat bottom
      el('chat', 80, 1230, 920, 420, {
        placeholder: 'Pergunte sobre o prédio, salas, serviços...', theme: 'dark',
      }),
      // Clock + Weather footer
      el('clock', 60, 1700, 300, 80, {
        format: '24h', showDate: true, color: 'rgba(255,255,255,0.3)', fontSize: 22,
      }),
      el('weather', 700, 1700, 300, 80, {
        city: 'São Paulo', units: 'metric', color: 'rgba(255,255,255,0.3)',
      }),
      // QR
      el('qrcode', 440, 1800, 200, 100, {
        value: 'https://example.com/checkin', fgColor: 'rgba(255,255,255,0.2)', bgColor: 'transparent',
      }),
    ],
    selectedId: null,
  };
})();

// ═══════════════════════════════════════════════════
// 6. Evento / Conferência
// ═══════════════════════════════════════════════════
const eventConference: CanvasState = (() => {
  _id = 0;
  return {
    bgColor: '#0a0a1a',
    elements: [
      // Top gradient
      el('shape', 0, 0, 1080, 400, {
        shapeType: 'rectangle', fill: '#4c1d95', borderRadius: 0,
        borderColor: 'transparent', borderWidth: 0,
      }, { opacity: 0.4 }),
      // Event badge
      el('shape', 340, 60, 400, 50, {
        shapeType: 'rectangle', fill: '#a855f7', borderRadius: 999,
        borderColor: 'transparent', borderWidth: 0,
      }),
      el('text', 340, 66, 400, 38, {
        text: '🎤 AO VIVO', fontSize: 16, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      // Event name
      el('text', 60, 150, 960, 100, {
        text: 'Tech Summit 2026', fontSize: 56, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      el('text', 60, 260, 960, 50, {
        text: '21 a 23 de Fevereiro • Centro de Convenções', fontSize: 20,
        fontWeight: 'normal', color: 'rgba(255,255,255,0.5)', align: 'center', fontFamily: 'Inter',
      }),
      // Countdown
      el('countdown', 260, 350, 560, 120, {
        targetDate: '2026-02-23T18:00:00', label: 'Próxima palestra em',
        color: '#a855f7', fontSize: 36,
      }),
      // Schedule cards
      ...[
        { time: '14:00', title: 'IA Generativa no Varejo', speaker: 'Ana Silva' },
        { time: '15:30', title: 'O Futuro dos Pagamentos', speaker: 'Carlos Santos' },
        { time: '17:00', title: 'Transformação Digital', speaker: 'Marina Costa' },
      ].flatMap((item, i) => {
        const y = 520 + i * 160;
        return [
          el('shape', 80, y, 920, 130, {
            shapeType: 'rectangle', fill: 'rgba(168,85,247,0.08)', borderRadius: 16,
            borderColor: 'rgba(168,85,247,0.15)', borderWidth: 1,
          }),
          el('text', 110, y + 15, 180, 40, {
            text: item.time, fontSize: 28, fontWeight: 'bold',
            color: '#a855f7', align: 'left', fontFamily: 'Inter',
          }),
          el('text', 300, y + 15, 680, 40, {
            text: item.title, fontSize: 22, fontWeight: 'bold',
            color: '#ffffff', align: 'left', fontFamily: 'Inter',
          }),
          el('text', 300, y + 60, 680, 36, {
            text: `🎙️ ${item.speaker}`, fontSize: 16, fontWeight: 'normal',
            color: 'rgba(255,255,255,0.5)', align: 'left', fontFamily: 'Inter',
          }),
        ];
      }),
      // CTA buttons
      el('button', 140, 1040, 380, 70, {
        label: '🗺️ Mapa do Evento', bgColor: 'rgba(168,85,247,0.15)',
        textColor: '#ffffff', fontSize: 18, borderRadius: 16, action: 'Mapa do evento',
      }),
      el('button', 560, 1040, 380, 70, {
        label: '📋 Programação', bgColor: 'rgba(168,85,247,0.15)',
        textColor: '#ffffff', fontSize: 18, borderRadius: 16, action: 'Programação completa',
      }),
      // Chat
      el('chat', 80, 1160, 920, 420, {
        placeholder: 'Pergunte sobre palestras, salas, WiFi...', theme: 'dark',
      }),
      // Social links
      el('social', 260, 1620, 560, 60, {
        links: [
          { platform: 'instagram', url: 'https://instagram.com' },
          { platform: 'facebook', url: 'https://facebook.com' },
        ],
        iconSize: 32, gap: 24, color: 'rgba(255,255,255,0.4)',
      }),
      // QR
      el('text', 340, 1720, 400, 30, {
        text: 'Acesse a agenda no celular', fontSize: 13,
        fontWeight: 'normal', color: 'rgba(255,255,255,0.25)', align: 'center', fontFamily: 'Inter',
      }),
      el('qrcode', 440, 1760, 200, 150, {
        value: 'https://example.com/event', fgColor: 'rgba(255,255,255,0.2)', bgColor: 'transparent',
      }),
    ],
    selectedId: null,
  };
})();

// ═══════════════════════════════════════════════════
// 7. Minimalista / Atendimento
// ═══════════════════════════════════════════════════
const minimalService: CanvasState = (() => {
  _id = 0;
  return {
    bgColor: '#111827',
    elements: [
      // Subtle top accent
      el('shape', 0, 0, 1080, 4, {
        shapeType: 'rectangle', fill: '#10b981', borderRadius: 0,
        borderColor: 'transparent', borderWidth: 0,
      }),
      // Centered icon
      el('icon', 460, 300, 160, 160, { icon: '💬', size: 80, color: '#10b981' }),
      // Main question
      el('text', 100, 520, 880, 100, {
        text: 'Como posso ajudar?', fontSize: 48, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      el('text', 100, 630, 880, 50, {
        text: 'Toque em um botão ou digite sua pergunta', fontSize: 18,
        fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'center', fontFamily: 'Inter',
      }),
      // 3 large action buttons
      el('button', 140, 750, 800, 90, {
        label: '📋 Informações Gerais', bgColor: '#10b981',
        textColor: '#ffffff', fontSize: 22, borderRadius: 20, action: 'Informações gerais',
      }),
      el('button', 140, 870, 800, 90, {
        label: '📍 Encontrar Localização', bgColor: 'rgba(16,185,129,0.15)',
        textColor: '#ffffff', fontSize: 22, borderRadius: 20, action: 'Preciso encontrar algo',
      }),
      el('button', 140, 990, 800, 90, {
        label: '📞 Falar com Atendente', bgColor: 'rgba(16,185,129,0.15)',
        textColor: '#ffffff', fontSize: 22, borderRadius: 20, action: 'Quero falar com alguém',
      }),
      // Chat area
      el('chat', 80, 1160, 920, 520, {
        placeholder: 'Digite sua pergunta aqui...', theme: 'dark',
      }),
      // Clock
      el('clock', 380, 1740, 320, 80, {
        format: '24h', showDate: true, color: 'rgba(255,255,255,0.25)', fontSize: 22,
      }),
    ],
    selectedId: null,
  };
})();

// ═══════════════════════════════════════════════════
// Export all
// ═══════════════════════════════════════════════════
export const FREEFORM_TEMPLATES: FreeFormTemplate[] = [
  {
    id: 'welcome-avatar',
    name: 'Boas-vindas + Avatar',
    description: 'Avatar 3D centralizado com botões de ação e relógio',
    icon: '🧑‍💼',
    category: 'welcome',
    state: welcomeAvatar,
  },
  {
    id: 'shopping-directory',
    name: 'Diretório de Lojas',
    description: 'Grid de categorias com chat IA integrado',
    icon: '🏪',
    category: 'menu',
    state: shoppingDirectory,
  },
  {
    id: 'promo-blackfriday',
    name: 'Promoções & Ofertas',
    description: 'Layout promocional com imagem hero e cards de desconto',
    icon: '🔥',
    category: 'promo',
    state: promoBlackFriday,
  },
  {
    id: 'restaurant-menu',
    name: 'Cardápio Digital',
    description: 'Menu de restaurante com seções e preços',
    icon: '🍕',
    category: 'menu',
    state: restaurantMenu,
  },
  {
    id: 'corporate-reception',
    name: 'Recepção Corporativa',
    description: 'Check-in de visitantes com mapa e agenda',
    icon: '🏢',
    category: 'corporate',
    state: corporateReception,
  },
  {
    id: 'event-conference',
    name: 'Evento / Conferência',
    description: 'Programação com countdown e social links',
    icon: '🎤',
    category: 'info',
    state: eventConference,
  },
  {
    id: 'minimal-service',
    name: 'Atendimento Minimalista',
    description: 'Layout limpo focado em chat IA e ações rápidas',
    icon: '💬',
    category: 'welcome',
    state: minimalService,
  },
];
