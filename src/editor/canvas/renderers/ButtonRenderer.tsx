export function ButtonRenderer(props: any) {
  const bgColor = props.bgColor || '#6366f1';
  const textColor = props.textColor || '#fff';
  const fontSize = props.fontSize || 20;
  const borderRadius = props.borderRadius ?? 16;

  // Compute lighter/darker shades for 3D gradient
  const hexToHSL = (hex: string) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0, s = 0, l = (max + min) / 2;
    if (d !== 0) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max - min);
      h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) * 60 : max === g ? ((b - r) / d + 2) * 60 : ((r - g) / d + 4) * 60;
    }
    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
  };

  let lighter = bgColor, darker = bgColor;
  try {
    const [h, s, l] = hexToHSL(bgColor.length === 7 ? bgColor : '#6366f1');
    lighter = `hsl(${h}, ${Math.min(s + 10, 100)}%, ${Math.min(l + 15, 92)}%)`;
    darker = `hsl(${h}, ${s}%, ${Math.max(l - 18, 8)}%)`;
  } catch (_) {}

  return (
    <div className="w-full h-full flex items-center justify-center p-1">
      <style>{`
        @keyframes btn-shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(350%) skewX(-15deg); }
        }
      `}</style>
      <button
        className="w-full h-full flex items-center justify-center gap-2 select-none font-extrabold relative overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${lighter} 0%, ${bgColor} 50%, ${darker} 100%)`,
          color: textColor,
          fontSize,
          borderRadius,
          letterSpacing: '0.02em',
          boxShadow: `0 6px 20px ${bgColor}60, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.15)`,
          border: 'none',
          borderTop: '2px solid rgba(255,255,255,0.35)',
          borderBottom: '3px solid rgba(0,0,0,0.4)',
          textShadow: '0 2px 4px rgba(0,0,0,0.4)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          padding: '0 16px',
          minHeight: 48,
        }}
      >
        {/* Glossy top highlight */}
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.05) 60%, transparent 100%)',
          borderRadius: `${borderRadius}px ${borderRadius}px ${borderRadius * 2}px ${borderRadius * 2}px`,
          pointerEvents: 'none',
        }} />
        {/* Shimmer sweep */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '35%', height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
          animation: 'btn-shimmer 4s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        {props.icon && <span style={{ position: 'relative', zIndex: 1, fontSize: '1.1em' }}>{props.icon}</span>}
        <span style={{ position: 'relative', zIndex: 1 }}>
          {props.label || 'Botão'}
        </span>
      </button>
    </div>
  );
}
