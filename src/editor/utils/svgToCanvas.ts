/**
 * SVG → CanvasElement[] converter
 * Parses SVG markup and maps supported elements to canvas elements.
 * Robust against complex Figma exports with vectorized text, pattern images, and nested filters.
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT, type CanvasElement, type ElementType } from '../types/canvas';

let _counter = 0;
const uid = () => `svg_${Date.now()}_${++_counter}`;

interface ParsedSVG {
  elements: CanvasElement[];
  bgColor: string;
  viewBox: { width: number; height: number };
}

// ── SVG Path bounding-box parser ─────────────────────────────────────
interface PathInfo {
  x: number; y: number; w: number; h: number;
  cmdCount: number;
  curveCount: number;
  subpathCount: number;
}

function pathBounds(d: string): PathInfo | null {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let cx = 0, cy = 0;
  let sx = 0, sy = 0;
  let found = false;
  let cmdCount = 0;
  let curveCount = 0;
  let subpathCount = 0;

  function track(x: number, y: number) {
    if (!isFinite(x) || !isFinite(y)) return;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    found = true;
  }

  const tokens = d.match(/[a-zA-Z]|[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g);
  if (!tokens) return null;

  const maxTokens = Math.min(tokens.length, 50000);

  let i = 0;
  const num = () => (i < maxTokens ? parseFloat(tokens[i++]) : 0);
  const isNum = () => i < maxTokens && !/^[a-zA-Z]$/.test(tokens[i]);

  let cmd = '';
  while (i < maxTokens) {
    const t = tokens[i];
    if (/^[a-zA-Z]$/.test(t)) { cmd = t; i++; }
    cmdCount++;

    switch (cmd) {
      case 'M': { const x = num(), y = num(); cx = x; cy = y; sx = x; sy = y; track(cx, cy); subpathCount++; cmd = 'L'; break; }
      case 'm': { const x = num(), y = num(); cx += x; cy += y; sx = cx; sy = cy; track(cx, cy); subpathCount++; cmd = 'l'; break; }
      case 'L': { cx = num(); cy = num(); track(cx, cy); break; }
      case 'l': { cx += num(); cy += num(); track(cx, cy); break; }
      case 'H': { cx = num(); track(cx, cy); break; }
      case 'h': { cx += num(); track(cx, cy); break; }
      case 'V': { cy = num(); track(cx, cy); break; }
      case 'v': { cy += num(); track(cx, cy); break; }
      case 'C': {
        curveCount++;
        const x1 = num(), y1 = num(), x2 = num(), y2 = num(), x = num(), y = num();
        track(x1, y1); track(x2, y2); track(x, y); cx = x; cy = y; break;
      }
      case 'c': {
        curveCount++;
        const x1 = cx + num(), y1 = cy + num(), x2 = cx + num(), y2 = cy + num();
        const x = cx + num(), y = cy + num();
        track(x1, y1); track(x2, y2); track(x, y); cx = x; cy = y; break;
      }
      case 'S': { curveCount++; const x2 = num(), y2 = num(), x = num(), y = num(); track(x2, y2); track(x, y); cx = x; cy = y; break; }
      case 's': { curveCount++; const x2 = cx + num(), y2 = cy + num(), x = cx + num(), y = cy + num(); track(x2, y2); track(x, y); cx = x; cy = y; break; }
      case 'Q': { curveCount++; const x1 = num(), y1 = num(), x = num(), y = num(); track(x1, y1); track(x, y); cx = x; cy = y; break; }
      case 'q': { curveCount++; const x1 = cx + num(), y1 = cy + num(), x = cx + num(), y = cy + num(); track(x1, y1); track(x, y); cx = x; cy = y; break; }
      case 'T': { cx = num(); cy = num(); track(cx, cy); break; }
      case 't': { cx += num(); cy += num(); track(cx, cy); break; }
      case 'A': { num(); num(); num(); num(); num(); cx = num(); cy = num(); track(cx, cy); break; }
      case 'a': { num(); num(); num(); num(); num(); cx += num(); cy += num(); track(cx, cy); break; }
      case 'Z': case 'z': { cx = sx; cy = sy; break; }
      default: { i++; break; }
    }

    // Implicit repeat: if next token is a number and current command allows repeats, continue
    // Do NOT break here — let the while loop naturally re-enter with the same cmd
  }

  if (!found || maxX - minX < 0.5 || maxY - minY < 0.5) return null;
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY, cmdCount, curveCount, subpathCount };
}

/**
 * Heuristic: detect if a path is likely vectorized text (glyph outlines).
 */
