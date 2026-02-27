/**
 * Pre-configured free-form canvas templates for vertical totems (1080×1920).
 * 
 * LAYOUT RULES:
 * - Canvas: 1080 wide × 1920 tall
 * - Safe margins: 60px sides, 40px top, 60px bottom (max y+h ≤ 1860)
 * - QR codes always square
 * - No overlapping elements
 * - Chat height: max 360px
 * - Store height: max 600px
 */
import type { CanvasState, CanvasElement } from '../types/canvas';

export interface FreeFormTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'welcome' | 'info' | 'promo' | 'menu' | 'corporate' | 'health' | 'hotel' | 'retail';
  state: CanvasState;
}

export const FREEFORM_TEMPLATE_CATEGORIES = [
  { id: 'welcome', label: 'Boas-vindas', icon: '👋' },
  { id: 'info', label: 'Informativo', icon: '📋' },
  { id: 'promo', label: 'Promoção', icon: '🎯' },
  { id: 'menu', label: 'Menu', icon: '📂' },
  { id: 'corporate', label: 'Corporativo', icon: '🏢' },
  { id: 'health', label: 'Saúde', icon: '🏥' },
  { id: 'hotel', label: 'Hotel', icon: '🏨' },
  { id: 'retail', label: 'Varejo', icon: '🛒' },
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
// Layout: Logo(40-240) → Title(270-340) → Subtitle(350-390) → Avatar(420-900) → CTA(940-1020) → Buttons(1060-1130) → Divider(1180) → Clock(1210-1280) → QR(1700-1840)
// ═══════════════════════════════════════════════════
const welcomeAvatar: CanvasState = (() => {
  _id = 0;
  return {
    bgColor: '#0f172a',
    elements: [
      // Logo placeholder top-center
      el('shape', 440, 40, 200, 200, {
        shapeType: 'circle', fill: 'rgba(99,102,241,0.15)', borderRadius: 100,
        borderColor: 'rgba(99,102,241,0.3)', borderWidth: 2,
      }),
      el('icon', 480, 80, 120, 120, { icon: '🏢', size: 64, color: '#ffffff' }),
      // Title
      el('text', 140, 270, 800, 70, {
        text: 'Bem-vindo!', fontSize: 52, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      // Subtitle
      el('text', 140, 350, 800, 40, {
        text: 'Toque na tela para começar', fontSize: 22, fontWeight: 'normal',
        color: 'rgba(255,255,255,0.5)', align: 'center', fontFamily: 'Inter',
      }),
      // Avatar 3D center
      el('avatar', 290, 420, 500, 480, {
        position: 'center', scale: 1.5, animation: 'idle', enabled: true,
        avatarUrl: '/models/avatar.glb', animationsUrl: '/models/animations.glb',
        colors: { shirt: '#6366f1', pants: '#1e293b', shoes: '#000000' },
        frameY: 0, frameZoom: 50,
      }),
      // CTA button
      el('button', 240, 940, 600, 76, {
        label: '💬 Falar com Assistente', bgColor: '#6366f1',
        textColor: '#ffffff', fontSize: 22, borderRadius: 999, action: 'Olá, como posso ajudar?',
      }),
      // Info buttons row
      el('button', 140, 1050, 370, 60, {
        label: 'ℹ️ Informações', bgColor: 'rgba(255,255,255,0.08)',
        textColor: '#ffffff', fontSize: 18, borderRadius: 16, action: 'Informações gerais',
      }),
      el('button', 550, 1050, 370, 60, {
        label: '📍 Localização', bgColor: 'rgba(255,255,255,0.08)',
        textColor: '#ffffff', fontSize: 18, borderRadius: 16, action: 'Onde estamos?',
      }),
      // Footer divider
      el('shape', 140, 1160, 800, 2, {
        shapeType: 'rectangle', fill: 'rgba(255,255,255,0.08)', borderRadius: 1,
        borderColor: 'transparent', borderWidth: 0,
      }),
      // Clock
      el('clock', 380, 1200, 320, 70, {
        format: '24h', showDate: true, color: 'rgba(255,255,255,0.4)', fontSize: 26,
      }),
      // QR bottom-center (square)
      el('qrcode', 460, 1720, 160, 160, {
        value: 'https://example.com', fgColor: 'rgba(255,255,255,0.3)', bgColor: 'transparent',
      }),
    ],
    selectedId: null,
  };
})();

// ═══════════════════════════════════════════════════
// 2. Shopping / Diretório de Lojas
// Layout: Header(0-220) → Store(250-850) → Chat(890-1240) → Footer text(1280) → Clock(1330-1400) → QR(1720-1860)
// ═══════════════════════════════════════════════════
const shoppingDirectory: CanvasState = (() => {
  _id = 0;
  return {
    bgColor: '#0c0a1a',
    elements: [
      // Header gradient bar
      el('shape', 0, 0, 1080, 220, {
        shapeType: 'rectangle', fill: '#1e1b4b', borderRadius: 0,
        borderColor: 'transparent', borderWidth: 0,
      }, { opacity: 0.8 }),
      // Title
      el('text', 60, 50, 960, 70, {
        text: '🏪 Shopping Center', fontSize: 44, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      el('text', 60, 130, 960, 40, {
        text: 'Diretório de Lojas e Serviços', fontSize: 18, fontWeight: 'normal',
        color: 'rgba(255,255,255,0.5)', align: 'center', fontFamily: 'Inter',
      }),
      // Store directory (compact height)
      el('store', 60, 250, 960, 600, {
        title: 'Lojas & Serviços',
        titleColor: '#ffffff',
        titleSize: 24,
        bgColor: 'rgba(0,0,0,0.4)',
        borderRadius: 20,
        stores: [
          { id: '1', name: 'Burger King', logo: '', floor: 'Piso 1', category: 'Alimentação', hours: '10h–22h', phone: '', description: 'Fast food e lanches' },
          { id: '2', name: 'Zara', logo: '', floor: 'Piso 2', category: 'Moda', hours: '10h–22h', phone: '', description: 'Moda feminina e masculina' },
          { id: '3', name: 'Farmácia Popular', logo: '', floor: 'Piso 1', category: 'Saúde', hours: '8h–22h', phone: '(11) 1234-5678', description: 'Medicamentos e bem-estar' },
          { id: '4', name: 'Cinema IMAX', logo: '', floor: 'Piso 3', category: 'Entretenimento', hours: '12h–00h', phone: '', description: 'Filmes e sessões especiais' },
          { id: '5', name: 'iPlace', logo: '', floor: 'Piso 2', category: 'Tecnologia', hours: '10h–22h', phone: '', description: 'Produtos Apple e acessórios' },
          { id: '6', name: 'Starbucks', logo: '', floor: 'Piso 1', category: 'Alimentação', hours: '9h–22h', phone: '', description: 'Cafés e bebidas' },
        ],
        columns: 1,
        gap: 10,
        cardBgColor: 'rgba(255,255,255,0.06)',
        cardBorderRadius: 14,
        accentColor: '#8b5cf6',
        showCategory: true,
        showHours: true,
        showPhone: true,
        showFloor: true,
        showCategoryFilter: true,
        showSearch: true,
      }),
      // Chat IA (compact)
      el('chat', 60, 890, 960, 350, {
        placeholder: 'Pergunte sobre lojas, horários, promoções...', theme: 'dark',
      }),
      // Footer
      el('text', 60, 1280, 960, 36, {
        text: 'Toque nos botões ou pergunte ao assistente virtual', fontSize: 15,
        fontWeight: 'normal', color: 'rgba(255,255,255,0.3)', align: 'center', fontFamily: 'Inter',
      }),
      // Clock
      el('clock', 380, 1340, 320, 70, {
        format: '24h', showDate: true, color: 'rgba(255,255,255,0.3)', fontSize: 22,
      }),
      // QR code (square, centered)
      el('qrcode', 450, 1720, 180, 180, {
        value: 'https://example.com', fgColor: 'rgba(255,255,255,0.2)', bgColor: 'transparent',
      }),
    ],
    selectedId: null,
  };
})();

// ═══════════════════════════════════════════════════
// 3. Promoções / Black Friday
// Layout: Accent(0-8) → Badge(50-106) → Image(140-560) → Headline(590-670) → Subtitle(690-730) → Cards(770-910) → CTA(950-1030) → Buttons(1070-1134) → QR label(1200) → QR(1250-1430) → Clock(1700-1770)
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
      el('shape', 340, 50, 400, 50, {
        shapeType: 'rectangle', fill: '#ef4444', borderRadius: 999,
        borderColor: 'transparent', borderWidth: 0,
      }),
      el('text', 340, 58, 400, 36, {
        text: '🔥 OFERTA ESPECIAL', fontSize: 20, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      // Hero image area
      el('image', 60, 140, 960, 420, {
        src: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=960&h=420&fit=crop',
        fit: 'cover', borderRadius: 24,
      }),
      // Price / Headline
      el('text', 60, 590, 960, 80, {
        text: 'Até 70% OFF', fontSize: 60, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      el('text', 60, 690, 960, 40, {
        text: 'Em lojas selecionadas • Válido até 28/02', fontSize: 19,
        fontWeight: 'normal', color: 'rgba(255,255,255,0.5)', align: 'center', fontFamily: 'Inter',
      }),
      // Highlight cards (3 columns)
      ...[
        { emoji: '👟', name: 'Calçados', discount: '50% OFF', color: '#f59e0b' },
        { emoji: '👕', name: 'Moda', discount: '40% OFF', color: '#8b5cf6' },
        { emoji: '📱', name: 'Tech', discount: '30% OFF', color: '#3b82f6' },
      ].map((item, i) => [
        el('shape', 60 + i * 330, 770, 300, 140, {
          shapeType: 'rectangle', fill: item.color + '18', borderRadius: 20,
          borderColor: item.color + '40', borderWidth: 1,
        }),
        el('text', 60 + i * 330, 790, 300, 44, {
          text: `${item.emoji} ${item.name}`, fontSize: 20, fontWeight: 'bold',
          color: '#ffffff', align: 'center', fontFamily: 'Inter',
        }),
        el('text', 60 + i * 330, 844, 300, 44, {
          text: item.discount, fontSize: 26, fontWeight: 'bold',
          color: item.color, align: 'center', fontFamily: 'Inter',
        }),
      ]).flat(),
      // CTA
      el('button', 160, 950, 760, 76, {
        label: '🛒 Ver Todas as Promoções', bgColor: '#ef4444',
        textColor: '#ffffff', fontSize: 22, borderRadius: 999, action: 'Mostrar todas as promoções',
      }),
      // Secondary buttons
      el('button', 160, 1060, 360, 60, {
        label: '🎁 Cupons', bgColor: 'rgba(255,255,255,0.08)',
        textColor: '#ffffff', fontSize: 18, borderRadius: 16, action: 'Mostrar cupons',
      }),
      el('button', 560, 1060, 360, 60, {
        label: '📍 Lojas', bgColor: 'rgba(255,255,255,0.08)',
        textColor: '#ffffff', fontSize: 18, borderRadius: 16, action: 'Listar lojas com desconto',
      }),
      // QR code with label (square)
      el('text', 340, 1200, 400, 30, {
        text: 'Escaneie para ver no celular', fontSize: 14,
        fontWeight: 'normal', color: 'rgba(255,255,255,0.3)', align: 'center', fontFamily: 'Inter',
      }),
      el('qrcode', 430, 1250, 180, 180, {
        value: 'https://example.com/promo', fgColor: 'rgba(255,255,255,0.25)', bgColor: 'transparent',
      }),
      // Clock bottom-left
      el('clock', 60, 1720, 300, 70, {
        format: '24h', showDate: true, color: 'rgba(255,255,255,0.25)', fontSize: 20,
      }),
    ],
    selectedId: null,
  };
})();

// ═══════════════════════════════════════════════════
// 4. Cardápio / Restaurante
// Layout: Header(0-250) → Sections(280-1500) → CTA(1540-1610) → QR(1700-1850)
// ═══════════════════════════════════════════════════
const restaurantMenu: CanvasState = (() => {
  _id = 0;
  return {
    bgColor: '#1a0f0a',
    elements: [
      // Warm header
      el('shape', 0, 0, 1080, 250, {
        shapeType: 'rectangle', fill: '#7c2d12', borderRadius: 0,
        borderColor: 'transparent', borderWidth: 0,
      }, { opacity: 0.5 }),
      el('icon', 460, 30, 160, 70, { icon: '🍕', size: 52, color: '#ffffff' }),
      el('text', 60, 110, 960, 60, {
        text: 'Nosso Cardápio', fontSize: 42, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      el('text', 60, 180, 960, 36, {
        text: 'Toque para mais detalhes', fontSize: 17,
        fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'center', fontFamily: 'Inter',
      }),
      // Menu sections (4 sections, compact)
      ...[
        { cat: '🥗 Entradas', items: ['Bruschetta • R$18', 'Carpaccio • R$28', 'Salada Caesar • R$22'] },
        { cat: '🍝 Pratos Principais', items: ['Filé Mignon • R$58', 'Salmão Grelhado • R$52', 'Risoto de Funghi • R$42'] },
        { cat: '🍰 Sobremesas', items: ['Tiramisù • R$24', 'Petit Gâteau • R$28', 'Sorbet de Frutas • R$18'] },
        { cat: '🥤 Bebidas', items: ['Suco Natural • R$12', 'Refrigerante • R$8', 'Água com Gás • R$6'] },
      ].flatMap((section, si) => {
        const baseY = 280 + si * 290;
        return [
          // Section title
          el('text', 80, baseY, 920, 40, {
            text: section.cat, fontSize: 22, fontWeight: 'bold',
            color: '#f97316', align: 'left', fontFamily: 'Inter',
          }),
          // Divider
          el('shape', 80, baseY + 44, 920, 1, {
            shapeType: 'rectangle', fill: 'rgba(249,115,22,0.2)', borderRadius: 0,
            borderColor: 'transparent', borderWidth: 0,
          }),
          // Items
          ...section.items.map((item, ii) =>
            el('text', 100, baseY + 58 + ii * 42, 880, 36, {
              text: item, fontSize: 18, fontWeight: 'normal',
              color: 'rgba(255,255,255,0.8)', align: 'left', fontFamily: 'Inter',
            })
          ),
        ];
      }),
      // CTA
      el('button', 200, 1540, 680, 70, {
        label: '📲 Peça pelo App', bgColor: '#f97316',
        textColor: '#ffffff', fontSize: 22, borderRadius: 999, action: 'Como faço pedido?',
      }),
      // QR bottom (square)
      el('qrcode', 450, 1700, 160, 160, {
        value: 'https://example.com/menu', fgColor: 'rgba(255,255,255,0.2)', bgColor: 'transparent',
      }),
    ],
    selectedId: null,
  };
})();

// ═══════════════════════════════════════════════════
// 5. Recepção Corporativa
// Layout: Accent(0-6) → Logo(50-320) → Name(350-410) → Subtitle(430-470) → Sep(500) → Buttons(540-1020) → Chat(1060-1400) → Clock(1440-1510) → QR(1700-1860)
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
      el('shape', 415, 50, 250, 250, {
        shapeType: 'circle', fill: 'rgba(59,130,246,0.1)', borderRadius: 125,
        borderColor: 'rgba(59,130,246,0.2)', borderWidth: 2,
      }),
      el('icon', 460, 100, 160, 150, { icon: '🏢', size: 72, color: '#3b82f6' }),
      // Company name
      el('text', 60, 340, 960, 60, {
        text: 'Empresa S.A.', fontSize: 38, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      el('text', 60, 410, 960, 40, {
        text: 'Bem-vindo à nossa sede', fontSize: 20,
        fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'center', fontFamily: 'Inter',
      }),
      // Separator
      el('shape', 340, 470, 400, 2, {
        shapeType: 'rectangle', fill: 'rgba(59,130,246,0.2)', borderRadius: 1,
        borderColor: 'transparent', borderWidth: 0,
      }),
      // Action buttons (vertical stack, compact)
      ...[
        { label: '📋 Check-in de Visitante', color: '#3b82f6', action: 'Fazer check-in' },
        { label: '📍 Mapa do Prédio', color: '#6366f1', action: 'Mostrar mapa' },
        { label: '📞 Ligar para Recepção', color: '#10b981', action: 'Contato recepção' },
        { label: '📅 Agenda de Reuniões', color: '#f59e0b', action: 'Ver agenda de hoje' },
        { label: '🅿️ Estacionamento', color: '#64748b', action: 'Info estacionamento' },
      ].map((item, i) =>
        el('button', 140, 510 + i * 90, 800, 68, {
          label: item.label, bgColor: item.color + '20',
          textColor: '#ffffff', fontSize: 19, borderRadius: 16, action: item.action,
        })
      ),
      // Chat bottom (compact)
      el('chat', 60, 980, 960, 340, {
        placeholder: 'Pergunte sobre o prédio, salas, serviços...', theme: 'dark',
      }),
      // Clock + Weather footer
      el('clock', 60, 1360, 300, 60, {
        format: '24h', showDate: true, color: 'rgba(255,255,255,0.3)', fontSize: 20,
      }),
      el('weather', 720, 1360, 300, 60, {
        city: 'São Paulo', units: 'metric', color: 'rgba(255,255,255,0.3)',
      }),
      // QR (square, centered)
      el('qrcode', 440, 1700, 180, 180, {
        value: 'https://example.com/checkin', fgColor: 'rgba(255,255,255,0.2)', bgColor: 'transparent',
      }),
    ],
    selectedId: null,
  };
})();

// ═══════════════════════════════════════════════════
// 6. Evento / Conferência
// Layout: Gradient(0-340) → Badge(40-86) → Title(110-190) → Date(210-250) → Countdown(280-370) → Schedule(400-820) → Buttons(860-930) → Chat(970-1300) → Social(1340-1400) → QR label(1450) → QR(1490-1670)
// ═══════════════════════════════════════════════════
const eventConference: CanvasState = (() => {
  _id = 0;
  return {
    bgColor: '#0a0a1a',
    elements: [
      // Top gradient
      el('shape', 0, 0, 1080, 340, {
        shapeType: 'rectangle', fill: '#4c1d95', borderRadius: 0,
        borderColor: 'transparent', borderWidth: 0,
      }, { opacity: 0.4 }),
      // Event badge
      el('shape', 340, 40, 400, 46, {
        shapeType: 'rectangle', fill: '#a855f7', borderRadius: 999,
        borderColor: 'transparent', borderWidth: 0,
      }),
      el('text', 340, 48, 400, 32, {
        text: '🎤 AO VIVO', fontSize: 15, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      // Event name
      el('text', 60, 110, 960, 80, {
        text: 'Tech Summit 2026', fontSize: 48, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      el('text', 60, 210, 960, 40, {
        text: '21 a 23 de Fevereiro • Centro de Convenções', fontSize: 18,
        fontWeight: 'normal', color: 'rgba(255,255,255,0.5)', align: 'center', fontFamily: 'Inter',
      }),
      // Countdown
      el('countdown', 260, 280, 560, 90, {
        targetDate: '2026-02-23T18:00:00', label: 'Próxima palestra em',
        color: '#a855f7', fontSize: 28,
      }),
      // Schedule cards (compact)
      ...[
        { time: '14:00', title: 'IA Generativa no Varejo', speaker: 'Ana Silva' },
        { time: '15:30', title: 'O Futuro dos Pagamentos', speaker: 'Carlos Santos' },
        { time: '17:00', title: 'Transformação Digital', speaker: 'Marina Costa' },
      ].flatMap((item, i) => {
        const y = 400 + i * 140;
        return [
          el('shape', 80, y, 920, 110, {
            shapeType: 'rectangle', fill: 'rgba(168,85,247,0.08)', borderRadius: 16,
            borderColor: 'rgba(168,85,247,0.15)', borderWidth: 1,
          }),
          el('text', 110, y + 12, 170, 36, {
            text: item.time, fontSize: 24, fontWeight: 'bold',
            color: '#a855f7', align: 'left', fontFamily: 'Inter',
          }),
          el('text', 290, y + 12, 690, 36, {
            text: item.title, fontSize: 20, fontWeight: 'bold',
            color: '#ffffff', align: 'left', fontFamily: 'Inter',
          }),
          el('text', 290, y + 54, 690, 30, {
            text: `🎙️ ${item.speaker}`, fontSize: 15, fontWeight: 'normal',
            color: 'rgba(255,255,255,0.5)', align: 'left', fontFamily: 'Inter',
          }),
        ];
      }),
      // CTA buttons
      el('button', 140, 840, 380, 64, {
        label: '🗺️ Mapa do Evento', bgColor: 'rgba(168,85,247,0.15)',
        textColor: '#ffffff', fontSize: 17, borderRadius: 16, action: 'Mapa do evento',
      }),
      el('button', 560, 840, 380, 64, {
        label: '📋 Programação', bgColor: 'rgba(168,85,247,0.15)',
        textColor: '#ffffff', fontSize: 17, borderRadius: 16, action: 'Programação completa',
      }),
      // Chat (compact)
      el('chat', 60, 940, 960, 340, {
        placeholder: 'Pergunte sobre palestras, salas, WiFi...', theme: 'dark',
      }),
      // Social links
      el('social', 260, 1320, 560, 50, {
        links: [
          { platform: 'instagram', url: 'https://instagram.com' },
          { platform: 'facebook', url: 'https://facebook.com' },
        ],
        iconSize: 28, gap: 20, color: 'rgba(255,255,255,0.4)',
      }),
      // QR (square)
      el('text', 340, 1420, 400, 26, {
        text: 'Acesse a agenda no celular', fontSize: 13,
        fontWeight: 'normal', color: 'rgba(255,255,255,0.25)', align: 'center', fontFamily: 'Inter',
      }),
      el('qrcode', 440, 1470, 180, 180, {
        value: 'https://example.com/event', fgColor: 'rgba(255,255,255,0.2)', bgColor: 'transparent',
      }),
    ],
    selectedId: null,
  };
})();

// ═══════════════════════════════════════════════════
// 7. Minimalista / Atendimento
// Layout: Accent(0-4) → Icon(250-390) → Title(420-500) → Subtitle(520-560) → Buttons(610-890) → Chat(940-1380) → Clock(1440-1510)
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
      el('icon', 460, 250, 160, 140, { icon: '💬', size: 72, color: '#10b981' }),
      // Main question
      el('text', 100, 420, 880, 80, {
        text: 'Como posso ajudar?', fontSize: 42, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      el('text', 100, 520, 880, 40, {
        text: 'Toque em um botão ou digite sua pergunta', fontSize: 17,
        fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'center', fontFamily: 'Inter',
      }),
      // 3 large action buttons
      el('button', 140, 610, 800, 80, {
        label: '📋 Informações Gerais', bgColor: '#10b981',
        textColor: '#ffffff', fontSize: 21, borderRadius: 20, action: 'Informações gerais',
      }),
      el('button', 140, 714, 800, 80, {
        label: '📍 Encontrar Localização', bgColor: 'rgba(16,185,129,0.15)',
        textColor: '#ffffff', fontSize: 21, borderRadius: 20, action: 'Preciso encontrar algo',
      }),
      el('button', 140, 818, 800, 80, {
        label: '📞 Falar com Atendente', bgColor: 'rgba(16,185,129,0.15)',
        textColor: '#ffffff', fontSize: 21, borderRadius: 20, action: 'Quero falar com alguém',
      }),
      // Chat area (compact)
      el('chat', 60, 940, 960, 440, {
        placeholder: 'Digite sua pergunta aqui...', theme: 'dark',
      }),
      // Clock
      el('clock', 380, 1440, 320, 70, {
        format: '24h', showDate: true, color: 'rgba(255,255,255,0.25)', fontSize: 22,
      }),
    ],
    selectedId: null,
  };
})();

// ═══════════════════════════════════════════════════
// 8. Hospital / Clínica
// ═══════════════════════════════════════════════════
const hospitalClinic: CanvasState = (() => {
  _id = 0;
  return {
    bgColor: '#0a1628',
    elements: [
      // Top accent
      el('shape', 0, 0, 1080, 6, {
        shapeType: 'rectangle', fill: '#06b6d4', borderRadius: 0,
        borderColor: 'transparent', borderWidth: 0,
      }),
      // Header
      el('icon', 460, 50, 160, 100, { icon: '🏥', size: 64, color: '#06b6d4' }),
      el('text', 60, 170, 960, 60, {
        text: 'Clínica São Lucas', fontSize: 38, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      el('text', 60, 240, 960, 36, {
        text: 'Bem-vindo! Retire sua senha abaixo', fontSize: 17,
        fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'center', fontFamily: 'Inter',
      }),
      // Ticket widget
      el('ticket', 280, 320, 520, 380, {
        prefix: 'C', currentNumber: 127, bgColor: 'rgba(6,182,212,0.08)',
        textColor: '#ffffff', accentColor: '#06b6d4', fontSize: 72,
        borderRadius: 24, label: 'Sua senha de atendimento', showPrint: true,
        printLabel: '🖨️ Retirar Senha',
      }),
      // Department buttons
      ...[
        { label: '🩺 Consultas', color: '#06b6d4' },
        { label: '💉 Vacinas', color: '#8b5cf6' },
        { label: '🔬 Exames', color: '#f59e0b' },
        { label: '💊 Farmácia', color: '#10b981' },
      ].map((item, i) =>
        el('button', 60 + (i % 2) * 500, 740 + Math.floor(i / 2) * 90, 460, 72, {
          label: item.label, bgColor: item.color + '18',
          textColor: '#ffffff', fontSize: 19, borderRadius: 16, action: item.label,
        })
      ),
      // Chat
      el('chat', 60, 960, 960, 340, {
        placeholder: 'Pergunte sobre horários, convênios, resultados...', theme: 'dark',
      }),
      // Clock
      el('clock', 380, 1340, 320, 60, {
        format: '24h', showDate: true, color: 'rgba(255,255,255,0.3)', fontSize: 20,
      }),
      // QR
      el('qrcode', 440, 1700, 180, 180, {
        value: 'https://example.com/clinic', fgColor: 'rgba(255,255,255,0.2)', bgColor: 'transparent',
      }),
    ],
    selectedId: null,
  };
})();

// ═══════════════════════════════════════════════════
// 9. Hotel / Turismo
// ═══════════════════════════════════════════════════
const hotelTourism: CanvasState = (() => {
  _id = 0;
  return {
    bgColor: '#1a1007',
    elements: [
      // Warm header
      el('shape', 0, 0, 1080, 300, {
        shapeType: 'rectangle', fill: '#78350f', borderRadius: 0,
        borderColor: 'transparent', borderWidth: 0,
      }, { opacity: 0.3 }),
      el('icon', 460, 40, 160, 100, { icon: '🏨', size: 64, color: '#f59e0b' }),
      el('text', 60, 160, 960, 60, {
        text: 'Hotel Grand Palace', fontSize: 38, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      el('text', 60, 230, 960, 36, {
        text: 'Faça seu check-in digital', fontSize: 17,
        fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'center', fontFamily: 'Inter',
      }),
      // Check-in form
      el('form', 140, 320, 800, 480, {
        title: 'Check-in', titleColor: '#ffffff', titleSize: 24,
        bgColor: 'rgba(245,158,11,0.06)', borderRadius: 20,
        fields: [
          { id: '1', type: 'text', label: 'Nome completo', placeholder: 'Seu nome', required: true },
          { id: '2', type: 'text', label: 'Nº da Reserva', placeholder: 'Ex: HTL-12345', required: true },
          { id: '3', type: 'select', label: 'Tipo de quarto', placeholder: 'Selecione...', options: 'Standard, Luxo, Suíte, Penthouse', required: false },
        ],
        submitLabel: '🔑 Fazer Check-in', submitBgColor: '#f59e0b',
        submitTextColor: '#ffffff', accentColor: '#f59e0b',
        fieldBgColor: 'rgba(255,255,255,0.06)', fieldTextColor: '#ffffff',
        successMessage: 'Check-in realizado! Bem-vindo! 🎉',
      }),
      // Services buttons
      ...[
        { label: '🍽️ Room Service', action: 'Room service' },
        { label: '🧖 Spa & Lazer', action: 'Spa e lazer' },
        { label: '📍 Pontos Turísticos', action: 'Pontos turísticos' },
        { label: '🚗 Transfer', action: 'Transfer aeroporto' },
      ].map((item, i) =>
        el('button', 60 + (i % 2) * 500, 840 + Math.floor(i / 2) * 80, 460, 62, {
          label: item.label, bgColor: 'rgba(245,158,11,0.1)',
          textColor: '#ffffff', fontSize: 17, borderRadius: 14, action: item.action,
        })
      ),
      // Weather + Clock
      el('weather', 60, 1060, 300, 60, {
        city: 'Rio de Janeiro', units: 'metric', color: 'rgba(255,255,255,0.3)',
      }),
      el('clock', 720, 1060, 300, 60, {
        format: '24h', showDate: true, color: 'rgba(255,255,255,0.3)', fontSize: 20,
      }),
      // QR
      el('qrcode', 440, 1700, 180, 180, {
        value: 'https://example.com/hotel', fgColor: 'rgba(255,255,255,0.2)', bgColor: 'transparent',
      }),
    ],
    selectedId: null,
  };
})();

// ═══════════════════════════════════════════════════
// 10. Varejo / Loja
// ═══════════════════════════════════════════════════
const retailStore: CanvasState = (() => {
  _id = 0;
  return {
    bgColor: '#0f0f14',
    elements: [
      // Top accent
      el('shape', 0, 0, 1080, 6, {
        shapeType: 'rectangle', fill: '#ec4899', borderRadius: 0,
        borderColor: 'transparent', borderWidth: 0,
      }),
      // Header
      el('icon', 460, 40, 160, 100, { icon: '🛍️', size: 64, color: '#ec4899' }),
      el('text', 60, 160, 960, 60, {
        text: 'Loja Fashion', fontSize: 42, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      el('text', 60, 230, 960, 36, {
        text: 'Explore nossos produtos e ofertas', fontSize: 17,
        fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'center', fontFamily: 'Inter',
      }),
      // Catalog
      el('catalog', 60, 300, 960, 700, {
        title: 'Destaques', titleColor: '#ffffff', titleSize: 24,
        bgColor: 'rgba(236,72,153,0.05)', borderRadius: 20,
        items: [
          { id: '1', name: 'Tênis Runner', description: 'Conforto para o dia a dia', price: 'R$ 299,90', image: '', category: 'Calçados', badge: 'NOVO', badgeColor: '#ec4899' },
          { id: '2', name: 'Camisa Premium', description: 'Algodão egípcio', price: 'R$ 189,90', image: '', category: 'Roupas', badge: '-30%', badgeColor: '#ef4444' },
          { id: '3', name: 'Bolsa Elegance', description: 'Couro legítimo', price: 'R$ 459,90', image: '', category: 'Acessórios', badge: '', badgeColor: '' },
          { id: '4', name: 'Óculos Solar', description: 'Proteção UV400', price: 'R$ 149,90', image: '', category: 'Acessórios', badge: 'BEST', badgeColor: '#f59e0b' },
        ],
        columns: 2, gap: 12, cardBgColor: 'rgba(255,255,255,0.06)',
        cardBorderRadius: 16, accentColor: '#ec4899', showPrice: true,
        showCategory: true, showSearch: true, showCategoryFilter: true,
        imageAspect: '1/1', priceColor: '#ec4899', nameSize: 15, priceSize: 18,
      }),
      // QR Pix payment
      el('qrpix', 280, 1040, 520, 400, {
        pixKey: '12345678901', amount: '', recipientName: 'Loja Fashion LTDA',
        bgColor: 'rgba(236,72,153,0.06)', textColor: '#ffffff', accentColor: '#32bcad',
        borderRadius: 20, showAmount: false, label: 'Pague com Pix',
      }),
      // Big CTA
      el('bigcta', 140, 1480, 800, 120, {
        label: '🛒 Peça pelo App', sublabel: 'Escaneie o QR code abaixo',
        icon: '', bgColor: '#ec4899', textColor: '#ffffff', fontSize: 24,
        borderRadius: 999, pulse: true,
      }),
      // QR
      el('qrcode', 440, 1700, 180, 180, {
        value: 'https://example.com/store', fgColor: 'rgba(255,255,255,0.2)', bgColor: 'transparent',
      }),
    ],
    selectedId: null,
  };
})();

// ═══════════════════════════════════════════════════════════════
// MULTI-PAGE TEMPLATES (with views + navigation)
// ═══════════════════════════════════════════════════════════════

// Helper for multi-page elements
function elv(
  viewId: string,
  type: CanvasElement['type'],
  x: number, y: number, w: number, h: number,
  props: Record<string, any>,
  extra?: Partial<CanvasElement>,
): CanvasElement {
  return el(type, x, y, w, h, props, { viewId, ...extra });
}

// ═══════════════════════════════════════════════════
// MP1. Restaurante Completo (4 páginas)
// ═══════════════════════════════════════════════════
const mpRestaurant: CanvasState = (() => {
  _id = 0;
  const V = { home: 'v_rest_home', menu: 'v_rest_menu', order: 'v_rest_order', pay: 'v_rest_pay' };
  return {
    bgColor: '#0d0806',
    views: [
      { id: V.home, name: '🏠 Início', isDefault: true },
      { id: V.menu, name: '📋 Cardápio' },
      { id: V.order, name: '🛒 Pedido' },
      { id: V.pay, name: '💳 Pagamento' },
    ],
    pageBgColors: { [V.home]: '#0d0806', [V.menu]: '#1a0f0a', [V.order]: '#0f1419', [V.pay]: '#0a1628' },
    elements: [
      // ── HOME ──
      elv(V.home, 'shape', 0, 0, 1080, 1920, { shapeType: 'rectangle', fill: '#7c2d12', borderRadius: 0, borderColor: 'transparent', borderWidth: 0 }, { opacity: 0.15 }),
      elv(V.home, 'icon', 420, 120, 240, 180, { icon: '🍽️', size: 96, color: '#f97316' }),
      elv(V.home, 'text', 60, 350, 960, 80, { text: 'Ristorante Bella', fontSize: 52, fontWeight: 'bold', color: '#ffffff', align: 'center', fontFamily: 'Inter' }),
      elv(V.home, 'text', 60, 450, 960, 50, { text: 'Cucina Italiana Autentica', fontSize: 22, fontWeight: 'normal', color: 'rgba(249,115,22,0.7)', align: 'center', fontFamily: 'Inter' }),
      elv(V.home, 'shape', 360, 530, 360, 2, { shapeType: 'rectangle', fill: 'rgba(249,115,22,0.3)', borderRadius: 1, borderColor: 'transparent', borderWidth: 0 }),
      elv(V.home, 'image', 60, 580, 960, 500, { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=960&h=500&fit=crop', fit: 'cover', borderRadius: 24 }),
      elv(V.home, 'bigcta', 140, 1140, 800, 160, {
        label: '📋 Ver Cardápio', sublabel: 'Toque para explorar nossos pratos', icon: '', bgColor: '#f97316', textColor: '#ffffff', fontSize: 28, borderRadius: 24, pulse: true,
        actionType: 'navigate', navigateTarget: V.menu, navigateTransition: 'slide-left',
      }),
      elv(V.home, 'button', 140, 1350, 460, 72, { label: '⭐ Reservar Mesa', bgColor: 'rgba(249,115,22,0.12)', textColor: '#ffffff', fontSize: 19, borderRadius: 16, actionType: 'navigate', navigateTarget: V.order, navigateTransition: 'slide-left' }),
      elv(V.home, 'button', 640, 1350, 300, 72, { label: '📍 Como Chegar', bgColor: 'rgba(255,255,255,0.06)', textColor: '#ffffff', fontSize: 19, borderRadius: 16, action: 'Onde fica o restaurante?' }),
      elv(V.home, 'clock', 380, 1500, 320, 60, { format: '24h', showDate: true, color: 'rgba(255,255,255,0.25)', fontSize: 20 }),
      elv(V.home, 'text', 60, 1600, 960, 30, { text: 'Seg-Sáb 11h–23h | Dom 11h–16h', fontSize: 14, fontWeight: 'normal', color: 'rgba(255,255,255,0.25)', align: 'center', fontFamily: 'Inter' }),
      elv(V.home, 'social', 260, 1680, 560, 60, { links: [{ id: '1', platform: 'instagram', label: '@bella', url: '', color: '#E1306C' }, { id: '2', platform: 'whatsapp', label: 'WhatsApp', url: '', color: '#25D366' }], iconSize: 28, gap: 20, showLabels: true, layout: 'horizontal' }),
      elv(V.home, 'qrcode', 440, 1760, 180, 140, { value: 'https://example.com/restaurant', fgColor: 'rgba(255,255,255,0.15)', bgColor: 'transparent' }),

      // ── CARDÁPIO ──
      elv(V.menu, 'shape', 0, 0, 1080, 200, { shapeType: 'rectangle', fill: '#7c2d12', borderRadius: 0, borderColor: 'transparent', borderWidth: 0 }, { opacity: 0.4 }),
      elv(V.menu, 'text', 60, 50, 800, 60, { text: '📋 Cardápio', fontSize: 38, fontWeight: 'bold', color: '#ffffff', align: 'left', fontFamily: 'Inter' }),
      elv(V.menu, 'button', 870, 55, 160, 50, { label: '← Voltar', bgColor: 'rgba(255,255,255,0.1)', textColor: '#ffffff', fontSize: 13, borderRadius: 12, actionType: 'navigate', navigateTarget: V.home, navigateTransition: 'slide-right' }),
      elv(V.menu, 'text', 60, 120, 960, 36, { text: 'Peça pelo totem — sem espera!', fontSize: 16, fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'left', fontFamily: 'Inter' }),
      elv(V.menu, 'list', 60, 230, 960, 800, {
        listTitle: '🥗 Entradas & Saladas', bgColor: 'rgba(249,115,22,0.05)', borderRadius: 20, titleSize: 20, titleColor: '#f97316', priceColor: '#f97316', showIcon: true, showPrice: true, showDivider: true,
        items: [
          { id: '1', title: 'Bruschetta Clássica', subtitle: 'Pão italiano, tomate, manjericão', price: 'R$ 24,90', icon: '🍞' },
          { id: '2', title: 'Carpaccio di Manzo', subtitle: 'Carne fatiada, rúcula, parmesão', price: 'R$ 38,90', icon: '🥩' },
          { id: '3', title: 'Insalata Caprese', subtitle: 'Tomate, mozzarella de búfala', price: 'R$ 29,90', icon: '🥗' },
          { id: '4', title: 'Antipasto Misto', subtitle: 'Embutidos e queijos italianos', price: 'R$ 54,90', icon: '🧀' },
        ],
      }),
      elv(V.menu, 'list', 60, 1060, 960, 580, {
        listTitle: '🍝 Pratos Principais', bgColor: 'rgba(249,115,22,0.05)', borderRadius: 20, titleSize: 20, titleColor: '#f97316', priceColor: '#f97316', showIcon: true, showPrice: true, showDivider: true,
        items: [
          { id: '1', title: 'Spaghetti Carbonara', subtitle: 'Guanciale e pecorino', price: 'R$ 48,90', icon: '🍝' },
          { id: '2', title: 'Risotto ai Funghi', subtitle: 'Arroz arbório, cogumelos', price: 'R$ 52,90', icon: '🍚' },
          { id: '3', title: 'Filetto di Salmone', subtitle: 'Salmão grelhado com ervas', price: 'R$ 64,90', icon: '🐟' },
        ],
      }),
      elv(V.menu, 'button', 140, 1700, 800, 80, { label: '🛒 Fazer Pedido', bgColor: '#f97316', textColor: '#ffffff', fontSize: 22, borderRadius: 999, actionType: 'navigate', navigateTarget: V.order, navigateTransition: 'slide-left' }),

      // ── PEDIDO ──
      elv(V.order, 'text', 60, 50, 800, 60, { text: '🛒 Seu Pedido', fontSize: 38, fontWeight: 'bold', color: '#ffffff', align: 'left', fontFamily: 'Inter' }),
      elv(V.order, 'button', 870, 55, 160, 50, { label: '← Cardápio', bgColor: 'rgba(255,255,255,0.1)', textColor: '#ffffff', fontSize: 13, borderRadius: 12, actionType: 'navigate', navigateTarget: V.menu, navigateTransition: 'slide-right' }),
      elv(V.order, 'numpad', 200, 180, 680, 600, { label: 'Número da mesa', placeholder: '00', bgColor: 'rgba(99,102,241,0.06)', textColor: '#ffffff', accentColor: '#6366f1', borderRadius: 24, maxLength: 3, mask: 'none', buttonLabel: 'Confirmar mesa' }),
      elv(V.order, 'form', 140, 830, 800, 440, {
        title: 'Observações', titleColor: '#ffffff', titleSize: 20, bgColor: 'rgba(99,102,241,0.05)', borderRadius: 20,
        fields: [
          { id: '1', type: 'text', label: 'Seu nome', placeholder: 'Para chamar quando pronto', required: true },
          { id: '2', type: 'textarea', label: 'Observações', placeholder: 'Alergias, sem cebola...', required: false },
        ],
        submitLabel: '💳 Ir para Pagamento', submitBgColor: '#6366f1', submitTextColor: '#ffffff', accentColor: '#6366f1', fieldBgColor: 'rgba(255,255,255,0.06)', fieldTextColor: '#ffffff', successMessage: 'Pedido registrado! ✅',
      }),
      elv(V.order, 'button', 140, 1330, 800, 76, { label: '💳 Pagar Agora', bgColor: '#22c55e', textColor: '#ffffff', fontSize: 22, borderRadius: 999, actionType: 'navigate', navigateTarget: V.pay, navigateTransition: 'slide-left' }),
      elv(V.order, 'animated-number', 340, 1470, 400, 120, { value: 127, prefix: 'R$ ', suffix: ',90', label: 'Total do pedido', color: '#22c55e', labelColor: 'rgba(255,255,255,0.4)', fontSize: 56, labelSize: 16, duration: 1500, useGrouping: true }),

      // ── PAGAMENTO ──
      elv(V.pay, 'text', 60, 50, 800, 60, { text: '💳 Pagamento', fontSize: 38, fontWeight: 'bold', color: '#ffffff', align: 'left', fontFamily: 'Inter' }),
      elv(V.pay, 'button', 870, 55, 160, 50, { label: '← Voltar', bgColor: 'rgba(255,255,255,0.1)', textColor: '#ffffff', fontSize: 13, borderRadius: 12, actionType: 'navigate', navigateTarget: V.order, navigateTransition: 'slide-right' }),
      elv(V.pay, 'animated-number', 240, 160, 600, 140, { value: 127, prefix: 'R$ ', suffix: ',90', label: 'Valor total', color: '#ffffff', labelColor: 'rgba(255,255,255,0.5)', fontSize: 64, labelSize: 18, duration: 1000, useGrouping: true }),
      elv(V.pay, 'qrpix', 200, 360, 680, 520, { pixKey: '12345678901', amount: 'R$ 127,90', recipientName: 'Ristorante Bella LTDA', bgColor: 'rgba(50,188,173,0.06)', textColor: '#ffffff', accentColor: '#32bcad', borderRadius: 24, showAmount: true, label: 'Pague com Pix' }),
      elv(V.pay, 'text', 60, 920, 960, 40, { text: 'ou pague no caixa', fontSize: 16, fontWeight: 'normal', color: 'rgba(255,255,255,0.3)', align: 'center', fontFamily: 'Inter' }),
      elv(V.pay, 'ticket', 300, 1000, 480, 340, { prefix: 'P', currentNumber: 42, bgColor: 'rgba(99,102,241,0.06)', textColor: '#ffffff', accentColor: '#6366f1', fontSize: 64, borderRadius: 20, label: 'Senha do pedido', showPrint: true, printLabel: '🖨️ Imprimir Senha' }),
      elv(V.pay, 'button', 240, 1400, 600, 76, { label: '🏠 Voltar ao Início', bgColor: 'rgba(255,255,255,0.08)', textColor: '#ffffff', fontSize: 20, borderRadius: 999, actionType: 'navigate', navigateTarget: V.home, navigateTransition: 'fade' }),
      elv(V.pay, 'text', 60, 1520, 960, 30, { text: 'Obrigado pela preferência! ❤️', fontSize: 16, fontWeight: 'normal', color: 'rgba(255,255,255,0.3)', align: 'center', fontFamily: 'Inter' }),
    ],
    selectedId: null,
    activeViewId: V.home,
    viewIdleTimeout: 60,
  };
})();

// ═══════════════════════════════════════════════════
// MP2. Shopping Center (5 páginas)
// ═══════════════════════════════════════════════════
const mpShopping: CanvasState = (() => {
  _id = 0;
  const V = { home: 'v_shop_home', stores: 'v_shop_stores', promos: 'v_shop_promos', food: 'v_shop_food', help: 'v_shop_help' };
  return {
    bgColor: '#08070f',
    views: [
      { id: V.home, name: '🏠 Início', isDefault: true },
      { id: V.stores, name: '🏪 Lojas' },
      { id: V.promos, name: '🔥 Promoções' },
      { id: V.food, name: '🍔 Alimentação' },
      { id: V.help, name: '💬 Ajuda' },
    ],
    pageBgColors: { [V.home]: '#08070f', [V.stores]: '#0c0a1a', [V.promos]: '#0a0a0a', [V.food]: '#1a0f0a', [V.help]: '#111827' },
    elements: [
      // ── HOME ──
      elv(V.home, 'shape', 0, 0, 1080, 400, { shapeType: 'rectangle', fill: '#4c1d95', borderRadius: 0, borderColor: 'transparent', borderWidth: 0 }, { opacity: 0.25 }),
      elv(V.home, 'icon', 420, 80, 240, 160, { icon: '🏬', size: 96, color: '#a855f7' }),
      elv(V.home, 'text', 60, 280, 960, 80, { text: 'Shopping Ville', fontSize: 52, fontWeight: 'bold', color: '#ffffff', align: 'center', fontFamily: 'Inter' }),
      elv(V.home, 'text', 60, 380, 960, 40, { text: 'O que você procura hoje?', fontSize: 20, fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'center', fontFamily: 'Inter' }),
      ...[
        { label: '🏪 Lojas', desc: '120+ lojas', color: '#8b5cf6', target: V.stores },
        { label: '🔥 Promoções', desc: 'Ofertas do dia', color: '#ef4444', target: V.promos },
        { label: '🍔 Alimentação', desc: 'Restaurantes', color: '#f97316', target: V.food },
        { label: '💬 Ajuda', desc: 'Chat IA', color: '#10b981', target: V.help },
      ].flatMap((item, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const x = 60 + col * 500, y = 480 + row * 280;
        return [
          elv(V.home, 'shape', x, y, 460, 240, { shapeType: 'rectangle', fill: item.color + '12', borderRadius: 24, borderColor: item.color + '30', borderWidth: 1 }),
          elv(V.home, 'text', x, y + 50, 460, 60, { text: item.label, fontSize: 28, fontWeight: 'bold', color: '#ffffff', align: 'center', fontFamily: 'Inter' }),
          elv(V.home, 'text', x, y + 120, 460, 36, { text: item.desc, fontSize: 16, fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'center', fontFamily: 'Inter' }),
          elv(V.home, 'button', x + 80, y + 170, 300, 50, { label: 'Explorar →', bgColor: item.color, textColor: '#ffffff', fontSize: 15, borderRadius: 999, actionType: 'navigate', navigateTarget: item.target, navigateTransition: 'slide-left' }),
        ];
      }),
      elv(V.home, 'clock', 380, 1120, 320, 70, { format: '24h', showDate: true, color: 'rgba(255,255,255,0.25)', fontSize: 22 }),
      elv(V.home, 'weather', 380, 1210, 320, 60, { city: 'São Paulo', units: 'metric', color: 'rgba(255,255,255,0.25)' }),
      elv(V.home, 'text', 60, 1340, 960, 30, { text: 'Seg-Sáb 10h–22h | Dom 14h–20h', fontSize: 14, fontWeight: 'normal', color: 'rgba(255,255,255,0.2)', align: 'center', fontFamily: 'Inter' }),
      elv(V.home, 'qrcode', 440, 1740, 180, 160, { value: 'https://example.com/shopping', fgColor: 'rgba(255,255,255,0.12)', bgColor: 'transparent' }),

      // ── LOJAS ──
      elv(V.stores, 'text', 60, 40, 800, 60, { text: '🏪 Lojas & Serviços', fontSize: 34, fontWeight: 'bold', color: '#ffffff', align: 'left', fontFamily: 'Inter' }),
      elv(V.stores, 'button', 870, 45, 160, 50, { label: '← Início', bgColor: 'rgba(255,255,255,0.1)', textColor: '#ffffff', fontSize: 13, borderRadius: 12, actionType: 'navigate', navigateTarget: V.home, navigateTransition: 'slide-right' }),
      elv(V.stores, 'store', 60, 120, 960, 1700, {
        title: '', titleColor: '#ffffff', titleSize: 0, bgColor: 'rgba(139,92,246,0.03)', borderRadius: 20,
        stores: [
          { id: '1', name: 'Renner', logo: '', floor: 'Piso 1', category: 'Moda', hours: '10h–22h', phone: '', description: 'Moda feminina, masculina e infantil' },
          { id: '2', name: 'Apple Store', logo: '', floor: 'Piso 2', category: 'Tecnologia', hours: '10h–22h', phone: '', description: 'Produtos Apple e acessórios' },
          { id: '3', name: 'Farmácia Drogasil', logo: '', floor: 'Piso 1', category: 'Saúde', hours: '8h–22h', phone: '(11) 9999-0000', description: 'Medicamentos e bem-estar' },
          { id: '4', name: 'McDonald\'s', logo: '', floor: 'Piso 3', category: 'Alimentação', hours: '10h–23h', phone: '', description: 'Fast food e lanches' },
          { id: '5', name: 'Cinemark', logo: '', floor: 'Piso 3', category: 'Lazer', hours: '12h–00h', phone: '', description: 'Cinema IMAX e salas VIP' },
          { id: '6', name: 'Nike', logo: '', floor: 'Piso 2', category: 'Esportes', hours: '10h–22h', phone: '', description: 'Artigos esportivos' },
        ],
        columns: 1, gap: 10, cardBgColor: 'rgba(255,255,255,0.05)', cardBorderRadius: 14, accentColor: '#8b5cf6',
        showCategory: true, showHours: true, showPhone: true, showFloor: true, showCategoryFilter: true, showSearch: true,
      }),

      // ── PROMOÇÕES ──
      elv(V.promos, 'text', 60, 40, 800, 60, { text: '🔥 Promoções', fontSize: 34, fontWeight: 'bold', color: '#ffffff', align: 'left', fontFamily: 'Inter' }),
      elv(V.promos, 'button', 870, 45, 160, 50, { label: '← Início', bgColor: 'rgba(255,255,255,0.1)', textColor: '#ffffff', fontSize: 13, borderRadius: 12, actionType: 'navigate', navigateTarget: V.home, navigateTransition: 'slide-right' }),
      elv(V.promos, 'shape', 340, 130, 400, 50, { shapeType: 'rectangle', fill: '#ef4444', borderRadius: 999, borderColor: 'transparent', borderWidth: 0 }),
      elv(V.promos, 'text', 340, 138, 400, 36, { text: '⚡ OFERTAS DO DIA', fontSize: 17, fontWeight: 'bold', color: '#ffffff', align: 'center', fontFamily: 'Inter' }),
      elv(V.promos, 'carousel', 60, 220, 960, 500, {
        images: ['https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=960&h=500&fit=crop', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=960&h=500&fit=crop'],
        autoplay: true, interval: 4, borderRadius: 20, transition: 'slide',
      }),
      elv(V.promos, 'text', 60, 760, 960, 60, { text: 'Até 70% OFF', fontSize: 48, fontWeight: 'bold', color: '#ef4444', align: 'center', fontFamily: 'Inter' }),
      elv(V.promos, 'text', 60, 830, 960, 36, { text: 'Em mais de 50 lojas participantes', fontSize: 17, fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'center', fontFamily: 'Inter' }),
      ...[
        { emoji: '👟', name: 'Calçados', discount: '50% OFF', color: '#f59e0b' },
        { emoji: '👕', name: 'Moda', discount: '40% OFF', color: '#8b5cf6' },
        { emoji: '📱', name: 'Tech', discount: '30% OFF', color: '#3b82f6' },
      ].flatMap((item, i) => [
        elv(V.promos, 'shape', 60 + i * 330, 900, 300, 140, { shapeType: 'rectangle', fill: item.color + '12', borderRadius: 20, borderColor: item.color + '30', borderWidth: 1 }),
        elv(V.promos, 'text', 60 + i * 330, 920, 300, 44, { text: `${item.emoji} ${item.name}`, fontSize: 20, fontWeight: 'bold', color: '#ffffff', align: 'center', fontFamily: 'Inter' }),
        elv(V.promos, 'text', 60 + i * 330, 970, 300, 44, { text: item.discount, fontSize: 26, fontWeight: 'bold', color: item.color, align: 'center', fontFamily: 'Inter' }),
      ]),
      elv(V.promos, 'button', 200, 1100, 680, 72, { label: '🏪 Ver Lojas', bgColor: '#ef4444', textColor: '#ffffff', fontSize: 20, borderRadius: 999, actionType: 'navigate', navigateTarget: V.stores, navigateTransition: 'slide-left' }),
      elv(V.promos, 'qrcode', 420, 1250, 200, 200, { value: 'https://example.com/promos', fgColor: 'rgba(255,255,255,0.2)', bgColor: 'transparent' }),

      // ── ALIMENTAÇÃO ──
      elv(V.food, 'text', 60, 40, 800, 60, { text: '🍔 Praça de Alimentação', fontSize: 34, fontWeight: 'bold', color: '#ffffff', align: 'left', fontFamily: 'Inter' }),
      elv(V.food, 'button', 870, 45, 160, 50, { label: '← Início', bgColor: 'rgba(255,255,255,0.1)', textColor: '#ffffff', fontSize: 13, borderRadius: 12, actionType: 'navigate', navigateTarget: V.home, navigateTransition: 'slide-right' }),
      elv(V.food, 'text', 60, 110, 960, 36, { text: 'Piso 3 • 10h às 22h', fontSize: 16, fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'left', fontFamily: 'Inter' }),
      elv(V.food, 'catalog', 60, 170, 960, 1200, {
        title: '', titleColor: '#ffffff', titleSize: 0, bgColor: 'rgba(249,115,22,0.03)', borderRadius: 20,
        items: [
          { id: '1', name: 'Big Mac', description: 'O clássico', price: 'R$ 29,90', image: '', category: 'Fast Food', badge: '🔥', badgeColor: '#ef4444' },
          { id: '2', name: 'Açaí 500ml', description: 'Com frutas e granola', price: 'R$ 19,90', image: '', category: 'Saudável', badge: 'TOP', badgeColor: '#8b5cf6' },
          { id: '3', name: 'Pizza Napolitana', description: 'Massa artesanal', price: 'R$ 34,90', image: '', category: 'Italiana', badge: '', badgeColor: '' },
          { id: '4', name: 'Sushi Combo', description: '15 peças', price: 'R$ 49,90', image: '', category: 'Japonesa', badge: 'NOVO', badgeColor: '#22c55e' },
        ],
        columns: 2, gap: 12, cardBgColor: 'rgba(255,255,255,0.05)', cardBorderRadius: 16, accentColor: '#f97316',
        showPrice: true, showCategory: true, showSearch: true, showCategoryFilter: true, imageAspect: '1/1', priceColor: '#f97316', nameSize: 15, priceSize: 18,
      }),
      elv(V.food, 'map', 60, 1400, 960, 400, { lat: -23.5505, lng: -46.6333, zoom: 18, borderRadius: 20, label: 'Praça de Alimentação - Piso 3', labelColor: '#ffffff', labelSize: 14 }),

      // ── AJUDA ──
      elv(V.help, 'text', 60, 40, 800, 60, { text: '💬 Como podemos ajudar?', fontSize: 34, fontWeight: 'bold', color: '#ffffff', align: 'left', fontFamily: 'Inter' }),
      elv(V.help, 'button', 870, 45, 160, 50, { label: '← Início', bgColor: 'rgba(255,255,255,0.1)', textColor: '#ffffff', fontSize: 13, borderRadius: 12, actionType: 'navigate', navigateTarget: V.home, navigateTransition: 'slide-right' }),
      elv(V.help, 'text', 60, 110, 960, 36, { text: 'Digite sua pergunta ou escolha uma opção', fontSize: 16, fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'left', fontFamily: 'Inter' }),
      ...[
        { label: '📍 Onde fica...?', action: 'Encontrar loja' },
        { label: '🚗 Estacionamento', action: 'Info estacionamento' },
        { label: '♿ Acessibilidade', action: 'Recursos acessibilidade' },
        { label: '📞 SAC', action: 'Falar com atendente' },
      ].map((item, i) => elv(V.help, 'button', 60, 180 + i * 80, 960, 64, { label: item.label, bgColor: 'rgba(16,185,129,0.08)', textColor: '#ffffff', fontSize: 18, borderRadius: 16, action: item.action })),
      elv(V.help, 'chat', 60, 520, 960, 800, { placeholder: 'Pergunte sobre lojas, horários...', theme: 'dark' }),
      elv(V.help, 'clock', 380, 1380, 320, 60, { format: '24h', showDate: true, color: 'rgba(255,255,255,0.25)', fontSize: 20 }),
    ],
    selectedId: null,
    activeViewId: V.home,
    viewIdleTimeout: 45,
  };
})();

// ═══════════════════════════════════════════════════
// MP3. Clínica Médica (4 páginas)
// ═══════════════════════════════════════════════════
const mpClinic: CanvasState = (() => {
  _id = 0;
  const V = { home: 'v_clin_home', ticket: 'v_clin_ticket', depts: 'v_clin_depts', chat: 'v_clin_chat' };
  return {
    bgColor: '#0a1628',
    views: [
      { id: V.home, name: '🏠 Início', isDefault: true },
      { id: V.ticket, name: '🎫 Senha' },
      { id: V.depts, name: '🏥 Setores' },
      { id: V.chat, name: '💬 Assistente' },
    ],
    pageBgColors: { [V.home]: '#0a1628', [V.ticket]: '#0d1a2d', [V.depts]: '#0f172a', [V.chat]: '#111827' },
    elements: [
      // ── HOME ──
      elv(V.home, 'shape', 0, 0, 1080, 6, { shapeType: 'rectangle', fill: '#06b6d4', borderRadius: 0, borderColor: 'transparent', borderWidth: 0 }),
      elv(V.home, 'shape', 340, 80, 400, 280, { shapeType: 'circle', fill: 'rgba(6,182,212,0.06)', borderRadius: 200, borderColor: 'rgba(6,182,212,0.15)', borderWidth: 2 }),
      elv(V.home, 'icon', 420, 130, 240, 180, { icon: '🏥', size: 96, color: '#06b6d4' }),
      elv(V.home, 'text', 60, 400, 960, 80, { text: 'Clínica São Lucas', fontSize: 46, fontWeight: 'bold', color: '#ffffff', align: 'center', fontFamily: 'Inter' }),
      elv(V.home, 'text', 60, 500, 960, 40, { text: 'Cuidando da sua saúde com excelência', fontSize: 18, fontWeight: 'normal', color: 'rgba(6,182,212,0.7)', align: 'center', fontFamily: 'Inter' }),
      ...[
        { label: '🎫 Retirar Senha', desc: 'Atendimento e exames', color: '#06b6d4', target: V.ticket },
        { label: '🏥 Setores', desc: 'Encontre o setor', color: '#8b5cf6', target: V.depts },
        { label: '💬 Assistente', desc: 'Tire suas dúvidas', color: '#10b981', target: V.chat },
      ].flatMap((item, i) => {
        const y = 600 + i * 200;
        return [
          elv(V.home, 'shape', 100, y, 880, 170, { shapeType: 'rectangle', fill: item.color + '08', borderRadius: 20, borderColor: item.color + '20', borderWidth: 1 }),
          elv(V.home, 'text', 140, y + 30, 500, 50, { text: item.label, fontSize: 26, fontWeight: 'bold', color: '#ffffff', align: 'left', fontFamily: 'Inter' }),
          elv(V.home, 'text', 140, y + 85, 500, 30, { text: item.desc, fontSize: 15, fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'left', fontFamily: 'Inter' }),
          elv(V.home, 'button', 700, y + 55, 240, 50, { label: 'Acessar →', bgColor: item.color, textColor: '#ffffff', fontSize: 14, borderRadius: 999, actionType: 'navigate', navigateTarget: item.target, navigateTransition: 'slide-left' }),
        ];
      }),
      elv(V.home, 'clock', 60, 1280, 300, 60, { format: '24h', showDate: true, color: 'rgba(255,255,255,0.25)', fontSize: 20 }),
      elv(V.home, 'text', 60, 1400, 960, 30, { text: '📞 Emergência: (11) 3333-0000 | Seg-Sex 7h–19h', fontSize: 13, fontWeight: 'normal', color: 'rgba(255,255,255,0.2)', align: 'center', fontFamily: 'Inter' }),
      elv(V.home, 'qrcode', 440, 1740, 180, 160, { value: 'https://example.com/clinic', fgColor: 'rgba(255,255,255,0.12)', bgColor: 'transparent' }),

      // ── SENHA ──
      elv(V.ticket, 'text', 60, 40, 800, 60, { text: '🎫 Retirar Senha', fontSize: 34, fontWeight: 'bold', color: '#ffffff', align: 'left', fontFamily: 'Inter' }),
      elv(V.ticket, 'button', 870, 45, 160, 50, { label: '← Início', bgColor: 'rgba(255,255,255,0.1)', textColor: '#ffffff', fontSize: 13, borderRadius: 12, actionType: 'navigate', navigateTarget: V.home, navigateTransition: 'slide-right' }),
      elv(V.ticket, 'text', 60, 120, 960, 36, { text: 'Selecione o tipo de atendimento:', fontSize: 17, fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'left', fontFamily: 'Inter' }),
      ...[
        { label: '🩺 Consulta', prefix: 'C', color: '#06b6d4' },
        { label: '🔬 Exames', prefix: 'E', color: '#8b5cf6' },
        { label: '💉 Vacinas', prefix: 'V', color: '#f59e0b' },
        { label: '💊 Farmácia', prefix: 'F', color: '#10b981' },
      ].map((item, i) => elv(V.ticket, 'button', 100, 190 + i * 90, 880, 72, { label: item.label, bgColor: item.color + '15', textColor: '#ffffff', fontSize: 20, borderRadius: 16, action: item.label })),
      elv(V.ticket, 'ticket', 200, 580, 680, 420, { prefix: 'C', currentNumber: 127, bgColor: 'rgba(6,182,212,0.06)', textColor: '#ffffff', accentColor: '#06b6d4', fontSize: 80, borderRadius: 24, label: 'Sua senha', labelSize: 18, showPrint: true, printLabel: '🖨️ Imprimir Senha' }),
      elv(V.ticket, 'animated-number', 340, 1060, 400, 120, { value: 12, prefix: '', suffix: ' min', label: 'Tempo estimado', color: '#06b6d4', labelColor: 'rgba(255,255,255,0.4)', fontSize: 56, labelSize: 14, duration: 1500, useGrouping: false }),

      // ── SETORES ──
      elv(V.depts, 'text', 60, 40, 800, 60, { text: '🏥 Setores', fontSize: 34, fontWeight: 'bold', color: '#ffffff', align: 'left', fontFamily: 'Inter' }),
      elv(V.depts, 'button', 870, 45, 160, 50, { label: '← Início', bgColor: 'rgba(255,255,255,0.1)', textColor: '#ffffff', fontSize: 13, borderRadius: 12, actionType: 'navigate', navigateTarget: V.home, navigateTransition: 'slide-right' }),
      elv(V.depts, 'store', 60, 120, 960, 1200, {
        title: '', titleColor: '#ffffff', titleSize: 0, bgColor: 'rgba(6,182,212,0.03)', borderRadius: 20,
        stores: [
          { id: '1', name: 'Clínica Geral', logo: '', floor: 'Térreo', category: 'Consulta', hours: '7h–19h', phone: 'Ramal 100', description: 'Consultas gerais' },
          { id: '2', name: 'Cardiologia', logo: '', floor: '1º Andar', category: 'Especialidade', hours: '8h–18h', phone: 'Ramal 201', description: 'Exames cardiológicos' },
          { id: '3', name: 'Laboratório', logo: '', floor: 'Térreo', category: 'Exames', hours: '6h–17h', phone: 'Ramal 150', description: 'Coleta e análises' },
          { id: '4', name: 'Ortopedia', logo: '', floor: '2º Andar', category: 'Especialidade', hours: '8h–18h', phone: 'Ramal 301', description: 'Ossos e articulações' },
          { id: '5', name: 'Pediatria', logo: '', floor: '1º Andar', category: 'Consulta', hours: '8h–18h', phone: 'Ramal 202', description: 'Atendimento infantil' },
          { id: '6', name: 'Farmácia', logo: '', floor: 'Térreo', category: 'Serviço', hours: '7h–19h', phone: 'Ramal 120', description: 'Medicamentos' },
        ],
        columns: 1, gap: 10, cardBgColor: 'rgba(255,255,255,0.04)', cardBorderRadius: 14, accentColor: '#06b6d4',
        showCategory: true, showHours: true, showPhone: true, showFloor: true, showCategoryFilter: true, showSearch: true,
      }),
      elv(V.depts, 'map', 60, 1360, 960, 460, { lat: -23.5505, lng: -46.6333, zoom: 17, borderRadius: 20, label: 'Clínica São Lucas', labelColor: '#ffffff', labelSize: 14 }),

      // ── ASSISTENTE ──
      elv(V.chat, 'text', 60, 40, 800, 60, { text: '💬 Assistente Virtual', fontSize: 34, fontWeight: 'bold', color: '#ffffff', align: 'left', fontFamily: 'Inter' }),
      elv(V.chat, 'button', 870, 45, 160, 50, { label: '← Início', bgColor: 'rgba(255,255,255,0.1)', textColor: '#ffffff', fontSize: 13, borderRadius: 12, actionType: 'navigate', navigateTarget: V.home, navigateTransition: 'slide-right' }),
      ...[
        { label: '🕐 Horários', action: 'Horários' },
        { label: '💳 Convênios', action: 'Convênios' },
        { label: '🔬 Preparo exames', action: 'Preparo exame' },
      ].map((item, i) => elv(V.chat, 'button', 60, 130 + i * 70, 960, 56, { label: item.label, bgColor: 'rgba(16,185,129,0.08)', textColor: '#ffffff', fontSize: 16, borderRadius: 14, action: item.action })),
      elv(V.chat, 'chat', 60, 360, 960, 900, { placeholder: 'Pergunte sobre a clínica...', theme: 'dark' }),
    ],
    selectedId: null,
    activeViewId: V.home,
    viewIdleTimeout: 45,
  };
})();

// ═══════════════════════════════════════════════════
// MP4. Hotel Completo (4 páginas)
// ═══════════════════════════════════════════════════
const mpHotel: CanvasState = (() => {
  _id = 0;
  const V = { home: 'v_htl_home', checkin: 'v_htl_checkin', services: 'v_htl_services', tourism: 'v_htl_tourism' };
  return {
    bgColor: '#1a1007',
    views: [
      { id: V.home, name: '🏠 Lobby', isDefault: true },
      { id: V.checkin, name: '🔑 Check-in' },
      { id: V.services, name: '🛎️ Serviços' },
      { id: V.tourism, name: '🗺️ Turismo' },
    ],
    pageBgColors: { [V.home]: '#1a1007', [V.checkin]: '#0f1419', [V.services]: '#0d0806', [V.tourism]: '#0a1628' },
    elements: [
      // ── LOBBY ──
      elv(V.home, 'shape', 0, 0, 1080, 480, { shapeType: 'rectangle', fill: '#78350f', borderRadius: 0, borderColor: 'transparent', borderWidth: 0 }, { opacity: 0.2 }),
      elv(V.home, 'icon', 420, 80, 240, 180, { icon: '🏨', size: 96, color: '#f59e0b' }),
      elv(V.home, 'text', 60, 300, 960, 80, { text: 'Grand Palace', fontSize: 52, fontWeight: 'bold', color: '#ffffff', align: 'center', fontFamily: 'Inter' }),
      elv(V.home, 'text', 60, 400, 960, 40, { text: 'Luxury Resort & Spa ⭐⭐⭐⭐⭐', fontSize: 20, fontWeight: 'normal', color: 'rgba(245,158,11,0.6)', align: 'center', fontFamily: 'Inter' }),
      ...[
        { label: '🔑 Check-in Digital', desc: 'Rápido e sem fila', color: '#f59e0b', target: V.checkin },
        { label: '🛎️ Serviços', desc: 'Room service, spa', color: '#8b5cf6', target: V.services },
        { label: '🗺️ Turismo', desc: 'Pontos turísticos', color: '#3b82f6', target: V.tourism },
      ].flatMap((item, i) => {
        const y = 520 + i * 180;
        return [
          elv(V.home, 'shape', 100, y, 880, 150, { shapeType: 'rectangle', fill: item.color + '08', borderRadius: 20, borderColor: item.color + '20', borderWidth: 1 }),
          elv(V.home, 'text', 140, y + 25, 500, 46, { text: item.label, fontSize: 24, fontWeight: 'bold', color: '#ffffff', align: 'left', fontFamily: 'Inter' }),
          elv(V.home, 'text', 140, y + 75, 500, 30, { text: item.desc, fontSize: 14, fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'left', fontFamily: 'Inter' }),
          elv(V.home, 'button', 700, y + 45, 240, 50, { label: 'Acessar →', bgColor: item.color, textColor: '#ffffff', fontSize: 14, borderRadius: 999, actionType: 'navigate', navigateTarget: item.target, navigateTransition: 'slide-left' }),
        ];
      }),
      elv(V.home, 'weather', 60, 1100, 480, 80, { city: 'Rio de Janeiro', units: 'metric', color: 'rgba(255,255,255,0.35)' }),
      elv(V.home, 'clock', 600, 1100, 420, 80, { format: '24h', showDate: true, color: 'rgba(255,255,255,0.3)', fontSize: 24 }),
      elv(V.home, 'text', 60, 1240, 960, 30, { text: 'WiFi: GrandPalace_Guest | Senha: welcome2026', fontSize: 14, fontWeight: 'normal', color: 'rgba(255,255,255,0.25)', align: 'center', fontFamily: 'Inter' }),
      elv(V.home, 'qrcode', 440, 1740, 180, 160, { value: 'https://example.com/hotel', fgColor: 'rgba(255,255,255,0.12)', bgColor: 'transparent' }),

      // ── CHECK-IN ──
      elv(V.checkin, 'text', 60, 40, 800, 60, { text: '🔑 Check-in Digital', fontSize: 34, fontWeight: 'bold', color: '#ffffff', align: 'left', fontFamily: 'Inter' }),
      elv(V.checkin, 'button', 870, 45, 160, 50, { label: '← Lobby', bgColor: 'rgba(255,255,255,0.1)', textColor: '#ffffff', fontSize: 13, borderRadius: 12, actionType: 'navigate', navigateTarget: V.home, navigateTransition: 'slide-right' }),
      elv(V.checkin, 'form', 100, 140, 880, 620, {
        title: 'Dados do Hóspede', titleColor: '#ffffff', titleSize: 22, bgColor: 'rgba(245,158,11,0.04)', borderRadius: 24,
        fields: [
          { id: '1', type: 'text', label: 'Nome completo', placeholder: 'Seu nome', required: true },
          { id: '2', type: 'text', label: 'Nº da Reserva', placeholder: 'Ex: HTL-12345', required: true },
          { id: '3', type: 'email', label: 'E-mail', placeholder: 'seu@email.com', required: true },
          { id: '4', type: 'select', label: 'Tipo de quarto', placeholder: 'Selecione...', options: 'Standard, Luxo, Suíte, Penthouse', required: false },
        ],
        submitLabel: '🔑 Realizar Check-in', submitBgColor: '#f59e0b', submitTextColor: '#ffffff', accentColor: '#f59e0b', fieldBgColor: 'rgba(255,255,255,0.06)', fieldTextColor: '#ffffff', successMessage: 'Check-in realizado! 🎉',
      }),
      elv(V.checkin, 'numpad', 200, 810, 680, 560, { label: 'Ou digite o CPF', placeholder: '000.000.000-00', bgColor: 'rgba(245,158,11,0.04)', textColor: '#ffffff', accentColor: '#f59e0b', borderRadius: 24, maxLength: 11, mask: 'cpf', buttonLabel: 'Buscar reserva' }),

      // ── SERVIÇOS ──
      elv(V.services, 'text', 60, 40, 800, 60, { text: '🛎️ Serviços', fontSize: 34, fontWeight: 'bold', color: '#ffffff', align: 'left', fontFamily: 'Inter' }),
      elv(V.services, 'button', 870, 45, 160, 50, { label: '← Lobby', bgColor: 'rgba(255,255,255,0.1)', textColor: '#ffffff', fontSize: 13, borderRadius: 12, actionType: 'navigate', navigateTarget: V.home, navigateTransition: 'slide-right' }),
      elv(V.services, 'list', 60, 130, 960, 800, {
        listTitle: '🛎️ Serviços Disponíveis', bgColor: 'rgba(139,92,246,0.04)', borderRadius: 20,
        titleSize: 20, titleColor: '#8b5cf6', priceColor: '#8b5cf6', showIcon: true, showPrice: true, showDivider: true,
        items: [
          { id: '1', title: 'Room Service', subtitle: 'Cardápio 24h', price: '', icon: '🍽️' },
          { id: '2', title: 'Spa & Massagem', subtitle: '8h às 20h', price: 'R$ 180+', icon: '🧖' },
          { id: '3', title: 'Piscina & Fitness', subtitle: '6h às 22h', price: 'Incluso', icon: '🏊' },
          { id: '4', title: 'Lavanderia Express', subtitle: 'Entrega em 4h', price: 'R$ 50+', icon: '👔' },
          { id: '5', title: 'Transfer', subtitle: 'Reservar 24h antes', price: 'R$ 120', icon: '🚗' },
          { id: '6', title: 'Concierge', subtitle: 'Reservas e tours', price: 'Incluso', icon: '🎩' },
        ],
      }),
      elv(V.services, 'chat', 60, 970, 960, 500, { placeholder: 'Peça algo ou tire dúvidas...', theme: 'dark' }),

      // ── TURISMO ──
      elv(V.tourism, 'text', 60, 40, 800, 60, { text: '🗺️ Pontos Turísticos', fontSize: 34, fontWeight: 'bold', color: '#ffffff', align: 'left', fontFamily: 'Inter' }),
      elv(V.tourism, 'button', 870, 45, 160, 50, { label: '← Lobby', bgColor: 'rgba(255,255,255,0.1)', textColor: '#ffffff', fontSize: 13, borderRadius: 12, actionType: 'navigate', navigateTarget: V.home, navigateTransition: 'slide-right' }),
      elv(V.tourism, 'catalog', 60, 130, 960, 900, {
        title: '', titleColor: '#ffffff', titleSize: 0, bgColor: 'rgba(59,130,246,0.03)', borderRadius: 20,
        items: [
          { id: '1', name: 'Cristo Redentor', description: '7 Maravilhas do Mundo', price: '~30 min', image: '', category: 'Histórico', badge: '⭐', badgeColor: '#f59e0b' },
          { id: '2', name: 'Pão de Açúcar', description: 'Vista panorâmica', price: '~25 min', image: '', category: 'Natureza', badge: 'TOP', badgeColor: '#22c55e' },
          { id: '3', name: 'Copacabana', description: 'Praia mais famosa', price: '~10 min', image: '', category: 'Praia', badge: '', badgeColor: '' },
          { id: '4', name: 'Jardim Botânico', description: 'Flora tropical', price: '~20 min', image: '', category: 'Natureza', badge: '', badgeColor: '' },
          { id: '5', name: 'Escadaria Selarón', description: 'Mosaico colorido', price: '~15 min', image: '', category: 'Cultural', badge: '📸', badgeColor: '#ec4899' },
        ],
        columns: 2, gap: 12, cardBgColor: 'rgba(255,255,255,0.05)', cardBorderRadius: 16, accentColor: '#3b82f6',
        showPrice: true, showCategory: true, showSearch: true, showCategoryFilter: true, imageAspect: '4/3', priceColor: '#3b82f6', nameSize: 15, priceSize: 14,
      }),
      elv(V.tourism, 'map', 60, 1070, 960, 500, { lat: -22.9068, lng: -43.1729, zoom: 13, borderRadius: 20, label: 'Rio de Janeiro', labelColor: '#ffffff', labelSize: 14 }),
    ],
    selectedId: null,
    activeViewId: V.home,
    viewIdleTimeout: 60,
  };
})();

// ═══════════════════════════════════════════════════
// MP5. Evento / Conferência (3 páginas)
// ═══════════════════════════════════════════════════
const mpEvent: CanvasState = (() => {
  _id = 0;
  const V = { home: 'v_evt_home', schedule: 'v_evt_schedule', info: 'v_evt_info' };
  return {
    bgColor: '#0a0a1a',
    views: [
      { id: V.home, name: '🏠 Evento', isDefault: true },
      { id: V.schedule, name: '📋 Programação' },
      { id: V.info, name: 'ℹ️ Informações' },
    ],
    pageBgColors: { [V.home]: '#0a0a1a', [V.schedule]: '#0f0a1e', [V.info]: '#111827' },
    elements: [
      // ── EVENTO HOME ──
      elv(V.home, 'shape', 0, 0, 1080, 500, { shapeType: 'rectangle', fill: '#4c1d95', borderRadius: 0, borderColor: 'transparent', borderWidth: 0 }, { opacity: 0.3 }),
      elv(V.home, 'shape', 300, 60, 480, 60, { shapeType: 'rectangle', fill: '#a855f7', borderRadius: 999, borderColor: 'transparent', borderWidth: 0 }),
      elv(V.home, 'text', 300, 68, 480, 44, { text: '🎤 AO VIVO • 2026', fontSize: 18, fontWeight: 'bold', color: '#ffffff', align: 'center', fontFamily: 'Inter' }),
      elv(V.home, 'text', 60, 160, 960, 100, { text: 'Tech Summit', fontSize: 64, fontWeight: 'bold', color: '#ffffff', align: 'center', fontFamily: 'Inter' }),
      elv(V.home, 'text', 60, 280, 960, 50, { text: 'São Paulo • 21 a 23 de Fevereiro', fontSize: 22, fontWeight: 'normal', color: 'rgba(168,85,247,0.8)', align: 'center', fontFamily: 'Inter' }),
      elv(V.home, 'countdown', 200, 380, 680, 100, { targetDate: '2026-02-23T18:00:00', label: 'Próxima palestra em', color: '#a855f7', fontSize: 32 }),
      ...[
        { label: '📋 Programação', desc: 'Palestras e workshops', color: '#a855f7', target: V.schedule },
        { label: 'ℹ️ Informações', desc: 'WiFi, mapa, alimentação', color: '#3b82f6', target: V.info },
      ].flatMap((item, i) => {
        const y = 540 + i * 180;
        return [
          elv(V.home, 'shape', 100, y, 880, 150, { shapeType: 'rectangle', fill: item.color + '08', borderRadius: 20, borderColor: item.color + '20', borderWidth: 1 }),
          elv(V.home, 'text', 140, y + 25, 500, 46, { text: item.label, fontSize: 22, fontWeight: 'bold', color: '#ffffff', align: 'left', fontFamily: 'Inter' }),
          elv(V.home, 'text', 140, y + 75, 500, 30, { text: item.desc, fontSize: 14, fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'left', fontFamily: 'Inter' }),
          elv(V.home, 'button', 700, y + 45, 240, 50, { label: 'Ver →', bgColor: item.color, textColor: '#ffffff', fontSize: 14, borderRadius: 999, actionType: 'navigate', navigateTarget: item.target, navigateTransition: 'slide-left' }),
        ];
      }),
      // Speakers
      elv(V.home, 'text', 60, 940, 960, 50, { text: '🎙️ Speakers', fontSize: 22, fontWeight: 'bold', color: '#ffffff', align: 'center', fontFamily: 'Inter' }),
      ...[
        { name: 'Ana Silva', role: 'CEO TechCorp', color: '#ec4899' },
        { name: 'Carlos Santos', role: 'CTO FinBank', color: '#3b82f6' },
        { name: 'Marina Costa', role: 'VP Google BR', color: '#10b981' },
      ].flatMap((s, i) => [
        elv(V.home, 'shape', 60 + i * 340, 1020, 310, 110, { shapeType: 'rectangle', fill: s.color + '10', borderRadius: 16, borderColor: s.color + '25', borderWidth: 1 }),
        elv(V.home, 'text', 60 + i * 340, 1040, 310, 36, { text: s.name, fontSize: 17, fontWeight: 'bold', color: '#ffffff', align: 'center', fontFamily: 'Inter' }),
        elv(V.home, 'text', 60 + i * 340, 1080, 310, 30, { text: s.role, fontSize: 12, fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'center', fontFamily: 'Inter' }),
      ]),
      elv(V.home, 'social', 260, 1200, 560, 60, { links: [{ id: '1', platform: 'instagram', label: '@techsummit', url: '', color: '#E1306C' }], iconSize: 28, gap: 20, showLabels: true, layout: 'horizontal' }),
      elv(V.home, 'qrcode', 400, 1320, 240, 240, { value: 'https://example.com/event', fgColor: 'rgba(168,85,247,0.4)', bgColor: 'transparent' }),
      elv(V.home, 'text', 300, 1580, 480, 26, { text: 'Escaneie para o app do evento', fontSize: 13, fontWeight: 'normal', color: 'rgba(255,255,255,0.2)', align: 'center', fontFamily: 'Inter' }),

      // ── PROGRAMAÇÃO ──
      elv(V.schedule, 'text', 60, 40, 800, 60, { text: '📋 Programação', fontSize: 34, fontWeight: 'bold', color: '#ffffff', align: 'left', fontFamily: 'Inter' }),
      elv(V.schedule, 'button', 870, 45, 160, 50, { label: '← Início', bgColor: 'rgba(255,255,255,0.1)', textColor: '#ffffff', fontSize: 13, borderRadius: 12, actionType: 'navigate', navigateTarget: V.home, navigateTransition: 'slide-right' }),
      elv(V.schedule, 'text', 60, 110, 960, 36, { text: 'Dia 1 — 21 de Fevereiro', fontSize: 18, fontWeight: 'bold', color: '#a855f7', align: 'left', fontFamily: 'Inter' }),
      ...[
        { time: '09:00', title: 'Abertura e Keynote', speaker: 'Ana Silva', room: 'Auditório Principal' },
        { time: '10:30', title: 'IA Generativa no Varejo', speaker: 'Carlos Santos', room: 'Sala A' },
        { time: '14:00', title: 'O Futuro dos Pagamentos', speaker: 'Marina Costa', room: 'Sala B' },
        { time: '15:30', title: 'Workshop: Prompt Engineering', speaker: 'Pedro Lima', room: 'Lab 1' },
        { time: '17:00', title: 'Painel: Transformação Digital', speaker: 'Diversos', room: 'Auditório' },
        { time: '18:30', title: 'Happy Hour & Networking', speaker: '', room: 'Lounge' },
      ].flatMap((item, i) => {
        const y = 170 + i * 130;
        return [
          elv(V.schedule, 'shape', 80, y, 920, 110, { shapeType: 'rectangle', fill: 'rgba(168,85,247,0.05)', borderRadius: 16, borderColor: 'rgba(168,85,247,0.1)', borderWidth: 1 }),
          elv(V.schedule, 'text', 110, y + 10, 160, 36, { text: item.time, fontSize: 22, fontWeight: 'bold', color: '#a855f7', align: 'left', fontFamily: 'Inter' }),
          elv(V.schedule, 'text', 280, y + 10, 700, 36, { text: item.title, fontSize: 18, fontWeight: 'bold', color: '#ffffff', align: 'left', fontFamily: 'Inter' }),
          elv(V.schedule, 'text', 280, y + 48, 700, 26, { text: item.speaker ? `🎙️ ${item.speaker}` : '', fontSize: 13, fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', align: 'left', fontFamily: 'Inter' }),
          elv(V.schedule, 'text', 280, y + 76, 700, 22, { text: `📍 ${item.room}`, fontSize: 11, fontWeight: 'normal', color: 'rgba(168,85,247,0.5)', align: 'left', fontFamily: 'Inter' }),
        ];
      }),
      elv(V.schedule, 'button', 140, 970, 800, 72, { label: 'ℹ️ Informações do Evento', bgColor: 'rgba(168,85,247,0.12)', textColor: '#ffffff', fontSize: 18, borderRadius: 16, actionType: 'navigate', navigateTarget: V.info, navigateTransition: 'slide-left' }),

      // ── INFORMAÇÕES ──
      elv(V.info, 'text', 60, 40, 800, 60, { text: 'ℹ️ Informações', fontSize: 34, fontWeight: 'bold', color: '#ffffff', align: 'left', fontFamily: 'Inter' }),
      elv(V.info, 'button', 870, 45, 160, 50, { label: '← Início', bgColor: 'rgba(255,255,255,0.1)', textColor: '#ffffff', fontSize: 13, borderRadius: 12, actionType: 'navigate', navigateTarget: V.home, navigateTransition: 'slide-right' }),
      elv(V.info, 'list', 60, 130, 960, 600, {
        listTitle: '📌 Informações Úteis', bgColor: 'rgba(59,130,246,0.04)', borderRadius: 20,
        titleSize: 18, titleColor: '#3b82f6', priceColor: '#3b82f6', showIcon: true, showPrice: false, showDivider: true,
        items: [
          { id: '1', title: 'WiFi', subtitle: 'Rede: TechSummit2026 | Senha: connect2026', price: '', icon: '📶' },
          { id: '2', title: 'Alimentação', subtitle: 'Praça de alimentação no Piso 2', price: '', icon: '🍔' },
          { id: '3', title: 'Estacionamento', subtitle: 'Subsolo -1 e -2 | Validar no balcão', price: '', icon: '🚗' },
          { id: '4', title: 'Credenciamento', subtitle: 'Hall de entrada, 8h–17h', price: '', icon: '🎫' },
          { id: '5', title: 'Primeiros Socorros', subtitle: 'Sala 15, Piso 1', price: '', icon: '🏥' },
        ],
      }),
      elv(V.info, 'map', 60, 760, 960, 500, { lat: -23.5636, lng: -46.6544, zoom: 16, borderRadius: 20, label: 'Centro de Convenções', labelColor: '#ffffff', labelSize: 14 }),
      elv(V.info, 'chat', 60, 1300, 960, 500, { placeholder: 'Pergunte sobre o evento...', theme: 'dark' }),
    ],
    selectedId: null,
    activeViewId: V.home,
    viewIdleTimeout: 60,
  };
})();


// ═══════════════════════════════════════════════════
// Store Welcome (Figma-inspired light theme)
// Layout: Logo+Name(40) | HelpBtn(40) | TouchIcon(380) | Title(620) | Subtitle(740) | CTA(920) | LangBar(1740)
// ═══════════════════════════════════════════════════
const storeWelcome: CanvasState = (() => {
  _id = 0;
  return {
    bgColor: '#fdf2f2',
    elements: [
      // ── Background gradient shape (full canvas) ──
      el('shape', 0, 0, 1080, 1920, {
        shapeType: 'rectangle', fill: 'linear-gradient(180deg, #ffffff 0%, #fef2f2 40%, #fce4e4 70%, #f5f5f5 100%)',
        borderRadius: 0, borderColor: 'transparent', borderWidth: 0,
      }, { name: 'BG Gradiente', zIndex: 0 }),

      // ── Top bar: Logo icon ──
      el('shape', 50, 40, 56, 56, {
        shapeType: 'rectangle', fill: '#dc2626', borderRadius: 14,
        borderColor: 'transparent', borderWidth: 0,
      }, { name: 'Logo BG' }),
      el('icon', 54, 44, 48, 48, { icon: '🏪', size: 28, color: '#ffffff' }, { name: 'Logo Icon' }),

      // ── Store name text ──
      el('text', 120, 46, 300, 48, {
        text: 'StoreName', fontSize: 24, fontWeight: 'bold',
        color: '#1f2937', align: 'left', fontFamily: 'Inter',
      }, { name: 'Nome da Loja' }),

      // ── Need Help? button (top-right) ──
      el('button', 830, 40, 200, 56, {
        label: '❓ Need Help?', bgColor: '#ffffff', textColor: '#374151',
        fontSize: 15, borderRadius: 28, actionType: 'prompt',
        action: 'Preciso de ajuda', borderColor: '#e5e7eb', borderWidth: 1,
        shadow: 'sm',
      }, { name: 'Btn Ajuda' }),

      // ── Touch icon circle background ──
      el('shape', 370, 300, 340, 340, {
        shapeType: 'circle', fill: 'rgba(254,202,202,0.35)', borderRadius: 170,
        borderColor: 'transparent', borderWidth: 0,
      }, { name: 'Circle BG' }),
      el('shape', 430, 360, 220, 220, {
        shapeType: 'circle', fill: 'rgba(254,202,202,0.5)', borderRadius: 110,
        borderColor: 'transparent', borderWidth: 0,
      }, { name: 'Circle Inner' }),
      el('icon', 480, 410, 120, 120, { icon: '👆', size: 72, color: '#dc2626' }, { name: 'Touch Icon' }),

      // ── Main title ──
      el('text', 90, 700, 900, 100, {
        text: 'Welcome to our Store', fontSize: 56, fontWeight: 'bold',
        color: '#111827', align: 'center', fontFamily: 'Inter',
      }, { name: 'Título Principal' }),

      // ── Subtitle ──
      el('text', 160, 820, 760, 80, {
        text: "We're glad to see you. Tap the button below to browse our catalog and place your order quickly.",
        fontSize: 20, fontWeight: 'normal',
        color: '#6b7280', align: 'center', fontFamily: 'Inter',
      }, { name: 'Subtítulo' }),

      // ── Big CTA button ──
      el('bigcta', 240, 960, 600, 120, {
        label: 'Tap to Start', sublabel: '', icon: '→',
        bgColor: '#dc2626', textColor: '#ffffff',
        fontSize: 32, sublabelSize: 14, borderRadius: 60, pulse: true,
      }, { name: 'CTA Principal' }),

      // ── Language selector section ──
      el('text', 50, 1760, 200, 40, {
        text: 'SELECT LANGUAGE:', fontSize: 12, fontWeight: 'bold',
        color: '#9ca3af', align: 'left', fontFamily: 'Inter',
      }, { name: 'Label Idioma' }),

      // Language buttons
      el('button', 260, 1748, 190, 56, {
        label: '🇺🇸 English', bgColor: '#ffffff', textColor: '#dc2626',
        fontSize: 15, borderRadius: 28, actionType: 'prompt',
        action: 'Switch language to English', borderColor: '#dc2626', borderWidth: 2,
        shadow: 'none',
      }, { name: 'Btn English' }),
      el('button', 470, 1748, 200, 56, {
        label: '🇧🇷 Português', bgColor: '#ffffff', textColor: '#374151',
        fontSize: 15, borderRadius: 28, actionType: 'prompt',
        action: 'Switch language to Portuguese', borderColor: '#e5e7eb', borderWidth: 1,
        shadow: 'none',
      }, { name: 'Btn Português' }),
      el('button', 690, 1748, 190, 56, {
        label: '🇪🇸 Español', bgColor: '#ffffff', textColor: '#374151',
        fontSize: 15, borderRadius: 28, actionType: 'prompt',
        action: 'Switch language to Spanish', borderColor: '#e5e7eb', borderWidth: 1,
        shadow: 'none',
      }, { name: 'Btn Español' }),

      // ── Accessibility buttons (bottom-right) ──
      el('button', 920, 1748, 56, 56, {
        label: '◑', bgColor: '#ffffff', textColor: '#374151',
        fontSize: 22, borderRadius: 28, actionType: 'prompt',
        action: 'Toggle high contrast mode', borderColor: '#e5e7eb', borderWidth: 1,
        shadow: 'none',
      }, { name: 'Btn Contraste' }),
      el('button', 990, 1748, 56, 56, {
        label: 'A+', bgColor: '#ffffff', textColor: '#374151',
        fontSize: 16, borderRadius: 28, actionType: 'prompt',
        action: 'Increase font size', borderColor: '#e5e7eb', borderWidth: 1,
        shadow: 'none', fontWeight: 'bold',
      }, { name: 'Btn Font Size' }),
    ],
    selectedId: null,
    views: [{ id: '__default__', name: 'Home', isDefault: true }],
    activeViewId: '__default__',
    viewIdleTimeout: 30,
    pageBgColors: {},
  };
})();


// ═══════════════════════════════════════════════════
// Shopping Avatar Directory (matches reference design)
// Layout: Avatar(0-400) → Handle(410) → Search(440-490) → Filters(510-560) → Store(580-1680) → BottomNav(1740-1860)
// ═══════════════════════════════════════════════════
const shoppingAvatarDirectory: CanvasState = (() => {
  _id = 0;
  return {
    bgColor: '#0c1020',
    elements: [
      // ── Hero Avatar Area ──
      // Dark gradient background behind avatar
      el('shape', 140, 0, 800, 400, {
        shapeType: 'rectangle', fill: '#111827', borderRadius: 20,
        borderColor: 'rgba(99,102,241,0.15)', borderWidth: 1,
      }),
      // Avatar 3D
      el('avatar', 240, -30, 600, 400, {
        position: 'center', scale: 1.8, animation: 'idle', enabled: true,
        avatarUrl: '/models/avatar.glb', animationsUrl: '/models/animations.glb',
        colors: { shirt: '#5BA4C9', pants: '#1e293b', shoes: '#000000' },
        frameY: -10, frameZoom: 55,
      }),
      // Avatar greeting overlay text
      el('text', 200, 310, 680, 50, {
        text: 'Olá! Posso ajudar?', fontSize: 32, fontWeight: 'bold',
        color: '#ffffff', align: 'center', fontFamily: 'Inter',
      }),
      el('text', 200, 360, 680, 30, {
        text: 'Toque abaixo para encontrar sua loja', fontSize: 16, fontWeight: 'normal',
        color: 'rgba(255,255,255,0.5)', align: 'center', fontFamily: 'Inter',
      }),
      // Handle indicator (small pill)
      el('shape', 470, 410, 140, 6, {
        shapeType: 'rectangle', fill: 'rgba(255,255,255,0.15)', borderRadius: 999,
        borderColor: 'transparent', borderWidth: 0,
      }),

      // ── Search Bar ──
      el('shape', 60, 440, 960, 56, {
        shapeType: 'rectangle', fill: 'rgba(255,255,255,0.06)', borderRadius: 16,
        borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
      }),
      el('text', 110, 452, 700, 32, {
        text: '🔍  Buscar loja, categoria ou piso...', fontSize: 16, fontWeight: 'normal',
        color: 'rgba(255,255,255,0.35)', align: 'left', fontFamily: 'Inter',
      }),
      el('icon', 940, 455, 40, 30, { icon: '🎤', size: 22, color: 'rgba(255,255,255,0.4)' }),

      // ── Category Filter Pills ──
      el('button', 60, 516, 120, 42, {
        label: 'Todas', bgColor: '#6366f1',
        textColor: '#ffffff', fontSize: 14, borderRadius: 999, actionType: 'prompt', action: '',
      }),
      el('button', 200, 516, 120, 42, {
        label: 'Moda', bgColor: 'rgba(255,255,255,0.06)',
        textColor: 'rgba(255,255,255,0.7)', fontSize: 14, borderRadius: 999, actionType: 'prompt', action: '',
      }),
      el('button', 340, 516, 170, 42, {
        label: 'Gastronomia', bgColor: 'rgba(255,255,255,0.06)',
        textColor: 'rgba(255,255,255,0.7)', fontSize: 14, borderRadius: 999, actionType: 'prompt', action: '',
      }),
      el('button', 530, 516, 140, 42, {
        label: 'Serviços', bgColor: 'rgba(255,255,255,0.06)',
        textColor: 'rgba(255,255,255,0.7)', fontSize: 14, borderRadius: 999, actionType: 'prompt', action: '',
      }),
      el('button', 690, 516, 130, 42, {
        label: 'Cinema', bgColor: 'rgba(255,255,255,0.06)',
        textColor: 'rgba(255,255,255,0.7)', fontSize: 14, borderRadius: 999, actionType: 'prompt', action: '',
      }),

      // ── Store Directory ──
      el('store', 60, 580, 960, 1100, {
        title: '',
        titleColor: '#ffffff',
        titleSize: 0,
        bgColor: 'transparent',
        borderRadius: 0,
        stores: [
          { id: '1', name: 'Zara Fashion', logo: '', coverImage: '', gallery: [], floor: 'Piso L2', category: 'Moda', hours: '10h–22h', phone: '', description: 'Roupas femininas, masculinas e infantis.', mapX: 50, mapY: 30, zone: '' },
          { id: '2', name: 'Madero Steakhouse', logo: '', coverImage: '', gallery: [], floor: 'Piso L3', category: 'Gastronomia', hours: '11h–23h', phone: '', description: 'O melhor hambúrguer do mundo.', mapX: 30, mapY: 60, zone: '' },
          { id: '3', name: 'iPlace', logo: '', coverImage: '', gallery: [], floor: 'Piso L1', category: 'Tecnologia', hours: '10h–22h', phone: '', description: 'Revendedor Autorizado Apple.', mapX: 70, mapY: 40, zone: '' },
          { id: '4', name: 'Sephora', logo: '', coverImage: '', gallery: [], floor: 'Piso L1', category: 'Beleza', hours: '10h–22h', phone: '', description: 'Maquiagem, perfumes e skincare.', mapX: 40, mapY: 50, zone: '' },
          { id: '5', name: 'Renner', logo: '', coverImage: '', gallery: [], floor: 'Piso L2', category: 'Moda', hours: '10h–22h', phone: '', description: 'Moda para todos os estilos.', mapX: 60, mapY: 70, zone: '' },
        ],
        columns: 1,
        gap: 14,
        cardBgColor: 'rgba(255,255,255,0.04)',
        cardBorderRadius: 16,
        accentColor: '#6366f1',
        showCategory: true,
        showHours: false,
        showPhone: false,
        showFloor: true,
        showCategoryFilter: false,
        showSearch: false,
      }),

      // ── Bottom Navigation Bar ──
      // Nav background
      el('shape', 0, 1740, 1080, 180, {
        shapeType: 'rectangle', fill: '#0c1020', borderRadius: 0,
        borderColor: 'rgba(255,255,255,0.06)', borderWidth: 0,
      }),
      // Top border line
      el('shape', 0, 1740, 1080, 1, {
        shapeType: 'rectangle', fill: 'rgba(255,255,255,0.06)', borderRadius: 0,
        borderColor: 'transparent', borderWidth: 0,
      }),
      // Nav items (4 columns: Lojas, Mapa, Cinema, Estacionamento)
      el('icon', 100, 1770, 60, 40, { icon: '🏪', size: 28, color: '#6366f1' }),
      el('text', 60, 1815, 140, 28, {
        text: 'Lojas', fontSize: 13, fontWeight: 'bold',
        color: '#6366f1', align: 'center', fontFamily: 'Inter',
      }),

      el('icon', 345, 1770, 60, 40, { icon: '🗺️', size: 28, color: 'rgba(255,255,255,0.4)' }),
      el('text', 305, 1815, 140, 28, {
        text: 'Mapa', fontSize: 13, fontWeight: 'normal',
        color: 'rgba(255,255,255,0.4)', align: 'center', fontFamily: 'Inter',
      }),

      el('icon', 590, 1770, 60, 40, { icon: '🎬', size: 28, color: 'rgba(255,255,255,0.4)' }),
      el('text', 550, 1815, 140, 28, {
        text: 'Cinema', fontSize: 13, fontWeight: 'normal',
        color: 'rgba(255,255,255,0.4)', align: 'center', fontFamily: 'Inter',
      }),

      el('icon', 840, 1770, 60, 40, { icon: '🅿️', size: 28, color: 'rgba(255,255,255,0.4)' }),
      el('text', 790, 1815, 160, 28, {
        text: 'Estacionamento', fontSize: 13, fontWeight: 'normal',
        color: 'rgba(255,255,255,0.4)', align: 'center', fontFamily: 'Inter',
      }),
    ],
    selectedId: null,
    views: [{ id: '__default__', name: 'Home', isDefault: true }],
    activeViewId: '__default__',
    viewIdleTimeout: 30,
    pageBgColors: {},
  };
})();


// ═══════════════════════════════════════════════════
// MP6. Shopping AI Assistant (4 páginas) — baseado no design de referência
// Páginas: Lojas (home) → Categorias → Mapa → Eventos
// ═══════════════════════════════════════════════════
const mpShoppingAI: CanvasState = (() => {
  _id = 0;
  const V = {
    home: 'v_sai_home',
    categorias: 'v_sai_cats',
    mapa: 'v_sai_mapa',
    chat: 'v_sai_chat',
  };

  // Bottom nav helper
  const bottomNav = (currentView: string) => {
    const tabs = [
      { icon: '🏪', label: 'Lojas', target: V.home },
      { icon: '📂', label: 'Categorias', target: V.categorias },
      { icon: '🗺️', label: 'Mapa', target: V.mapa },
      { icon: '💬', label: 'Chat IA', target: V.chat },
    ];
    const navY = 1800;
    const tabW = 230;
    return [
      elv(currentView, 'shape', 0, navY - 10, 1080, 130, {
        shapeType: 'rectangle', fill: 'rgba(0,0,0,0.85)', borderRadius: 0,
        borderColor: 'transparent', borderWidth: 0,
      }),
      ...tabs.flatMap((tab, i) => {
        const x = 30 + i * (tabW + 15);
        const active = currentView === tab.target;
        return [
          elv(currentView, 'button', x, navY + 10, tabW, 80, {
            label: `${tab.icon} ${tab.label}`,
            bgColor: active ? '#3b82f6' : 'transparent',
            textColor: active ? '#ffffff' : 'rgba(255,255,255,0.5)',
            fontSize: 14, borderRadius: 16,
            actionType: 'navigate' as any,
            navigateTarget: tab.target,
            navigateTransition: 'fade' as any,
          }),
        ];
      }),
    ];
  };

  return {
    bgColor: '#0f172a',
    views: [
      { id: V.home, name: '🏪 Home', isDefault: true },
      { id: V.categorias, name: '📂 Categorias' },
      { id: V.mapa, name: '🗺️ Mapa' },
      { id: V.chat, name: '💬 Chat IA' },
    ],
    pageBgColors: {
      [V.home]: '#0a0a14',
      [V.categorias]: '#0f172a',
      [V.mapa]: '#0f172a',
      [V.chat]: '#0f172a',
    },
    elements: [
      // ══════════════════════════════════════════════
      // PÁGINA 1 — HOME (imagem de fundo + overlays editáveis)
      // ══════════════════════════════════════════════

      // Imagem de fundo completa
      elv(V.home, 'image', 0, 0, 1080, 1920, {
        src: '/templates/shopping-ai-bg.png',
        objectFit: 'cover',
        borderRadius: 0,
      }, { locked: true, name: 'Fundo (imagem)' }),

      // Overlay escuro no topo para legibilidade
      elv(V.home, 'shape', 0, 0, 1080, 140, {
        shapeType: 'rectangle', fill: 'rgba(0,0,0,0.5)', borderRadius: 0,
        borderColor: 'transparent', borderWidth: 0,
      }, { name: 'Header overlay' }),

      // Título editável
      elv(V.home, 'text', 60, 40, 600, 60, {
        text: 'SHOPPING ASSISTANT AI', fontSize: 22, fontWeight: 'bold',
        color: '#ffffff', align: 'left', fontFamily: 'Inter',
      }, { name: 'Título' }),

      // Horário editável
      elv(V.home, 'text', 700, 45, 320, 50, {
        text: '🕐 10h – 22h', fontSize: 18, fontWeight: 'normal',
        color: 'rgba(255,255,255,0.7)', align: 'right', fontFamily: 'Inter',
      }, { name: 'Horário' }),

      // Barra de busca flutuante
      elv(V.home, 'shape', 60, 160, 960, 70, {
        shapeType: 'rectangle', fill: 'rgba(255,255,255,0.95)', borderRadius: 20,
        borderColor: 'rgba(0,0,0,0.1)', borderWidth: 1,
      }, { name: 'Busca fundo' }),
      elv(V.home, 'text', 100, 175, 700, 40, {
        text: '🔍 Buscar loja, produto ou serviço...', fontSize: 16, fontWeight: 'normal',
        color: 'rgba(0,0,0,0.35)', align: 'left', fontFamily: 'Inter',
      }, { name: 'Busca texto' }),

      // Botão microfone
      elv(V.home, 'button', 930, 170, 60, 50, {
        label: '🎤', bgColor: '#3b82f6', textColor: '#ffffff',
        fontSize: 20, borderRadius: 14,
      }, { name: 'Mic' }),

      // Overlay na parte inferior para cards
      elv(V.home, 'shape', 0, 1200, 1080, 600, {
        shapeType: 'rectangle', fill: 'rgba(0,0,0,0.7)', borderRadius: 40,
        borderColor: 'transparent', borderWidth: 0,
      }, { name: 'Cards overlay' }),

      // Seção "Lojas em destaque"
      elv(V.home, 'text', 60, 1230, 600, 50, {
        text: '⭐ Lojas em destaque', fontSize: 24, fontWeight: 'bold',
        color: '#ffffff', align: 'left', fontFamily: 'Inter',
      }, { name: 'Seção título' }),

      // Card 1
      elv(V.home, 'shape', 60, 1310, 460, 200, {
        shapeType: 'rectangle', fill: 'rgba(255,255,255,0.08)', borderRadius: 20,
        borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1,
      }, { name: 'Card 1 bg' }),
      elv(V.home, 'text', 100, 1340, 380, 40, {
        text: '👗 Zara', fontSize: 22, fontWeight: 'bold',
        color: '#ffffff', align: 'left', fontFamily: 'Inter',
      }, { name: 'Card 1 nome' }),
      elv(V.home, 'text', 100, 1390, 380, 36, {
        text: 'Moda Feminina e Masculina', fontSize: 14, fontWeight: 'normal',
        color: 'rgba(255,255,255,0.5)', align: 'left', fontFamily: 'Inter',
      }, { name: 'Card 1 desc' }),
      elv(V.home, 'text', 100, 1440, 200, 30, {
        text: '● ABERTO', fontSize: 13, fontWeight: 'bold',
        color: '#22c55e', align: 'left', fontFamily: 'Inter',
      }, { name: 'Card 1 status' }),

      // Card 2
      elv(V.home, 'shape', 560, 1310, 460, 200, {
        shapeType: 'rectangle', fill: 'rgba(255,255,255,0.08)', borderRadius: 20,
        borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1,
      }, { name: 'Card 2 bg' }),
      elv(V.home, 'text', 600, 1340, 380, 40, {
        text: '📱 Apple Store', fontSize: 22, fontWeight: 'bold',
        color: '#ffffff', align: 'left', fontFamily: 'Inter',
      }, { name: 'Card 2 nome' }),
      elv(V.home, 'text', 600, 1390, 380, 36, {
        text: 'Eletrônicos e Acessórios', fontSize: 14, fontWeight: 'normal',
        color: 'rgba(255,255,255,0.5)', align: 'left', fontFamily: 'Inter',
      }, { name: 'Card 2 desc' }),
      elv(V.home, 'text', 600, 1440, 200, 30, {
        text: '● ABERTO', fontSize: 13, fontWeight: 'bold',
        color: '#22c55e', align: 'left', fontFamily: 'Inter',
      }, { name: 'Card 2 status' }),

      // Card 3
      elv(V.home, 'shape', 60, 1540, 460, 200, {
        shapeType: 'rectangle', fill: 'rgba(255,255,255,0.08)', borderRadius: 20,
        borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1,
      }, { name: 'Card 3 bg' }),
      elv(V.home, 'text', 100, 1570, 380, 40, {
        text: '☕ Starbucks', fontSize: 22, fontWeight: 'bold',
        color: '#ffffff', align: 'left', fontFamily: 'Inter',
      }, { name: 'Card 3 nome' }),
      elv(V.home, 'text', 100, 1620, 380, 36, {
        text: 'Cafés e Bebidas Especiais', fontSize: 14, fontWeight: 'normal',
        color: 'rgba(255,255,255,0.5)', align: 'left', fontFamily: 'Inter',
      }, { name: 'Card 3 desc' }),
      elv(V.home, 'text', 100, 1670, 200, 30, {
        text: '● ABERTO', fontSize: 13, fontWeight: 'bold',
        color: '#22c55e', align: 'left', fontFamily: 'Inter',
      }, { name: 'Card 3 status' }),

      // Card 4
      elv(V.home, 'shape', 560, 1540, 460, 200, {
        shapeType: 'rectangle', fill: 'rgba(255,255,255,0.08)', borderRadius: 20,
        borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1,
      }, { name: 'Card 4 bg' }),
      elv(V.home, 'text', 600, 1570, 380, 40, {
        text: '👟 Nike', fontSize: 22, fontWeight: 'bold',
        color: '#ffffff', align: 'left', fontFamily: 'Inter',
      }, { name: 'Card 4 nome' }),
      elv(V.home, 'text', 600, 1620, 380, 36, {
        text: 'Artigos Esportivos', fontSize: 14, fontWeight: 'normal',
        color: 'rgba(255,255,255,0.5)', align: 'left', fontFamily: 'Inter',
      }, { name: 'Card 4 desc' }),
      elv(V.home, 'text', 600, 1670, 200, 30, {
        text: '● 12h', fontSize: 13, fontWeight: 'bold',
        color: '#f59e0b', align: 'left', fontFamily: 'Inter',
      }, { name: 'Card 4 status' }),

      ...bottomNav(V.home),

      // ══════════════════════════════════════════════
      // PÁGINA 2 — CATEGORIAS
      // ══════════════════════════════════════════════

      elv(V.categorias, 'text', 60, 50, 800, 60, {
        text: '📂 Categorias', fontSize: 38, fontWeight: 'bold',
        color: '#ffffff', align: 'left', fontFamily: 'Inter',
      }),
      elv(V.categorias, 'text', 60, 120, 960, 36, {
        text: 'Encontre lojas por segmento', fontSize: 16, fontWeight: 'normal',
        color: 'rgba(255,255,255,0.4)', align: 'left', fontFamily: 'Inter',
      }),

      ...[
        { icon: '👗', name: 'Moda', count: '24 lojas', color: '#ec4899' },
        { icon: '🍔', name: 'Alimentação', count: '18 lojas', color: '#f97316' },
        { icon: '📱', name: 'Tecnologia', count: '12 lojas', color: '#3b82f6' },
        { icon: '💊', name: 'Saúde', count: '8 lojas', color: '#10b981' },
        { icon: '🎮', name: 'Lazer', count: '10 lojas', color: '#8b5cf6' },
        { icon: '🏋️', name: 'Esportes', count: '6 lojas', color: '#ef4444' },
        { icon: '💇', name: 'Beleza', count: '14 lojas', color: '#f59e0b' },
        { icon: '🛎️', name: 'Serviços', count: '20 lojas', color: '#06b6d4' },
      ].flatMap((cat, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 60 + col * 500;
        const y = 190 + row * 380;
        return [
          elv(V.categorias, 'shape', x, y, 460, 340, {
            shapeType: 'rectangle', fill: cat.color + '10', borderRadius: 24,
            borderColor: cat.color + '25', borderWidth: 1,
          }),
          elv(V.categorias, 'icon', x + 190, y + 50, 80, 80, {
            icon: cat.icon, size: 44, color: cat.color,
          }),
          elv(V.categorias, 'text', x + 20, y + 160, 420, 50, {
            text: cat.name, fontSize: 24, fontWeight: 'bold',
            color: '#ffffff', align: 'center', fontFamily: 'Inter',
          }),
          elv(V.categorias, 'text', x + 20, y + 220, 420, 36, {
            text: cat.count, fontSize: 15, fontWeight: 'normal',
            color: 'rgba(255,255,255,0.4)', align: 'center', fontFamily: 'Inter',
          }),
          elv(V.categorias, 'button', x + 80, y + 270, 300, 44, {
            label: 'Ver lojas →', bgColor: cat.color + '20', textColor: cat.color,
            fontSize: 13, borderRadius: 999, actionType: 'navigate' as any,
            navigateTarget: V.home, navigateTransition: 'slide-left' as any,
          }),
        ];
      }),

      ...bottomNav(V.categorias),

      // ══════════════════════════════════════════════
      // PÁGINA 3 — MAPA
      // ══════════════════════════════════════════════

      elv(V.mapa, 'text', 60, 50, 800, 60, {
        text: '🗺️ Mapa do Shopping', fontSize: 38, fontWeight: 'bold',
        color: '#ffffff', align: 'left', fontFamily: 'Inter',
      }),

      elv(V.mapa, 'store', 60, 150, 960, 1000, {
        title: '', titleColor: '#ffffff', titleSize: 0,
        bgColor: 'rgba(0,0,0,0.3)', borderRadius: 24,
        stores: [
          { id: '1', name: 'Zara', logo: '', floor: 'Piso 1', category: 'Moda', hours: '10h–22h', phone: '', description: 'Moda', mapX: 25, mapY: 30 },
          { id: '2', name: 'Apple Store', logo: '', floor: 'Piso 2', category: 'Tech', hours: '10h–22h', phone: '', description: 'Eletrônicos', mapX: 70, mapY: 25 },
          { id: '3', name: 'Starbucks', logo: '', floor: 'Piso 1', category: 'Food', hours: '9h–22h', phone: '', description: 'Café', mapX: 50, mapY: 60 },
        ],
        columns: 1, gap: 10, enableMap: true,
        cardBgColor: 'rgba(255,255,255,0.06)', cardBorderRadius: 14,
        accentColor: '#3b82f6', pinColor: '#3b82f6', pinSize: 28,
        showCategory: true, showHours: true, showFloor: true,
        showCategoryFilter: false, showSearch: false,
      }),

      ...[
        { label: 'Piso 1', active: true },
        { label: 'Piso 2', active: false },
        { label: 'Piso 3', active: false },
      ].map((floor, i) =>
        elv(V.mapa, 'button', 60 + i * 330, 1200, 300, 56, {
          label: floor.label,
          bgColor: floor.active ? '#3b82f6' : 'rgba(255,255,255,0.06)',
          textColor: floor.active ? '#ffffff' : 'rgba(255,255,255,0.5)',
          fontSize: 16, borderRadius: 16,
        })
      ),

      ...bottomNav(V.mapa),

      // ══════════════════════════════════════════════
      // PÁGINA 4 — CHAT IA
      // ══════════════════════════════════════════════

      elv(V.chat, 'text', 60, 50, 800, 60, {
        text: '💬 Assistente IA', fontSize: 38, fontWeight: 'bold',
        color: '#ffffff', align: 'left', fontFamily: 'Inter',
      }),
      elv(V.chat, 'text', 60, 120, 960, 36, {
        text: 'Pergunte qualquer coisa sobre o shopping', fontSize: 16, fontWeight: 'normal',
        color: 'rgba(255,255,255,0.4)', align: 'left', fontFamily: 'Inter',
      }),

      // Avatar
      elv(V.chat, 'avatar', 290, 180, 500, 500, {
        position: 'center', scale: 1.5, animation: 'idle', enabled: true,
        avatarUrl: '/models/avatar.glb', animationsUrl: '/models/animations.glb',
        colors: { shirt: '#3b82f6', pants: '#1e293b', shoes: '#111827' },
        frameY: -5, frameZoom: 55, transparentBg: true,
      }),

      // Chat completo
      elv(V.chat, 'chat', 60, 720, 960, 1000, {
        placeholder: 'Pergunte sobre lojas, eventos, horários...', theme: 'dark',
      }),

      ...bottomNav(V.chat),
    ],
    selectedId: null,
    activeViewId: V.home,
    viewIdleTimeout: 45,
  };
})();


// ═══════════════════════════════════════════════════
// Multi-page HTML Pure template
// ═══════════════════════════════════════════════════
const htmlMultiPageContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background:#0a0a1a; color:#fff; width:1080px; height:1920px; overflow:hidden; }
  [data-page] { display:none; width:100%; height:100%; position:absolute; top:0; left:0; flex-direction:column; }
  [data-page].active { display:flex; }
  .header { padding:40px 60px 20px; }
  .header h1 { font-size:36px; font-weight:800; }
  .header p { font-size:16px; opacity:0.6; margin-top:8px; }
  .content { flex:1; padding:20px 60px; overflow:auto; }
  .nav-bar { display:flex; justify-content:space-around; padding:20px 40px 40px; background:rgba(255,255,255,0.05); border-top:1px solid rgba(255,255,255,0.1); }
  .nav-btn { display:flex; flex-direction:column; align-items:center; gap:6px; background:none; border:none; color:#fff; opacity:0.5; cursor:pointer; font-size:12px; }
  .nav-btn.active { opacity:1; color:#818cf8; }
  .nav-btn span.icon { font-size:24px; }
  .card { background:rgba(255,255,255,0.08); border-radius:16px; padding:24px; margin-bottom:16px; border:1px solid rgba(255,255,255,0.06); }
  .card h3 { font-size:20px; font-weight:700; margin-bottom:8px; }
  .card p { font-size:14px; opacity:0.7; line-height:1.5; }
  .card img { width:100%; height:200px; object-fit:cover; border-radius:12px; margin-bottom:16px; }
  .hero-img { width:100%; height:320px; object-fit:cover; border-radius:0 0 24px 24px; }
  .badge { display:inline-block; padding:6px 16px; border-radius:20px; font-size:13px; font-weight:600; margin:4px; }
  .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .cta-btn { width:100%; padding:18px; border-radius:14px; border:none; font-size:18px; font-weight:700; cursor:pointer; margin-top:16px; }
</style>
<script>
  function goPage(id) {
    document.querySelectorAll('[data-page]').forEach(p => p.classList.remove('active'));
    const target = document.querySelector('[data-page="'+id+'"]');
    if (target) target.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.target === id);
    });
  }
  document.addEventListener('DOMContentLoaded', () => goPage('home'));
</script>
</head>
<body>

  <div data-page="home" data-name="Início" class="active">
    <img class="hero-img" src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1080&h=320&fit=crop" alt="Shopping">
    <div class="header">
      <h1>🏬 Shopping Center</h1>
      <p>Bem-vindo! Explore nossas lojas e promoções.</p>
    </div>
    <div class="content">
      <div class="card">
        <h3>✨ Promoção do Dia</h3>
        <p>Até 50% OFF em eletrônicos e moda. Válido somente hoje!</p>
        <button class="cta-btn" style="background:#818cf8;color:#fff" onclick="goPage('promos')">Ver Promoções →</button>
      </div>
      <div class="grid-2">
        <div class="card" onclick="goPage('lojas')" style="cursor:pointer">
          <h3>🏪</h3>
          <p>Diretório de Lojas</p>
        </div>
        <div class="card" onclick="goPage('servicos')" style="cursor:pointer">
          <h3>🍽️</h3>
          <p>Serviços</p>
        </div>
      </div>
    </div>
    <nav class="nav-bar">
      <button class="nav-btn active" data-target="home" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
      <button class="nav-btn" data-target="lojas" onclick="goPage('lojas')"><span class="icon">🏪</span>Lojas</button>
      <button class="nav-btn" data-target="promos" onclick="goPage('promos')"><span class="icon">🔥</span>Promos</button>
      <button class="nav-btn" data-target="servicos" onclick="goPage('servicos')"><span class="icon">⚙️</span>Serviços</button>
    </nav>
  </div>

  <div data-page="lojas" data-name="Lojas">
    <div class="header">
      <h1>🏪 Diretório de Lojas</h1>
      <p>Encontre a loja perfeita para você</p>
    </div>
    <div class="content">
      <div class="card">
        <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=200&fit=crop" alt="Moda">
        <h3>Fashion Store</h3>
        <p>Moda feminina e masculina — Piso 1, Loja 102</p>
        <span class="badge" style="background:rgba(129,140,248,0.2);color:#818cf8">Moda</span>
      </div>
      <div class="card">
        <img src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&h=200&fit=crop" alt="Tech">
        <h3>TechWorld</h3>
        <p>Eletrônicos e acessórios — Piso 2, Loja 205</p>
        <span class="badge" style="background:rgba(52,211,153,0.2);color:#34d399">Eletrônicos</span>
      </div>
      <div class="card">
        <img src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&h=200&fit=crop" alt="Casa">
        <h3>Casa & Decoração</h3>
        <p>Móveis e decoração para seu lar — Piso 1, Loja 115</p>
        <span class="badge" style="background:rgba(251,191,36,0.2);color:#fbbf24">Casa</span>
      </div>
    </div>
    <nav class="nav-bar">
      <button class="nav-btn" data-target="home" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
      <button class="nav-btn active" data-target="lojas" onclick="goPage('lojas')"><span class="icon">🏪</span>Lojas</button>
      <button class="nav-btn" data-target="promos" onclick="goPage('promos')"><span class="icon">🔥</span>Promos</button>
      <button class="nav-btn" data-target="servicos" onclick="goPage('servicos')"><span class="icon">⚙️</span>Serviços</button>
    </nav>
  </div>

  <div data-page="promos" data-name="Promoções">
    <div class="header">
      <h1>🔥 Promoções Imperdíveis</h1>
      <p>Ofertas exclusivas do dia</p>
    </div>
    <div class="content">
      <div class="card" style="background:linear-gradient(135deg, rgba(129,140,248,0.3), rgba(168,85,247,0.3)); border-color:rgba(129,140,248,0.3)">
        <h3>⚡ Flash Sale — Eletrônicos</h3>
        <p>Smartphones, tablets e notebooks com até 40% de desconto. Corra, estoque limitado!</p>
        <span class="badge" style="background:#818cf8;color:#fff">-40%</span>
      </div>
      <div class="card" style="background:linear-gradient(135deg, rgba(248,113,113,0.3), rgba(251,146,60,0.3)); border-color:rgba(248,113,113,0.3)">
        <h3>👗 Liquidação de Moda</h3>
        <p>Coleção verão com preços irresistíveis. Compre 2 e leve 3!</p>
        <span class="badge" style="background:#f87171;color:#fff">Leve 3 Pague 2</span>
      </div>
      <div class="card" style="background:linear-gradient(135deg, rgba(52,211,153,0.3), rgba(59,130,246,0.3)); border-color:rgba(52,211,153,0.3)">
        <h3>🍔 Gastronomia</h3>
        <p>Praça de alimentação com combos a partir de R$19,90 hoje!</p>
        <span class="badge" style="background:#34d399;color:#000">R$19,90</span>
      </div>
    </div>
    <nav class="nav-bar">
      <button class="nav-btn" data-target="home" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
      <button class="nav-btn" data-target="lojas" onclick="goPage('lojas')"><span class="icon">🏪</span>Lojas</button>
      <button class="nav-btn active" data-target="promos" onclick="goPage('promos')"><span class="icon">🔥</span>Promos</button>
      <button class="nav-btn" data-target="servicos" onclick="goPage('servicos')"><span class="icon">⚙️</span>Serviços</button>
    </nav>
  </div>

  <div data-page="servicos" data-name="Serviços">
    <div class="header">
      <h1>⚙️ Serviços</h1>
      <p>Tudo que você precisa em um só lugar</p>
    </div>
    <div class="content">
      <div class="grid-2">
        <div class="card" style="text-align:center">
          <h3 style="font-size:36px">🅿️</h3>
          <p style="font-weight:600;margin-top:8px">Estacionamento</p>
          <p style="font-size:12px;margin-top:4px">2h grátis</p>
        </div>
        <div class="card" style="text-align:center">
          <h3 style="font-size:36px">🚻</h3>
          <p style="font-weight:600;margin-top:8px">Banheiros</p>
          <p style="font-size:12px;margin-top:4px">Todos os pisos</p>
        </div>
        <div class="card" style="text-align:center">
          <h3 style="font-size:36px">📶</h3>
          <p style="font-weight:600;margin-top:8px">Wi-Fi Grátis</p>
          <p style="font-size:12px;margin-top:4px">Shopping_Free</p>
        </div>
        <div class="card" style="text-align:center">
          <h3 style="font-size:36px">🛎️</h3>
          <p style="font-weight:600;margin-top:8px">Concierge</p>
          <p style="font-size:12px;margin-top:4px">Piso Térreo</p>
        </div>
      </div>
      <div class="card" style="margin-top:16px">
        <h3>📞 Central de Atendimento</h3>
        <p>Precisa de ajuda? Fale conosco pelo telefone (11) 3000-0000 ou visite a Central no Piso Térreo.</p>
      </div>
    </div>
    <nav class="nav-bar">
      <button class="nav-btn" data-target="home" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
      <button class="nav-btn" data-target="lojas" onclick="goPage('lojas')"><span class="icon">🏪</span>Lojas</button>
      <button class="nav-btn" data-target="promos" onclick="goPage('promos')"><span class="icon">🔥</span>Promos</button>
      <button class="nav-btn active" data-target="servicos" onclick="goPage('servicos')"><span class="icon">⚙️</span>Serviços</button>
    </nav>
  </div>

</body>
</html>`;

const mpHtmlShopping: CanvasState = {
  bgColor: '#0a0a1a',
  elements: [
    {
      id: eid(),
      type: 'iframe',
      x: 0, y: 0,
      width: 1080, height: 1920,
      rotation: 0, zIndex: 1, opacity: 1,
      locked: false, visible: true,
      name: 'HTML Multi-Página',
      props: {
        htmlContent: htmlMultiPageContent,
        borderRadius: 0,
        scrolling: false,
        htmlPages: [
          { id: 'page_0', name: 'Início', selector: '[data-page="home"]' },
          { id: 'page_1', name: 'Lojas', selector: '[data-page="lojas"]' },
          { id: 'page_2', name: 'Promoções', selector: '[data-page="promos"]' },
          { id: 'page_3', name: 'Serviços', selector: '[data-page="servicos"]' },
        ],
      },
    },
  ],
  selectedId: null,
  views: [
    { id: 'page_0', name: 'Início', isDefault: true },
    { id: 'page_1', name: 'Lojas', isDefault: false },
    { id: 'page_2', name: 'Promoções', isDefault: false },
    { id: 'page_3', name: 'Serviços', isDefault: false },
  ],
  activeViewId: 'page_0',
  viewIdleTimeout: 30,
  pageBgColors: {},
};

// ═══════════════════════════════════════════════════
// HTML Templates — Restaurante / Pizzaria
// ═══════════════════════════════════════════════════
const htmlRestaurantContent = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#1a0f0a;color:#fff;width:1080px;height:1920px;overflow:hidden}
[data-page]{display:none;width:100%;height:100%;position:absolute;top:0;left:0;flex-direction:column}
[data-page].active{display:flex}
.header{padding:50px 60px 24px;background:linear-gradient(180deg,rgba(234,88,12,0.25),transparent)}
.header h1{font-size:38px;font-weight:800;color:#fb923c}
.header p{font-size:16px;opacity:0.5;margin-top:8px}
.content{flex:1;padding:16px 60px;overflow:auto}
.nav-bar{display:flex;justify-content:space-around;padding:20px 40px 44px;background:rgba(0,0,0,0.6);border-top:1px solid rgba(251,146,60,0.15)}
.nav-btn{display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;color:#fff;opacity:0.4;cursor:pointer;font-size:12px;transition:all .2s}
.nav-btn.active{opacity:1;color:#fb923c}
.nav-btn span.icon{font-size:26px}
.card{background:rgba(255,255,255,0.06);border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid rgba(251,146,60,0.1)}
.card h3{font-size:20px;font-weight:700;margin-bottom:8px}
.card p{font-size:14px;opacity:0.7;line-height:1.5}
.hero-img{width:100%;height:340px;object-fit:cover}
.menu-item{display:flex;justify-content:space-between;align-items:center;padding:18px 0;border-bottom:1px solid rgba(255,255,255,0.06)}
.menu-item:last-child{border:none}
.menu-item .info h4{font-size:18px;font-weight:600}
.menu-item .info p{font-size:13px;opacity:0.5;margin-top:4px}
.menu-item .price{font-size:20px;font-weight:800;color:#fb923c;white-space:nowrap}
.section-title{font-size:22px;font-weight:700;color:#fb923c;margin:24px 0 12px;display:flex;align-items:center;gap:10px}
.cta-btn{width:100%;padding:18px;border-radius:14px;border:none;font-size:18px;font-weight:700;cursor:pointer;margin-top:16px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.badge{display:inline-block;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:600}
.rating{color:#fbbf24;font-size:14px;letter-spacing:2px;margin-top:8px}
</style>
<script>
function goPage(id){
  document.querySelectorAll('[data-page]').forEach(p=>p.classList.remove('active'));
  var t=document.querySelector('[data-page="'+id+'"]');if(t)t.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.target===id));
}
document.addEventListener('DOMContentLoaded',()=>goPage('home'));
</script></head><body>

<div data-page="home" data-name="Início" class="active">
  <img class="hero-img" src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1080&h=340&fit=crop" alt="Pizza">
  <div class="header"><h1>🍕 Pizzaria Napoli</h1><p>A melhor pizza artesanal da cidade</p></div>
  <div class="content">
    <div class="card">
      <h3>🔥 Pizza do Dia</h3>
      <p>Margherita Trufada — Massa artesanal, molho San Marzano, mozzarella de búfala e trufa negra.</p>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px">
        <div><span style="text-decoration:line-through;opacity:0.4;font-size:14px">R$ 69,90</span><span style="font-size:24px;font-weight:800;color:#fb923c;margin-left:12px">R$ 49,90</span></div>
        <span class="badge" style="background:#fb923c;color:#fff">-29%</span>
      </div>
    </div>
    <div class="grid-2">
      <div class="card" style="cursor:pointer;text-align:center" data-navigate="page_1" onclick="goPage('cardapio')">
        <div style="font-size:36px;margin-bottom:8px">📋</div><p style="font-weight:600">Cardápio</p>
      </div>
      <div class="card" style="cursor:pointer;text-align:center" data-navigate="page_2" onclick="goPage('pedido')">
        <div style="font-size:36px;margin-bottom:8px">🛒</div><p style="font-weight:600">Fazer Pedido</p>
      </div>
    </div>
    <div class="rating">★★★★★</div>
    <p style="font-size:12px;opacity:0.4;margin-top:4px">4.8 — 2.340 avaliações no Google</p>
  </div>
  <nav class="nav-bar">
    <button class="nav-btn active" data-target="home" data-navigate="page_0" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
    <button class="nav-btn" data-target="cardapio" data-navigate="page_1" onclick="goPage('cardapio')"><span class="icon">📋</span>Cardápio</button>
    <button class="nav-btn" data-target="pedido" data-navigate="page_2" onclick="goPage('pedido')"><span class="icon">🛒</span>Pedido</button>
    <button class="nav-btn" data-target="sobre" data-navigate="page_3" onclick="goPage('sobre')"><span class="icon">ℹ️</span>Sobre</button>
  </nav>
</div>

<div data-page="cardapio" data-name="Cardápio">
  <div class="header"><h1>📋 Cardápio</h1><p>Ingredientes selecionados, massa artesanal</p></div>
  <div class="content">
    <div class="section-title">🍕 Pizzas Tradicionais</div>
    <div class="menu-item"><div class="info"><h4>Margherita</h4><p>Molho, mozzarella, manjericão</p></div><div class="price">R$ 42</div></div>
    <div class="menu-item"><div class="info"><h4>Calabresa</h4><p>Calabresa, cebola, azeitona</p></div><div class="price">R$ 45</div></div>
    <div class="menu-item"><div class="info"><h4>Quatro Queijos</h4><p>Mozzarella, gorgonzola, parmesão, brie</p></div><div class="price">R$ 52</div></div>
    <div class="section-title">🥩 Pizzas Especiais</div>
    <div class="menu-item"><div class="info"><h4>Filé Mignon</h4><p>Filé, catupiry, rúcula</p></div><div class="price">R$ 62</div></div>
    <div class="menu-item"><div class="info"><h4>Camarão</h4><p>Camarão, catupiry, tomate seco</p></div><div class="price">R$ 68</div></div>
    <div class="section-title">🥤 Bebidas</div>
    <div class="menu-item"><div class="info"><h4>Refrigerante 600ml</h4><p>Coca-Cola, Guaraná, Fanta</p></div><div class="price">R$ 10</div></div>
    <div class="menu-item"><div class="info"><h4>Suco Natural</h4><p>Laranja, limão, maracujá</p></div><div class="price">R$ 14</div></div>
  </div>
  <nav class="nav-bar">
    <button class="nav-btn" data-target="home" data-navigate="page_0" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
    <button class="nav-btn active" data-target="cardapio" data-navigate="page_1" onclick="goPage('cardapio')"><span class="icon">📋</span>Cardápio</button>
    <button class="nav-btn" data-target="pedido" data-navigate="page_2" onclick="goPage('pedido')"><span class="icon">🛒</span>Pedido</button>
    <button class="nav-btn" data-target="sobre" data-navigate="page_3" onclick="goPage('sobre')"><span class="icon">ℹ️</span>Sobre</button>
  </nav>
</div>

<div data-page="pedido" data-name="Pedido">
  <div class="header"><h1>🛒 Fazer Pedido</h1><p>Monte seu pedido e retire no balcão</p></div>
  <div class="content">
    <div class="card" style="background:linear-gradient(135deg,rgba(251,146,60,0.2),rgba(234,88,12,0.1));border-color:rgba(251,146,60,0.2)">
      <h3>📲 Peça pelo WhatsApp</h3>
      <p>Envie seu pedido diretamente para a cozinha. Rápido e prático!</p>
      <button class="cta-btn" style="background:#25d366;color:#fff">💬 Abrir WhatsApp</button>
    </div>
    <div class="card">
      <h3>🏪 Retire no Balcão</h3>
      <p>Faça seu pedido no totem e retire quando estiver pronto. Tempo médio: 20 minutos.</p>
      <button class="cta-btn" style="background:#fb923c;color:#fff">🍕 Começar Pedido</button>
    </div>
    <div class="card">
      <h3>💳 Formas de Pagamento</h3>
      <div style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap">
        <span class="badge" style="background:rgba(255,255,255,0.1)">💳 Cartão</span>
        <span class="badge" style="background:rgba(255,255,255,0.1)">📱 Pix</span>
        <span class="badge" style="background:rgba(255,255,255,0.1)">💵 Dinheiro</span>
      </div>
    </div>
  </div>
  <nav class="nav-bar">
    <button class="nav-btn" data-target="home" data-navigate="page_0" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
    <button class="nav-btn" data-target="cardapio" data-navigate="page_1" onclick="goPage('cardapio')"><span class="icon">📋</span>Cardápio</button>
    <button class="nav-btn active" data-target="pedido" data-navigate="page_2" onclick="goPage('pedido')"><span class="icon">🛒</span>Pedido</button>
    <button class="nav-btn" data-target="sobre" data-navigate="page_3" onclick="goPage('sobre')"><span class="icon">ℹ️</span>Sobre</button>
  </nav>
</div>

<div data-page="sobre" data-name="Sobre">
  <div class="header"><h1>ℹ️ Sobre Nós</h1><p>Tradição italiana desde 1998</p></div>
  <div class="content">
    <img src="https://images.unsplash.com/photo-1579751626657-72bc17010498?w=960&h=280&fit=crop" alt="Interior" style="width:100%;height:280px;object-fit:cover;border-radius:16px;margin-bottom:20px">
    <div class="card"><h3>📍 Endereço</h3><p>Rua das Pizzas, 42 — Centro<br>São Paulo — SP</p></div>
    <div class="card"><h3>🕐 Horário</h3><p>Seg a Sex: 18h às 23h<br>Sáb e Dom: 11h às 23h</p></div>
    <div class="card"><h3>📞 Contato</h3><p>WhatsApp: (11) 99999-0000<br>Instagram: @pizzarianapoli</p></div>
  </div>
  <nav class="nav-bar">
    <button class="nav-btn" data-target="home" data-navigate="page_0" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
    <button class="nav-btn" data-target="cardapio" data-navigate="page_1" onclick="goPage('cardapio')"><span class="icon">📋</span>Cardápio</button>
    <button class="nav-btn" data-target="pedido" data-navigate="page_2" onclick="goPage('pedido')"><span class="icon">🛒</span>Pedido</button>
    <button class="nav-btn active" data-target="sobre" data-navigate="page_3" onclick="goPage('sobre')"><span class="icon">ℹ️</span>Sobre</button>
  </nav>
</div>

</body></html>`;

const mpHtmlRestaurant: CanvasState = {
  bgColor: '#1a0f0a',
  elements: [{
    id: eid(), type: 'iframe', x: 0, y: 0, width: 1080, height: 1920,
    rotation: 0, zIndex: 1, opacity: 1, locked: false, visible: true, name: 'Restaurante HTML',
    props: { htmlContent: htmlRestaurantContent, borderRadius: 0, scrolling: false,
      htmlPages: [
        { id: 'page_0', name: 'Início', selector: '[data-page="home"]' },
        { id: 'page_1', name: 'Cardápio', selector: '[data-page="cardapio"]' },
        { id: 'page_2', name: 'Pedido', selector: '[data-page="pedido"]' },
        { id: 'page_3', name: 'Sobre', selector: '[data-page="sobre"]' },
      ],
    },
  }],
  selectedId: null,
  views: [
    { id: 'page_0', name: 'Início', isDefault: true },
    { id: 'page_1', name: 'Cardápio', isDefault: false },
    { id: 'page_2', name: 'Pedido', isDefault: false },
    { id: 'page_3', name: 'Sobre', isDefault: false },
  ],
  activeViewId: 'page_0',
  viewIdleTimeout: 30,
  pageBgColors: {},
};

// ═══════════════════════════════════════════════════
// HTML Templates — Clínica Médica / Consultório
// ═══════════════════════════════════════════════════
const htmlClinicContent = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#0a1628;color:#fff;width:1080px;height:1920px;overflow:hidden}
[data-page]{display:none;width:100%;height:100%;position:absolute;top:0;left:0;flex-direction:column}
[data-page].active{display:flex}
.header{padding:50px 60px 24px;background:linear-gradient(180deg,rgba(16,185,129,0.2),transparent)}
.header h1{font-size:36px;font-weight:800;color:#34d399}
.header p{font-size:16px;opacity:0.5;margin-top:8px}
.content{flex:1;padding:16px 60px;overflow:auto}
.nav-bar{display:flex;justify-content:space-around;padding:20px 40px 44px;background:rgba(0,0,0,0.5);border-top:1px solid rgba(52,211,153,0.15)}
.nav-btn{display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;color:#fff;opacity:0.4;cursor:pointer;font-size:12px;transition:all .2s}
.nav-btn.active{opacity:1;color:#34d399}
.nav-btn span.icon{font-size:26px}
.card{background:rgba(255,255,255,0.06);border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid rgba(52,211,153,0.08)}
.card h3{font-size:20px;font-weight:700;margin-bottom:8px}
.card p{font-size:14px;opacity:0.7;line-height:1.5}
.cta-btn{width:100%;padding:18px;border-radius:14px;border:none;font-size:18px;font-weight:700;cursor:pointer;margin-top:16px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.badge{display:inline-block;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:600}
.stat-card{background:rgba(52,211,153,0.1);border-radius:16px;padding:20px;text-align:center;border:1px solid rgba(52,211,153,0.15)}
.stat-card .num{font-size:36px;font-weight:800;color:#34d399}
.stat-card .label{font-size:12px;opacity:0.5;margin-top:6px}
.doc-card{display:flex;gap:16px;background:rgba(255,255,255,0.06);border-radius:16px;padding:20px;margin-bottom:12px;align-items:center;border:1px solid rgba(52,211,153,0.08)}
.doc-avatar{width:64px;height:64px;border-radius:50%;background:rgba(52,211,153,0.2);display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0}
.doc-info h4{font-size:16px;font-weight:700}
.doc-info p{font-size:12px;opacity:0.5;margin-top:4px}
</style>
<script>
function goPage(id){
  document.querySelectorAll('[data-page]').forEach(p=>p.classList.remove('active'));
  var t=document.querySelector('[data-page="'+id+'"]');if(t)t.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.target===id));
}
document.addEventListener('DOMContentLoaded',()=>goPage('home'));
</script></head><body>

<div data-page="home" data-name="Início" class="active">
  <div class="header" style="padding-top:60px;padding-bottom:40px;text-align:center">
    <div style="font-size:56px;margin-bottom:16px">🏥</div>
    <h1>Clínica Vida Plena</h1>
    <p>Cuidando de você com carinho e tecnologia</p>
  </div>
  <div class="content">
    <div class="grid-3">
      <div class="stat-card"><div class="num">12</div><div class="label">Especialidades</div></div>
      <div class="stat-card"><div class="num">25+</div><div class="label">Médicos</div></div>
      <div class="stat-card"><div class="num">4.9★</div><div class="label">Avaliação</div></div>
    </div>
    <div class="card" style="margin-top:20px;background:linear-gradient(135deg,rgba(52,211,153,0.15),rgba(16,185,129,0.05));border-color:rgba(52,211,153,0.2)">
      <h3>📋 Check-in Rápido</h3>
      <p>Já tem consulta agendada? Faça seu check-in pelo totem e agilize o atendimento.</p>
      <button class="cta-btn" style="background:#34d399;color:#000;font-weight:800">✅ Fazer Check-in</button>
    </div>
    <div class="grid-2" style="margin-top:8px">
      <div class="card" style="cursor:pointer;text-align:center" data-navigate="page_1" onclick="goPage('especialidades')">
        <div style="font-size:32px;margin-bottom:8px">🩺</div><p style="font-weight:600;font-size:14px">Especialidades</p>
      </div>
      <div class="card" style="cursor:pointer;text-align:center" data-navigate="page_2" onclick="goPage('medicos')">
        <div style="font-size:32px;margin-bottom:8px">👨‍⚕️</div><p style="font-weight:600;font-size:14px">Médicos</p>
      </div>
    </div>
  </div>
  <nav class="nav-bar">
    <button class="nav-btn active" data-target="home" data-navigate="page_0" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
    <button class="nav-btn" data-target="especialidades" data-navigate="page_1" onclick="goPage('especialidades')"><span class="icon">🩺</span>Áreas</button>
    <button class="nav-btn" data-target="medicos" data-navigate="page_2" onclick="goPage('medicos')"><span class="icon">👨‍⚕️</span>Médicos</button>
    <button class="nav-btn" data-target="info" data-navigate="page_3" onclick="goPage('info')"><span class="icon">ℹ️</span>Info</button>
  </nav>
</div>

<div data-page="especialidades" data-name="Especialidades">
  <div class="header"><h1>🩺 Especialidades</h1><p>Atendimento completo para toda a família</p></div>
  <div class="content">
    <div class="grid-2">
      <div class="card" style="text-align:center"><div style="font-size:32px;margin-bottom:8px">❤️</div><h3 style="font-size:16px">Cardiologia</h3><p style="font-size:12px">Sala 201</p></div>
      <div class="card" style="text-align:center"><div style="font-size:32px;margin-bottom:8px">🦴</div><h3 style="font-size:16px">Ortopedia</h3><p style="font-size:12px">Sala 105</p></div>
      <div class="card" style="text-align:center"><div style="font-size:32px;margin-bottom:8px">👶</div><h3 style="font-size:16px">Pediatria</h3><p style="font-size:12px">Sala 302</p></div>
      <div class="card" style="text-align:center"><div style="font-size:32px;margin-bottom:8px">🧠</div><h3 style="font-size:16px">Neurologia</h3><p style="font-size:12px">Sala 204</p></div>
      <div class="card" style="text-align:center"><div style="font-size:32px;margin-bottom:8px">👁️</div><h3 style="font-size:16px">Oftalmologia</h3><p style="font-size:12px">Sala 108</p></div>
      <div class="card" style="text-align:center"><div style="font-size:32px;margin-bottom:8px">🦷</div><h3 style="font-size:16px">Odontologia</h3><p style="font-size:12px">Sala 110</p></div>
      <div class="card" style="text-align:center"><div style="font-size:32px;margin-bottom:8px">💊</div><h3 style="font-size:16px">Clínico Geral</h3><p style="font-size:12px">Sala 101</p></div>
      <div class="card" style="text-align:center"><div style="font-size:32px;margin-bottom:8px">🧬</div><h3 style="font-size:16px">Dermatologia</h3><p style="font-size:12px">Sala 206</p></div>
    </div>
  </div>
  <nav class="nav-bar">
    <button class="nav-btn" data-target="home" data-navigate="page_0" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
    <button class="nav-btn active" data-target="especialidades" data-navigate="page_1" onclick="goPage('especialidades')"><span class="icon">🩺</span>Áreas</button>
    <button class="nav-btn" data-target="medicos" data-navigate="page_2" onclick="goPage('medicos')"><span class="icon">👨‍⚕️</span>Médicos</button>
    <button class="nav-btn" data-target="info" data-navigate="page_3" onclick="goPage('info')"><span class="icon">ℹ️</span>Info</button>
  </nav>
</div>

<div data-page="medicos" data-name="Médicos">
  <div class="header"><h1>👨‍⚕️ Corpo Clínico</h1><p>Profissionais qualificados e experientes</p></div>
  <div class="content">
    <div class="doc-card"><div class="doc-avatar">👨‍⚕️</div><div class="doc-info"><h4>Dr. Carlos Silva</h4><p>Cardiologia — CRM 12345</p><span class="badge" style="background:rgba(52,211,153,0.2);color:#34d399;margin-top:8px">Disponível hoje</span></div></div>
    <div class="doc-card"><div class="doc-avatar">👩‍⚕️</div><div class="doc-info"><h4>Dra. Ana Oliveira</h4><p>Pediatria — CRM 23456</p><span class="badge" style="background:rgba(52,211,153,0.2);color:#34d399;margin-top:8px">Disponível hoje</span></div></div>
    <div class="doc-card"><div class="doc-avatar">👨‍⚕️</div><div class="doc-info"><h4>Dr. Roberto Santos</h4><p>Ortopedia — CRM 34567</p><span class="badge" style="background:rgba(251,191,36,0.2);color:#fbbf24;margin-top:8px">Próximo: Quinta</span></div></div>
    <div class="doc-card"><div class="doc-avatar">👩‍⚕️</div><div class="doc-info"><h4>Dra. Maria Costa</h4><p>Dermatologia — CRM 45678</p><span class="badge" style="background:rgba(52,211,153,0.2);color:#34d399;margin-top:8px">Disponível hoje</span></div></div>
    <div class="doc-card"><div class="doc-avatar">👨‍⚕️</div><div class="doc-info"><h4>Dr. Paulo Ferreira</h4><p>Neurologia — CRM 56789</p><span class="badge" style="background:rgba(251,191,36,0.2);color:#fbbf24;margin-top:8px">Próximo: Sexta</span></div></div>
  </div>
  <nav class="nav-bar">
    <button class="nav-btn" data-target="home" data-navigate="page_0" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
    <button class="nav-btn" data-target="especialidades" data-navigate="page_1" onclick="goPage('especialidades')"><span class="icon">🩺</span>Áreas</button>
    <button class="nav-btn active" data-target="medicos" data-navigate="page_2" onclick="goPage('medicos')"><span class="icon">👨‍⚕️</span>Médicos</button>
    <button class="nav-btn" data-target="info" data-navigate="page_3" onclick="goPage('info')"><span class="icon">ℹ️</span>Info</button>
  </nav>
</div>

<div data-page="info" data-name="Informações">
  <div class="header"><h1>ℹ️ Informações</h1><p>Tudo que você precisa saber</p></div>
  <div class="content">
    <div class="card"><h3>📍 Endereço</h3><p>Av. da Saúde, 500 — Centro Médico<br>São Paulo — SP, CEP 01000-000</p></div>
    <div class="card"><h3>🕐 Horário</h3><p>Segunda a Sexta: 7h às 19h<br>Sábado: 7h às 12h<br>Emergência: 24 horas</p></div>
    <div class="card"><h3>📞 Contato</h3><p>Recepção: (11) 3000-1000<br>WhatsApp: (11) 99999-1000<br>E-mail: contato@vidaplena.com.br</p></div>
    <div class="card"><h3>🅿️ Estacionamento</h3><p>Estacionamento próprio com 120 vagas.<br>Manobrista disponível.</p></div>
    <div class="card" style="background:linear-gradient(135deg,rgba(52,211,153,0.15),rgba(16,185,129,0.05));border-color:rgba(52,211,153,0.2)">
      <h3>🆘 Emergência</h3>
      <p>Pronto-socorro funcionando 24h. Acesso pela entrada lateral.</p>
    </div>
  </div>
  <nav class="nav-bar">
    <button class="nav-btn" data-target="home" data-navigate="page_0" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
    <button class="nav-btn" data-target="especialidades" data-navigate="page_1" onclick="goPage('especialidades')"><span class="icon">🩺</span>Áreas</button>
    <button class="nav-btn" data-target="medicos" data-navigate="page_2" onclick="goPage('medicos')"><span class="icon">👨‍⚕️</span>Médicos</button>
    <button class="nav-btn active" data-target="info" data-navigate="page_3" onclick="goPage('info')"><span class="icon">ℹ️</span>Info</button>
  </nav>
</div>

</body></html>`;

const mpHtmlClinic: CanvasState = {
  bgColor: '#0a1628',
  elements: [{
    id: eid(), type: 'iframe', x: 0, y: 0, width: 1080, height: 1920,
    rotation: 0, zIndex: 1, opacity: 1, locked: false, visible: true, name: 'Clínica HTML',
    props: { htmlContent: htmlClinicContent, borderRadius: 0, scrolling: false,
      htmlPages: [
        { id: 'page_0', name: 'Início', selector: '[data-page="home"]' },
        { id: 'page_1', name: 'Especialidades', selector: '[data-page="especialidades"]' },
        { id: 'page_2', name: 'Médicos', selector: '[data-page="medicos"]' },
        { id: 'page_3', name: 'Informações', selector: '[data-page="info"]' },
      ],
    },
  }],
  selectedId: null,
  views: [
    { id: 'page_0', name: 'Início', isDefault: true },
    { id: 'page_1', name: 'Especialidades', isDefault: false },
    { id: 'page_2', name: 'Médicos', isDefault: false },
    { id: 'page_3', name: 'Informações', isDefault: false },
  ],
  activeViewId: 'page_0',
  viewIdleTimeout: 30,
  pageBgColors: {},
};

// ═══════════════════════════════════════════════════
// HTML Templates — Barbearia / Salão
// ═══════════════════════════════════════════════════
const htmlBarberContent = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#0f0f0f;color:#fff;width:1080px;height:1920px;overflow:hidden}
[data-page]{display:none;width:100%;height:100%;position:absolute;top:0;left:0;flex-direction:column}
[data-page].active{display:flex}
.header{padding:50px 60px 24px;background:linear-gradient(180deg,rgba(212,175,55,0.2),transparent)}
.header h1{font-size:36px;font-weight:800;color:#d4af37}
.header p{font-size:16px;opacity:0.5;margin-top:8px}
.content{flex:1;padding:16px 60px;overflow:auto}
.nav-bar{display:flex;justify-content:space-around;padding:20px 40px 44px;background:rgba(0,0,0,0.7);border-top:1px solid rgba(212,175,55,0.15)}
.nav-btn{display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;color:#fff;opacity:0.4;cursor:pointer;font-size:12px;transition:all .2s}
.nav-btn.active{opacity:1;color:#d4af37}
.nav-btn span.icon{font-size:26px}
.card{background:rgba(255,255,255,0.05);border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid rgba(212,175,55,0.1)}
.card h3{font-size:20px;font-weight:700;margin-bottom:8px}
.card p{font-size:14px;opacity:0.7;line-height:1.5}
.hero-img{width:100%;height:360px;object-fit:cover}
.service-row{display:flex;justify-content:space-between;align-items:center;padding:20px 0;border-bottom:1px solid rgba(255,255,255,0.06)}
.service-row:last-child{border:none}
.service-row .left{display:flex;align-items:center;gap:14px}
.service-row .left .emoji{font-size:28px}
.service-row .left h4{font-size:17px;font-weight:600}
.service-row .left p{font-size:12px;opacity:0.5;margin-top:2px}
.service-row .right{text-align:right}
.service-row .right .price{font-size:20px;font-weight:800;color:#d4af37}
.service-row .right .time{font-size:11px;opacity:0.4;margin-top:2px}
.cta-btn{width:100%;padding:18px;border-radius:14px;border:none;font-size:18px;font-weight:700;cursor:pointer;margin-top:16px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.badge{display:inline-block;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:600}
.gallery-img{width:100%;height:220px;object-fit:cover;border-radius:12px;margin-bottom:12px}
</style>
<script>
function goPage(id){
  document.querySelectorAll('[data-page]').forEach(p=>p.classList.remove('active'));
  var t=document.querySelector('[data-page="'+id+'"]');if(t)t.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.target===id));
}
document.addEventListener('DOMContentLoaded',()=>goPage('home'));
</script></head><body>

<div data-page="home" data-name="Início" class="active">
  <img class="hero-img" src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1080&h=360&fit=crop" alt="Barbearia">
  <div class="header"><h1>✂️ Barbearia Elite</h1><p>Estilo, tradição e atendimento premium</p></div>
  <div class="content">
    <div class="card" style="background:linear-gradient(135deg,rgba(212,175,55,0.15),rgba(0,0,0,0));border-color:rgba(212,175,55,0.2)">
      <h3>🌟 Promoção do Mês</h3>
      <p>Combo Barba + Corte + Sobrancelha por apenas</p>
      <div style="display:flex;align-items:center;gap:12px;margin-top:12px">
        <span style="text-decoration:line-through;opacity:0.4">R$ 120</span>
        <span style="font-size:28px;font-weight:800;color:#d4af37">R$ 89</span>
      </div>
    </div>
    <div class="grid-2">
      <div class="card" style="cursor:pointer;text-align:center" data-navigate="page_1" onclick="goPage('servicos')">
        <div style="font-size:32px;margin-bottom:8px">💈</div><p style="font-weight:600">Serviços</p>
      </div>
      <div class="card" style="cursor:pointer;text-align:center" data-navigate="page_2" onclick="goPage('portfolio')">
        <div style="font-size:32px;margin-bottom:8px">📸</div><p style="font-weight:600">Portfólio</p>
      </div>
    </div>
    <button class="cta-btn" style="background:#d4af37;color:#000" data-navigate="page_3" onclick="goPage('agendar')">📅 Agendar Horário</button>
  </div>
  <nav class="nav-bar">
    <button class="nav-btn active" data-target="home" data-navigate="page_0" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
    <button class="nav-btn" data-target="servicos" data-navigate="page_1" onclick="goPage('servicos')"><span class="icon">💈</span>Serviços</button>
    <button class="nav-btn" data-target="portfolio" data-navigate="page_2" onclick="goPage('portfolio')"><span class="icon">📸</span>Portfólio</button>
    <button class="nav-btn" data-target="agendar" data-navigate="page_3" onclick="goPage('agendar')"><span class="icon">📅</span>Agendar</button>
  </nav>
</div>

<div data-page="servicos" data-name="Serviços">
  <div class="header"><h1>💈 Serviços</h1><p>Tudo para o seu visual perfeito</p></div>
  <div class="content">
    <div class="card">
      <div class="service-row"><div class="left"><span class="emoji">✂️</span><div><h4>Corte Masculino</h4><p>Tesoura ou máquina</p></div></div><div class="right"><div class="price">R$ 50</div><div class="time">40 min</div></div></div>
      <div class="service-row"><div class="left"><span class="emoji">🪒</span><div><h4>Barba Completa</h4><p>Navalha + toalha quente</p></div></div><div class="right"><div class="price">R$ 40</div><div class="time">30 min</div></div></div>
      <div class="service-row"><div class="left"><span class="emoji">💇</span><div><h4>Corte + Barba</h4><p>Combo completo</p></div></div><div class="right"><div class="price">R$ 80</div><div class="time">1h</div></div></div>
      <div class="service-row"><div class="left"><span class="emoji">🧴</span><div><h4>Hidratação</h4><p>Tratamento capilar</p></div></div><div class="right"><div class="price">R$ 35</div><div class="time">20 min</div></div></div>
      <div class="service-row"><div class="left"><span class="emoji">✨</span><div><h4>Sobrancelha</h4><p>Design e acabamento</p></div></div><div class="right"><div class="price">R$ 20</div><div class="time">15 min</div></div></div>
      <div class="service-row"><div class="left"><span class="emoji">🎨</span><div><h4>Coloração</h4><p>Tintura completa</p></div></div><div class="right"><div class="price">R$ 90</div><div class="time">1h30</div></div></div>
    </div>
  </div>
  <nav class="nav-bar">
    <button class="nav-btn" data-target="home" data-navigate="page_0" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
    <button class="nav-btn active" data-target="servicos" data-navigate="page_1" onclick="goPage('servicos')"><span class="icon">💈</span>Serviços</button>
    <button class="nav-btn" data-target="portfolio" data-navigate="page_2" onclick="goPage('portfolio')"><span class="icon">📸</span>Portfólio</button>
    <button class="nav-btn" data-target="agendar" data-navigate="page_3" onclick="goPage('agendar')"><span class="icon">📅</span>Agendar</button>
  </nav>
</div>

<div data-page="portfolio" data-name="Portfólio">
  <div class="header"><h1>📸 Portfólio</h1><p>Nossos melhores trabalhos</p></div>
  <div class="content">
    <div class="grid-2">
      <div><img class="gallery-img" src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=480&h=220&fit=crop" alt="Corte 1"><p style="font-size:13px;opacity:0.5;text-align:center">Fade Clássico</p></div>
      <div><img class="gallery-img" src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=480&h=220&fit=crop" alt="Corte 2"><p style="font-size:13px;opacity:0.5;text-align:center">Pompadour</p></div>
      <div><img class="gallery-img" src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=480&h=220&fit=crop" alt="Barba"><p style="font-size:13px;opacity:0.5;text-align:center">Barba Desenhada</p></div>
      <div><img class="gallery-img" src="https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=480&h=220&fit=crop" alt="Corte 3"><p style="font-size:13px;opacity:0.5;text-align:center">Undercut</p></div>
    </div>
  </div>
  <nav class="nav-bar">
    <button class="nav-btn" data-target="home" data-navigate="page_0" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
    <button class="nav-btn" data-target="servicos" data-navigate="page_1" onclick="goPage('servicos')"><span class="icon">💈</span>Serviços</button>
    <button class="nav-btn active" data-target="portfolio" data-navigate="page_2" onclick="goPage('portfolio')"><span class="icon">📸</span>Portfólio</button>
    <button class="nav-btn" data-target="agendar" data-navigate="page_3" onclick="goPage('agendar')"><span class="icon">📅</span>Agendar</button>
  </nav>
</div>

<div data-page="agendar" data-name="Agendar">
  <div class="header"><h1>📅 Agendar Horário</h1><p>Escolha a melhor forma de agendar</p></div>
  <div class="content">
    <div class="card" style="background:linear-gradient(135deg,rgba(212,175,55,0.15),rgba(0,0,0,0));border-color:rgba(212,175,55,0.2)">
      <h3>📱 Agende pelo WhatsApp</h3>
      <p>Fale com a gente e escolha o melhor horário. Resposta rápida!</p>
      <button class="cta-btn" style="background:#25d366;color:#fff">💬 WhatsApp</button>
    </div>
    <div class="card">
      <h3>📞 Ligue para Nós</h3>
      <p style="font-size:24px;font-weight:800;color:#d4af37;margin-top:8px">(11) 3000-2000</p>
      <p style="margin-top:8px">Seg a Sáb: 9h às 20h</p>
    </div>
    <div class="card">
      <h3>🕐 Horários Disponíveis Hoje</h3>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">
        <span class="badge" style="background:rgba(212,175,55,0.2);color:#d4af37">10:00</span>
        <span class="badge" style="background:rgba(212,175,55,0.2);color:#d4af37">11:30</span>
        <span class="badge" style="background:rgba(212,175,55,0.2);color:#d4af37">14:00</span>
        <span class="badge" style="background:rgba(212,175,55,0.2);color:#d4af37">15:30</span>
        <span class="badge" style="background:rgba(212,175,55,0.2);color:#d4af37">17:00</span>
        <span class="badge" style="background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.3)">18:30</span>
      </div>
    </div>
  </div>
  <nav class="nav-bar">
    <button class="nav-btn" data-target="home" data-navigate="page_0" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
    <button class="nav-btn" data-target="servicos" data-navigate="page_1" onclick="goPage('servicos')"><span class="icon">💈</span>Serviços</button>
    <button class="nav-btn" data-target="portfolio" data-navigate="page_2" onclick="goPage('portfolio')"><span class="icon">📸</span>Portfólio</button>
    <button class="nav-btn active" data-target="agendar" data-navigate="page_3" onclick="goPage('agendar')"><span class="icon">📅</span>Agendar</button>
  </nav>
</div>

</body></html>`;

const mpHtmlBarber: CanvasState = {
  bgColor: '#0f0f0f',
  elements: [{
    id: eid(), type: 'iframe', x: 0, y: 0, width: 1080, height: 1920,
    rotation: 0, zIndex: 1, opacity: 1, locked: false, visible: true, name: 'Barbearia HTML',
    props: { htmlContent: htmlBarberContent, borderRadius: 0, scrolling: false,
      htmlPages: [
        { id: 'page_0', name: 'Início', selector: '[data-page="home"]' },
        { id: 'page_1', name: 'Serviços', selector: '[data-page="servicos"]' },
        { id: 'page_2', name: 'Portfólio', selector: '[data-page="portfolio"]' },
        { id: 'page_3', name: 'Agendar', selector: '[data-page="agendar"]' },
      ],
    },
  }],
  selectedId: null,
  views: [
    { id: 'page_0', name: 'Início', isDefault: true },
    { id: 'page_1', name: 'Serviços', isDefault: false },
    { id: 'page_2', name: 'Portfólio', isDefault: false },
    { id: 'page_3', name: 'Agendar', isDefault: false },
  ],
  activeViewId: 'page_0',
  viewIdleTimeout: 30,
  pageBgColors: {},
};

// ═══════════════════════════════════════════════════
// HTML Templates — Hotel / Pousada
// ═══════════════════════════════════════════════════
const htmlHotelContent = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#0c1222;color:#fff;width:1080px;height:1920px;overflow:hidden}
[data-page]{display:none;width:100%;height:100%;position:absolute;top:0;left:0;flex-direction:column}
[data-page].active{display:flex}
.header{padding:50px 60px 24px;background:linear-gradient(180deg,rgba(99,102,241,0.2),transparent)}
.header h1{font-size:36px;font-weight:800;color:#a5b4fc}
.header p{font-size:16px;opacity:0.5;margin-top:8px}
.content{flex:1;padding:16px 60px;overflow:auto}
.nav-bar{display:flex;justify-content:space-around;padding:20px 40px 44px;background:rgba(0,0,0,0.5);border-top:1px solid rgba(165,180,252,0.1)}
.nav-btn{display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;color:#fff;opacity:0.4;cursor:pointer;font-size:12px;transition:all .2s}
.nav-btn.active{opacity:1;color:#a5b4fc}
.nav-btn span.icon{font-size:26px}
.card{background:rgba(255,255,255,0.05);border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid rgba(165,180,252,0.08)}
.card h3{font-size:20px;font-weight:700;margin-bottom:8px}
.card p{font-size:14px;opacity:0.7;line-height:1.5}
.hero-img{width:100%;height:380px;object-fit:cover}
.cta-btn{width:100%;padding:18px;border-radius:14px;border:none;font-size:18px;font-weight:700;cursor:pointer;margin-top:16px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.badge{display:inline-block;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:600}
.amenity{display:flex;flex-direction:column;align-items:center;background:rgba(165,180,252,0.08);border-radius:14px;padding:20px 12px;text-align:center;border:1px solid rgba(165,180,252,0.1)}
.amenity .emoji{font-size:32px;margin-bottom:8px}
.amenity .name{font-size:13px;font-weight:600}
.amenity .detail{font-size:11px;opacity:0.4;margin-top:4px}
.room-card{background:rgba(255,255,255,0.05);border-radius:16px;overflow:hidden;margin-bottom:16px;border:1px solid rgba(165,180,252,0.08)}
.room-card img{width:100%;height:200px;object-fit:cover}
.room-card .info{padding:20px}
.room-card .info h4{font-size:18px;font-weight:700}
.room-card .info .price-row{display:flex;justify-content:space-between;align-items:center;margin-top:12px}
</style>
<script>
function goPage(id){
  document.querySelectorAll('[data-page]').forEach(p=>p.classList.remove('active'));
  var t=document.querySelector('[data-page="'+id+'"]');if(t)t.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.target===id));
}
document.addEventListener('DOMContentLoaded',()=>goPage('home'));
</script></head><body>

<div data-page="home" data-name="Início" class="active">
  <img class="hero-img" src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1080&h=380&fit=crop" alt="Hotel">
  <div class="header"><h1>🏨 Grand Hotel</h1><p>Sua experiência premium começa aqui</p></div>
  <div class="content">
    <div class="card" style="background:linear-gradient(135deg,rgba(165,180,252,0.15),rgba(99,102,241,0.05));border-color:rgba(165,180,252,0.2)">
      <h3>🔑 Check-in Express</h3>
      <p>Tem reserva? Faça o check-in digital e vá direto para o quarto.</p>
      <button class="cta-btn" style="background:#6366f1;color:#fff">✅ Fazer Check-in</button>
    </div>
    <div class="grid-2">
      <div class="card" style="cursor:pointer;text-align:center" data-navigate="page_1" onclick="goPage('quartos')">
        <div style="font-size:32px;margin-bottom:8px">🛏️</div><p style="font-weight:600">Quartos</p>
      </div>
      <div class="card" style="cursor:pointer;text-align:center" data-navigate="page_2" onclick="goPage('servicos')">
        <div style="font-size:32px;margin-bottom:8px">🍽️</div><p style="font-weight:600">Serviços</p>
      </div>
    </div>
  </div>
  <nav class="nav-bar">
    <button class="nav-btn active" data-target="home" data-navigate="page_0" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
    <button class="nav-btn" data-target="quartos" data-navigate="page_1" onclick="goPage('quartos')"><span class="icon">🛏️</span>Quartos</button>
    <button class="nav-btn" data-target="servicos" data-navigate="page_2" onclick="goPage('servicos')"><span class="icon">🍽️</span>Serviços</button>
    <button class="nav-btn" data-target="turismo" data-navigate="page_3" onclick="goPage('turismo')"><span class="icon">🗺️</span>Turismo</button>
  </nav>
</div>

<div data-page="quartos" data-name="Quartos">
  <div class="header"><h1>🛏️ Acomodações</h1><p>Conforto e elegância para sua estadia</p></div>
  <div class="content">
    <div class="room-card"><img src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=960&h=200&fit=crop" alt="Standard"><div class="info"><h4>Standard</h4><p style="font-size:13px;opacity:0.5;margin-top:4px">Cama Queen • Wi-Fi • TV 43" • Frigobar</p><div class="price-row"><span class="badge" style="background:rgba(165,180,252,0.2);color:#a5b4fc">Disponível</span><span style="font-size:22px;font-weight:800;color:#a5b4fc">R$ 280<span style="font-size:12px;opacity:0.5">/noite</span></span></div></div></div>
    <div class="room-card"><img src="https://images.unsplash.com/photo-1590490360182-c33d57733427?w=960&h=200&fit=crop" alt="Luxo"><div class="info"><h4>Luxo</h4><p style="font-size:13px;opacity:0.5;margin-top:4px">Cama King • Banheira • Varanda • Vista Mar</p><div class="price-row"><span class="badge" style="background:rgba(165,180,252,0.2);color:#a5b4fc">Disponível</span><span style="font-size:22px;font-weight:800;color:#a5b4fc">R$ 520<span style="font-size:12px;opacity:0.5">/noite</span></span></div></div></div>
    <div class="room-card"><img src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=960&h=200&fit=crop" alt="Suite"><div class="info"><h4>Suíte Presidencial</h4><p style="font-size:13px;opacity:0.5;margin-top:4px">Living • Jacuzzi • Butler Service • Panorâmica</p><div class="price-row"><span class="badge" style="background:rgba(251,191,36,0.2);color:#fbbf24">2 restantes</span><span style="font-size:22px;font-weight:800;color:#a5b4fc">R$ 1.200<span style="font-size:12px;opacity:0.5">/noite</span></span></div></div></div>
  </div>
  <nav class="nav-bar">
    <button class="nav-btn" data-target="home" data-navigate="page_0" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
    <button class="nav-btn active" data-target="quartos" data-navigate="page_1" onclick="goPage('quartos')"><span class="icon">🛏️</span>Quartos</button>
    <button class="nav-btn" data-target="servicos" data-navigate="page_2" onclick="goPage('servicos')"><span class="icon">🍽️</span>Serviços</button>
    <button class="nav-btn" data-target="turismo" data-navigate="page_3" onclick="goPage('turismo')"><span class="icon">🗺️</span>Turismo</button>
  </nav>
</div>

<div data-page="servicos" data-name="Serviços">
  <div class="header"><h1>🍽️ Serviços</h1><p>Tudo para tornar sua estadia inesquecível</p></div>
  <div class="content">
    <div class="grid-3">
      <div class="amenity"><span class="emoji">🏊</span><span class="name">Piscina</span><span class="detail">7h–22h</span></div>
      <div class="amenity"><span class="emoji">🏋️</span><span class="name">Academia</span><span class="detail">24h</span></div>
      <div class="amenity"><span class="emoji">💆</span><span class="name">Spa</span><span class="detail">9h–21h</span></div>
      <div class="amenity"><span class="emoji">🍳</span><span class="name">Café da Manhã</span><span class="detail">6h–10h</span></div>
      <div class="amenity"><span class="emoji">🍷</span><span class="name">Bar</span><span class="detail">18h–01h</span></div>
      <div class="amenity"><span class="emoji">🅿️</span><span class="name">Valet</span><span class="detail">24h</span></div>
    </div>
    <div class="card" style="margin-top:16px">
      <h3>🛎️ Room Service</h3>
      <p>Peça direto do quarto. Cardápio completo, 24 horas.</p>
      <button class="cta-btn" style="background:#6366f1;color:#fff">📋 Ver Cardápio</button>
    </div>
    <div class="card">
      <h3>📶 Wi-Fi</h3>
      <p style="font-weight:700;color:#a5b4fc;font-size:18px;margin-top:4px">Rede: GrandHotel_Guest</p>
      <p style="margin-top:4px">Senha: Bem-vindo2024</p>
    </div>
  </div>
  <nav class="nav-bar">
    <button class="nav-btn" data-target="home" data-navigate="page_0" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
    <button class="nav-btn" data-target="quartos" data-navigate="page_1" onclick="goPage('quartos')"><span class="icon">🛏️</span>Quartos</button>
    <button class="nav-btn active" data-target="servicos" data-navigate="page_2" onclick="goPage('servicos')"><span class="icon">🍽️</span>Serviços</button>
    <button class="nav-btn" data-target="turismo" data-navigate="page_3" onclick="goPage('turismo')"><span class="icon">🗺️</span>Turismo</button>
  </nav>
</div>

<div data-page="turismo" data-name="Turismo">
  <div class="header"><h1>🗺️ Turismo</h1><p>Descubra as atrações da região</p></div>
  <div class="content">
    <div class="card"><img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=960&h=200&fit=crop" alt="Praia" style="width:100%;height:200px;object-fit:cover;border-radius:12px;margin-bottom:12px"><h3>🏖️ Praia Central</h3><p>A 5 minutos do hotel. Quiosques e esportes aquáticos.</p><span class="badge" style="background:rgba(56,189,248,0.2);color:#38bdf8;margin-top:8px">500m</span></div>
    <div class="card"><h3>🏛️ Centro Histórico</h3><p>Passeio guiado pela história da cidade. Saídas diárias às 9h e 15h.</p><span class="badge" style="background:rgba(251,191,36,0.2);color:#fbbf24;margin-top:8px">2km</span></div>
    <div class="card"><h3>🌿 Trilha Ecológica</h3><p>Percurso de 3km em meio à Mata Atlântica. Guias disponíveis no hotel.</p><span class="badge" style="background:rgba(52,211,153,0.2);color:#34d399;margin-top:8px">4km</span></div>
    <div class="card"><h3>🛥️ Passeio de Barco</h3><p>Tour pelas ilhas com paradas para mergulho. Reservas na recepção.</p><span class="badge" style="background:rgba(165,180,252,0.2);color:#a5b4fc;margin-top:8px">Porto — 1km</span></div>
  </div>
  <nav class="nav-bar">
    <button class="nav-btn" data-target="home" data-navigate="page_0" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
    <button class="nav-btn" data-target="quartos" data-navigate="page_1" onclick="goPage('quartos')"><span class="icon">🛏️</span>Quartos</button>
    <button class="nav-btn" data-target="servicos" data-navigate="page_2" onclick="goPage('servicos')"><span class="icon">🍽️</span>Serviços</button>
    <button class="nav-btn active" data-target="turismo" data-navigate="page_3" onclick="goPage('turismo')"><span class="icon">🗺️</span>Turismo</button>
  </nav>
</div>

</body></html>`;

const mpHtmlHotel: CanvasState = {
  bgColor: '#0c1222',
  elements: [{
    id: eid(), type: 'iframe', x: 0, y: 0, width: 1080, height: 1920,
    rotation: 0, zIndex: 1, opacity: 1, locked: false, visible: true, name: 'Hotel HTML',
    props: { htmlContent: htmlHotelContent, borderRadius: 0, scrolling: false,
      htmlPages: [
        { id: 'page_0', name: 'Início', selector: '[data-page="home"]' },
        { id: 'page_1', name: 'Quartos', selector: '[data-page="quartos"]' },
        { id: 'page_2', name: 'Serviços', selector: '[data-page="servicos"]' },
        { id: 'page_3', name: 'Turismo', selector: '[data-page="turismo"]' },
      ],
    },
  }],
  selectedId: null,
  views: [
    { id: 'page_0', name: 'Início', isDefault: true },
    { id: 'page_1', name: 'Quartos', isDefault: false },
    { id: 'page_2', name: 'Serviços', isDefault: false },
    { id: 'page_3', name: 'Turismo', isDefault: false },
  ],
  activeViewId: 'page_0',
  viewIdleTimeout: 30,
  pageBgColors: {},
};

// ═══════════════════════════════════════════════════
// HTML Templates — Academia / Gym
// ═══════════════════════════════════════════════════
const htmlGymContent = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#0a0a0a;color:#fff;width:1080px;height:1920px;overflow:hidden}
[data-page]{display:none;width:100%;height:100%;position:absolute;top:0;left:0;flex-direction:column}
[data-page].active{display:flex}
.header{padding:50px 60px 24px;background:linear-gradient(180deg,rgba(239,68,68,0.2),transparent)}
.header h1{font-size:36px;font-weight:800;color:#f87171}
.header p{font-size:16px;opacity:0.5;margin-top:8px}
.content{flex:1;padding:16px 60px;overflow:auto}
.nav-bar{display:flex;justify-content:space-around;padding:20px 40px 44px;background:rgba(0,0,0,0.7);border-top:1px solid rgba(239,68,68,0.15)}
.nav-btn{display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;color:#fff;opacity:0.4;cursor:pointer;font-size:12px;transition:all .2s}
.nav-btn.active{opacity:1;color:#f87171}
.nav-btn span.icon{font-size:26px}
.card{background:rgba(255,255,255,0.05);border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid rgba(239,68,68,0.08)}
.card h3{font-size:20px;font-weight:700;margin-bottom:8px}
.card p{font-size:14px;opacity:0.7;line-height:1.5}
.hero-img{width:100%;height:340px;object-fit:cover}
.cta-btn{width:100%;padding:18px;border-radius:14px;border:none;font-size:18px;font-weight:700;cursor:pointer;margin-top:16px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.badge{display:inline-block;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:600}
.plan-card{background:rgba(255,255,255,0.05);border-radius:20px;padding:28px;text-align:center;border:1px solid rgba(239,68,68,0.1);margin-bottom:16px}
.plan-card.featured{background:linear-gradient(135deg,rgba(239,68,68,0.15),rgba(251,113,133,0.05));border-color:rgba(239,68,68,0.3)}
.plan-card h3{font-size:22px;font-weight:800;margin-bottom:4px}
.plan-card .price{font-size:36px;font-weight:900;color:#f87171;margin:12px 0}
.plan-card .price span{font-size:14px;opacity:0.5;font-weight:400}
.plan-card ul{list-style:none;text-align:left;margin-top:12px}
.plan-card ul li{padding:8px 0;font-size:14px;border-bottom:1px solid rgba(255,255,255,0.04)}
.plan-card ul li:before{content:'✅ ';font-size:12px}
.schedule-row{display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.05)}
.schedule-row:last-child{border:none}
.schedule-row .time{font-size:14px;font-weight:700;color:#f87171;min-width:60px}
.schedule-row .name{font-size:16px;font-weight:600;flex:1;margin-left:16px}
.schedule-row .teacher{font-size:12px;opacity:0.4}
.schedule-row .badge{margin-left:auto}
</style>
<script>
function goPage(id){
  document.querySelectorAll('[data-page]').forEach(p=>p.classList.remove('active'));
  var t=document.querySelector('[data-page="'+id+'"]');if(t)t.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.target===id));
}
document.addEventListener('DOMContentLoaded',()=>goPage('home'));
</script></head><body>

<div data-page="home" data-name="Início" class="active">
  <img class="hero-img" src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1080&h=340&fit=crop" alt="Academia">
  <div class="header"><h1>🏋️ Power Gym</h1><p>Supere seus limites todos os dias</p></div>
  <div class="content">
    <div class="grid-3">
      <div style="background:rgba(239,68,68,0.1);border-radius:16px;padding:16px;text-align:center;border:1px solid rgba(239,68,68,0.15)"><div style="font-size:28px;font-weight:900;color:#f87171">850+</div><div style="font-size:11px;opacity:0.4;margin-top:4px">Alunos Ativos</div></div>
      <div style="background:rgba(239,68,68,0.1);border-radius:16px;padding:16px;text-align:center;border:1px solid rgba(239,68,68,0.15)"><div style="font-size:28px;font-weight:900;color:#f87171">30+</div><div style="font-size:11px;opacity:0.4;margin-top:4px">Aulas/Semana</div></div>
      <div style="background:rgba(239,68,68,0.1);border-radius:16px;padding:16px;text-align:center;border:1px solid rgba(239,68,68,0.15)"><div style="font-size:28px;font-weight:900;color:#f87171">5h–23h</div><div style="font-size:11px;opacity:0.4;margin-top:4px">Horário</div></div>
    </div>
    <div class="card" style="margin-top:16px;background:linear-gradient(135deg,rgba(239,68,68,0.15),rgba(0,0,0,0));border-color:rgba(239,68,68,0.2)">
      <h3>🆓 Aula Experimental</h3>
      <p>Primeira aula grátis! Venha conhecer nossa estrutura.</p>
      <button class="cta-btn" style="background:#ef4444;color:#fff">💪 Agendar Aula Grátis</button>
    </div>
    <div class="grid-2" style="margin-top:8px">
      <div class="card" style="cursor:pointer;text-align:center" data-navigate="page_1" onclick="goPage('planos')"><div style="font-size:32px;margin-bottom:8px">💎</div><p style="font-weight:600">Planos</p></div>
      <div class="card" style="cursor:pointer;text-align:center" data-navigate="page_2" onclick="goPage('aulas')"><div style="font-size:32px;margin-bottom:8px">📅</div><p style="font-weight:600">Aulas</p></div>
    </div>
  </div>
  <nav class="nav-bar">
    <button class="nav-btn active" data-target="home" data-navigate="page_0" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
    <button class="nav-btn" data-target="planos" data-navigate="page_1" onclick="goPage('planos')"><span class="icon">💎</span>Planos</button>
    <button class="nav-btn" data-target="aulas" data-navigate="page_2" onclick="goPage('aulas')"><span class="icon">📅</span>Aulas</button>
    <button class="nav-btn" data-target="checkin" data-navigate="page_3" onclick="goPage('checkin')"><span class="icon">✅</span>Check-in</button>
  </nav>
</div>

<div data-page="planos" data-name="Planos">
  <div class="header"><h1>💎 Planos</h1><p>Escolha o plano ideal para você</p></div>
  <div class="content">
    <div class="plan-card"><h3>Basic</h3><div class="price">R$ 89<span>/mês</span></div><ul><li>Acesso à musculação</li><li>Horário: 5h–23h</li><li>Avaliação física</li></ul><button class="cta-btn" style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.1)">Assinar Basic</button></div>
    <div class="plan-card featured"><span class="badge" style="background:#ef4444;color:#fff;margin-bottom:12px">⭐ Mais Popular</span><h3>Premium</h3><div class="price">R$ 149<span>/mês</span></div><ul><li>Musculação + Aulas</li><li>Horário: 5h–23h</li><li>Personal 2x/mês</li><li>Área de alongamento</li></ul><button class="cta-btn" style="background:#ef4444;color:#fff">Assinar Premium</button></div>
    <div class="plan-card"><h3>VIP</h3><div class="price">R$ 249<span>/mês</span></div><ul><li>Acesso total</li><li>Personal ilimitado</li><li>Nutricionista</li><li>Armário pessoal</li><li>Spa e sauna</li></ul><button class="cta-btn" style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.1)">Assinar VIP</button></div>
  </div>
  <nav class="nav-bar">
    <button class="nav-btn" data-target="home" data-navigate="page_0" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
    <button class="nav-btn active" data-target="planos" data-navigate="page_1" onclick="goPage('planos')"><span class="icon">💎</span>Planos</button>
    <button class="nav-btn" data-target="aulas" data-navigate="page_2" onclick="goPage('aulas')"><span class="icon">📅</span>Aulas</button>
    <button class="nav-btn" data-target="checkin" data-navigate="page_3" onclick="goPage('checkin')"><span class="icon">✅</span>Check-in</button>
  </nav>
</div>

<div data-page="aulas" data-name="Aulas">
  <div class="header"><h1>📅 Aulas de Hoje</h1><p>Grade completa do dia</p></div>
  <div class="content">
    <div class="card">
      <div class="schedule-row"><div class="time">06:00</div><div class="name">Spinning<div class="teacher">Prof. Ricardo</div></div><span class="badge" style="background:rgba(52,211,153,0.2);color:#34d399">5 vagas</span></div>
      <div class="schedule-row"><div class="time">07:30</div><div class="name">Funcional<div class="teacher">Prof. Amanda</div></div><span class="badge" style="background:rgba(52,211,153,0.2);color:#34d399">8 vagas</span></div>
      <div class="schedule-row"><div class="time">09:00</div><div class="name">Yoga<div class="teacher">Prof. Camila</div></div><span class="badge" style="background:rgba(251,191,36,0.2);color:#fbbf24">2 vagas</span></div>
      <div class="schedule-row"><div class="time">10:30</div><div class="name">Pilates<div class="teacher">Prof. Fernanda</div></div><span class="badge" style="background:rgba(52,211,153,0.2);color:#34d399">6 vagas</span></div>
      <div class="schedule-row"><div class="time">17:00</div><div class="name">CrossFit<div class="teacher">Prof. Bruno</div></div><span class="badge" style="background:rgba(239,68,68,0.2);color:#f87171">Lotada</span></div>
      <div class="schedule-row"><div class="time">18:30</div><div class="name">Muay Thai<div class="teacher">Prof. Diego</div></div><span class="badge" style="background:rgba(52,211,153,0.2);color:#34d399">4 vagas</span></div>
      <div class="schedule-row"><div class="time">20:00</div><div class="name">Dança<div class="teacher">Prof. Juliana</div></div><span class="badge" style="background:rgba(52,211,153,0.2);color:#34d399">10 vagas</span></div>
    </div>
  </div>
  <nav class="nav-bar">
    <button class="nav-btn" data-target="home" data-navigate="page_0" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
    <button class="nav-btn" data-target="planos" data-navigate="page_1" onclick="goPage('planos')"><span class="icon">💎</span>Planos</button>
    <button class="nav-btn active" data-target="aulas" data-navigate="page_2" onclick="goPage('aulas')"><span class="icon">📅</span>Aulas</button>
    <button class="nav-btn" data-target="checkin" data-navigate="page_3" onclick="goPage('checkin')"><span class="icon">✅</span>Check-in</button>
  </nav>
</div>

<div data-page="checkin" data-name="Check-in">
  <div class="header"><h1>✅ Check-in</h1><p>Registre sua presença de forma rápida</p></div>
  <div class="content">
    <div class="card" style="text-align:center;padding:40px;background:linear-gradient(135deg,rgba(239,68,68,0.15),rgba(0,0,0,0));border-color:rgba(239,68,68,0.2)">
      <div style="font-size:64px;margin-bottom:16px">📱</div>
      <h3>Escaneie seu QR Code</h3>
      <p style="margin-top:8px">Aproxime o celular do leitor para registrar sua entrada.</p>
    </div>
    <div class="card" style="text-align:center">
      <h3>Ou digite sua matrícula</h3>
      <div style="display:flex;gap:8px;margin-top:16px;justify-content:center">
        <div style="width:60px;height:72px;background:rgba(255,255,255,0.08);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;border:2px solid rgba(239,68,68,0.2)">_</div>
        <div style="width:60px;height:72px;background:rgba(255,255,255,0.08);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;border:2px solid rgba(255,255,255,0.06)">_</div>
        <div style="width:60px;height:72px;background:rgba(255,255,255,0.08);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;border:2px solid rgba(255,255,255,0.06)">_</div>
        <div style="width:60px;height:72px;background:rgba(255,255,255,0.08);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;border:2px solid rgba(255,255,255,0.06)">_</div>
        <div style="width:60px;height:72px;background:rgba(255,255,255,0.08);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;border:2px solid rgba(255,255,255,0.06)">_</div>
      </div>
      <button class="cta-btn" style="background:#ef4444;color:#fff;max-width:300px;margin:16px auto 0">Confirmar</button>
    </div>
    <div class="card">
      <h3>🕐 Horário de Funcionamento</h3>
      <p>Seg a Sex: 5h às 23h<br>Sáb: 7h às 18h<br>Dom e Feriados: 8h às 14h</p>
    </div>
  </div>
  <nav class="nav-bar">
    <button class="nav-btn" data-target="home" data-navigate="page_0" onclick="goPage('home')"><span class="icon">🏠</span>Início</button>
    <button class="nav-btn" data-target="planos" data-navigate="page_1" onclick="goPage('planos')"><span class="icon">💎</span>Planos</button>
    <button class="nav-btn" data-target="aulas" data-navigate="page_2" onclick="goPage('aulas')"><span class="icon">📅</span>Aulas</button>
    <button class="nav-btn active" data-target="checkin" data-navigate="page_3" onclick="goPage('checkin')"><span class="icon">✅</span>Check-in</button>
  </nav>
</div>

</body></html>`;

const mpHtmlGym: CanvasState = {
  bgColor: '#0a0a0a',
  elements: [{
    id: eid(), type: 'iframe', x: 0, y: 0, width: 1080, height: 1920,
    rotation: 0, zIndex: 1, opacity: 1, locked: false, visible: true, name: 'Academia HTML',
    props: { htmlContent: htmlGymContent, borderRadius: 0, scrolling: false,
      htmlPages: [
        { id: 'page_0', name: 'Início', selector: '[data-page="home"]' },
        { id: 'page_1', name: 'Planos', selector: '[data-page="planos"]' },
        { id: 'page_2', name: 'Aulas', selector: '[data-page="aulas"]' },
        { id: 'page_3', name: 'Check-in', selector: '[data-page="checkin"]' },
      ],
    },
  }],
  selectedId: null,
  views: [
    { id: 'page_0', name: 'Início', isDefault: true },
    { id: 'page_1', name: 'Planos', isDefault: false },
    { id: 'page_2', name: 'Aulas', isDefault: false },
    { id: 'page_3', name: 'Check-in', isDefault: false },
  ],
  activeViewId: 'page_0',
  viewIdleTimeout: 30,
  pageBgColors: {},
};

// ═══════════════════════════════════════════════════
// Export all
// ═══════════════════════════════════════════════════
export const FREEFORM_TEMPLATES: FreeFormTemplate[] = [
  // ── Single-page ──
  { id: 'store-welcome', name: 'Loja – Welcome Screen', description: 'Tela de boas-vindas estilo Figma com seletor de idioma e acessibilidade', icon: '🛍️', category: 'retail', state: storeWelcome },
  { id: 'welcome-avatar', name: 'Boas-vindas + Avatar', description: 'Avatar 3D com botões de ação e relógio', icon: '🧑‍💼', category: 'welcome', state: welcomeAvatar },
  { id: 'shopping-directory', name: 'Diretório de Lojas', description: 'Diretório com busca, filtro e chat IA', icon: '🏪', category: 'menu', state: shoppingDirectory },
  { id: 'shopping-avatar-dir', name: 'Shopping + Avatar', description: 'Avatar IA, busca, filtros, lojas e navegação inferior', icon: '🤖', category: 'retail', state: shoppingAvatarDirectory },
  { id: 'promo-blackfriday', name: 'Promoções & Ofertas', description: 'Layout promocional com hero e descontos', icon: '🔥', category: 'promo', state: promoBlackFriday },
  { id: 'restaurant-menu', name: 'Cardápio Digital', description: 'Menu com seções e preços', icon: '🍕', category: 'menu', state: restaurantMenu },
  { id: 'corporate-reception', name: 'Recepção Corporativa', description: 'Check-in de visitantes e agenda', icon: '🏢', category: 'corporate', state: corporateReception },
  { id: 'event-conference', name: 'Evento / Conferência', description: 'Programação com countdown', icon: '🎤', category: 'info', state: eventConference },
  { id: 'minimal-service', name: 'Atendimento Minimalista', description: 'Chat IA e ações rápidas', icon: '💬', category: 'welcome', state: minimalService },
  { id: 'hospital-clinic', name: 'Hospital / Clínica', description: 'Senhas, departamentos e chat', icon: '🏥', category: 'health', state: hospitalClinic },
  { id: 'hotel-tourism', name: 'Hotel / Turismo', description: 'Check-in digital e serviços', icon: '🏨', category: 'hotel', state: hotelTourism },
  { id: 'retail-store', name: 'Loja / Varejo', description: 'Catálogo com QR Pix e CTA', icon: '🛍️', category: 'retail', state: retailStore },
  // ── Multi-page (com navegação entre páginas) ──
  { id: 'mp-restaurant', name: '🍽️ Restaurante Completo', description: '4 páginas: Início → Cardápio → Pedido → Pagamento', icon: '🍽️', category: 'menu', state: mpRestaurant },
  { id: 'mp-shopping', name: '🏬 Shopping Center', description: '5 páginas: Início → Lojas → Promos → Food → Ajuda', icon: '🏬', category: 'menu', state: mpShopping },
  { id: 'mp-clinic', name: '🏥 Clínica Médica', description: '4 páginas: Início → Senhas → Setores → Assistente', icon: '🏥', category: 'health', state: mpClinic },
  { id: 'mp-hotel', name: '🏨 Hotel Completo', description: '4 páginas: Início → Check-in → Serviços → Turismo', icon: '🏨', category: 'hotel', state: mpHotel },
  { id: 'mp-event', name: '🎤 Evento Multi-página', description: '3 páginas: Início → Programação → Informações', icon: '🎤', category: 'info', state: mpEvent },
  { id: 'mp-shopping-ai', name: '🤖 Shopping AI Assistant', description: '4 páginas: Lojas + Avatar → Categorias → Mapa → Eventos', icon: '🤖', category: 'retail', state: mpShoppingAI },
  // ── HTML Puro (multi-page) ──
  { id: 'html-shopping', name: '📄 Shopping HTML Puro', description: '4 páginas HTML nativas com navegação, edição inline de textos e imagens', icon: '📄', category: 'retail', state: mpHtmlShopping },
  { id: 'html-restaurant', name: '🍕 Pizzaria HTML Puro', description: '4 páginas: Início → Cardápio → Pedido → Sobre com design premium', icon: '🍕', category: 'menu', state: mpHtmlRestaurant },
  { id: 'html-clinic', name: '🏥 Clínica HTML Puro', description: '4 páginas: Início → Especialidades → Médicos → Informações', icon: '🏥', category: 'health', state: mpHtmlClinic },
  { id: 'html-barber', name: '💈 Barbearia HTML Puro', description: '4 páginas: Início → Serviços → Portfólio → Agendamento', icon: '💈', category: 'welcome', state: mpHtmlBarber },
  { id: 'html-hotel', name: '🏨 Hotel HTML Puro', description: '4 páginas: Início → Quartos → Serviços → Turismo', icon: '🏨', category: 'hotel', state: mpHtmlHotel },
  { id: 'html-gym', name: '🏋️ Academia HTML Puro', description: '4 páginas: Início → Planos → Aulas → Check-in', icon: '🏋️', category: 'menu', state: mpHtmlGym },
];
