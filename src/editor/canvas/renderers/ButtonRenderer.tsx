export function ButtonRenderer(props: any) {
  const bgColor = props.bgColor || '#6366f1';
  const textColor = props.textColor || '#fff';
  const fontSize = props.fontSize || 18;
  const borderRadius = props.borderRadius ?? 999;

  return (
    <div className="w-full h-full flex items-center justify-center p-1">
      <style>{`
        @keyframes btn-shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
      `}</style>
      <button
        className="w-full h-full flex items-center justify-center gap-2 select-none font-bold relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${bgColor}, ${bgColor}dd, ${bgColor})`,
          color: textColor,
          fontSize,
          borderRadius,
          letterSpacing: '-0.01em',
          boxShadow: `0 4px 20px ${bgColor}50, inset 0 1px 0 rgba(255,255,255,0.2)`,
          border: `1px solid rgba(255,255,255,0.15)`,
          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
      >
        {/* Top shine */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)',
          borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
          pointerEvents: 'none',
        }} />
        {/* Shimmer sweep */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '40%', height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          animation: 'btn-shimmer 3s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <span style={{ position: 'relative', zIndex: 1 }}>
          {props.label || 'Botão'}
        </span>
      </button>
    </div>
  );
}
