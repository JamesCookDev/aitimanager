/**
 * SVG → CanvasElement[] converter
 * Parses SVG markup and maps supported elements to canvas elements.
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT, type CanvasElement, type ElementType } from '../types/canvas';

let _counter = 0;
const uid = () => `svg_${Date.now()}_${++_counter}`;

interface ParsedSVG {
  elements: CanvasElement[];
  bgColor: string;
  viewBox: { width: number; height: number };
}

/**
 * Parse an SVG string and return CanvasElement[] mapped to our 1080x1920 canvas.
 */
export function parseSVGToCanvas(svgString: string): ParsedSVG {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svg = doc.querySelector('svg');

  if (!svg) throw new Error('SVG inválido: elemento <svg> não encontrado');

  // Parse viewBox or width/height for coordinate mapping
  const vb = svg.getAttribute('viewBox');
  let svgW = parseFloat(svg.getAttribute('width') || '1080');
  let svgH = parseFloat(svg.getAttribute('height') || '1920');

  if (vb) {
    const parts = vb.split(/[\s,]+/).map(Number);
    if (parts.length >= 4) {
      svgW = parts[2];
      svgH = parts[3];
    }
  }

  const scaleX = CANVAS_WIDTH / svgW;
  const scaleY = CANVAS_HEIGHT / svgH;

  // Detect background from first full-size rect or SVG style
  let bgColor = '#0f172a';
  const elements: CanvasElement[] = [];
  let zIndex = 1;

  function mapCoord(x: number, y: number, w: number, h: number) {
    return {
      x: Math.round(x * scaleX),
      y: Math.round(y * scaleY),
      width: Math.max(20, Math.round(w * scaleX)),
      height: Math.max(20, Math.round(h * scaleY)),
    };
  }

  function makeElement(
    type: ElementType,
    x: number, y: number, w: number, h: number,
    props: Record<string, any>,
    name?: string,
  ): CanvasElement {
    const mapped = mapCoord(x, y, w, h);
    return {
      id: uid(),
      type,
      ...mapped,
      rotation: 0,
      zIndex: zIndex++,
      opacity: 1,
      locked: false,
      visible: true,
      name: name || type.charAt(0).toUpperCase() + type.slice(1),
      viewId: '__default__',
      props,
    };
  }

  function parseColor(node: Element): string {
    return (
      node.getAttribute('fill') ||
      node.getAttribute('style')?.match(/fill:\s*([^;]+)/)?.[1] ||
      '#ffffff'
    );
  }

  function parseOpacity(node: Element): number {
    const op = node.getAttribute('opacity') || node.getAttribute('fill-opacity');
    return op ? Math.min(1, Math.max(0, parseFloat(op))) : 1;
  }

  function getTranslate(node: Element): { tx: number; ty: number } {
    const t = node.getAttribute('transform');
    if (!t) return { tx: 0, ty: 0 };
    const m = t.match(/translate\(\s*([-\d.]+)[,\s]+([-\d.]+)\s*\)/);
    return m ? { tx: parseFloat(m[1]), ty: parseFloat(m[2]) } : { tx: 0, ty: 0 };
  }

  function processNode(node: Element, parentTx = 0, parentTy = 0) {
    const { tx, ty } = getTranslate(node);
    const ox = parentTx + tx;
    const oy = parentTy + ty;

    const tag = node.tagName.toLowerCase();

    switch (tag) {
      case 'rect': {
        const x = parseFloat(node.getAttribute('x') || '0') + ox;
        const y = parseFloat(node.getAttribute('y') || '0') + oy;
        const w = parseFloat(node.getAttribute('width') || '0');
        const h = parseFloat(node.getAttribute('height') || '0');
        if (w <= 0 || h <= 0) break;

        const fill = parseColor(node);
        const rx = parseFloat(node.getAttribute('rx') || '0');
        const opacity = parseOpacity(node);

        // Full-canvas rect → treat as background
        if (w >= svgW * 0.95 && h >= svgH * 0.95 && elements.length === 0) {
          bgColor = fill === 'none' ? bgColor : fill;
          break;
        }

        const el = makeElement('shape', x, y, w, h, {
          shapeType: 'rectangle',
          fill: fill === 'none' ? 'transparent' : fill,
          borderRadius: Math.round(rx * scaleX),
          borderColor: node.getAttribute('stroke') || 'transparent',
          borderWidth: parseFloat(node.getAttribute('stroke-width') || '0') * scaleX,
        }, 'Retângulo');
        el.opacity = opacity;
        elements.push(el);
        break;
      }

      case 'circle':
      case 'ellipse': {
        const cx = parseFloat(node.getAttribute('cx') || '0') + ox;
        const cy = parseFloat(node.getAttribute('cy') || '0') + oy;
        const rx = tag === 'circle'
          ? parseFloat(node.getAttribute('r') || '0')
          : parseFloat(node.getAttribute('rx') || '0');
        const ry = tag === 'circle'
          ? rx
          : parseFloat(node.getAttribute('ry') || '0');
        if (rx <= 0 || ry <= 0) break;

        const fill = parseColor(node);
        const el = makeElement('shape', cx - rx, cy - ry, rx * 2, ry * 2, {
          shapeType: 'circle',
          fill: fill === 'none' ? 'transparent' : fill,
          borderRadius: 0,
          borderColor: node.getAttribute('stroke') || 'transparent',
          borderWidth: parseFloat(node.getAttribute('stroke-width') || '0') * scaleX,
        }, 'Círculo');
        el.opacity = parseOpacity(node);
        elements.push(el);
        break;
      }

      case 'text':
      case 'tspan': {
        const x = parseFloat(node.getAttribute('x') || '0') + ox;
        const y = parseFloat(node.getAttribute('y') || '0') + oy;
        const textContent = node.textContent?.trim() || '';
        if (!textContent) break;

        const style = node.getAttribute('style') || '';
        const fontSizeMatch = style.match(/font-size:\s*([\d.]+)/);
        const fontWeightMatch = style.match(/font-weight:\s*(\w+)/);
        const fillMatch = style.match(/fill:\s*([^;]+)/);
        const fontSize = fontSizeMatch
          ? Math.round(parseFloat(fontSizeMatch[1]) * scaleX)
          : Math.round(parseFloat(node.getAttribute('font-size') || '16') * scaleX);
        const color = fillMatch?.[1] || node.getAttribute('fill') || '#ffffff';
        const fontWeight = fontWeightMatch?.[1] || node.getAttribute('font-weight') || 'normal';
        const textAnchor = node.getAttribute('text-anchor') || 'start';
        const align = textAnchor === 'middle' ? 'center' : textAnchor === 'end' ? 'right' : 'left';

        // Estimate width based on text length and font size
        const estimatedW = Math.max(100, textContent.length * fontSize * 0.6);
        const estimatedH = Math.max(40, fontSize * 1.5);

        const adjX = align === 'center' ? x - estimatedW / (2 * scaleX) : x;

        const el = makeElement('text', adjX, y - fontSize / scaleX, estimatedW / scaleX, estimatedH / scaleX, {
          text: textContent,
          fontSize: Math.max(12, fontSize),
          fontWeight: fontWeight === 'bold' || parseInt(fontWeight) >= 700 ? 'bold' : 'normal',
          color: color === 'none' ? '#ffffff' : color,
          align,
          fontFamily: 'Inter',
        }, `Texto: ${textContent.slice(0, 20)}`);
        el.opacity = parseOpacity(node);
        elements.push(el);
        break;
      }

      case 'image': {
        const x = parseFloat(node.getAttribute('x') || '0') + ox;
        const y = parseFloat(node.getAttribute('y') || '0') + oy;
        const w = parseFloat(node.getAttribute('width') || '200');
        const h = parseFloat(node.getAttribute('height') || '200');
        const href = node.getAttribute('href') || node.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';

        const el = makeElement('image', x, y, w, h, {
          src: href,
          fit: 'cover',
          borderRadius: parseFloat(node.getAttribute('rx') || '0') * scaleX,
        }, 'Imagem SVG');
        el.opacity = parseOpacity(node);
        elements.push(el);
        break;
      }

      case 'line': {
        const x1 = parseFloat(node.getAttribute('x1') || '0') + ox;
        const y1 = parseFloat(node.getAttribute('y1') || '0') + oy;
        const x2 = parseFloat(node.getAttribute('x2') || '0') + ox;
        const y2 = parseFloat(node.getAttribute('y2') || '0') + oy;
        const stroke = node.getAttribute('stroke') || '#ffffff';
        const strokeW = parseFloat(node.getAttribute('stroke-width') || '2');

        const el = makeElement('shape',
          Math.min(x1, x2), Math.min(y1, y2),
          Math.max(Math.abs(x2 - x1), 4), Math.max(Math.abs(y2 - y1), strokeW * 2),
          {
            shapeType: 'rectangle',
            fill: stroke,
            borderRadius: 0,
            borderColor: 'transparent',
            borderWidth: 0,
          }, 'Linha');
        el.opacity = parseOpacity(node);
        elements.push(el);
        break;
      }

      case 'g':
      case 'svg': {
        // Recurse into groups
        Array.from(node.children).forEach(child => processNode(child, ox, oy));
        return; // Don't fall through to child processing below
      }

      case 'path': {
        // Paths are complex — render as a shape placeholder with the bounding box
        const d = node.getAttribute('d') || '';
        if (!d) break;
        const fill = parseColor(node);
        const stroke = node.getAttribute('stroke');

        // Try to extract bounding info from path commands
        const numbers = d.match(/[-+]?\d*\.?\d+/g)?.map(Number) || [];
        if (numbers.length < 2) break;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (let i = 0; i < numbers.length - 1; i += 2) {
          minX = Math.min(minX, numbers[i]);
          maxX = Math.max(maxX, numbers[i]);
          minY = Math.min(minY, numbers[i + 1]);
          maxY = Math.max(maxY, numbers[i + 1]);
        }

        const pw = maxX - minX;
        const ph = maxY - minY;
        if (pw < 1 || ph < 1) break;

        const el = makeElement('shape', minX + ox, minY + oy, pw, ph, {
          shapeType: 'rectangle',
          fill: fill === 'none' ? (stroke || 'transparent') : fill,
          borderRadius: 0,
          borderColor: stroke || 'transparent',
          borderWidth: parseFloat(node.getAttribute('stroke-width') || '0') * scaleX,
        }, 'Path');
        el.opacity = parseOpacity(node);
        elements.push(el);
        break;
      }
    }

    // Process children for non-group elements that may contain nested elements
    if (tag !== 'g' && tag !== 'svg') {
      Array.from(node.children).forEach(child => processNode(child, ox, oy));
    }
  }

  // Process all top-level children of the SVG
  Array.from(svg.children).forEach(child => processNode(child));

  return {
    elements,
    bgColor,
    viewBox: { width: svgW, height: svgH },
  };
}
