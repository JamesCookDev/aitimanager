/**
 * HTML → CanvasElement[] converter (v2)
 * Intelligently parses HTML markup and maps elements to native canvas widgets.
 * Supports: Figma exports, marketing pages, hand-coded layouts, complex designs.
 *
 * Key improvements:
 * - Smart card/section detection (repeating patterns)
 * - Better background image extraction
 * - Inline style parsing for elements not in the DOM
 * - Smarter z-index layering based on DOM order
 * - Better text grouping (avoids splitting paragraphs)
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
  if (!raw || raw === 'transparent' || raw === 'initial' || raw === 'inherit' || raw === 'currentcolor') return '';
  return raw.trim();
}

function colorToHex(color: string): string {
  if (!color) return '';
  if (color.startsWith('#')) return color;
  const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (match) {
    const [, r, g, b] = match.map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
  return color;
}

function isTransparent(color: string): boolean {
  if (!color) return true;
  if (color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return true;
  const match = color.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\)/);
  return match ? parseFloat(match[1]) < 0.05 : false;
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
    lineHeight: parseFloat(cs.lineHeight) || 0,
    letterSpacing: cs.letterSpacing,
    textDecoration: cs.textDecoration,
    textTransform: cs.textTransform,
    overflow: cs.overflow,
    position: cs.position,
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

/* ── Semantic detectors ──────────────────────────────────────────── */

/** Detect if a container looks like a "card" */
function isCard(node: HTMLElement, cs: ReturnType<typeof getComputedStyles>): boolean {
  const tag = node.tagName.toLowerCase();
  const classes = node.className?.toLowerCase() || '';
  const hasCardClass = /card|tile|item|product|feature|testimonial|pricing/i.test(classes);
  if (hasCardClass) return true;
  if (tag === 'article' || tag === 'section') return true;
  // Heuristic: has bg/border, multiple children, reasonable size
  const hasBg = cs.bgColor && !isTransparent(cs.bgColor);
  const hasBorder = cs.borderWidth > 0;
  const hasRoundCorners = cs.borderRadius > 4;
  const childCount = node.children.length;
  return (hasBg || hasBorder || hasRoundCorners) && childCount >= 2 && childCount <= 15;
}

/** Detect repeating card patterns (like a grid of cards) */
function isRepeatingContainer(node: HTMLElement): { isGrid: boolean; items: HTMLElement[] } {
  const children = Array.from(node.children).filter(c => c instanceof HTMLElement) as HTMLElement[];
  if (children.length < 2) return { isGrid: false, items: [] };

  // Check if children share the same tag + similar classes
  const firstTag = children[0].tagName;
  const firstClasses = new Set(Array.from(children[0].classList));
  const matchingChildren = children.filter(c => {
    if (c.tagName !== firstTag) return false;
    const overlap = Array.from(c.classList).filter(cl => firstClasses.has(cl));
    return overlap.length >= Math.min(1, firstClasses.size);
  });

  if (matchingChildren.length >= children.length * 0.7 && matchingChildren.length >= 2) {
    return { isGrid: true, items: matchingChildren };
  }
  return { isGrid: false, items: [] };
}

/* ── List extractor (ul, ol, dl) ─────────────────────────────────── */

