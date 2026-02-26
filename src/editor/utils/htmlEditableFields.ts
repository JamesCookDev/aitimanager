/**
 * HTML Editable Fields Parser
 * Extracts text, image, link, button, and color fields from HTML for inline editing,
 * and detects page-like sections.
 */

export interface EditableField {
  id: string;
  type: 'text' | 'image' | 'link' | 'button' | 'color';
  /** CSS selector path to locate the element */
  selector: string;
  /** Current value (text content, image src, href, or color) */
  value: string;
  /** Label for the properties panel */
  label: string;
  /** HTML tag name */
  tag: string;
  /** Raw outerHTML of the element for manual editing */
  html?: string;
  /** Extra properties (href, bgColor, textColor, etc.) */
  extras?: Record<string, string>;
}

export interface HtmlPage {
  id: string;
  name: string;
  /** CSS selector for the section element */
  selector: string;
}

/**
 * Parse HTML string and extract editable text, image, link, button, and color fields.
 */
export function extractEditableFields(html: string): EditableField[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const fields: EditableField[] = [];
  let textIdx = 0;
  let imgIdx = 0;
  let btnIdx = 0;
  let linkIdx = 0;
  let colorIdx = 0;

  // ── Buttons ──
  const buttons = doc.body.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"], .btn, [class*="button"], [class*="btn"]');
  const buttonSet = new Set<Element>();
  buttons.forEach((el) => {
    if (buttonSet.has(el)) return;
    buttonSet.add(el);
    btnIdx++;
    const htmlEl = el as HTMLElement;
    const text = htmlEl.textContent?.trim() || '';
    const style = htmlEl.getAttribute('style') || '';
    const bgColor = htmlEl.style.backgroundColor || '';
    const textColor = htmlEl.style.color || '';
    const href = htmlEl.getAttribute('href') || (htmlEl.closest('a')?.getAttribute('href')) || '';
    
    fields.push({
      id: `btn_${btnIdx}`,
      type: 'button',
      selector: buildSelector(htmlEl, doc.body),
      value: text,
      label: `Botão "${text.slice(0, 25)}${text.length > 25 ? '…' : ''}"`,
      tag: htmlEl.tagName.toLowerCase(),
      html: htmlEl.outerHTML,
      extras: {
        bgColor,
        textColor,
        href,
        classes: htmlEl.className,
      },
    });
  });

  // ── Links (that aren't buttons) ──
  const links = doc.body.querySelectorAll('a[href]');
  links.forEach((el) => {
    if (buttonSet.has(el)) return;
    // Skip links that are wrappers for buttons
    if (el.querySelector('button, [role="button"]')) return;
    linkIdx++;
    const htmlEl = el as HTMLAnchorElement;
    const text = htmlEl.textContent?.trim() || '';
    const href = htmlEl.getAttribute('href') || '';

    fields.push({
      id: `link_${linkIdx}`,
      type: 'link',
      selector: buildSelector(htmlEl, doc.body),
      value: href,
      label: text ? `Link "${text.slice(0, 25)}${text.length > 25 ? '…' : ''}"` : `Link ${linkIdx}`,
      tag: 'a',
      html: htmlEl.outerHTML,
      extras: {
        text,
        href,
      },
    });
  });

  // ── Text-containing elements (skip already-captured buttons/links) ──
  const processedEls = new Set<Element>([...buttonSet]);
  links.forEach(el => processedEls.add(el));

  const textTags = doc.body.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,li,td,th,label,div');
  textTags.forEach((el) => {
    if (processedEls.has(el)) return;
    // Only direct text (skip if children also have text)
    const directText = Array.from(el.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent?.trim())
      .filter(Boolean)
      .join(' ');
    if (directText && directText.length > 0) {
      textIdx++;
      const htmlEl = el as HTMLElement;
      fields.push({
        id: `text_${textIdx}`,
        type: 'text',
        selector: buildSelector(htmlEl, doc.body),
        value: directText,
        label: `${el.tagName.toLowerCase()} "${directText.slice(0, 30)}${directText.length > 30 ? '…' : ''}"`,
        tag: el.tagName.toLowerCase(),
        html: htmlEl.outerHTML,
      });
    }
  });

  // ── Images ──
  const images = doc.body.querySelectorAll('img');
  images.forEach((img) => {
    imgIdx++;
    const src = img.getAttribute('src') || '';
    const alt = img.getAttribute('alt') || '';
    fields.push({
      id: `img_${imgIdx}`,
      type: 'image',
      selector: buildSelector(img as HTMLElement, doc.body),
      value: src,
      label: alt || `Imagem ${imgIdx}`,
      tag: 'img',
      html: (img as HTMLElement).outerHTML,
    });
  });

  // ── Background images in style attributes ──
  const allEls = doc.body.querySelectorAll('*');
  allEls.forEach((el) => {
    const style = (el as HTMLElement).style;
    const bgImage = style?.backgroundImage || '';
    const match = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
    if (match && match[1]) {
      imgIdx++;
      fields.push({
        id: `bgimg_${imgIdx}`,
        type: 'image',
        selector: buildSelector(el as HTMLElement, doc.body),
        value: match[1],
        label: `Fundo ${imgIdx}`,
        tag: el.tagName.toLowerCase(),
        html: (el as HTMLElement).outerHTML.slice(0, 500),
      });
    }
  });

  // ── Elements with significant background colors ──
  allEls.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const bg = htmlEl.style.backgroundColor;
    if (bg && bg !== 'transparent' && bg !== '') {
      colorIdx++;
      fields.push({
        id: `color_${colorIdx}`,
        type: 'color',
        selector: buildSelector(htmlEl, doc.body),
        value: bg,
        label: `Cor fundo (${htmlEl.tagName.toLowerCase()})`,
        tag: htmlEl.tagName.toLowerCase(),
        html: htmlEl.outerHTML.slice(0, 300),
        extras: {
          property: 'backgroundColor',
        },
      });
    }
  });

  return fields;
}

