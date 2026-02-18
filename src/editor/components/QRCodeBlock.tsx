import { useNode, UserComponent } from '@craftjs/core';
import { useEffect, useRef } from 'react';
import { QRCodeBlockSettings } from '../settings/QRCodeBlockSettings';

export interface QRCodeBlockProps {
  content: string;
  size: number;
  fgColor: string;
  bgColor: string;
  borderRadius: number;
  padding: number;
  label: string;
  labelColor: string;
  labelSize: number;
}

// Minimal QR code generator using canvas
function generateQR(canvas: HTMLCanvasElement, text: string, size: number, fg: string, bg: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = size;
  canvas.height = size;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  if (!text) {
    ctx.fillStyle = fg;
    ctx.font = `${size * 0.08}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('QR Code', size / 2, size / 2);
    return;
  }

  // Simple QR-like pattern (visual placeholder - for production use a real QR lib)
  const modules = 21;
  const cellSize = size / (modules + 2);
  const offset = cellSize;

  ctx.fillStyle = fg;

  // Finder patterns
  const drawFinder = (x: number, y: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const fill = r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        if (fill) {
          ctx.fillRect(offset + (x + c) * cellSize, offset + (y + r) * cellSize, cellSize, cellSize);
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(modules - 7, 0);
  drawFinder(0, modules - 7);

  // Data area - hash-based pattern from content
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }

  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      // Skip finder areas
      if ((r < 8 && c < 8) || (r < 8 && c >= modules - 8) || (r >= modules - 8 && c < 8)) continue;
      // Timing patterns
      if (r === 6 || c === 6) {
        if ((r + c) % 2 === 0) ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize, cellSize);
        continue;
      }
      // Pseudo-random data
      const seed = (hash + r * 31 + c * 17) & 0xffffffff;
      if (seed % 3 !== 0) {
        ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize, cellSize);
      }
    }
  }
}

export const QRCodeBlock: UserComponent<Partial<QRCodeBlockProps>> = (props) => {
  const {
    content = '',
    size = 160,
    fgColor = '#ffffff',
    bgColor = 'transparent',
    borderRadius = 8,
    padding = 12,
    label = '',
    labelColor = '#ffffff',
    labelSize = 12,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  useEffect(() => {
    if (canvasRef.current) {
      generateQR(canvasRef.current, content, size * 2, fgColor, bgColor === 'transparent' ? 'rgba(0,0,0,0)' : bgColor);
    }
  }, [content, size, fgColor, bgColor]);

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`flex flex-col items-center gap-2 transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      style={{ padding, cursor: 'move' }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size, borderRadius, imageRendering: 'pixelated' }}
      />
      {label && (
        <span style={{ color: labelColor, fontSize: labelSize, fontWeight: 500, textAlign: 'center' }}>
          {label}
        </span>
      )}
    </div>
  );
};

QRCodeBlock.craft = {
  props: {
    content: 'https://example.com',
    size: 160,
    fgColor: '#ffffff',
    bgColor: 'transparent',
    borderRadius: 8,
    padding: 12,
    label: 'Escaneie o QR Code',
    labelColor: '#ffffff',
    labelSize: 12,
  },
  related: { settings: QRCodeBlockSettings },
  rules: { canDrag: () => true },
  displayName: 'QR Code',
};
