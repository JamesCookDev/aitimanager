import { useState } from 'react';
import { useNode, UserComponent } from '@craftjs/core';
import { MenuBlockSettings } from '../settings/MenuBlockSettings';

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
  { id: '1', emoji: 'ℹ️', label: 'Informações', action: 'Quem é você?', color: '#0ea5e9' },
  { id: '2', emoji: '📍', label: 'Localização', action: 'Onde estamos?', color: '#8b5cf6' },
  { id: '3', emoji: '📞', label: 'Contato', action: 'Como falar conosco?', color: '#10b981' },
  { id: '4', emoji: '⭐', label: 'Destaques', action: 'Quais são os destaques?', color: '#f59e0b' },
];

export const MenuBlock: UserComponent<Partial<MenuBlockProps>> = ({
  title = 'Menu',
  titleIcon = '💬',
  items = DEFAULT_ITEMS,
  layout = 'grid',
  columns = 2,
  bgColor = 'rgba(255,255,255,0.06)',
  bgOpacity = 1,
  bgBlur = 12,
  borderRadius = 16,
  gap = 8,
  padding = 16,
  titleColor = '#ffffff',
  titleFontSize = 14,
  itemBgColor = 'rgba(255,255,255,0.08)',
  itemTextColor = '#ffffff',
  itemFontSize = 13,
  itemBorderRadius = 12,
  showItemEmoji = true,
  collapsible = false,
  defaultOpen = true,
}) => {
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
              className="inline-flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: item.color + '22',
                color: itemTextColor,
                fontSize: itemFontSize,
                borderRadius: 999,
                padding: '8px 16px',
                border: `1px solid ${item.color}44`,
                fontWeight: 500,
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
              backgroundColor: itemBgColor,
              color: itemTextColor,
              fontSize: itemFontSize,
              borderRadius: itemBorderRadius,
              padding: layout === 'list' ? '12px 16px' : '14px 12px',
              border: '1px solid rgba(255,255,255,0.06)',
              textAlign: layout === 'grid' ? 'center' : 'left',
              flexDirection: layout === 'grid' ? 'column' : 'row',
              fontWeight: 500,
              backdropFilter: 'blur(8px)',
              minHeight: 44,
            }}
            onClick={(e) => e.preventDefault()}
          >
            {showItemEmoji && (
              <span
                className="flex items-center justify-center shrink-0"
                style={{
                  width: layout === 'grid' ? 36 : 32,
                  height: layout === 'grid' ? 36 : 32,
                  borderRadius: 10,
                  backgroundColor: item.color + '25',
                  fontSize: layout === 'grid' ? 18 : 16,
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

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      style={{ cursor: 'move', pointerEvents: 'auto' }}
    >
      <div
        style={{
          backgroundColor: bgColor,
          opacity: bgOpacity,
          borderRadius,
          padding,
          backdropFilter: bgBlur > 0 ? `blur(${bgBlur}px)` : undefined,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Title */}
        {title && (
          <button
            className="w-full flex items-center gap-2 mb-3"
            style={{ color: titleColor, fontSize: titleFontSize, fontWeight: 600 }}
            onClick={() => collapsible && setIsOpen(!isOpen)}
          >
            <span>{titleIcon}</span>
            <span>{title}</span>
            {collapsible && (
              <span className="ml-auto text-sm opacity-50" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                ▾
              </span>
            )}
          </button>
        )}

        {/* Items */}
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
    bgColor: 'rgba(255,255,255,0.06)',
    bgOpacity: 1,
    bgBlur: 12,
    borderRadius: 16,
    gap: 8,
    padding: 16,
    titleColor: '#ffffff',
    titleFontSize: 14,
    itemBgColor: 'rgba(255,255,255,0.08)',
    itemTextColor: '#ffffff',
    itemFontSize: 13,
    itemBorderRadius: 12,
    showItemEmoji: true,
    collapsible: false,
    defaultOpen: true,
  },
  related: { settings: MenuBlockSettings },
  displayName: 'Menu',
};
