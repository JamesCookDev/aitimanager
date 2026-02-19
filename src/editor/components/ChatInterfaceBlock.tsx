import React, { useState } from 'react';
import { useNode, UserComponent } from '@craftjs/core';
import { ChatInterfaceBlockSettings } from '../settings/ChatInterfaceBlockSettings';
import { DEFAULT_LAYOUT_PROPS, getLayoutStyle } from '../shared/layoutProps';
import type { LayoutProps } from '../shared/layoutProps';

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

export interface ChatInterfaceBlockProps extends Partial<LayoutProps> {
  enabled: boolean;
  position: 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left' | 'center';
  // Header
  headerShow: boolean;
  headerTitle: string;
  headerSubtitle: string;
  headerIcon: string;
  headerIndicatorColor: string;
  // CTA Button
  ctaText: string;
  ctaIcon: string;
  // Style
  opacity: number;
  blur: number;
  zIndex: number;
  // Folder styles
  folderIconDefault: string;
  itemIconDefault: string;
  folderArrowSymbol: string;
  itemArrowSymbol: string;
  // Menu items
  items: MenuItemProps[];
  // Behavior
  closeOnSelect: boolean;
}

const POSITION_STYLES: Record<string, React.CSSProperties> = {
  bottom_right: { bottom: 16, right: 16 },
  bottom_left: { bottom: 16, left: 16 },
  top_right: { top: 16, right: 16 },
  top_left: { top: 16, left: 16 },
  center: { bottom: 16, left: '50%', transform: 'translateX(-50%)' },
};

const DEFAULT_ITEMS: MenuItemProps[] = [
  {
    id: '1', type: 'folder', icon: '📋', label: 'Serviços',
    children: [
      { id: '1-1', type: 'action', icon: '💬', label: 'Informações gerais', prompt: 'Me fale sobre os serviços disponíveis', gradient: 'from-blue-400 to-indigo-400' },
      { id: '1-2', type: 'action', icon: '📍', label: 'Localização', prompt: 'Onde fica o local?', gradient: 'from-teal-400 to-cyan-400' },
    ],
  },
  {
    id: '2', type: 'action', icon: '🆘', label: 'Ajuda', prompt: 'Preciso de ajuda', gradient: 'from-rose-400 to-red-400',
  },
];