function extractListItems(node: HTMLElement): { id: string; title: string; subtitle: string; price: string; icon: string }[] {
  const items: { id: string; title: string; subtitle: string; price: string; icon: string }[] = [];
  const tag = node.tagName.toLowerCase();

  if (tag === 'dl') {
    const children = Array.from(node.children);
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.tagName.toLowerCase() === 'dt') {
        const dd = children[i + 1];
        items.push({
          id: uid(),
          title: child.textContent?.trim() || '',
          subtitle: dd?.tagName.toLowerCase() === 'dd' ? dd.textContent?.trim() || '' : '',
          price: '', icon: '📋',
        });
        if (dd?.tagName.toLowerCase() === 'dd') i++;
      }
    }
  } else {
    node.querySelectorAll(':scope > li').forEach(li => {
      items.push({
        id: uid(),
        title: li.textContent?.trim() || '',
        subtitle: '', price: '', icon: '•',
      });
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

function extractFormFields(form: HTMLElement) {
  const fields: { label: string; type: string; placeholder?: string; required?: boolean; options?: string[] }[] = [];

  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    const el = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const tag = el.tagName.toLowerCase();
    const inputType = (el as HTMLInputElement).type || 'text';

    if (inputType === 'hidden' || inputType === 'submit' || inputType === 'button') return;

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
  const tag = node.tagName.toLowerCase();
  if (tag === 'progress') {
    return parseFloat(node.getAttribute('value') || '0') / parseFloat(node.getAttribute('max') || '100') * 100;
  }
  if (node.getAttribute('role') === 'progressbar') {
    const val = node.getAttribute('aria-valuenow');
    const max = node.getAttribute('aria-valuemax') || '100';
    if (val) return (parseFloat(val) / parseFloat(max)) * 100;
  }
  if (node.children.length === 1) {
    const child = node.children[0] as HTMLElement;
    const childCs = getComputedStyles(child);
    const parentRect = node.getBoundingClientRect();
    const childRect = child.getBoundingClientRect();
    if (parentRect.height < 30 && parentRect.width > 60
        && childCs.bgColor && !isTransparent(childCs.bgColor)
        && childRect.width < parentRect.width
        && childRect.height >= parentRect.height * 0.6) {
      return Math.round((childRect.width / parentRect.width) * 100);
    }
  }
  return null;
}

/* ── Smart text analysis ─────────────────────────────────────────── */

function getTextRole(node: HTMLElement, cs: ReturnType<typeof getComputedStyles>): string {
  const tag = node.tagName.toLowerCase();
  const fontSize = cs.fontSize;
  if (['h1'].includes(tag) || fontSize >= 36) return 'Título';
  if (['h2'].includes(tag) || fontSize >= 28) return 'Subtítulo';
  if (['h3', 'h4'].includes(tag) || fontSize >= 22) return 'Heading';
  if (['h5', 'h6'].includes(tag)) return 'Legenda';
  if (tag === 'p' || tag === 'span') return 'Texto';
  if (tag === 'label') return 'Label';
  if (tag === 'figcaption' || tag === 'caption') return 'Legenda';
  return 'Texto';
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
    // Extract and inject styles first
    const fullDoc = new DOMParser().parseFromString(trimmed, 'text/html');
    const linkedStyles: string[] = [];
    fullDoc.querySelectorAll('style').forEach(tag => {
      linkedStyles.push(tag.textContent || '');
    });
    // Also grab inline styles from <link> stylesheet refs (can't load, but note them)

    container.innerHTML = trimmed;

    // Apply styles
    if (linkedStyles.length > 0) {
      const styleEl = document.createElement('style');
      styleEl.textContent = linkedStyles.join('\n');
      container.prepend(styleEl);
    }

    // Force layout
    void container.offsetHeight;
    container.getBoundingClientRect();

    const containerRect = container.getBoundingClientRect();
    const originX = containerRect.left;
    const originY = containerRect.top;
    const refW = containerRect.width || 1080;
    const refH = Math.max(container.scrollHeight, containerRect.height, 1920);

    const scaleX = CANVAS_WIDTH / refW;
    const scaleY = CANVAS_HEIGHT / Math.max(refH, 1920);

    const elements: CanvasElement[] = [];
    zIndex = 1;
    let bgColor = '#0f172a';

    // Detect background
    const rootEl = container.querySelector('body, [class], div, section, main') as HTMLElement || container.firstElementChild as HTMLElement;
    if (rootEl) {
      const rootCs = getComputedStyles(rootEl);
      if (rootCs.bgColor && !isTransparent(rootCs.bgColor)) {
        bgColor = colorToHex(rootCs.bgColor) || rootCs.bgColor;
      }
      // Also check for gradient backgrounds
      if (rootCs.backgroundImage && rootCs.backgroundImage !== 'none' && !rootCs.backgroundImage.includes('url(')) {
        bgColor = rootCs.bgColor || '#0f172a';
      }
    }

    // Set to track processed nodes (avoid duplicates)
    const processedNodes = new WeakSet<HTMLElement>();

    function processElement(node: HTMLElement, depth = 0) {
      if (depth > 25) return;
      if (processedNodes.has(node)) return;

      const tag = node.tagName?.toLowerCase();
      if (!tag) return;

      // Skip invisible/meta elements
      if (['script', 'style', 'meta', 'link', 'head', 'title', 'noscript', 'template'].includes(tag)) return;

      const cs = getComputedStyles(node);
      const rect = node.getBoundingClientRect();
      const box: BoxInfo = { x: rect.left, y: rect.top, w: rect.width, h: rect.height };

      // Skip zero-size or off-screen
      if (box.w < 2 || box.h < 2) return;
      if (cs.display === 'none' || cs.opacity < 0.01) return;

      const mappedW = box.w * scaleX;
      const mappedH = box.h * scaleY;

      // ── IMG → image ──
      if (tag === 'img') {
        const src = node.getAttribute('src') || '';
        if (src && mappedW >= 15 && mappedH >= 15) {
          const alt = node.getAttribute('alt') || '';
          elements.push(makeElement('image', box, {
            src,
            fit: 'cover',
            borderRadius: Math.round(cs.borderRadius * scaleX),
          }, alt ? `Imagem: ${alt.slice(0, 30)}` : 'Imagem', scaleX, scaleY, originX, originY, cs.opacity));
          processedNodes.add(node);
        }
        return;
      }

      // ── PICTURE → image (use first source or img) ──
      if (tag === 'picture') {
        const img = node.querySelector('img');
        if (img) {
          processElement(img, depth);
          processedNodes.add(node);
        }
        return;
      }

      // ── VIDEO → video ──
      if (tag === 'video') {
        const src = node.getAttribute('src') || node.querySelector('source')?.getAttribute('src') || '';
        elements.push(makeElement('video', box, {
          url: src,
          autoplay: node.hasAttribute('autoplay'),
          loop: node.hasAttribute('loop'),
          muted: node.hasAttribute('muted'),
          borderRadius: Math.round(cs.borderRadius * scaleX),
        }, 'Vídeo', scaleX, scaleY, originX, originY, cs.opacity));
        processedNodes.add(node);
        return;
      }

      // ── IFRAME → iframe ──
      if (tag === 'iframe') {
        const src = node.getAttribute('src') || '';
        elements.push(makeElement('iframe', box, {
          url: src,
          borderRadius: Math.round(cs.borderRadius * scaleX),
        }, `Iframe: ${new URL(src, 'http://x').hostname}`, scaleX, scaleY, originX, originY, cs.opacity));
        processedNodes.add(node);
        return;
      }

      // ── SVG (small) → icon ──
      if (tag === 'svg' && mappedW < 120 && mappedH < 120) {
        elements.push(makeElement('icon', box, {
          icon: '⭐',
          size: Math.round(Math.min(mappedW, mappedH)),
          color: cs.color,
        }, 'Ícone SVG', scaleX, scaleY, originX, originY, cs.opacity));
        processedNodes.add(node);
        return;
      }

      // ── PROGRESS / progressbar ──
      const progressValue = isProgressBar(node, cs);
      if (progressValue !== null) {
        elements.push(makeElement('animated-number', box, {
          value: progressValue, suffix: '%', prefix: '', label: '',
          duration: 1.5, color: cs.bgColor || cs.color || '#6366f1',
          fontSize: Math.max(16, Math.round(cs.fontSize * scaleX)),
        }, `Progresso: ${progressValue}%`, scaleX, scaleY, originX, originY, cs.opacity));
        processedNodes.add(node);
        return;
      }

      // ── TABLE → list ──
      if (tag === 'table') {
        const { headers, rows } = extractTableData(node);
        if (headers.length > 0) {
          const items = rows.map(row => ({
            id: uid(), title: row.join(' | '), subtitle: '', price: '', icon: '📊',
          }));
          elements.push(makeElement('list', box, {
            listTitle: headers.join(' | '),
            items: items.length > 0 ? items : [{ id: uid(), title: 'Sem dados', subtitle: '', price: '', icon: '' }],
            bgColor: cs.bgColor || 'rgba(0,0,0,0.4)',
            borderRadius: Math.round(cs.borderRadius * scaleX),
            titleSize: 14, titleColor: cs.color,
          }, `Tabela: ${headers.length} colunas × ${rows.length} linhas`, scaleX, scaleY, originX, originY, cs.opacity));
          processedNodes.add(node);
        }
        return;
      }

      // ── UL / OL / DL → list ──
      if (tag === 'ul' || tag === 'ol' || tag === 'dl') {
        const items = extractListItems(node);
        if (items.length > 0) {
          elements.push(makeElement('list', box, {
            listTitle: '',
            items,
            bgColor: cs.bgColor || 'rgba(0,0,0,0.4)',
            borderRadius: Math.round(cs.borderRadius * scaleX),
            titleSize: 14, titleColor: cs.color,
            showIcon: true, showPrice: false, showDivider: true,
          }, `Lista: ${items.length} itens`, scaleX, scaleY, originX, originY, cs.opacity));
          processedNodes.add(node);
        }
        return;
      }

      // ── FORM → form ──
      if (tag === 'form') {
        const fields = extractFormFields(node);
        if (fields.length > 0) {
          const heading = node.querySelector('h1, h2, h3, h4, legend');
          const title = heading?.textContent?.trim() || 'Formulário';
          const submitBtn = node.querySelector('button[type="submit"], input[type="submit"]');
          const submitLabel = submitBtn?.textContent?.trim() || submitBtn?.getAttribute('value') || 'Enviar';

          elements.push(makeElement('form', box, {
            title, titleColor: cs.color || '#ffffff', titleSize: 22,
            fields: fields.map(f => ({
              id: uid(), label: f.label,
              type: f.type === 'email' ? 'email' : f.type === 'tel' ? 'phone' : f.type === 'textarea' ? 'textarea' : f.type === 'select' ? 'select' : 'text',
              placeholder: f.placeholder || '', required: f.required || false,
              options: f.options?.join(', '),
            })),
            submitLabel,
            bgColor: cs.bgColor || 'rgba(0,0,0,0.5)',
            borderRadius: Math.round(cs.borderRadius * scaleX),
            accentColor: '#6366f1',
          }, `Formulário: ${title}`, scaleX, scaleY, originX, originY, cs.opacity));
          processedNodes.add(node);
        }
        return;
      }

      // ── NAV → list of links ──
      if (tag === 'nav') {
        const links = extractNavLinks(node);
        if (links.length > 0) {
          elements.push(makeElement('list', box, {
            listTitle: 'Navegação',
            items: links.map(l => ({ id: uid(), title: l.label, subtitle: '', price: '', icon: '🔗' })),
            bgColor: cs.bgColor || 'rgba(0,0,0,0.4)',
            borderRadius: Math.round(cs.borderRadius * scaleX),
            titleSize: 14, titleColor: cs.color,
          }, `Navegação: ${links.length} links`, scaleX, scaleY, originX, originY, cs.opacity));
          processedNodes.add(node);
        }
        return;
      }

      // ── Standalone INPUT/SELECT/TEXTAREA ──
      if ((tag === 'input' || tag === 'select' || tag === 'textarea') && !node.closest('form')) {
        const inputType = (node as HTMLInputElement).type || 'text';
        if (inputType !== 'hidden' && inputType !== 'submit' && inputType !== 'button') {
          const placeholder = node.getAttribute('placeholder') || node.getAttribute('name') || '';
          let labelText = '';
          const id = node.id;
          if (id) {
            const labelEl = container.querySelector(`label[for="${id}"]`);
            if (labelEl) labelText = labelEl.textContent?.trim() || '';
          }
          if (!labelText) labelText = placeholder || inputType;

          elements.push(makeElement('form', box, {
            title: '', fields: [{
              id: uid(), label: labelText,
              type: inputType === 'email' ? 'email' : tag === 'textarea' ? 'textarea' : tag === 'select' ? 'select' : 'text',
              placeholder, required: node.hasAttribute('required'),
            }],
            submitLabel: 'Enviar', bgColor: 'transparent', borderRadius: Math.round(cs.borderRadius * scaleX),
          }, `Campo: ${labelText}`, scaleX, scaleY, originX, originY, cs.opacity));
          processedNodes.add(node);
          return;
        }
      }

      // ── Detect repeating grid of cards → catalog ──
      const repeating = isRepeatingContainer(node);
      if (repeating.isGrid && repeating.items.length >= 2) {
        const catalogItems = repeating.items.map(item => {
          const img = item.querySelector('img');
          const heading = item.querySelector('h1, h2, h3, h4, h5, h6, [class*="title"], [class*="name"]');
          const desc = item.querySelector('p, [class*="desc"], [class*="description"]');
          const price = item.querySelector('[class*="price"], [class*="valor"]');
          return {
            id: uid(),
            name: heading?.textContent?.trim() || item.querySelector('strong, b')?.textContent?.trim() || 'Item',
            description: desc?.textContent?.trim() || '',
            price: price?.textContent?.trim() || '',
            image: img?.getAttribute('src') || '',
            category: 'Geral',
            badge: '', badgeColor: '#6366f1',
          };
        });

        elements.push(makeElement('catalog', box, {
          title: '',
          items: catalogItems,
          columns: Math.min(repeating.items.length, 3),
          gap: 12,
          bgColor: cs.bgColor || 'rgba(0,0,0,0.5)',
          cardBgColor: 'rgba(255,255,255,0.08)',
          cardBorderRadius: Math.round(cs.borderRadius * scaleX) || 12,
          accentColor: '#6366f1',
          borderRadius: Math.round(cs.borderRadius * scaleX),
          showPrice: catalogItems.some(i => i.price),
          showCategory: false,
          showSearch: false,
          showCategoryFilter: false,
        }, `Catálogo: ${catalogItems.length} itens`, scaleX, scaleY, originX, originY, cs.opacity));
        processedNodes.add(node);
        repeating.items.forEach(item => processedNodes.add(item));
        return;
      }

      // ── Text-only nodes ──
      const textContent = getDirectText(node).trim();
      const hasBlockChildren = Array.from(node.children).some(c =>
        !['br', 'span', 'strong', 'em', 'b', 'i', 'u', 'a', 'mark', 'small', 'sub', 'sup', 'abbr', 'code', 'time'].includes(c.tagName.toLowerCase())
      );

      if (textContent && !hasBlockChildren) {
        // Check if it's a button-like element
        const isButton = tag === 'button' ||
          (tag === 'a' && (cs.bgColor && !isTransparent(cs.bgColor))) ||
          node.getAttribute('role') === 'button' ||
          (node.classList && /btn|button|cta/i.test(node.className)) ||
          (!isTransparent(cs.bgColor) && mappedH < 120 && textContent.length < 40 && mappedW < 600);

        if (isButton && mappedH < 120 && mappedW < 800) {
          const href = node.getAttribute('href') || '';
          elements.push(makeElement('button', box, {
            label: textContent,
            bgColor: isTransparent(cs.bgColor) ? '#6366f1' : cs.bgColor,
            textColor: cs.color,
            fontSize: Math.round(cs.fontSize * scaleX),
            borderRadius: Math.round(cs.borderRadius * scaleX),
            actionType: href ? 'url' : 'prompt',
            action: href || '',
            navigateTarget: '',
            navigateTransition: 'fade',
          }, `Botão: ${textContent.slice(0, 25)}`, scaleX, scaleY, originX, originY, cs.opacity));
          processedNodes.add(node);
          return;
        }

        // Regular text
        if (mappedW >= 15 && mappedH >= 10) {
          const fullText = node.textContent?.trim() || textContent;
          const role = getTextRole(node, cs);
          elements.push(makeElement('text', box, {
            text: fullText,
            fontSize: Math.max(12, Math.round(cs.fontSize * scaleX)),
            fontWeight: cs.fontWeight === 'bold' || parseInt(cs.fontWeight) >= 700 ? 'bold' : cs.fontWeight === '500' || cs.fontWeight === '600' ? 'semibold' : 'normal',
            color: cs.color || '#ffffff',
            align: cs.textAlign === 'center' ? 'center' : cs.textAlign === 'right' ? 'right' : 'left',
            fontFamily: cs.fontFamily || 'Inter',
          }, `${role}: ${fullText.slice(0, 30)}`, scaleX, scaleY, originX, originY, cs.opacity));
          processedNodes.add(node);
          return;
        }
      }

      // ── Background containers → shape (or image if has bg-image) ──
      const hasBg = cs.bgColor && !isTransparent(cs.bgColor);
      const hasGradient = cs.backgroundImage && cs.backgroundImage !== 'none' && !cs.backgroundImage.includes('url(');
      const hasBgImage = cs.backgroundImage && cs.backgroundImage.includes('url(');
      const hasBorder = cs.borderWidth > 0 && cs.borderColor && !isTransparent(cs.borderColor);
      const isBackgroundContainer = (hasBg || hasGradient || hasBgImage || hasBorder) && mappedW >= 20 && mappedH >= 20;

      // Skip full-page containers
      const isFullPage = box.w >= refW * 0.9 && box.h >= refH * 0.85;

      if (isBackgroundContainer && !isFullPage) {
        if (hasBgImage) {
          const urlMatch = cs.backgroundImage!.match(/url\(['"]?([^'")\s]+)['"]?\)/);
          if (urlMatch) {
            elements.push(makeElement('image', box, {
              src: urlMatch[1],
              fit: 'cover',
              borderRadius: Math.round(cs.borderRadius * scaleX),
            }, 'Imagem (fundo)', scaleX, scaleY, originX, originY, cs.opacity));
          }
        } else {
          const fill = hasGradient ? cs.backgroundImage : (hasBg ? cs.bgColor : cs.borderColor || '#6366f1');
          elements.push(makeElement('shape', box, {
            shapeType: cs.borderRadius > Math.min(box.w, box.h) * 0.4 ? 'circle' : 'rectangle',
            fill: fill || '#6366f1',
            borderRadius: Math.round(cs.borderRadius * scaleX),
            borderColor: hasBorder ? cs.borderColor : 'transparent',
            borderWidth: hasBorder ? Math.round(cs.borderWidth * scaleX) : 0,
          }, hasGradient ? 'Gradiente' : isCard(node, cs) ? 'Card' : 'Retângulo', scaleX, scaleY, originX, originY, cs.opacity));
        }
      }

      // ── HR → separator ──
      if (tag === 'hr') {
        elements.push(makeElement('shape', box, {
          shapeType: 'rectangle',
          fill: cs.borderColor || cs.bgColor || 'rgba(255,255,255,0.15)',
          borderRadius: 0, borderColor: 'transparent', borderWidth: 0,
        }, 'Separador', scaleX, scaleY, originX, originY, cs.opacity));
        processedNodes.add(node);
        return;
      }

      // Recursively process children
      Array.from(node.children).forEach(child => {
        if (child instanceof HTMLElement && !processedNodes.has(child)) {
          processElement(child, depth + 1);
        }
      });
    }

    // Process all root children
    Array.from(container.children).forEach(child => {
      if (child instanceof HTMLElement && child.tagName.toLowerCase() !== 'style') {
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
      if (['span', 'strong', 'em', 'b', 'i', 'u', 'a', 'mark', 'small', 'sub', 'sup', 'br', 'abbr', 'code', 'time'].includes(tag)) {
        text += child.textContent || '';
      }
    }
  }
  return text;
}
