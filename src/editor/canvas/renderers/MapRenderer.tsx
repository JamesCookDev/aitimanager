import { MapPin } from 'lucide-react';

export function MapPlaceholder(props: any) {
  const lat = props.lat ?? -23.5505;
  const lng = props.lng ?? -46.6333;
  const zoom = props.zoom ?? 15;
  const borderRadius = props.borderRadius ?? 12;
  const label = props.label || '';
  const labelColor = props.labelColor || '#ffffff';
  const labelSize = props.labelSize || 14;

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01 / (zoom / 15)},${lat - 0.006 / (zoom / 15)},${lng + 0.01 / (zoom / 15)},${lat + 0.006 / (zoom / 15)}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden" style={{ borderRadius }}>
      <iframe
        src={src}
        className="flex-1 w-full border-0"
        style={{ pointerEvents: 'none' }}
        title="Mapa"
      />
      {label && (
        <div className="flex-shrink-0 px-2 py-1 text-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <span style={{ color: labelColor, fontSize: labelSize, fontWeight: 500 }}>{label}</span>
        </div>
      )}
    </div>
  );
}
