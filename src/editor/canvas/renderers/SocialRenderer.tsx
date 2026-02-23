import { Share2 } from 'lucide-react';
import { SocialIcon } from '@/editor/shared/socialIcons';

function SocialIconInline({ platform, size, color }: { platform: string; size: number; color: string }) {
  return <SocialIcon platform={platform} size={size} color={color} />;
}

export function SocialRenderer(props: any) {
  const links = props.links || [];
  const layout = props.layout || 'horizontal';
  const iconSize = props.iconSize || 36;
  const gap = props.gap || 16;
  const showLabels = props.showLabels !== false;
  const bgEnabled = props.bgEnabled || false;
  const bgColor = props.bgColor || 'rgba(0,0,0,0.3)';
  const borderRadius = props.borderRadius || 16;
  const padding = props.padding || 12;

  if (links.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Share2 className="w-8 h-8 text-white/30" />
        <span className="text-white/30 text-xs ml-2">Adicione redes sociais</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ padding: 4 }}>
      <style>{`
        @keyframes social-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        .social-icon-btn:hover .social-icon-circle { animation: social-pulse 0.6s ease-in-out; box-shadow: 0 0 16px var(--glow-color); }
        .social-icon-btn:hover { transform: scale(1.12); }
        .social-icon-btn:active { transform: scale(0.95); }
        .social-icon-btn { transition: transform 0.2s ease; }
      `}</style>
      <div className="flex items-center justify-center" style={{
        flexDirection: layout === 'vertical' ? 'column' : 'row',
        gap, padding,
        backgroundColor: bgEnabled ? bgColor : 'transparent',
        borderRadius: bgEnabled ? borderRadius : 0,
        backdropFilter: bgEnabled ? 'blur(8px)' : undefined,
        border: bgEnabled ? '1px solid rgba(255,255,255,0.08)' : undefined,
        flexWrap: 'wrap',
      }}>
        {links.map((link: any) => {
          const color = link.color || '#6366f1';
          return (
            <div key={link.id || link.platform} className="social-icon-btn flex items-center cursor-pointer"
              style={{ flexDirection: layout === 'vertical' ? 'row' : 'column', gap: showLabels ? 4 : 0, '--glow-color': color + '66' } as any}>
              <div className="social-icon-circle flex items-center justify-center rounded-xl transition-all duration-200"
                style={{
                  width: iconSize, height: iconSize,
                  backgroundColor: color + '22',
                  border: `1.5px solid ${color}44`,
                }}>
                <SocialIconInline platform={link.platform} size={iconSize} color={color} />
              </div>
              {showLabels && (
                <span style={{ fontSize: Math.max(9, iconSize * 0.28), color: 'rgba(255,255,255,0.65)', fontWeight: 500, textAlign: 'center' }}>
                  {link.label || link.platform}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