function isLikelyTextPath(info: PathInfo): boolean {
  if (info.curveCount > 15 && info.subpathCount > 3) return true;
  const area = info.w * info.h;
  if (area > 0 && info.curveCount / Math.sqrt(area) > 0.5 && info.curveCount > 10) return true;
  if (info.cmdCount > 100) return true;
  return false;
}

function estimateFontSize(pathHeight: number, scale: number): number {
  const raw = Math.round(pathHeight * scale * 1.25);
  return Math.max(12, Math.min(120, raw));
}

function estimateCharCount(w: number, h: number): number {
  if (h <= 0) return 5;
  const avgCharW = h * 0.55;
  return Math.max(1, Math.round(w / avgCharW));
}

// ── Detect content area from Figma-style exports ─────────────────────
function detectContentArea(svg: Element, svgW: number, svgH: number): { ox: number; oy: number; w: number; h: number } | null {
  const rects = svg.querySelectorAll('rect');
  let best: { ox: number; oy: number; w: number; h: number } | null = null;
  let bestArea = 0;

  for (const rect of Array.from(rects)) {
    const w = parseFloat(rect.getAttribute('width') || '0');
    const h = parseFloat(rect.getAttribute('height') || '0');
    if (w < svgW * 0.5 || h < svgH * 0.5) continue;
    if (w >= svgW * 0.98 && h >= svgH * 0.98) continue;

    let x = parseFloat(rect.getAttribute('x') || '0');
    let y = parseFloat(rect.getAttribute('y') || '0');
    const t = rect.getAttribute('transform');
    if (t) {
      const m = t.match(/translate\(\s*([-\d.]+)[,\s]+([-\d.]+)\s*\)/);
      if (m) { x += parseFloat(m[1]); y += parseFloat(m[2]); }
    }

    const area = w * h;
    const isTotemSize = (Math.abs(w - 1080) < 10 && Math.abs(h - 1920) < 10);
    if (area > bestArea || isTotemSize) {
      best = { ox: x, oy: y, w, h };
      bestArea = area;
      if (isTotemSize) break;
    }
  }

  if (best && (best.ox > 5 || best.oy > 5)) return best;
  return null;
}

/**
 * Parse an SVG string and return CanvasElement[] mapped to our 1080x1920 canvas.
 */
