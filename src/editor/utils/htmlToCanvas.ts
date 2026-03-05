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
    display: cs.display,
    gap: parseFloat(cs.gap) || 0,
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

/* ── List extractor (ul, ol, dl) ─────────────────────────────────── */

function extractListItems(node: HTMLElement): { label: string; description?: string }[] {
  const items: { label: string; description?: string }[] = [];
  const tag = node.tagName.toLowerCase();

  if (tag === 'dl') {
    const children = Array.from(node.children);
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.tagName.toLowerCase() === 'dt') {
        const dd = children[i + 1];
        items.push({
          label: child.textContent?.trim() || '',
          description: dd?.tagName.toLowerCase() === 'dd' ? dd.textContent?.trim() : undefined,
        });
        if (dd?.tagName.toLowerCase() === 'dd') i++;
      }
    }
  } else {
    node.querySelectorAll(':scope > li').forEach(li => {
      items.push({ label: li.textContent?.trim() || '' });
    });
  }
  return items;
}

/* ── Table extractor ─────────────────────────────────────────────── */

function extractTableData(table: HTMLElement): { headers: string[]; rows: string[][] } {
  const headers: string[] = [];
  const rows: string[][] = [];

  table.querySelectorAll('thead th, thead td').forEach(th => {
    headers.push(th.textContent?.trim() || '');
  });

  // If no thead, use first row as headers
  const bodyRows = table.querySelectorAll('tbody tr, :scope > tr');
  bodyRows.forEach((tr, idx) => {
    const cells: string[] = [];
    tr.querySelectorAll('td, th').forEach(td => cells.push(td.textContent?.trim() || ''));
    if (idx === 0 && headers.length === 0) {
      headers.push(...cells);
    } else {
      rows.push(cells);
    }
  });

  return { headers, rows };
}

/* ── Form extractor ──────────────────────────────────────────────── */

function extractFormFields(form: HTMLElement): { label: string; type: string; placeholder?: string; required?: boolean; options?: string[] }[] {
  const fields: { label: string; type: string; placeholder?: string; required?: boolean; options?: string[] }[] = [];

  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    const el = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const tag = el.tagName.toLowerCase();
    const inputType = (el as HTMLInputElement).type || 'text';

    // Skip hidden and submit inputs
    if (inputType === 'hidden' || inputType === 'submit' || inputType === 'button') return;

    // Try to find associated label
    let labelText = '';
    const id = el.id;
    if (id) {
      const labelEl = form.querySelector(`label[for="${id}"]`);
      if (labelEl) labelText = labelEl.textContent?.trim() || '';
    }
    if (!labelText) {
      const parent = el.closest('label');
      if (parent) labelText = getDirectText(parent).trim();
    }
    if (!labelText) {
      labelText = el.getAttribute('placeholder') || el.getAttribute('name') || inputType;
    }

    const field: typeof fields[0] = {
      label: labelText,
      type: tag === 'textarea' ? 'textarea' : tag === 'select' ? 'select' : inputType,
      placeholder: el.getAttribute('placeholder') || undefined,
      required: el.hasAttribute('required'),
    };

    if (tag === 'select') {
      field.options = Array.from((el as HTMLSelectElement).options).map(o => o.textContent?.trim() || o.value);
    }

    fields.push(field);
  });

  return fields;
}

/* ── Nav link extractor ──────────────────────────────────────────── */

function extractNavLinks(nav: HTMLElement): { label: string; icon?: string }[] {
  const links: { label: string; icon?: string }[] = [];
  nav.querySelectorAll('a, button, [role="menuitem"]').forEach(el => {
    const text = el.textContent?.trim();
    if (text && text.length < 50) {
      links.push({ label: text });
    }
  });
  return links;
}

/* ── Progress bar detector ───────────────────────────────────────── */

function isProgressBar(node: HTMLElement, cs: ReturnType<typeof getComputedStyles>): number | null {
  // Check for role="progressbar" or <progress>
  const tag = node.tagName.toLowerCase();
  if (tag === 'progress') {
    return parseFloat(node.getAttribute('value') || '0') / parseFloat(node.getAttribute('max') || '100') * 100;
  }
  if (node.getAttribute('role') === 'progressbar') {
    const val = node.getAttribute('aria-valuenow');
    const max = node.getAttribute('aria-valuemax') || '100';
    if (val) return (parseFloat(val) / parseFloat(max)) * 100;
  }
  // Heuristic: narrow tall-colored child inside a wider container
  if (node.children.length === 1) {
    const child = node.children[0] as HTMLElement;
    const childCs = getComputedStyles(child);
    const parentRect = node.getBoundingClientRect();
    const childRect = child.getBoundingClientRect();
    if (parentRect.height < 30 && parentRect.width > 60
        && childCs.bgColor && childCs.bgColor !== 'rgba(0, 0, 0, 0)'
        && childRect.width < parentRect.width
        && childRect.height >= parentRect.height * 0.6) {
      return Math.round((childRect.width / parentRect.width) * 100);
    }
  }
  return null;
}

/* ── Main parser ─────────────────────────────────────────────────── */

