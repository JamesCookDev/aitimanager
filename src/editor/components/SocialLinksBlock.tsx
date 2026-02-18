import { useNode, UserComponent } from '@craftjs/core';
import { SocialLinksBlockSettings } from '../settings/SocialLinksBlockSettings';

export interface SocialLink {
  id: string;
  icon: string;
  label: string;
  url: string;
  color: string;
}

export interface SocialLinksBlockProps {
  links: SocialLink[];
  layout: 'horizontal' | 'vertical';
  iconSize: number;
  gap: number;
  showLabels: boolean;
  bgEnabled: boolean;
  bgColor: string;
  borderRadius: number;
  padding: number;
}

const DEFAULT_LINKS: SocialLink[] = [
  { id: '1', icon: '📸', label: 'Instagram', url: '', color: '#E1306C' },
  { id: '2', icon: '👤', label: 'Facebook', url: '', color: '#1877F2' },
  { id: '3', icon: '🌐', label: 'Website', url: '', color: '#6366f1' },
  { id: '4', icon: '📧', label: 'Email', url: '', color: '#10b981' },
];

export const SocialLinksBlock: UserComponent<Partial<SocialLinksBlockProps>> = (props) => {
  const {
    links = DEFAULT_LINKS,
    layout = 'horizontal',
    iconSize = 40,
    gap = 12,
    showLabels = true,
    bgEnabled = false,
    bgColor = 'rgba(255,255,255,0.06)',
    borderRadius = 16,
    padding = 12,
  } = props;

  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      style={{ padding: 4, cursor: 'move', pointerEvents: 'auto' }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          flexDirection: layout === 'vertical' ? 'column' : 'row',
          gap,
          padding,
          backgroundColor: bgEnabled ? bgColor : 'transparent',
          borderRadius: bgEnabled ? borderRadius : 0,
          backdropFilter: bgEnabled ? 'blur(8px)' : undefined,
          border: bgEnabled ? '1px solid rgba(255,255,255,0.08)' : undefined,
        }}
      >
        {links.map((link) => (
          <button
            key={link.id}
            className="flex items-center gap-2 transition-all hover:scale-110 active:scale-95"
            style={{
              flexDirection: layout === 'vertical' ? 'row' : 'column',
              gap: showLabels ? 4 : 0,
            }}
            onClick={(e) => e.preventDefault()}
          >
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                width: iconSize,
                height: iconSize,
                backgroundColor: link.color + '20',
                border: `1px solid ${link.color}40`,
                fontSize: iconSize * 0.5,
              }}
            >
              {link.icon}
            </div>
            {showLabels && (
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                {link.label}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

SocialLinksBlock.craft = {
  props: {
    links: DEFAULT_LINKS,
    layout: 'horizontal',
    iconSize: 40,
    gap: 12,
    showLabels: true,
    bgEnabled: false,
    bgColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 12,
  },
  related: { settings: SocialLinksBlockSettings },
  displayName: 'Redes Sociais',
};
