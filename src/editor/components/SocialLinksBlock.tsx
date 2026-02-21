import { useNode, UserComponent } from '@craftjs/core';
import { SocialLinksBlockSettings } from '../settings/SocialLinksBlockSettings';
import { DEFAULT_LAYOUT_PROPS, getLayoutStyle } from '../shared/layoutProps';
import { SocialIcon } from '../shared/socialIcons';
import type { LayoutProps } from '../shared/layoutProps';

export interface SocialLink { id: string; icon: string; label: string; url: string; color: string; platform?: string; }
export interface SocialLinksBlockProps {
  links: SocialLink[]; layout: 'horizontal' | 'vertical'; iconSize: number;
  gap: number; showLabels: boolean; bgEnabled: boolean; bgColor: string;
  borderRadius: number; padding: number;
}

const DEFAULT_LINKS: SocialLink[] = [
  { id:'1', icon:'📸', label:'Instagram', url:'', color:'#E1306C', platform:'instagram' },
  { id:'2', icon:'👤', label:'Facebook', url:'', color:'#1877F2', platform:'facebook' },
  { id:'3', icon:'🌐', label:'Website', url:'', color:'#6366f1', platform:'website' },
  { id:'4', icon:'📧', label:'Email', url:'', color:'#EA4335', platform:'email' },
];

export const SocialLinksBlock: UserComponent<Partial<SocialLinksBlockProps & LayoutProps>> = (props) => {
  const {
    links = DEFAULT_LINKS, layout = 'horizontal', iconSize = 40, gap = 12,
    showLabels = true, bgEnabled = false, bgColor = 'rgba(255,255,255,0.06)',
    borderRadius = 16, padding = 12,
  } = props;
  const { connectors: { connect, drag }, isActive, isHovered } = useNode((node) => ({ isActive: node.events.selected, isHovered: node.events.hovered }));
  const layoutStyle = getLayoutStyle(props as any);
  return (
    <div style={{
      ...layoutStyle,
      cursor: 'move',
      pointerEvents: 'auto',
      zIndex: isActive ? 50 : isHovered ? 40 : (layoutStyle.zIndex || undefined),
      isolation: 'isolate',
    }}>
      <style>{`
        @keyframes social-craft-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
        .social-craft-btn:hover .social-craft-icon { animation: social-craft-pulse 0.6s ease-in-out; box-shadow: 0 0 16px var(--glow); }
        .social-craft-btn:hover { transform: scale(1.12); }
        .social-craft-btn:active { transform: scale(0.95); }
        .social-craft-btn { transition: transform 0.2s ease; }
      `}</style>
      <div
        ref={(ref) => { if (ref) connect(drag(ref)); }}
        className={`transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2 rounded-md shadow-lg shadow-primary/20' : isHovered ? 'ring-1 ring-primary/50 rounded-md' : 'hover:ring-1 hover:ring-primary/30 rounded-sm'}`}
        style={{ padding: 4 }}
      >
        <div className="flex items-center justify-center" style={{
          flexDirection: layout === 'vertical' ? 'column' : 'row', gap, padding,
          backgroundColor: bgEnabled ? bgColor : 'transparent',
          borderRadius: bgEnabled ? borderRadius : 0,
          backdropFilter: bgEnabled ? 'blur(8px)' : undefined,
          border: bgEnabled ? '1px solid rgba(255,255,255,0.08)' : undefined,
        }}>
          {links.map((link) => {
            const platform = link.platform || link.label?.toLowerCase() || '';
            return (
              <button key={link.id} className="social-craft-btn flex items-center gap-2"
                style={{ flexDirection: layout==='vertical' ? 'row' : 'column', gap: showLabels ? 4 : 0, '--glow': link.color + '66' } as any}
                onClick={(e) => e.preventDefault()}>
                <div className="social-craft-icon flex items-center justify-center rounded-xl transition-all duration-200" style={{ width:iconSize, height:iconSize, backgroundColor:link.color+'20', border:`1px solid ${link.color}40` }}>
                  <SocialIcon platform={platform} size={iconSize} color={link.color} />
                </div>
                {showLabels && <span style={{ fontSize:10, color:'rgba(255,255,255,0.6)', fontWeight:500 }}>{link.label}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

SocialLinksBlock.craft = {
  props: {
    links: DEFAULT_LINKS, layout:'horizontal', iconSize:40, gap:12,
    showLabels:true, bgEnabled:false, bgColor:'rgba(255,255,255,0.06)', borderRadius:16, padding:12,
    ...DEFAULT_LAYOUT_PROPS,
  },
  related: { settings: SocialLinksBlockSettings },
  displayName: 'Redes Sociais',
};