export function parseHTMLToCanvas(htmlString: string): ParsedHTML {
  const trimmed = htmlString.trim();

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
      if (depth > 20) return;

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

      // ── PROGRESS / progressbar → animated-number ──
      const progressValue = isProgressBar(node, cs);
      if (progressValue !== null) {
        elements.push(makeElement('animated-number', box, {
          value: progressValue,
          max: 100,
          suffix: '%',
          prefix: '',
          duration: 1.5,
          color: cs.bgColor || cs.color || '#6366f1',
          fontSize: Math.max(16, Math.round(cs.fontSize * scaleX)),
        }, `Progresso: ${progressValue}%`, scaleX, scaleY, originX, originY, cs.opacity));
        return;
      }

      // ── TABLE → list element (rows as items) ──
      if (tag === 'table') {
        const { headers, rows } = extractTableData(node);
        if (headers.length > 0) {
          const items = rows.map(row => {
            const obj: Record<string, string> = {};
            headers.forEach((h, i) => { obj[h] = row[i] || ''; });
            return { label: Object.values(obj).join(' • '), description: '' };
          });
          elements.push(makeElement('list', box, {
            items: items.length > 0 ? items : headers.map(h => ({ label: h, description: '' })),
            layout: 'list',
            columns: 1,
            gap: 4,
            showBorder: true,
            borderColor: cs.borderColor || 'rgba(255,255,255,0.1)',
            bgColor: cs.bgColor || 'transparent',
            textColor: cs.color || '#ffffff',
            fontSize: Math.max(12, Math.round(cs.fontSize * scaleX)),
            headerText: headers.join(' | '),
            showHeader: true,
          }, `Tabela: ${headers.length} colunas`, scaleX, scaleY, originX, originY, cs.opacity));
        }
        return;
      }

      // ── UL / OL / DL → list element ──
      if (tag === 'ul' || tag === 'ol' || tag === 'dl') {
        const items = extractListItems(node);
        if (items.length > 0) {
          elements.push(makeElement('list', box, {
            items,
            layout: 'list',
            columns: 1,
            gap: 4,
            showBorder: false,
            bgColor: cs.bgColor || 'transparent',
            textColor: cs.color || '#ffffff',
            fontSize: Math.max(12, Math.round(cs.fontSize * scaleX)),
            ordered: tag === 'ol',
          }, `Lista: ${items.length} itens`, scaleX, scaleY, originX, originY, cs.opacity));
        }
        return;
      }

      // ── FORM → form element ──
      if (tag === 'form') {
        const fields = extractFormFields(node);
        if (fields.length > 0) {
          // Try to find form title
          const heading = node.querySelector('h1, h2, h3, h4, legend');
          const title = heading?.textContent?.trim() || 'Formulário';
          const submitBtn = node.querySelector('button[type="submit"], input[type="submit"]');
          const submitLabel = submitBtn?.textContent?.trim() || submitBtn?.getAttribute('value') || 'Enviar';

          elements.push(makeElement('form', box, {
            title,
            fields: fields.map(f => ({
              id: `field_${uid()}`,
              label: f.label,
              type: f.type === 'email' ? 'email' : f.type === 'tel' ? 'phone' : f.type === 'number' ? 'number' : f.type === 'textarea' ? 'textarea' : f.type === 'select' ? 'select' : 'text',
              placeholder: f.placeholder || '',
              required: f.required || false,
              options: f.options,
            })),
            submitLabel,
            bgColor: cs.bgColor || 'transparent',
            textColor: cs.color || '#ffffff',
            accentColor: '#6366f1',
            borderRadius: Math.round(cs.borderRadius * scaleX),
          }, `Formulário: ${title}`, scaleX, scaleY, originX, originY, cs.opacity));
        }
        return;
      }

      // ── NAV → list of navigation items ──
      if (tag === 'nav') {
        const links = extractNavLinks(node);
        if (links.length > 0) {
          elements.push(makeElement('list', box, {
            items: links.map(l => ({ label: l.label, description: '' })),
            layout: 'horizontal',
            columns: links.length,
            gap: 8,
            showBorder: false,
            bgColor: cs.bgColor || 'transparent',
            textColor: cs.color || '#ffffff',
            fontSize: Math.max(12, Math.round(cs.fontSize * scaleX)),
          }, `Nav: ${links.length} links`, scaleX, scaleY, originX, originY, cs.opacity));
        }
        return;
      }

      // ── INPUT / SELECT / TEXTAREA (standalone, not inside a form) ──
      if ((tag === 'input' || tag === 'select' || tag === 'textarea') && !node.closest('form')) {
        const inputType = (node as HTMLInputElement).type || 'text';
        if (inputType !== 'hidden' && inputType !== 'submit' && inputType !== 'button') {
          const placeholder = node.getAttribute('placeholder') || node.getAttribute('name') || '';
          // Find label
          let labelText = '';
          const id = node.id;
          if (id) {
            const labelEl = container.querySelector(`label[for="${id}"]`);
            if (labelEl) labelText = labelEl.textContent?.trim() || '';
          }
          if (!labelText) labelText = placeholder || inputType;

          elements.push(makeElement('form', box, {
            title: '',
            fields: [{
              id: `field_${uid()}`,
              label: labelText,
              type: inputType === 'email' ? 'email' : inputType === 'tel' ? 'phone' : inputType === 'number' ? 'number' : tag === 'textarea' ? 'textarea' : tag === 'select' ? 'select' : 'text',
              placeholder: placeholder,
              required: node.hasAttribute('required'),
              options: tag === 'select' ? Array.from((node as HTMLSelectElement).options).map(o => o.textContent?.trim() || o.value) : undefined,
            }],
            submitLabel: 'Enviar',
            bgColor: 'transparent',
            textColor: cs.color || '#ffffff',
            accentColor: '#6366f1',
            borderRadius: Math.round(cs.borderRadius * scaleX),
          }, `Campo: ${labelText}`, scaleX, scaleY, originX, originY, cs.opacity));
          return;
        }
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
      if (['span', 'strong', 'em', 'b', 'i', 'u', 'a', 'mark', 'small', 'sub', 'sup', 'br'].includes(tag)) {
        text += child.textContent || '';
      }
    }
  }
  return text;
}