/**
 * Detect page-like sections in HTML.
 */
export function detectHtmlPages(html: string): HtmlPage[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const pages: HtmlPage[] = [];

  // First try: data-page attributes
  const dataPages = doc.body.querySelectorAll('[data-page]');
  if (dataPages.length > 1) {
    dataPages.forEach((el, i) => {
      const name = el.getAttribute('data-page') || el.getAttribute('data-name') || `Página ${i + 1}`;
      pages.push({
        id: `page_${i}`,
        name,
        selector: `[data-page="${el.getAttribute('data-page')}"]`,
      });
    });
    return pages;
  }

  // Second try: sections/pages by class
  const sectionEls = doc.body.querySelectorAll('.page, .section, .screen, [class*="page-"], [class*="screen-"]');
  if (sectionEls.length > 1) {
    sectionEls.forEach((el, i) => {
      const name = el.getAttribute('data-name') || el.getAttribute('id') || el.className.split(' ')[0] || `Página ${i + 1}`;
      pages.push({
        id: `page_${i}`,
        name: name.replace(/[-_]/g, ' ').replace(/^\w/, c => c.toUpperCase()),
        selector: buildSelector(el as HTMLElement, doc.body),
      });
    });
    return pages;
  }

  // Third: top-level children of body if multiple "big" divs
  const topChildren = Array.from(doc.body.children).filter(
    el => el.tagName !== 'STYLE' && el.tagName !== 'SCRIPT' && el.tagName !== 'LINK'
  );
  if (topChildren.length > 1) {
    topChildren.forEach((el, i) => {
      const heading = el.querySelector('h1,h2,h3');
      const name = el.getAttribute('data-name') || el.getAttribute('id') || heading?.textContent?.trim().slice(0, 30) || `Página ${i + 1}`;
      pages.push({
        id: `page_${i}`,
        name,
        selector: buildSelector(el as HTMLElement, doc.body),
      });
    });
  }

  return pages;
}

/**
 * Apply editable field overrides to HTML string.
 * Returns the modified HTML.
 */