export function parseSVGToCanvas(svgString: string): ParsedSVG {
  const trimmed = svgString.trim();
  if (
    trimmed.startsWith('<!DOCTYPE') ||
    trimmed.startsWith('<html') ||
    /<html[\s>]/i.test(trimmed)
  ) {
    throw new Error(
      'O conteúdo enviado é HTML, não SVG. Cole apenas o código <svg>...</svg> puro. ' +
      'Se o SVG está dentro de um HTML, extraia apenas a tag <svg> e tente novamente.'
    );
  }

  let input = trimmed;
  if (!input.startsWith('<svg') && !input.startsWith('<?xml')) {
    const svgMatch = input.match(/<svg[\s\S]*<\/svg>/i);
    if (svgMatch) {
      input = svgMatch[0];
    }
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'image/svg+xml');
  const svg = doc.querySelector('svg');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Erro de sintaxe no SVG. Verifique se o código é um SVG válido e bem formado.');
  }

  if (!svg) throw new Error('SVG inválido: elemento <svg> não encontrado.');

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

  // ── Detect Figma-style content area offset ──────────────────────────
  const contentArea = detectContentArea(svg, svgW, svgH);
  let originX = 0, originY = 0, refW = svgW, refH = svgH;
  if (contentArea) {
    originX = contentArea.ox;
    originY = contentArea.oy;
    refW = contentArea.w;
    refH = contentArea.h;
  }

  const scaleX = CANVAS_WIDTH / refW;
  const scaleY = CANVAS_HEIGHT / refH;

  // ── Pre-collect ALL <image> elements from entire SVG (including defs) ──
  const imageMap = new Map<string, { href: string; w: number; h: number }>();
  svg.querySelectorAll('image').forEach(img => {
    const id = img.getAttribute('id');
    const href = img.getAttribute('href') || img.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';
    const w = parseFloat(img.getAttribute('width') || '0');
    const h = parseFloat(img.getAttribute('height') || '0');
    if (id && href) {
      imageMap.set(id, { href, w, h });
    }
  });

  // ── Build gradient map from <defs> ──────────────────────────────────
  const gradientMap = new Map<string, string>();

  function parseStopColor(stop: Element): string {
    const style = stop.getAttribute('style') || '';
    const fromStyle = style.match(/stop-color:\s*([^;]+)/)?.[1];
    return fromStyle || stop.getAttribute('stop-color') || '#000000';
  }

  function parseStopOpacity(stop: Element): number {
    const style = stop.getAttribute('style') || '';
    const fromStyle = style.match(/stop-opacity:\s*([^;]+)/)?.[1];
    const val = fromStyle || stop.getAttribute('stop-opacity');
    return val ? parseFloat(val) : 1;
  }

  function colorWithOpacity(color: string, opacity: number): string {
    if (opacity >= 1) return color;
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r},${g},${b},${opacity.toFixed(2)})`;
    }
    return color;
  }

  svg.querySelectorAll('linearGradient').forEach(lg => {
    const id = lg.getAttribute('id');
    if (!id) return;
    const units = lg.getAttribute('gradientUnits') || 'objectBoundingBox';
    const x1 = parseFloat(lg.getAttribute('x1') || '0');
    const y1 = parseFloat(lg.getAttribute('y1') || '0');
    const x2 = parseFloat(lg.getAttribute('x2') || '1');
    const y2 = parseFloat(lg.getAttribute('y2') || '0');

    let ax1: number, ay1: number, ax2: number, ay2: number;
    if (units === 'userSpaceOnUse') {
      ax1 = ((x1 - originX) / refW) * 100;
      ay1 = ((y1 - originY) / refH) * 100;
      ax2 = ((x2 - originX) / refW) * 100;
      ay2 = ((y2 - originY) / refH) * 100;
    } else {
      ax1 = x1 * 100; ay1 = y1 * 100; ax2 = x2 * 100; ay2 = y2 * 100;
    }
    const angle = Math.round(Math.atan2(ay2 - ay1, ax2 - ax1) * (180 / Math.PI) + 90);

    const stops = Array.from(lg.querySelectorAll('stop'));
    if (stops.length === 0) return;

    const cssStops = stops.map(s => {
      const color = parseStopColor(s);
      const opacity = parseStopOpacity(s);
      const offset = s.getAttribute('offset') || '0';
      const pct = offset.includes('%') ? offset : `${Math.round(parseFloat(offset) * 100)}%`;
      return `${colorWithOpacity(color, opacity)} ${pct}`;
    }).join(', ');

    gradientMap.set(id, `linear-gradient(${angle}deg, ${cssStops})`);
  });

  svg.querySelectorAll('radialGradient').forEach(rg => {
    const id = rg.getAttribute('id');
    if (!id) return;

    const stops = Array.from(rg.querySelectorAll('stop'));
    if (stops.length === 0) return;

    const cssStops = stops.map(s => {
      const color = parseStopColor(s);
      const opacity = parseStopOpacity(s);
      const offset = s.getAttribute('offset') || '0';
      const pct = offset.includes('%') ? offset : `${Math.round(parseFloat(offset) * 100)}%`;
      return `${colorWithOpacity(color, opacity)} ${pct}`;
    }).join(', ');

    const cx = rg.getAttribute('cx');
    const cy = rg.getAttribute('cy');
    let pos = 'circle';
    if (cx && cy) {
      const units = rg.getAttribute('gradientUnits') || 'objectBoundingBox';
      let pxStr: string, pyStr: string;
      if (units === 'userSpaceOnUse') {
        pxStr = `${Math.round(((parseFloat(cx) - originX) / refW) * 100)}%`;
        pyStr = `${Math.round(((parseFloat(cy) - originY) / refH) * 100)}%`;
      } else {
        pxStr = cx.includes('%') ? cx : `${Math.round(parseFloat(cx) * 100)}%`;
        pyStr = cy.includes('%') ? cy : `${Math.round(parseFloat(cy) * 100)}%`;
      }
      pos = `circle at ${pxStr} ${pyStr}`;
    }

    gradientMap.set(id, `radial-gradient(${pos}, ${cssStops})`);
  });

  // ── Build pattern → image map (Figma embeds base64 images via patterns) ──
  const patternImageMap = new Map<string, { href: string; w: number; h: number }>();

  svg.querySelectorAll('pattern').forEach(pattern => {
    const id = pattern.getAttribute('id');
    if (!id) return;
    const useEl = pattern.querySelector('use');
    const imgEl = pattern.querySelector('image');

    let href = '';
    let w = 0;
    let h = 0;

    if (imgEl) {
      href = imgEl.getAttribute('href') || imgEl.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';
      w = parseFloat(imgEl.getAttribute('width') || '0');
      h = parseFloat(imgEl.getAttribute('height') || '0');
    } else if (useEl) {
      const refId = (useEl.getAttribute('href') || useEl.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '').replace('#', '');
      
      // Check for scale transform on <use> to compute actual dimensions
      const useTransform = useEl.getAttribute('transform') || '';
      let useScale = 1;
      const scaleMatch = useTransform.match(/scale\(\s*([-\d.eE]+)\s*(?:,\s*([-\d.eE]+))?\s*\)/);
      if (scaleMatch) {
        useScale = parseFloat(scaleMatch[1]);
      }

      if (refId) {
        const imgData = imageMap.get(refId);
        if (imgData) {
          href = imgData.href;
          // If scale is present, the pattern maps the image: actual pixel size = imgData.w, imgData.h
          // The pattern uses objectBoundingBox, so we just need the href
          w = imgData.w;
          h = imgData.h;
        } else {
          try {
            const refImg = svg.querySelector(`[id="${refId}"]`);
            if (refImg) {
              href = refImg.getAttribute('href') || refImg.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';
              w = parseFloat(refImg.getAttribute('width') || '0');
              h = parseFloat(refImg.getAttribute('height') || '0');
            }
          } catch (e) {
            console.warn(`SVG Import: Failed to resolve pattern reference #${refId}`);
          }
        }
      }
    }

    if (href) {
      patternImageMap.set(id, { href, w, h });
    }
  });

  // ── Helpers ─────────────────────────────────────────────────────────
  let bgColor = '#0f172a';
  const elements: CanvasElement[] = [];
  let zIndex = 1;
  let skippedCount = 0;

  function mapCoord(x: number, y: number, w: number, h: number) {
    const rx = (x - originX) * scaleX;
    const ry = (y - originY) * scaleY;
    const rw = w * scaleX;
    const rh = h * scaleY;
    return {
      x: Math.round(rx),
      y: Math.round(ry),
      width: Math.max(10, Math.round(rw)),
      height: Math.max(10, Math.round(rh)),
    };
  }

  function isOutOfBounds(x: number, y: number, w: number, h: number): boolean {
    const right = x + w;
    const bottom = y + h;
    const cRight = originX + refW;
    const cBottom = originY + refH;
    return right < originX || x > cRight || bottom < originY || y > cBottom;
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

  function resolveColor(raw: string): string {
    if (!raw) return '#ffffff';
    const urlMatch = raw.match(/url\(\s*#([^)]+)\s*\)/);
    if (urlMatch) {
      const id = urlMatch[1];
      return gradientMap.get(id) || '#ffffff';
    }
    return raw;
  }

  function getRawFill(node: Element): string {
    return (
      node.getAttribute('fill') ||
      node.getAttribute('style')?.match(/fill:\s*([^;]+)/)?.[1] ||
      '#ffffff'
    ).trim();
  }

  function getPatternId(rawFill: string): string | null {
    const urlMatch = rawFill.match(/url\(\s*#([^)]+)\s*\)/);
    if (!urlMatch) return null;
    const id = urlMatch[1];
    if (gradientMap.has(id)) return null;
    return id;
  }

  function parseColor(node: Element): string {
    return resolveColor(getRawFill(node));
  }

  function parseOpacity(node: Element): number {
    const op = node.getAttribute('opacity') || node.getAttribute('fill-opacity');
    return op ? Math.min(1, Math.max(0, parseFloat(op))) : 1;
  }

  function getFillOpacity(node: Element): number {
    const fo = node.getAttribute('fill-opacity');
    if (fo) return parseFloat(fo);
    const style = node.getAttribute('style') || '';
    const m = style.match(/fill-opacity:\s*([\d.]+)/);
    return m ? parseFloat(m[1]) : 1;
  }

  function getTranslate(node: Element): { tx: number; ty: number } {
    const t = node.getAttribute('transform');
    if (!t) return { tx: 0, ty: 0 };
    const m = t.match(/translate\(\s*([-\d.]+)[,\s]+([-\d.]+)\s*\)/);
    return m ? { tx: parseFloat(m[1]), ty: parseFloat(m[2]) } : { tx: 0, ty: 0 };
  }

  function getGroupOpacity(node: Element): number {
    const op = node.getAttribute('opacity');
    return op ? parseFloat(op) : 1;
  }

  // ── Collect raw text-path items for post-process merging ──
  interface TextPathItem {
    x: number; y: number; w: number; h: number;
    fontSize: number;
    color: string;
    opacity: number;
    placeholder: string;
    fontWeight: string;
  }
  const textPathItems: TextPathItem[] = [];

  function processNode(node: Element, parentTx = 0, parentTy = 0, parentOpacity = 1) {
    try {
      processNodeInner(node, parentTx, parentTy, parentOpacity);
    } catch (err) {
      skippedCount++;
      console.warn('SVG Import: Skipped element due to error', node.tagName, err);
    }
  }

  function processNodeInner(node: Element, parentTx = 0, parentTy = 0, parentOpacity = 1) {
    const { tx, ty } = getTranslate(node);
    const ox = parentTx + tx;
    const oy = parentTy + ty;
    const nodeOpacity = getGroupOpacity(node) * parentOpacity;

    const tag = node.tagName.toLowerCase();

    // Skip defs, metadata, clipPath, filter definitions
    if (['defs', 'metadata', 'clippath', 'filter', 'pattern', 'lineargradient', 'radialgradient', 'mask', 'style'].includes(tag)) return;

    switch (tag) {
      case 'rect': {
        const x = parseFloat(node.getAttribute('x') || '0') + ox;
        const y = parseFloat(node.getAttribute('y') || '0') + oy;
        const w = parseFloat(node.getAttribute('width') || '0');
        const h = parseFloat(node.getAttribute('height') || '0');
        if (w <= 0 || h <= 0) break;

        const rawFill = getRawFill(node);
        const patternId = getPatternId(rawFill);
        const fill = resolveColor(rawFill);
        const rx = parseFloat(node.getAttribute('rx') || '0');
        const elOpacity = parseOpacity(node) * nodeOpacity;
        const fillOp = getFillOpacity(node);

        // Full-content-area rect → treat as background
        if (w >= refW * 0.9 && h >= refH * 0.9) {
          if (fill !== 'none' && !fill.includes('gradient') && !patternId) {
            bgColor = fill;
          }
          break;
        }

        // Skip elements outside content area
        if (isOutOfBounds(x, y, w, h)) break;

        // Skip very low opacity decorative elements
        if (elOpacity < 0.05) break;

        // ── Pattern-filled rect → extract as image element ──
        if (patternId) {
          const imgData = patternImageMap.get(patternId);
          if (imgData && imgData.href) {
            const el = makeElement('image', x, y, w, h, {
              src: imgData.href,
              fit: 'cover',
              borderRadius: Math.round(rx * scaleX),
            }, 'Imagem');
            el.opacity = elOpacity;
            elements.push(el);
          } else {
            const el = makeElement('shape', x, y, w, h, {
              shapeType: 'rectangle',
              fill: '#1E293B',
              borderRadius: Math.round(rx * scaleX),
              borderColor: 'transparent',
              borderWidth: 0,
            }, 'Área de imagem');
            el.opacity = elOpacity;
            elements.push(el);
          }
          break;
        }

        // ── Stroke-only rects → import as separator/border shapes ──
        if (fill === 'none') {
          const stroke = node.getAttribute('stroke');
          const strokeW = parseFloat(node.getAttribute('stroke-width') || '0');
          if (stroke && stroke !== 'none' && strokeW > 0) {
            const mappedSW = w * scaleX;
            const mappedSH = h * scaleY;
            if (mappedSW >= 10 || mappedSH >= 10) {
              const isSeparator = (w / Math.max(h, 1) > 4) || (h / Math.max(w, 1) > 4);
              const minH = Math.max(h, strokeW * 2);
              const el = makeElement('shape', x, y, w, minH, {
                shapeType: 'rectangle',
                fill: stroke,
                borderRadius: Math.round(rx * scaleX),
                borderColor: 'transparent',
                borderWidth: 0,
              }, isSeparator ? 'Separador' : 'Borda');
              el.opacity = elOpacity;
              el.height = Math.max(el.height, 4);
              elements.push(el);
            }
          }
          break;
        }

        // Skip decorative rects with very low fill-opacity (but keep if it has a pattern sibling)
        if (fillOp < 0.1 && !fill.includes('gradient')) break;

        // Compute mapped dimensions
        const mappedW = w * scaleX;
        const mappedH = h * scaleY;

        // Skip very tiny rects (icon dots) — lower threshold to 8px
        if (mappedW < 8 && mappedH < 8) break;

        // Gradient-filled rects
        const isGradient = fill.includes('gradient');

        const el = makeElement('shape', x, y, w, h, {
          shapeType: rx > Math.min(w, h) * 0.4 ? 'circle' : 'rectangle',
          fill: fill,
          borderRadius: Math.round(rx * scaleX),
          borderColor: node.getAttribute('stroke') || 'transparent',
          borderWidth: parseFloat(node.getAttribute('stroke-width') || '0') * scaleX,
        }, isGradient ? 'Gradiente' : 'Retângulo');
        el.opacity = elOpacity;
        elements.push(el);
        break;
      }

      case 'circle':
      case 'ellipse': {
        const cxAttr = parseFloat(node.getAttribute('cx') || '0') + ox;
        const cyAttr = parseFloat(node.getAttribute('cy') || '0') + oy;
        const rx = tag === 'circle'
          ? parseFloat(node.getAttribute('r') || '0')
          : parseFloat(node.getAttribute('rx') || '0');
        const ry = tag === 'circle'
          ? rx
          : parseFloat(node.getAttribute('ry') || '0');
        if (rx <= 0 || ry <= 0) break;

        const fill = parseColor(node);
        if (fill === 'none') break;

        const elX = cxAttr - rx, elY = cyAttr - ry;
        if (isOutOfBounds(elX, elY, rx * 2, ry * 2)) break;

        const elOpacity = parseOpacity(node) * nodeOpacity;
        if (elOpacity < 0.05) break;

        const el = makeElement('shape', elX, elY, rx * 2, ry * 2, {
          shapeType: 'circle',
          fill: fill,
          borderRadius: 0,
          borderColor: node.getAttribute('stroke') || 'transparent',
          borderWidth: parseFloat(node.getAttribute('stroke-width') || '0') * scaleX,
        }, 'Círculo');
        el.opacity = elOpacity;
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

        const estimatedW = Math.max(100, textContent.length * fontSize * 0.6);
        const estimatedH = Math.max(40, fontSize * 1.5);

        const adjX = align === 'center' ? x - estimatedW / (2 * scaleX) : x;

        if (isOutOfBounds(adjX, y - fontSize / scaleX, estimatedW / scaleX, estimatedH / scaleX)) break;

        const el = makeElement('text', adjX, y - fontSize / scaleX, estimatedW / scaleX, estimatedH / scaleX, {
          text: textContent,
          fontSize: Math.max(12, fontSize),
          fontWeight: fontWeight === 'bold' || parseInt(fontWeight) >= 700 ? 'bold' : 'normal',
          color: color === 'none' ? '#ffffff' : color,
          align,
          fontFamily: 'Inter',
        }, `Texto: ${textContent.slice(0, 20)}`);
        el.opacity = parseOpacity(node) * nodeOpacity;
        elements.push(el);
        break;
      }

      case 'image': {
        const x = parseFloat(node.getAttribute('x') || '0') + ox;
        const y = parseFloat(node.getAttribute('y') || '0') + oy;
        const w = parseFloat(node.getAttribute('width') || '200');
        const h = parseFloat(node.getAttribute('height') || '200');
        const href = node.getAttribute('href') || node.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';

        if (isOutOfBounds(x, y, w, h)) break;

        const el = makeElement('image', x, y, w, h, {
          src: href,
          fit: 'cover',
          borderRadius: parseFloat(node.getAttribute('rx') || '0') * scaleX,
        }, 'Imagem SVG');
        el.opacity = parseOpacity(node) * nodeOpacity;
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

        const lx = Math.min(x1, x2), ly = Math.min(y1, y2);
        const lw = Math.max(Math.abs(x2 - x1), 4), lh = Math.max(Math.abs(y2 - y1), strokeW * 2);
        if (isOutOfBounds(lx, ly, lw, lh)) break;

        const el = makeElement('shape', lx, ly, lw, lh, {
          shapeType: 'rectangle',
          fill: stroke,
          borderRadius: 0,
          borderColor: 'transparent',
          borderWidth: 0,
        }, 'Linha');
        el.opacity = parseOpacity(node) * nodeOpacity;
        elements.push(el);
        break;
      }

      case 'g':
      case 'svg': {
        Array.from(node.children).forEach(child => processNode(child, ox, oy, nodeOpacity));
        return;
      }

      case 'path': {
        const d = node.getAttribute('d') || '';
        if (!d) break;
        const fill = parseColor(node);
        const stroke = node.getAttribute('stroke');

        const bounds = pathBounds(d);
        if (!bounds) break;

        const px = bounds.x + ox;
        const py = bounds.y + oy;
        const pw = bounds.w;
        const ph = bounds.h;

        if (isOutOfBounds(px, py, pw, ph)) break;

        const elOpacity = parseOpacity(node) * nodeOpacity;
        if (elOpacity < 0.05) break;

        // Convert vectorized text to text placeholder — collect for merging
        if (isLikelyTextPath(bounds)) {
          const mappedH = ph * scaleY;

          // Skip very small text paths (tiny labels)
          if (mappedH < 10) break;

          const fontSize = estimateFontSize(ph, scaleX);
          const charCount = estimateCharCount(pw, ph);
          const isMultiLine = pw > refW * 0.5 && ph > pw * 0.1;

          let placeholder: string;
          if (fontSize >= 40) {
            placeholder = 'Título aqui';
          } else if (fontSize >= 24) {
            placeholder = charCount > 20 ? 'Subtítulo ou descrição do conteúdo' : 'Subtítulo aqui';
          } else if (isMultiLine) {
            placeholder = 'Texto do parágrafo ou descrição detalhada do conteúdo';
          } else {
            placeholder = charCount > 30 ? 'Texto do parágrafo ou descrição detalhada' : 'Texto aqui';
          }

          const fillColor = fill === 'none' ? '#ffffff' : (fill.includes('gradient') ? '#ffffff' : fill);

          // Add to collection for merging instead of directly to elements
          textPathItems.push({
            x: px, y: py, w: pw, h: ph,
            fontSize: Math.max(12, fontSize),
            color: fillColor,
            opacity: elOpacity,
            placeholder,
            fontWeight: fontSize > 24 ? 'bold' : 'normal',
          });
          break;
        }

        // Skip small paths (icons, decorative elements) — lower threshold
        const mappedPW = pw * scaleX;
        const mappedPH = ph * scaleY;
        if (mappedPW < 15 && mappedPH < 15) break;

        // Skip stroke-only paths (outlines, borders)
        if (fill === 'none' && !stroke) break;

        // Check if this looks like an icon (small-ish, roughly square)
        const isIconLike = mappedPW < 80 && mappedPH < 80 && Math.abs(pw - ph) / Math.max(pw, ph) < 0.5;

        if (isIconLike) {
          const el = makeElement('shape', px, py, pw, ph, {
            shapeType: 'rectangle',
            fill: fill === 'none' ? (stroke || 'transparent') : fill,
            borderRadius: Math.round(Math.min(pw, ph) * scaleX * 0.2),
            borderColor: 'transparent',
            borderWidth: 0,
          }, 'Ícone');
          el.opacity = elOpacity;
          elements.push(el);
          break;
        }

        const el = makeElement('shape', px, py, pw, ph, {
          shapeType: 'rectangle',
          fill: fill === 'none' ? (stroke || 'transparent') : fill,
          borderRadius: 0,
          borderColor: stroke || 'transparent',
          borderWidth: parseFloat(node.getAttribute('stroke-width') || '0') * scaleX,
        }, 'Path');
        el.opacity = elOpacity;
        elements.push(el);
        break;
      }

      case 'use': {
        // Resolve <use> references that point to images or groups
        const refId = (node.getAttribute('href') || node.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '').replace('#', '');
        if (!refId) break;
        
        const x = parseFloat(node.getAttribute('x') || '0') + ox;
        const y = parseFloat(node.getAttribute('y') || '0') + oy;
        
        // Check if it references an image
        const imgData = imageMap.get(refId);
        if (imgData && imgData.href) {
          const w = parseFloat(node.getAttribute('width') || String(imgData.w));
          const h = parseFloat(node.getAttribute('height') || String(imgData.h));
          if (!isOutOfBounds(x, y, w, h)) {
            const el = makeElement('image', x, y, w, h, {
              src: imgData.href,
              fit: 'cover',
              borderRadius: 0,
            }, 'Imagem (use)');
            el.opacity = parseOpacity(node) * nodeOpacity;
            elements.push(el);
          }
        } else {
          // Try to find and process the referenced element
          try {
            const refEl = svg.querySelector(`[id="${refId}"]`);
            if (refEl) {
              processNode(refEl, x, y, nodeOpacity);
            }
          } catch (e) {
            console.warn(`SVG Import: Could not resolve <use> reference #${refId}`);
          }
        }
        break;
      }
    }

    // Process children for non-group elements that may contain nested elements
    if (tag !== 'g' && tag !== 'svg') {
      Array.from(node.children).forEach(child => processNode(child, ox, oy, nodeOpacity));
    }
  }

  // Process all top-level children of the SVG
  Array.from(svg.children).forEach(child => processNode(child));

  // ── Post-process: merge adjacent text paths into single text elements ──
  if (textPathItems.length > 0) {
    // Sort by Y position, then X
    textPathItems.sort((a, b) => {
      const yDiff = a.y - b.y;
      if (Math.abs(yDiff) > Math.max(a.h, b.h) * 0.5) return yDiff;
      return a.x - b.x;
    });

    // Merge items that are on the same line (similar Y, adjacent X)
    const merged: TextPathItem[] = [];
    let current = { ...textPathItems[0] };

    for (let ti = 1; ti < textPathItems.length; ti++) {
      const item = textPathItems[ti];
      const sameRow = Math.abs(item.y - current.y) < Math.max(current.h, item.h) * 0.6;
      const closeX = (item.x - (current.x + current.w)) < current.h * 2;
      const sameColor = item.color === current.color;
      const sameSize = Math.abs(item.fontSize - current.fontSize) < 4;

      if (sameRow && closeX && sameColor && sameSize) {
        // Merge: extend bounding box
        const newX = Math.min(current.x, item.x);
        const newY = Math.min(current.y, item.y);
        const newRight = Math.max(current.x + current.w, item.x + item.w);
        const newBottom = Math.max(current.y + current.h, item.y + item.h);
        current.x = newX;
        current.y = newY;
        current.w = newRight - newX;
        current.h = newBottom - newY;
        // Keep the larger font size
        current.fontSize = Math.max(current.fontSize, item.fontSize);
      } else {
        merged.push(current);
        current = { ...item };
      }
    }
    merged.push(current);

    // Create text elements from merged items
    for (const item of merged) {
      const el = makeElement('text', item.x, item.y, item.w, item.h, {
        text: item.placeholder,
        fontSize: item.fontSize,
        fontWeight: item.fontWeight,
        color: item.color,
        align: item.w > refW * 0.6 ? 'center' : 'left',
        fontFamily: 'Inter',
      }, `Texto (editar)`);
      el.opacity = item.opacity;
      elements.push(el);
    }
  }

  if (skippedCount > 0) {
    console.warn(`SVG Import: ${skippedCount} elements were skipped due to parsing errors`);
  }

  return {
    elements,
    bgColor,
    viewBox: { width: refW, height: refH },
  };
}
