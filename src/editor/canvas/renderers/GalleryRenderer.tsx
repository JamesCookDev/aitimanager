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
            className="relative overflow-hidden"
            style={{ borderRadius: borderRadius / 2 }}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              style={{ aspectRatio: props.aspectRatio || '1/1' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
