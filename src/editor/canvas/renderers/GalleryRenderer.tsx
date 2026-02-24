export function GalleryRenderer(props: any) {
  const images: string[] = props.images || [];
  const columns = props.columns || 2;
  const gap = props.gap ?? 8;
  const borderRadius = props.borderRadius ?? 12;
  const bgColor = props.bgColor || 'transparent';

  const placeholders = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=300&h=300&fit=crop',
  ];

  return (
    <div
      className="w-full h-full overflow-hidden"
      style={{ background: bgColor, borderRadius, padding: gap }}
    >
      <style>{`
        .gallery-cell { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .gallery-cell:hover { transform: scale(1.03); box-shadow: 0 8px 24px rgba(0,0,0,0.4); z-index: 1; }
      `}</style>
      <div
        className="w-full h-full"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap,
        }}
      >
        {placeholders.map((src, i) => (
          <div
            key={i}
            className="relative overflow-hidden gallery-cell"
            style={{ borderRadius: borderRadius / 2, border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              style={{ aspectRatio: props.aspectRatio || '1/1' }}
            />
            {/* Subtle vignette */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.3) 100%)',
              pointerEvents: 'none',
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}
