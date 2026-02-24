import { Image as ImageIcon } from 'lucide-react';

export function ImageRenderer(props: any) {
  if (!props.src) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))',
          border: '2px dashed rgba(255,255,255,0.1)',
          borderRadius: props.borderRadius || 0,
        }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ImageIcon className="w-7 h-7" style={{ color: 'rgba(255,255,255,0.25)' }} />
        </div>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 500 }}>Arraste uma imagem</span>
      </div>
    );
  }
  return (
    <img
      src={props.src}
      alt=""
      className="w-full h-full pointer-events-none select-none"
      style={{ objectFit: props.fit || 'cover', borderRadius: props.borderRadius || 0 }}
    />
  );
}
