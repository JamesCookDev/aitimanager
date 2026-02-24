/**
 * Visual totem device frame wrapping the canvas.
 * Gives a realistic hardware preview feel.
 */

interface Props {
  children: React.ReactNode;
  showFrame: boolean;
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
}

export function TotemFrame({ children, showFrame, canvasWidth, canvasHeight, scale }: Props) {
  if (!showFrame) return <>{children}</>;

  const bezelH = 40;
  const bezelW = 24;
  const frameW = canvasWidth + bezelW * 2;
  const frameH = canvasHeight + bezelH * 2;

  return (
    <div
      style={{
        width: frameW,
        height: frameH,
        padding: `${bezelH}px ${bezelW}px`,
        borderRadius: 28,
        background: 'linear-gradient(180deg, #2a2a2e 0%, #1a1a1e 100%)',
        boxShadow: `
          inset 0 1px 0 rgba(255,255,255,0.08),
          inset 0 -1px 0 rgba(0,0,0,0.3),
          0 20px 60px rgba(0,0,0,0.5),
          0 0 0 1px rgba(255,255,255,0.05)
        `,
        position: 'relative',
      }}
    >
      {/* Top speaker/camera area */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#333', border: '1px solid #444' }} />
        <div style={{ width: 60, height: 4, borderRadius: 2, background: '#333' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#333', border: '1px solid #444' }} />
      </div>

      {/* Bottom home indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 100,
          height: 4,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.1)',
        }}
      />

      {/* Canvas content */}
      <div style={{ width: canvasWidth, height: canvasHeight, overflow: 'hidden', borderRadius: 8 }}>
        {children}
      </div>
    </div>
  );
}
