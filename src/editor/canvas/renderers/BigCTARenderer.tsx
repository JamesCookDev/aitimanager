/**
 * Big CTA renderer - premium large call-to-action for touch kiosks.
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
        background: `linear-gradient(135deg, ${bgColor}, ${bgColor}cc, ${bgColor}ee)`,
        borderRadius,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        cursor: 'pointer',
        boxShadow: `0 8px 40px ${bgColor}50, inset 0 1px 0 rgba(255,255,255,0.2)`,
        animation: pulse ? 'totem-cta-pulse 2.5s ease-in-out infinite' : 'none',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <style>{`
        @keyframes totem-cta-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 40px ${bgColor}50; }
          50% { transform: scale(1.02); box-shadow: 0 12px 60px ${bgColor}70; }
        }
        @keyframes cta-shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(300%) skewX(-15deg); }
        }
        @keyframes cta-ring {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>

      {/* Top shine */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
        borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
        pointerEvents: 'none',
      }} />

      {/* Shimmer sweep */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '30%', height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        animation: 'cta-shimmer 4s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Pulsing ring behind icon */}
      {pulse && icon && (
        <div style={{
          position: 'absolute',
          width: 60, height: 60,
          borderRadius: '50%',
          border: `2px solid ${textColor}30`,
          animation: 'cta-ring 2.5s ease-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      {icon && <span style={{ fontSize: fontSize * 1.3, position: 'relative', zIndex: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{icon}</span>}
      <span style={{
        color: textColor, fontSize, fontWeight: 800, textAlign: 'center', lineHeight: 1.2,
        position: 'relative', zIndex: 1,
        textShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}>
        {label}
      </span>
      {sublabel && (
        <span style={{
          color: `${textColor}88`, fontSize: sublabelSize, fontWeight: 400, textAlign: 'center',
          position: 'relative', zIndex: 1,
        }}>
          {sublabel}
        </span>
      )}
    </div>
  );
}
