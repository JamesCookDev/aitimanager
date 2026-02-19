import { useState } from 'react';
import { useNode, UserComponent } from '@craftjs/core';
import { MenuBlockSettings } from '../settings/MenuBlockSettings';
import { DEFAULT_LAYOUT_PROPS, getLayoutStyle } from '../shared/layoutProps';
import type { LayoutProps } from '../shared/layoutProps';

// Reutiliza o mesmo tipo de item do ChatInterfaceBlock para paridade total
export interface MenuItemProps {
  id: string;
  type: 'action' | 'folder';
  icon: string;
  label: string;
  description?: string;
  prompt?: string;
  gradient?: string;
  children?: MenuItemProps[];
}

// Mantém compatibilidade reversa
export type MenuItem = MenuItemProps;

export interface MenuBlockProps extends Partial<LayoutProps> {
  title: string;
  titleIcon: string;
  items: MenuItemProps[];
  bgBlur: number;
  bgColor: string;
  borderRadius: number;
  gap: number;
  padding: number;
  titleColor: string;
  folderArrowSymbol: string;
  itemArrowSymbol: string;
  closeOnSelect: boolean;
  // legados (mantidos para não quebrar configs antigas)
  layout?: string;
  columns?: number;
  showItemEmoji?: boolean;
  collapsible?: boolean;
}

const DEFAULT_ITEMS: MenuItemProps[] = [
  {
    id: '1', type: 'folder', icon: '📋', label: 'Serviços',
    children: [
      { id: '1-1', type: 'action', icon: '💬', label: 'Informações', prompt: 'Me fale sobre os serviços', gradient: 'from-blue-400 to-indigo-400' },
      { id: '1-2', type: 'action', icon: '📍', label: 'Localização', prompt: 'Onde fica o local?', gradient: 'from-teal-400 to-cyan-400' },
    ],
  },
  { id: '2', type: 'action', icon: '⭐', label: 'Destaques', prompt: 'Quais são os destaques?', gradient: 'from-orange-400 to-yellow-400' },
  { id: '3', type: 'action', icon: '🆘', label: 'Ajuda', prompt: 'Preciso de ajuda', gradient: 'from-rose-400 to-red-400' },
];

// Extrai as classes Tailwind do gradiente para o CSS inline
function gradientToCss(gradient: string = 'from-blue-400 to-indigo-400'): string {
  const map: Record<string, string> = {
    'from-blue-400 to-indigo-400': 'linear-gradient(135deg, #60a5fa, #818cf8)',
    'from-teal-400 to-cyan-400': 'linear-gradient(135deg, #2dd4bf, #22d3ee)',
    'from-purple-400 to-pink-400': 'linear-gradient(135deg, #c084fc, #f472b6)',
    'from-orange-400 to-yellow-400': 'linear-gradient(135deg, #fb923c, #facc15)',
    'from-green-400 to-emerald-400': 'linear-gradient(135deg, #4ade80, #34d399)',
    'from-rose-400 to-red-400': 'linear-gradient(135deg, #fb7185, #f87171)',
  };
  return map[gradient] || map['from-blue-400 to-indigo-400'];
}

/** Item de menu suspense — ação ou pasta colapsável */
function MenuDropdownItem({
  item,
  depth = 0,
  folderArrow = '▼',
  itemArrow = '→',
  onSelect,
}: {
  item: MenuItemProps;
  depth?: number;
  folderArrow?: string;
  itemArrow?: string;
  onSelect?: (item: MenuItemProps) => void;
}) {
  const [open, setOpen] = useState(false);
  const isFolder = item.type === 'folder' || (item.children && item.children.length > 0);
  const bg = gradientToCss(item.gradient);

  return (
    <div style={{ marginLeft: depth * 12 }}>
      <div
        onClick={() => {
          if (isFolder) { setOpen((v) => !v); }
          else { onSelect?.(item); }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          background: isFolder ? 'rgba(255,255,255,0.07)' : `${bg.replace(')', ', 0.18)').replace('linear-gradient(', 'linear-gradient(')}`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: 16,
          marginBottom: 6,
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.12)',
          fontSize: 13,
          color: '#fff',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          transition: 'all 0.15s ease',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
        <span style={{ flex: 1 }}>{item.label}</span>
        {item.description && (
          <span style={{ fontSize: 11, opacity: 0.6 }}>{item.description}</span>
        )}
        <span style={{ opacity: 0.6, fontSize: 11, flexShrink: 0 }}>
          {isFolder ? (open ? '▲' : folderArrow) : itemArrow}
        </span>
      </div>

      {/* Sub-itens */}
      {isFolder && open && (
        <div style={{ marginBottom: 4 }}>
          {(item.children || []).map((child) => (
            <MenuDropdownItem
              key={child.id}
              item={child}
              depth={depth + 1}
              folderArrow={folderArrow}
              itemArrow={itemArrow}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const MenuBlock: UserComponent<Partial<MenuBlockProps>> = (allProps) => {
  const {
    title = 'Menu Interativo',
    titleIcon = '💬',
    items = DEFAULT_ITEMS,
    bgBlur = 20,
    bgColor = 'rgba(30,41,59,0.75)',
    borderRadius = 28,
    gap = 8,
    padding = 20,
    titleColor = '#ffffff',
    folderArrowSymbol = '▼',
    itemArrowSymbol = '→',
  } = allProps;

  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  const layoutStyle = getLayoutStyle(allProps as any);

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      style={{ cursor: 'move', pointerEvents: 'auto', ...layoutStyle }}
    >
      <div
        style={{
          backgroundColor: bgColor,
          borderRadius,
          padding,
          backdropFilter: bgBlur > 0 ? `blur(${bgBlur}px) saturate(1.6)` : undefined,
          WebkitBackdropFilter: bgBlur > 0 ? `blur(${bgBlur}px) saturate(1.6)` : undefined,
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        }}
      >
        {/* Header */}
        {title && (
          <div
            className="flex items-center gap-2.5 mb-4"
            style={{ color: titleColor, fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}
          >
            <span style={{ fontSize: 18 }}>{titleIcon}</span>
            <span>{title}</span>
          </div>
        )}

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap }}>
          {(items || []).map((item) => (
            <MenuDropdownItem
              key={item.id}
              item={item}
              folderArrow={folderArrowSymbol}
              itemArrow={itemArrowSymbol}
              onSelect={() => { /* no-op no editor */ }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

MenuBlock.craft = {
  props: {
    title: 'Menu Interativo',
    titleIcon: '💬',
    items: DEFAULT_ITEMS,
    bgBlur: 20,
    bgColor: 'rgba(30,41,59,0.75)',
    borderRadius: 28,
    gap: 8,
    padding: 20,
    titleColor: '#ffffff',
    folderArrowSymbol: '▼',
    itemArrowSymbol: '→',
    closeOnSelect: true,
    ...DEFAULT_LAYOUT_PROPS,
  },
  related: { settings: MenuBlockSettings },
  displayName: 'Menu',
};
