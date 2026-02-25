/**
 * HTML → CanvasElement[] converter
 * Parses HTML markup and maps elements to native canvas widgets.
 * Designed for Figma HTML exports, marketing emails, or hand-coded layouts.
 */
import { CANVAS_WIDTH, CANVAS_HEIGHT, type CanvasElement, type ElementType } from '../types/canvas';

let _counter = 0;
const uid = () => `html_${Date.now()}_${++_counter}`;

interface ParsedHTML {
  elements: CanvasElement[];
  bgColor: string;
}

/* ── Color helpers ────────────────────────────────────────────────── */

function normalizeColor(raw: string): string {
  if (!raw || raw === 'transparent' || raw === 'initial' || raw === 'inherit') return '';
  return raw.trim();
}

function isDark(color: string): boolean {
  if (!color) return false;
  if (color.includes('rgba') || color.includes('hsla')) return false;
  // Simple heuristic for hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    if (hex.length >= 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return (r + g + b) / 3 < 128;
    }
  }
  return false;
}

/* ── Computed style extraction ────────────────────────────────────── */

interface BoxInfo {
  x: number; y: number; w: number; h: number;
}

function getComputedStyles(el: HTMLElement) {
  const cs = window.getComputedStyle(el);
  return {
    bgColor: normalizeColor(cs.backgroundColor),
    color: normalizeColor(cs.color) || '#ffffff',
    fontSize: parseFloat(cs.fontSize) || 16,
    fontWeight: cs.fontWeight,
    fontFamily: cs.fontFamily?.split(',')[0]?.replace(/['"]/g, '').trim() || 'Inter',
    textAlign: cs.textAlign as 'left' | 'center' | 'right',
    borderRadius: parseFloat(cs.borderRadius) || 0,
    borderColor: normalizeColor(cs.borderColor),
    borderWidth: parseFloat(cs.borderWidth) || 0,
    opacity: parseFloat(cs.opacity) || 1,
    backgroundImage: cs.backgroundImage,
    padding: parseFloat(cs.padding) || 0,
  };
}

/* ── Element makers ──────────────────────────────────────────────── */

let zIndex = 1;

function makeElement(
  type: ElementType,
  box: BoxInfo,
  props: Record<string, any>,
  name: string,
  scaleX: number,
  scaleY: number,
  originX: number,
  originY: number,
  opacity = 1,
): CanvasElement {
  return {
    id: uid(),
    type,
    x: Math.round((box.x - originX) * scaleX),
    y: Math.round((box.y - originY) * scaleY),
    width: Math.max(20, Math.round(box.w * scaleX)),
    height: Math.max(20, Math.round(box.h * scaleY)),
    rotation: 0,
    zIndex: zIndex++,
    opacity,
    locked: false,
    visible: true,
    name,
    viewId: '__default__',
    props,
  };
}

/* ── Main parser ─────────────────────────────────────────────────── */

export function parseHTMLToCanvas(htmlString: string): ParsedHTML {
  const trimmed = htmlString.trim();

  // Create an invisible container to render the HTML
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed; top: -9999px; left: -9999px;
    width: 1080px; min-height: 1920px;
    overflow: hidden; visibility: hidden;
    font-family: Inter, system-ui, sans-serif;
    background: #0f172a; color: #ffffff;
  `;
  document.body.appendChild(container);

  try {
    container.innerHTML = trimmed;

    // Apply any <style> tags within the HTML
    const styleTags = container.querySelectorAll('style');
    styleTags.forEach(tag => {
      const styleEl = document.createElement('style');
      styleEl.textContent = tag.textContent || '';
      document.head.appendChild(styleEl);
      // Clean up later
      setTimeout(() => styleEl.remove(), 100);
    });

    // Force layout calculation
    container.getBoundingClientRect();

    const containerRect = container.getBoundingClientRect();
    const originX = containerRect.left;
    const originY = containerRect.top;
    const refW = containerRect.width || 1080;
    const refH = Math.max(containerRect.height, 1920);

    const scaleX = CANVAS_WIDTH / refW;
    const scaleY = CANVAS_HEIGHT / Math.max(refH, 1920);

    const elements: CanvasElement[] = [];
    zIndex = 1;
    let bgColor = '#0f172a';

    // Detect background from the root element
    const rootEl = container.firstElementChild as HTMLElement | null;
    if (rootEl) {
      const rootCs = getComputedStyles(rootEl);
      if (rootCs.bgColor && rootCs.bgColor !== 'rgba(0, 0, 0, 0)') {
        bgColor = rootCs.bgColor;
      }
    }

    // Walk the DOM tree
    function processElement(node: HTMLElement, depth = 0) {
      if (depth > 20) return; // Safety limit

      const tag = node.tagName?.toLowerCase();
      if (!tag) return;

      // Skip invisible elements
      if (['script', 'style', 'meta', 'link', 'head', 'title', 'noscript'].includes(tag)) return;

      const cs = getComputedStyles(node);
      const rect = node.getBoundingClientRect();
      const box: BoxInfo = {
        x: rect.left,
        y: rect.top,
        w: rect.width,
        h: rect.height,
      };

      // Skip zero-size or off-screen elements
      if (box.w < 2 || box.h < 2) return;
      if (box.x + box.w < originX || box.y + box.h < originY) return;

      const mappedW = box.w * scaleX;
      const mappedH = box.h * scaleY;

      // ── IMG tags → image element ──
      if (tag === 'img') {
        const src = node.getAttribute('src') || '';
        if (src && mappedW >= 15 && mappedH >= 15) {
          elements.push(makeElement('image', box, {
            src,
            fit: 'cover',
            borderRadius: Math.round(cs.borderRadius * scaleX),
          }, 'Imagem', scaleX, scaleY, originX, originY, cs.opacity));
        }
        return;
      }

      // ── VIDEO tags → video element ──
      if (tag === 'video') {
        const src = node.getAttribute('src') || node.querySelector('source')?.getAttribute('src') || '';
        elements.push(makeElement('video', box, {
          url: src,
          autoplay: true,
          loop: true,
          muted: true,
          borderRadius: Math.round(cs.borderRadius * scaleX),
        }, 'Vídeo', scaleX, scaleY, originX, originY, cs.opacity));
        return;
      }

      // ── IFRAME → iframe element ──
      if (tag === 'iframe') {
        const src = node.getAttribute('src') || '';
        elements.push(makeElement('iframe', box, {
          url: src,
          borderRadius: Math.round(cs.borderRadius * scaleX),
        }, 'Iframe', scaleX, scaleY, originX, originY, cs.opacity));
        return;
      }

      // ── SVG → icon element ──
      if (tag === 'svg' && mappedW < 120 && mappedH < 120) {
        elements.push(makeElement('icon', box, {
          icon: '⭐',
          size: Math.round(Math.min(mappedW, mappedH)),
          color: cs.color,
        }, 'Ícone', scaleX, scaleY, originX, originY, cs.opacity));
        return;
      }

      // ── Text-only nodes (leaf elements with text content) ──
      const textContent = getDirectText(node).trim();
      const hasChildElements = Array.from(node.children).some(c =>
        !['br', 'span', 'strong', 'em', 'b', 'i', 'u', 'a', 'mark', 'small', 'sub', 'sup'].includes(c.tagName.toLowerCase())
      );

      if (textContent && !hasChildElements) {
        // Check if it's a button-like element
        const isButton = tag === 'button' ||
          tag === 'a' ||
          node.getAttribute('role') === 'button' ||
          (cs.bgColor && cs.bgColor !== 'rgba(0, 0, 0, 0)' && mappedH < 120 && textContent.length < 40);

        if (isButton && mappedH < 120 && mappedW < 800) {
          elements.push(makeElement('button', box, {
            label: textContent,
            bgColor: cs.bgColor || '#6366f1',
            textColor: cs.color,
            fontSize: Math.round(cs.fontSize * scaleX),
            borderRadius: Math.round(cs.borderRadius * scaleX),
            actionType: 'prompt',
            action: '',
            navigateTarget: '',
            navigateTransition: 'fade',
          }, `Botão: ${textContent.slice(0, 20)}`, scaleX, scaleY, originX, originY, cs.opacity));
          return;
        }

        // Regular text
        if (mappedW >= 15 && mappedH >= 10) {
          const fullText = node.textContent?.trim() || textContent;
          elements.push(makeElement('text', box, {
            text: fullText,
            fontSize: Math.max(12, Math.round(cs.fontSize * scaleX)),
            fontWeight: cs.fontWeight === 'bold' || parseInt(cs.fontWeight) >= 700 ? 'bold' : 'normal',
            color: cs.color || '#ffffff',
            align: cs.textAlign === 'center' ? 'center' : cs.textAlign === 'right' ? 'right' : 'left',
            fontFamily: cs.fontFamily || 'Inter',
          }, `Texto: ${fullText.slice(0, 20)}`, scaleX, scaleY, originX, originY, cs.opacity));
          return;
        }
      }

      // ── Container elements with background → shape ──
      const hasBg = cs.bgColor && cs.bgColor !== 'rgba(0, 0, 0, 0)';
      const hasGradient = cs.backgroundImage && cs.backgroundImage !== 'none';
      const hasBorder = cs.borderWidth > 0 && cs.borderColor && cs.borderColor !== 'rgba(0, 0, 0, 0)';
      const isBackgroundContainer = (hasBg || hasGradient || hasBorder) && mappedW >= 20 && mappedH >= 20;

      // Skip root-level containers that are basically the whole page
      const isFullPage = box.w >= refW * 0.9 && box.h >= refH * 0.9;

      if (isBackgroundContainer && !isFullPage) {
        const fill = hasGradient && cs.backgroundImage !== 'none'
          ? cs.backgroundImage
          : (hasBg ? cs.bgColor : (hasBorder ? cs.borderColor : '#6366f1'));

        // Check if this is an image background
        if (cs.backgroundImage && cs.backgroundImage.includes('url(')) {
          const urlMatch = cs.backgroundImage.match(/url\(['"]?([^'")\s]+)['"]?\)/);
          if (urlMatch) {
            elements.push(makeElement('image', box, {
              src: urlMatch[1],
              fit: 'cover',
              borderRadius: Math.round(cs.borderRadius * scaleX),
            }, 'Imagem BG', scaleX, scaleY, originX, originY, cs.opacity));
          }
        } else {
          elements.push(makeElement('shape', box, {
            shapeType: cs.borderRadius > Math.min(box.w, box.h) * 0.4 ? 'circle' : 'rectangle',
            fill: fill || '#6366f1',
            borderRadius: Math.round(cs.borderRadius * scaleX),
            borderColor: hasBorder ? cs.borderColor : 'transparent',
            borderWidth: hasBorder ? Math.round(cs.borderWidth * scaleX) : 0,
          }, hasGradient ? 'Gradiente' : 'Retângulo', scaleX, scaleY, originX, originY, cs.opacity));
        }
      }

      // ── HR → separator line ──
      if (tag === 'hr') {
        elements.push(makeElement('shape', box, {
          shapeType: 'rectangle',
          fill: cs.borderColor || cs.bgColor || 'rgba(255,255,255,0.15)',
          borderRadius: 0,
          borderColor: 'transparent',
          borderWidth: 0,
        }, 'Separador', scaleX, scaleY, originX, originY, cs.opacity));
        return;
      }

      // Recursively process children
      Array.from(node.children).forEach(child => {
        if (child instanceof HTMLElement) {
          processElement(child, depth + 1);
        }
      });
    }

    // Process all root children
    Array.from(container.children).forEach(child => {
      if (child instanceof HTMLElement) {
        processElement(child, 0);
      }
    });

    return { elements, bgColor };
  } finally {
    document.body.removeChild(container);
  }
}

/** Get only the direct text content of a node (not from nested block elements) */
function getDirectText(node: HTMLElement): string {
  let text = '';
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      text += child.textContent || '';
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const tag = (child as HTMLElement).tagName?.toLowerCase();
      // Include inline elements' text
      if (['span', 'strong', 'em', 'b', 'i', 'u', 'a', 'mark', 'small', 'sub', 'sup', 'br'].includes(tag)) {
        text += child.textContent || '';
      }
    }
  }
  return text;
}
