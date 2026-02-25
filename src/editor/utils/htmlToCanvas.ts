/**
 * HTML/CSS → CanvasElement[] parser
 * Converts HTML exported from Figma plugins (Anima, Locofy, etc.)
 * into CanvasElement[] for the free-form canvas (1080×1920).
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, type CanvasElement, type ElementType } from '../types/canvas';

let _counter = 0;
const uid = () => `imp_${Date.now()}_${++_counter}`;

interface ParsedNode {
  tag: string;
  text: string;
  styles: Record<string, string>;
  src?: string;
  href?: string;
  children: ParsedNode[];
  rect: { x: number; y: number; w: number; h: number };
}

/** Parse inline style string to object */
function parseInlineStyle(style: string): Record<string, string> {
  const obj: Record<string, string> = {};
  style.split(';').forEach(decl => {
    const [prop, ...rest] = decl.split(':');
    if (prop && rest.length) {
      const key = prop.trim();
      const val = rest.join(':').trim();
      if (key && val) obj[key] = val;
    }
  });
  return obj;
}

/** Convert CSS color to hex (best-effort) */
function normalizeColor(c: string): string {
  if (!c) return '#ffffff';
  if (c.startsWith('#')) return c;
  if (c.startsWith('rgb')) {
    const nums = c.match(/\d+/g);
    if (nums && nums.length >= 3) {
      return '#' + nums.slice(0, 3).map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
    }
  }
  // named colors fallback
  const map: Record<string, string> = {
    white: '#ffffff', black: '#000000', red: '#ff0000', blue: '#0000ff',
    green: '#008000', transparent: 'transparent', gray: '#808080', grey: '#808080',
  };
  return map[c.toLowerCase()] || c;
}

/** Parse px/rem/em values to number */
function parseSize(val: string): number {
  if (!val) return 0;
  const n = parseFloat(val);
  if (val.endsWith('rem')) return n * 16;
  if (val.endsWith('em')) return n * 16;
  if (val.endsWith('vw')) return (n / 100) * CANVAS_WIDTH;
  if (val.endsWith('vh')) return (n / 100) * CANVAS_HEIGHT;
  if (val.endsWith('%')) return (n / 100) * CANVAS_WIDTH;
  return n || 0;
}

/** Detect element type from HTML node */
function detectType(node: ParsedNode): ElementType {
  const tag = node.tag.toLowerCase();
  if (tag === 'img' || tag === 'picture') return 'image';
  if (tag === 'video') return 'video';
  if (tag === 'iframe') return 'iframe';
  if (tag === 'button' || tag === 'a') return 'button';
  if (tag === 'svg') return 'icon';
  if (tag === 'input' || tag === 'textarea' || tag === 'form') return 'form';

  // Check for background-image
  const bg = node.styles['background-image'] || node.styles['background'];
  if (bg && (bg.includes('url(') || bg.includes('linear-gradient'))) {
    if (bg.includes('url(')) return 'image';
    return 'shape';
  }

  // Text detection
  const text = node.text.trim();
  if (text && !node.children.length) return 'text';

  // Containers with no text → shape
  if (!text && !node.children.length) return 'shape';

  return 'text';
}

