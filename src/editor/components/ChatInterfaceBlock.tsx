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
  headerShow: boolean;
  headerTitle: string;
  headerSubtitle: string;
  headerIcon: string;
  headerIndicatorColor: string;
  ctaText: string;
  ctaIcon: string;
  opacity: number;
  blur: number;
  zIndex: number;
  folderIconDefault: string;
  itemIconDefault: string;
  folderArrowSymbol: string;
  itemArrowSymbol: string;
  items: MenuItemProps[];
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

/** Mini preview de um item do menu — estilo Premium Kiosk */
function MenuPreviewItem({ item, depth = 0 }: { item: MenuItemProps; depth?: number }) {
  const [open, setOpen] = useState(false);
  const isFolder = item.type === 'folder' || (item.children && item.children.length > 0);

  return (
    <div style={{ marginLeft: depth * 14 }}>
      <div
        onClick={() => isFolder && setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(12px)',
          borderRadius: 16, marginBottom: 5,
          cursor: isFolder ? 'pointer' : 'default',
          border: '1px solid rgba(255,255,255,0.12)',
          fontSize: 13, color: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
        <span style={{ flex: 1, fontWeight: 600, letterSpacing: '-0.01em' }}>{item.label}</span>
        {item.description && <span style={{ opacity: 0.45, fontSize: 11 }}>{item.description}</span>}
        {isFolder && (
          <span style={{
            opacity: 0.5, fontSize: 10,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.25s',
            display: 'inline-block',
          }}>▼</span>
        )}
        {!isFolder && (
          <span style={{
            width: 22, height: 22, borderRadius: 11,
            background: 'linear-gradient(135deg,#6366f1,#ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, flexShrink: 0,
          }}>→</span>
        )}
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
    blur = 20,
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

  /* ── glass base ── */
  const glass: React.CSSProperties = {
    background: 'rgba(30,41,59,0.72)',
    backdropFilter: `blur(${blur}px) saturate(1.6)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(1.6)`,
    border: '1px solid rgba(255,255,255,0.13)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
  };

  if (!enabled) {
    return (
      <div style={{ ...layoutStyle, cursor: 'move', pointerEvents: 'auto' }}>
        <div
          ref={(ref) => { if (ref) connect(drag(ref)); }}
          className={`transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
        >
          <div style={{ padding:'14px 18px', ...glass, borderRadius:24, textAlign:'center', color:'rgba(255,255,255,0.35)', fontSize:13 }}>
            💬 ChatInterface (desabilitado)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...layoutStyle, cursor: 'move', pointerEvents: 'auto' }}>
      <div
        ref={(ref) => { if (ref) connect(drag(ref)); }}
        className={`transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      >
        {/* Preview label */}
        <div style={{
          fontSize: 9, fontWeight: 700, color: 'rgba(99,102,241,0.7)', letterSpacing: '0.1em',
          textTransform: 'uppercase', marginBottom: 6, textAlign: 'center',
        }}>
          Chat Interface — {position.replace('_', ' ')}
        </div>

        <div style={{ position: 'relative' }}>
          {/* ── Header ── */}
          {headerShow && (
            <div style={{
              ...glass,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', borderRadius: '28px 28px 0 0', borderBottom: 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: headerIndicatorColor, boxShadow: `0 0 8px ${headerIndicatorColor}` }} />
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>{headerTitle}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
                <span>{headerIcon}</span>
                <span>{headerSubtitle}</span>
              </div>
            </div>
          )}

          {/* ── CTA Pill button ── */}
          <div
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              boxShadow: '0 4px 20px rgba(99,102,241,0.45), 0 2px 8px rgba(0,0,0,0.25)',
              borderRadius: headerShow ? '0 0 28px 28px' : 28,
              padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer', opacity,
            }}
            onClick={() => setDropOpen(!dropOpen)}
          >
            <span style={{ fontSize: 20 }}>{ctaIcon}</span>
            <span style={{ color: '#fff', fontSize: 15, fontWeight: 700, flex: 1, letterSpacing: '-0.01em' }}>{ctaText}</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s', display: 'inline-block' }}>{folderArrowSymbol}</span>
          </div>

          {/* ── Dropdown ── */}
          {dropOpen && (
            <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 6, ...glass, borderRadius: 24, padding: 10, maxHeight: 300, overflowY: 'auto', zIndex: 50, opacity }}>
              {items.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12, padding: '14px 0' }}>Nenhum item configurado</p>
              ) : (
                items.map(item => <MenuPreviewItem key={item.id} item={item} />)
              )}
            </div>
          )}
        </div>
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
    blur: 20,
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
