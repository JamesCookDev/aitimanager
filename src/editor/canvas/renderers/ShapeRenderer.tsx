export function ShapeRenderer(props: any) {
  return (
    <div
      className="w-full h-full"
      style={{
        background: props.fill || '#6366f1',
        borderRadius: props.shapeType === 'circle' ? '50%' : (props.borderRadius || 0),
        border: props.borderWidth ? `${props.borderWidth}px solid ${props.borderColor || 'transparent'}` : undefined,
      }}
    />
  );
}
