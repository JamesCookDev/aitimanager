export function ShapeRenderer(props: any) {
  const fill = props.fill || '#6366f1';
  const isCircle = props.shapeType === 'circle';
  const borderRadius = isCircle ? '50%' : (props.borderRadius || 0);

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${fill}, ${fill}cc)`,
        borderRadius,
        border: props.borderWidth ? `${props.borderWidth}px solid ${props.borderColor || 'transparent'}` : undefined,
        boxShadow: `0 4px 20px ${fill}30`,
      }}
    >
      {/* Subtle inner shine */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
        borderRadius: typeof borderRadius === 'string' ? borderRadius : `${borderRadius}px ${borderRadius}px 0 0`,
        pointerEvents: 'none',
      }} />
    </div>
  );
}
