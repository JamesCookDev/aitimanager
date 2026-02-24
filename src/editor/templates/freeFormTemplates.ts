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
    description: 'Diretório com busca, filtro por categoria e chat IA',
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
  {
    id: 'hospital-clinic',
    name: 'Hospital / Clínica',
    description: 'Sistema de senhas, departamentos e chat para pacientes',
    icon: '🏥',
    category: 'health',
    state: hospitalClinic,
  },
  {
    id: 'hotel-tourism',
    name: 'Hotel / Turismo',
    description: 'Check-in digital com formulário e serviços do hotel',
    icon: '🏨',
    category: 'hotel',
    state: hotelTourism,
  },
  {
    id: 'retail-store',
    name: 'Loja / Varejo',
    description: 'Catálogo de produtos com QR Pix e CTA de compra',
    icon: '🛍️',
    category: 'retail',
    state: retailStore,
  },
];
