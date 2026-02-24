export function IconRenderer(props: any) {
  const color = props.color || '#fff';
  const size = props.size || 48;

  return (
    <div className="w-full h-full flex items-center justify-center select-none" style={{ color, position: 'relative' }}>
      {/* Subtle glow */}
      <div style={{
        position: 'absolute',
        width: size * 1.5, height: size * 1.5,
        background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <span style={{
        fontSize: size, position: 'relative',
        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
      }}>
        {props.icon || '⭐'}
      </span>
    </div>
  );
}