/** Mini preview de um item do menu */
function MenuPreviewItem({ item, depth = 0 }: { item: MenuItemProps; depth?: number }) {
  const [open, setOpen] = useState(false);
  const isFolder = item.type === 'folder' || (item.children && item.children.length > 0);

  return (
    <div style={{ marginLeft: depth * 12 }}>
      <div
        onClick={() => isFolder && setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
          background: 'rgba(255,255,255,0.06)', borderRadius: 8, marginBottom: 3,
          cursor: isFolder ? 'pointer' : 'default',
          border: '1px solid rgba(255,255,255,0.08)',
          fontSize: 11, color: '#fff',
        }}
      >
        <span style={{ fontSize: 14 }}>{item.icon}</span>
        <span style={{ flex: 1, fontWeight: 500 }}>{item.label}</span>
        {item.description && <span style={{ opacity: 0.5, fontSize: 10 }}>{item.description}</span>}
        {isFolder && <span style={{ opacity: 0.5, fontSize: 9, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>}
        {!isFolder && <span style={{ opacity: 0.5 }}>→</span>}
      </div>
      {isFolder && open && item.children?.map(child => (
        <MenuPreviewItem key={child.id} item={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export const ChatInterfaceBlock: UserComponent<Partial<ChatInterfaceBlockProps>> = (props) => {
  const {
    enabled = true,
    position = 'bottom_right',
    headerShow = true,
    headerTitle = 'Assistente Virtual',
    headerSubtitle = 'Online agora',
    headerIcon = '📍',
    headerIndicatorColor = '#10b981',
    ctaText = 'Como posso ajudar?',
    ctaIcon = '💬',
    opacity = 1,
    blur = 15,
    zIndex = 1000,
    folderArrowSymbol = '▼',
    itemArrowSymbol = '→',
    items = DEFAULT_ITEMS,
    closeOnSelect = true,
  } = props;

  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  const layoutStyle = getLayoutStyle(props as any);
  const [dropOpen, setDropOpen] = useState(false);
  const posStyle = POSITION_STYLES[position] || POSITION_STYLES.bottom_right;

  if (!enabled) {
    return (
      <div
        ref={(ref) => { if (ref) connect(drag(ref)); }}
        className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
        style={{ ...layoutStyle, cursor: 'move' }}
      >
        <div style={{
          padding: '12px 16px', background: 'rgba(255,255,255,0.04)',
          border: '1.5px dashed rgba(255,255,255,0.15)', borderRadius: 12,
          textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12,
        }}>
          💬 ChatInterface (desabilitado)
        </div>
      </div>
    );
  }

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      style={{ cursor: 'move', pointerEvents: 'auto', ...layoutStyle }}
    >
      {/* Preview label */}
      <div style={{
        fontSize: 9, fontWeight: 700, color: 'rgba(99,102,241,0.8)', letterSpacing: '0.08em',
        textTransform: 'uppercase', marginBottom: 4, textAlign: 'center',
      }}>
        Chat Interface — Preview (posição: {position.replace('_', ' ')})
      </div>

      {/* Simulated chat widget */}
      <div style={{ position: 'relative', minHeight: 80 }}>
        {/* Header */}
        {headerShow && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', background: 'rgba(16,23,42,0.85)',
            backdropFilter: `blur(${blur}px)`, borderRadius: '12px 12px 0 0',
            border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                backgroundColor: headerIndicatorColor,
                boxShadow: `0 0 6px ${headerIndicatorColor}`,
              }} />
              <span style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>{headerTitle}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>
              <span>{headerIcon}</span>
              <span>{headerSubtitle}</span>
            </div>
          </div>
        )}

        {/* Toggle button */}
        <div style={{
          background: 'rgba(16,23,42,0.85)', backdropFilter: `blur(${blur}px)`,
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: headerShow ? '0 0 12px 12px' : 12,
          padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8,
          cursor: 'pointer', opacity,
        }} onClick={() => setDropOpen(!dropOpen)}>
          <span style={{ fontSize: 16 }}>{ctaIcon}</span>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 500, flex: 1 }}>{ctaText}</span>
          <span style={{
            fontSize: 9, color: 'rgba(255,255,255,0.5)',
            transition: 'transform 0.2s',
            transform: dropOpen ? 'rotate(180deg)' : 'none',
          }}>{folderArrowSymbol}</span>
        </div>

        {/* Dropdown */}
        {dropOpen && (
          <div style={{
            position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 4,
            background: 'rgba(16,23,42,0.9)', backdropFilter: `blur(${blur}px)`,
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
            padding: 8, maxHeight: 280, overflowY: 'auto', zIndex: 50,
            opacity,
          }}>
            {items.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 11, padding: '12px 0' }}>
                Nenhum item configurado
              </p>
            ) : (
              items.map(item => <MenuPreviewItem key={item.id} item={item} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

ChatInterfaceBlock.craft = {
  props: {
    enabled: true,
    position: 'bottom_right',
    headerShow: true,
    headerTitle: 'Assistente Virtual',
    headerSubtitle: 'Online agora',
    headerIcon: '📍',
    headerIndicatorColor: '#10b981',
    ctaText: 'Como posso ajudar?',
    ctaIcon: '💬',
    opacity: 1,
    blur: 15,
    zIndex: 1000,
    folderArrowSymbol: '▼',
    itemArrowSymbol: '→',
    items: DEFAULT_ITEMS,
    closeOnSelect: true,
    ...DEFAULT_LAYOUT_PROPS,
  },
  related: { settings: ChatInterfaceBlockSettings },
  displayName: 'Chat Interface',
};