/** Build CanvasElement from parsed node */
function nodeToElement(node: ParsedNode, index: number, scaleX: number, scaleY: number): CanvasElement | null {
  const type = detectType(node);
  const s = node.styles;

  const x = Math.round(node.rect.x * scaleX);
  const y = Math.round(node.rect.y * scaleY);
  const w = Math.max(40, Math.round(node.rect.w * scaleX));
  const h = Math.max(20, Math.round(node.rect.h * scaleY));

  const base: Omit<CanvasElement, 'props'> = {
    id: uid(),
    type,
    x: Math.max(0, Math.min(x, CANVAS_WIDTH - 40)),
    y: Math.max(0, Math.min(y, CANVAS_HEIGHT - 20)),
    width: Math.min(w, CANVAS_WIDTH),
    height: Math.min(h, CANVAS_HEIGHT),
    rotation: 0,
    zIndex: index + 1,
    opacity: parseFloat(s.opacity || '1') || 1,
    locked: false,
    visible: true,
    name: `Import ${index + 1}`,
    viewId: '__default__',
  };

  let props: Record<string, any> = {};

  switch (type) {
    case 'text': {
      const fontSize = parseSize(s['font-size'] || '16px') || 16;
      props = {
        text: node.text.trim() || 'Texto',
        fontSize: Math.round(fontSize * Math.max(scaleX, scaleY)),
        fontWeight: s['font-weight'] || 'normal',
        color: normalizeColor(s.color || '#ffffff'),
        align: s['text-align'] || 'left',
        fontFamily: (s['font-family'] || 'Inter').split(',')[0].replace(/['"]/g, '').trim(),
      };
      base.name = (node.text.trim().slice(0, 20) || 'Texto') + (node.text.length > 20 ? '…' : '');
      break;
    }
    case 'image': {
      const src = node.src || '';
      const bgImg = s['background-image'] || '';
      const urlMatch = bgImg.match(/url\(['"]?(.+?)['"]?\)/);
      props = {
        src: src || urlMatch?.[1] || '',
        fit: s['object-fit'] || 'cover',
        borderRadius: parseSize(s['border-radius'] || '0'),
      };
      base.name = 'Imagem';
      break;
    }
    case 'button': {
      props = {
        label: node.text.trim() || 'Botão',
        bgColor: normalizeColor(s['background-color'] || s.background || '#6366f1'),
        textColor: normalizeColor(s.color || '#ffffff'),
        fontSize: parseSize(s['font-size'] || '16px') || 16,
        borderRadius: parseSize(s['border-radius'] || '8px'),
        actionType: 'prompt',
        action: '',
        navigateTarget: '',
        navigateTransition: 'fade',
      };
      base.name = node.text.trim().slice(0, 20) || 'Botão';
      break;
    }
    case 'shape': {
      props = {
        shapeType: 'rectangle',
        fill: normalizeColor(s['background-color'] || s.background || '#6366f1'),
        borderRadius: parseSize(s['border-radius'] || '0'),
        borderColor: normalizeColor(s['border-color'] || 'transparent'),
        borderWidth: parseSize(s['border-width'] || '0'),
      };
      base.name = 'Forma';
      break;
    }
    case 'video': {
      props = {
        url: node.src || '',
        autoplay: true,
        loop: true,
        muted: true,
        borderRadius: parseSize(s['border-radius'] || '0'),
      };
      base.name = 'Vídeo';
      break;
    }
    case 'iframe': {
      props = {
        url: node.src || '',
        borderRadius: parseSize(s['border-radius'] || '0'),
      };
      base.name = 'Iframe';
      break;
    }
    default: {
      props = {
        text: node.text.trim() || 'Elemento',
        fontSize: 16,
        color: '#ffffff',
      };
    }
  }

  return { ...base, props };
}

/** Main parser: HTML string → CanvasElement[] */
export function parseHtmlToElements(html: string): CanvasElement[] {
  // Use DOMParser to parse the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  if (!body || !body.children.length) return [];

  // Also extract <style> blocks for class-based styles
  const styleMap = new Map<string, Record<string, string>>();
  doc.querySelectorAll('style').forEach(styleEl => {
    const css = styleEl.textContent || '';
    // Simple regex to extract class rules
    const ruleRegex = /\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/g;
    let match: RegExpExecArray | null;
    while ((match = ruleRegex.exec(css)) !== null) {
      styleMap.set(match[1], parseInlineStyle(match[2]));
    }
  });

  // Flatten all visible elements
  const nodes: ParsedNode[] = [];
  
  function walk(el: Element, parentX = 0, parentY = 0) {
    if (el.nodeType !== 1) return;
    const tag = el.tagName.toLowerCase();
    if (['script', 'style', 'meta', 'link', 'head', 'noscript'].includes(tag)) return;

    // Merge styles: class-based + inline
    let mergedStyles: Record<string, string> = {};
    el.classList.forEach(cls => {
      const classStyles = styleMap.get(cls);
      if (classStyles) mergedStyles = { ...mergedStyles, ...classStyles };
    });
    const inlineStyle = el.getAttribute('style') || '';
    if (inlineStyle) {
      mergedStyles = { ...mergedStyles, ...parseInlineStyle(inlineStyle) };
    }

    // Compute position
    const posStyle = mergedStyles.position || '';
    let x = parentX;
    let y = parentY;
    
    if (posStyle === 'absolute' || posStyle === 'fixed') {
      x = parseSize(mergedStyles.left || '0');
      y = parseSize(mergedStyles.top || '0');
    } else {
      // Approximate flow positioning
      const mt = parseSize(mergedStyles['margin-top'] || '0');
      const ml = parseSize(mergedStyles['margin-left'] || '0');
      x = parentX + ml;
      y = parentY + mt;
    }

    const w = parseSize(mergedStyles.width || '0');
    const h = parseSize(mergedStyles.height || '0');

    // Get direct text content (not from children)
    let directText = '';
    el.childNodes.forEach(child => {
      if (child.nodeType === 3) directText += (child.textContent || '').trim() + ' ';
    });
    directText = directText.trim();

    const isLeaf = el.children.length === 0;
    const hasVisualContent = directText || (el as HTMLElement).getAttribute('src') || 
      mergedStyles['background-image'] || mergedStyles['background-color'] ||
      tag === 'img' || tag === 'video' || tag === 'button' || tag === 'iframe' || tag === 'svg';

    if (isLeaf || hasVisualContent) {
      const node: ParsedNode = {
        tag,
        text: directText,
        styles: mergedStyles,
        src: (el as HTMLImageElement).src || el.getAttribute('src') || undefined,
        href: (el as HTMLAnchorElement).href || el.getAttribute('href') || undefined,
        children: [],
        rect: { x, y, w: w || 300, h: h || (directText ? 40 : 100) },
      };
      nodes.push(node);
    }

    // Walk children with accumulated offset
    let childY = y + (isLeaf ? 0 : parseSize(mergedStyles['padding-top'] || '0'));
    Array.from(el.children).forEach(child => {
      walk(child, x + parseSize(mergedStyles['padding-left'] || '0'), childY);
      // Estimate child height for flow
      const childStyle = (child as HTMLElement).style;
      const ch = parseSize(childStyle.height || mergedStyles.height || '0');
      childY += ch || 40;
    });
  }

  walk(body);

  if (nodes.length === 0) return [];

  // Find bounding box to scale to canvas
  let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
  nodes.forEach(n => {
    minX = Math.min(minX, n.rect.x);
    minY = Math.min(minY, n.rect.y);
    maxX = Math.max(maxX, n.rect.x + n.rect.w);
    maxY = Math.max(maxY, n.rect.y + n.rect.h);
  });

  const srcW = maxX - minX || 1;
  const srcH = maxY - minY || 1;
  
  // Scale to fit canvas with margin
  const margin = 60;
  const scaleX = (CANVAS_WIDTH - margin * 2) / srcW;
  const scaleY = (CANVAS_HEIGHT - margin * 2) / srcH;
  const scale = Math.min(scaleX, scaleY, 3); // cap at 3x

  // Normalize positions relative to bounding box
  nodes.forEach(n => {
    n.rect.x -= minX;
    n.rect.y -= minY;
    n.rect.x += margin / scale;
    n.rect.y += margin / scale;
  });

  return nodes
    .map((n, i) => nodeToElement(n, i, scale, scale))
    .filter(Boolean) as CanvasElement[];
}

/** Extract background color from HTML */
export function extractBgColor(html: string): string | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Check body background
  const bodyStyle = doc.body?.getAttribute('style') || '';
  const styles = parseInlineStyle(bodyStyle);
  const bg = styles['background-color'] || styles.background;
  if (bg && !bg.includes('url(') && !bg.includes('gradient')) {
    return normalizeColor(bg);
  }

  // Check first container
  const first = doc.body?.firstElementChild;
  if (first) {
    const firstStyle = parseInlineStyle(first.getAttribute('style') || '');
    const firstBg = firstStyle['background-color'] || firstStyle.background;
    if (firstBg && !firstBg.includes('url(') && !firstBg.includes('gradient')) {
      return normalizeColor(firstBg);
    }
  }

  return null;
}
