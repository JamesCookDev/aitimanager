/**
 * Visual zone guides overlay for the canvas.
 * Shows header/body/footer zones to help with totem layout design.
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../types/canvas';

interface Props {
  show: boolean;
}

const ZONES = [
  { label: 'HEADER', y: 0, h: 280, color: '59,130,246' },      // blue
  { label: 'CONTEÚDO', y: 280, h: 1200, color: '34,197,94' },   // green
  { label: 'FOOTER', y: 1480, h: 440, color: '168,85,247' },    // purple
];

export function ZoneGuides({ show }: Props) {
  if (!show) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {ZONES.map((zone) => (
        <div
          key={zone.label}
          style={{
            position: 'absolute',
            left: 0,
            top: zone.y,
            width: CANVAS_WIDTH,
            height: zone.h,
            border: `1px dashed rgba(${zone.color}, 0.4)`,
            background: `rgba(${zone.color}, 0.03)`,
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 4,
              left: 8,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: `rgba(${zone.color}, 0.6)`,
              fontFamily: 'monospace',
              textTransform: 'uppercase',
            }}
          >
            {zone.label}
          </span>
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 8,
              fontSize: 9,
              color: `rgba(${zone.color}, 0.4)`,
              fontFamily: 'monospace',
            }}
          >
            {zone.h}px
          </span>
        </div>
      ))}

      {/* Safe margins */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: 40,
          width: CANVAS_WIDTH - 120,
          height: CANVAS_HEIGHT - 100,
          border: '1px dashed rgba(255,255,255,0.08)',
        }}
      />
    </div>
  );
}
