/**
 * Big CTA renderer - large call-to-action button optimized for touch kiosks.
 */

interface Props {
  label?: string;
  sublabel?: string;
  icon?: string;
  bgColor?: string;
  textColor?: string;
  fontSize?: number;
  sublabelSize?: number;
  borderRadius?: number;
  pulse?: boolean;
}

export function BigCTARenderer({
  label = 'Toque para começar',
  sublabel = '',
  icon = '👆',
  bgColor = '#6366f1',
  textColor = '#ffffff',
  fontSize = 28,
  sublabelSize = 14,
  borderRadius = 24,
  pulse = true,
}: Props) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: `linear-gradient(135deg, ${bgColor}, ${bgColor}cc)`,
        borderRadius,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: 'pointer',
        boxShadow: `0 8px 32px ${bgColor}40`,
        animation: pulse ? 'totem-cta-pulse 2.5s ease-in-out infinite' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes totem-cta-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 32px ${bgColor}40; }
          50% { transform: scale(1.02); box-shadow: 0 12px 48px ${bgColor}60; }
        }
      `}</style>

      {/* Shine effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
          borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
          pointerEvents: 'none',
        }}
      />

      {icon && <span style={{ fontSize: fontSize * 1.2 }}>{icon}</span>}
      <span style={{ color: textColor, fontSize, fontWeight: 800, textAlign: 'center', lineHeight: 1.2 }}>
        {label}
      </span>
      {sublabel && (
        <span style={{ color: `${textColor}99`, fontSize: sublabelSize, fontWeight: 400, textAlign: 'center' }}>
          {sublabel}
        </span>
      )}
    </div>
  );
}