export function applyFieldOverrides(
  html: string,
  overrides: Record<string, string>
): string {
  if (!overrides || Object.keys(overrides).length === 0) return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Re-extract fields to match by id
  const fields = extractEditableFields(html);

  for (const field of fields) {
    const newValue = overrides[field.id];
    if (newValue === undefined || newValue === field.value) continue;

    try {
      const el = doc.body.querySelector(field.selector) as HTMLElement;
      if (!el) continue;

      if (field.type === 'text') {
        // Replace direct text nodes
        Array.from(el.childNodes).forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === field.value) {
            node.textContent = newValue;
          }
        });
      } else if (field.type === 'image') {
        if (field.tag === 'img') {
          (el as HTMLImageElement).setAttribute('src', newValue);
        } else {
          // Background image
          const currentBg = el.style.backgroundImage;
          el.style.backgroundImage = currentBg.replace(field.value, newValue);
        }
      } else if (field.type === 'link') {
        (el as HTMLAnchorElement).setAttribute('href', newValue);
      } else if (field.type === 'button') {
        // Button text override
        const textNodes = Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
        if (textNodes.length > 0) {
          textNodes[0].textContent = newValue;
        } else {
          el.textContent = newValue;
        }
      } else if (field.type === 'color') {
        const prop = field.extras?.property || 'backgroundColor';
        (el.style as any)[prop] = newValue;
      }

      // Apply extras overrides (prefixed with field id)
      if (field.extras) {
        const bgOverride = overrides[`${field.id}__bgColor`];
        if (bgOverride !== undefined) el.style.backgroundColor = bgOverride;
        
        const textColorOverride = overrides[`${field.id}__textColor`];
        if (textColorOverride !== undefined) el.style.color = textColorOverride;

        const hrefOverride = overrides[`${field.id}__href`];
        if (hrefOverride !== undefined && el.tagName === 'A') {
          (el as HTMLAnchorElement).setAttribute('href', hrefOverride);
        }
      }

      // Apply raw HTML override
      const htmlOverride = overrides[`${field.id}__html`];
      if (htmlOverride !== undefined && htmlOverride !== field.html) {
        const tempDiv = doc.createElement('div');
        tempDiv.innerHTML = htmlOverride;
        const newEl = tempDiv.firstElementChild;
        if (newEl) {
          el.replaceWith(newEl);
        }
      }
    } catch (e) {
      // Skip invalid selectors silently
    }
  }

  // Reconstruct the full HTML preserving <head>
  const headContent = doc.head.innerHTML;
  const bodyContent = doc.body.innerHTML;
  const bodyAttrs = Array.from(doc.body.attributes).map(a => `${a.name}="${a.value}"`).join(' ');

  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const originalHead = headMatch ? headMatch[0] : `<head>${headContent}</head>`;

  return `<!DOCTYPE html><html>${originalHead}<body ${bodyAttrs}>${bodyContent}</body></html>`;
}

/**
 * Extract the HTML for a specific page/section, hiding all others.
 */
export function getPageHtml(html: string, pageSelector: string | null): string {
  if (!pageSelector) return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const style = doc.createElement('style');
  const pages = detectHtmlPages(html);
  const hideSelectors = pages
    .filter(p => p.selector !== pageSelector)
    .map(p => `${p.selector} { display: none !important; }`)
    .join('\n');
  style.textContent = hideSelectors;
  doc.head.appendChild(style);

  const headContent = doc.head.innerHTML;
  const bodyContent = doc.body.innerHTML;
  const bodyAttrs = Array.from(doc.body.attributes).map(a => `${a.name}="${a.value}"`).join(' ');

  return `<!DOCTYPE html><html><head>${headContent}</head><body ${bodyAttrs}>${bodyContent}</body></html>`;
}

/* ── Helper: build a unique CSS selector for an element ── */
function buildSelector(el: HTMLElement, root: HTMLElement): string {
  const parts: string[] = [];
  let current: HTMLElement | null = el;

  while (current && current !== root) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector = `#${CSS.escape(current.id)}`;
      parts.unshift(selector);
      break;
    }

    // Use nth-child for uniqueness
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(s => s.tagName === current!.tagName);
      if (siblings.length > 1) {
        const idx = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${idx})`;
      }
    }

    parts.unshift(selector);
    current = current.parentElement;
  }

  return parts.join(' > ');
}
