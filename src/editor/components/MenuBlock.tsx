import { useState } from 'react';
import { useNode, UserComponent } from '@craftjs/core';
import { MenuBlockSettings } from '../settings/MenuBlockSettings';
import { DEFAULT_LAYOUT_PROPS, getLayoutStyle } from '../shared/layoutProps';

export interface MenuItem {
  id: string;
  emoji: string;
  label: string;
  action: string;
  color: string;
}

export interface MenuBlockProps {
  title: string;
  titleIcon: string;
  items: MenuItem[];
  layout: 'grid' | 'list' | 'pills';
  columns: number;
  bgColor: string;
  bgOpacity: number;
  bgBlur: number;
  borderRadius: number;
  gap: number;
  padding: number;
  titleColor: string;
  titleFontSize: number;
  itemBgColor: string;
  itemTextColor: string;
  itemFontSize: number;
  itemBorderRadius: number;
  showItemEmoji: boolean;
  collapsible: boolean;
  defaultOpen: boolean;
}

const DEFAULT_ITEMS: MenuItem[] = [
  { id: '1', emoji: 'ℹ️', label: 'Informações', action: 'Quem é você?', color: '#6366f1' },
  { id: '2', emoji: '📍', label: 'Localização', action: 'Onde estamos?', color: '#8b5cf6' },
  { id: '3', emoji: '📞', label: 'Contato', action: 'Como falar conosco?', color: '#10b981' },
  { id: '4', emoji: '⭐', label: 'Destaques', action: 'Quais são os destaques?', color: '#ec4899' },
];

export const MenuBlock: UserComponent<Partial<MenuBlockProps>> = (allProps) => {
  const {
    title = 'Menu',
    titleIcon = '💬',
    items = DEFAULT_ITEMS,
    layout = 'grid',
    columns = 2,
    bgColor = 'rgba(30,41,59,0.65)',
    bgOpacity = 1,
    bgBlur = 20,
    borderRadius = 28,
    gap = 10,
    padding = 20,
    titleColor = '#ffffff',
    titleFontSize = 15,
    itemBgColor = 'rgba(255,255,255,0.08)',
    itemTextColor = '#ffffff',
    itemFontSize = 14,
    itemBorderRadius = 18,
    showItemEmoji = true,
    collapsible = false,
    defaultOpen = true,
  } = allProps;

  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  const [isOpen, setIsOpen] = useState(defaultOpen);

  const renderItems = () => {
    if (layout === 'pills') {
      return (
        <div className="flex flex-wrap" style={{ gap }}>
          {items.map((item) => (
            <button
              key={item.id}
              className="inline-flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${item.color}33, ${item.color}18)`,
                color: itemTextColor,
                fontSize: itemFontSize,
                borderRadius: 999,
                padding: '10px 20px',
                border: `1px solid ${item.color}55`,
                fontWeight: 600,
                backdropFilter: 'blur(12px)',
                boxShadow: `0 2px 12px ${item.color}22`,
                letterSpacing: '-0.01em',
              }}
              onClick={(e) => e.preventDefault()}
            >
              {showItemEmoji && <span>{item.emoji}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      );
    }

    const gridStyle = layout === 'grid'
      ? { display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }
      : { display: 'flex', flexDirection: 'column' as const, gap };

    return (
      <div style={gridStyle}>
        {items.map((item) => (
          <button
            key={item.id}
            className="flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${item.color}22, rgba(255,255,255,0.05))`,
              color: itemTextColor,
              fontSize: itemFontSize,
              borderRadius: itemBorderRadius,
              padding: layout === 'list' ? '14px 18px' : '16px 14px',
              border: `1px solid ${item.color}33`,
              textAlign: layout === 'grid' ? 'center' : 'left',
              flexDirection: layout === 'grid' ? 'column' : 'row',
              fontWeight: 600,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              minHeight: 52,
              boxShadow: `0 4px 16px rgba(0,0,0,0.18), 0 0 0 1px ${item.color}18`,
              letterSpacing: '-0.01em',
            }}
            onClick={(e) => e.preventDefault()}
          >
            {showItemEmoji && (
              <span
                className="flex items-center justify-center shrink-0"
                style={{
                  width: layout === 'grid' ? 42 : 36,
                  height: layout === 'grid' ? 42 : 36,
                  borderRadius: layout === 'grid' ? 16 : 12,
                  background: `linear-gradient(135deg, ${item.color}40, ${item.color}20)`,
                  border: `1px solid ${item.color}40`,
                  fontSize: layout === 'grid' ? 20 : 18,
                }}
              >
                {item.emoji}
              </span>
            )}
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>
    );
  };

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
          opacity: bgOpacity,
          borderRadius,
          padding,
          backdropFilter: bgBlur > 0 ? `blur(${bgBlur}px) saturate(1.5)` : undefined,
          WebkitBackdropFilter: bgBlur > 0 ? `blur(${bgBlur}px) saturate(1.5)` : undefined,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        {title && (
          <button
            className="w-full flex items-center gap-2.5 mb-4"
            style={{ color: titleColor, fontSize: titleFontSize, fontWeight: 700, letterSpacing: '-0.02em' }}
            onClick={() => collapsible && setIsOpen(!isOpen)}
          >
            <span style={{ fontSize: titleFontSize * 1.2 }}>{titleIcon}</span>
            <span>{title}</span>
            {collapsible && (
              <span className="ml-auto text-sm opacity-50" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                ▾
              </span>
            )}
          </button>
        )}
        {(!collapsible || isOpen) && renderItems()}
      </div>
    </div>
  );
};

MenuBlock.craft = {
  props: {
    title: 'Menu Interativo',
    titleIcon: '💬',
    items: DEFAULT_ITEMS,
    layout: 'grid',
    columns: 2,
    bgColor: 'rgba(30,41,59,0.65)',
    bgOpacity: 1,
    bgBlur: 20,
    borderRadius: 28,
    gap: 10,
    padding: 20,
    titleColor: '#ffffff',
    titleFontSize: 15,
    itemBgColor: 'rgba(255,255,255,0.08)',
    itemTextColor: '#ffffff',
    itemFontSize: 14,
    itemBorderRadius: 18,
    showItemEmoji: true,
    collapsible: false,
    defaultOpen: true,
    ...DEFAULT_LAYOUT_PROPS,
  },
  related: { settings: MenuBlockSettings },
  displayName: 'Menu',
};
