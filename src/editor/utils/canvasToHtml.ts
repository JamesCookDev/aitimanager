/**
 * Converts a CanvasState into a standalone static HTML document (1080×1920).
 * This HTML is served directly on the totem hardware.
 */

import type { CanvasState, CanvasElement, CanvasView } from '../types/canvas';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../types/canvas';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function isHtmlIframeMode(props: Record<string, any> | undefined): boolean {
  if (!props) return false;
  return props._iframeMode === 'html' || (!props._iframeMode && Boolean(props.htmlContent));
}

function renderElementHtml(el: CanvasElement, views: CanvasView[]): string {
  const p = el.props || {};

  switch (el.type) {
    case 'text':
      return `<div style="width:100%;height:100%;display:flex;align-items:center;padding:8px;color:${p.color || '#fff'};font-size:${p.fontSize || 24}px;font-weight:${p.fontWeight || 'normal'};text-align:${p.align || 'left'};font-family:${p.fontFamily || 'Inter'},sans-serif;line-height:1.25;letter-spacing:${(p.fontSize || 24) >= 32 ? '-0.02em' : '0'};justify-content:${p.align === 'center' ? 'center' : p.align === 'right' ? 'flex-end' : 'flex-start'}" data-editable="true">${escapeHtml(p.text || 'Texto')}</div>`;

    case 'image':
      if (!p.src) return `<div style="width:100%;height:100%;background:#1e293b;border-radius:${p.borderRadius || 0}px"></div>`;
      return `<img src="${escapeHtml(p.src)}" alt="" style="width:100%;height:100%;object-fit:${p.fit || 'cover'};border-radius:${p.borderRadius || 0}px" />`;

    case 'button': {
      const bg = p.bgColor || '#6366f1';
      const tc = p.textColor || '#fff';
      const br = p.borderRadius ?? 16;
      const fs = p.fontSize || 20;
      // Navigation support
      const nav = p.navigateTo ? `data-navigate="${escapeHtml(p.navigateTo)}"` : '';
      const url = p.actionType === 'url' && p.url ? `onclick="window.open('${escapeHtml(p.url)}','_blank')"` : '';
      const prompt = p.actionType === 'prompt' && p.prompt ? `data-prompt="${escapeHtml(p.prompt)}"` : '';
      return `<button ${nav} ${url} ${prompt} style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${bg};color:${tc};font-size:${fs}px;font-weight:800;border:none;border-radius:${br}px;cursor:pointer;font-family:inherit" data-editable="true">${escapeHtml(p.label || 'Botão')}</button>`;
    }

    case 'shape': {
      const fill = p.fill || '#6366f1';
      const br = p.shapeType === 'circle' ? '50%' : `${p.borderRadius || 0}px`;
      return `<div style="width:100%;height:100%;background:${fill.includes('gradient') ? fill : `linear-gradient(135deg,${fill},${fill}cc)`};border-radius:${br};${p.borderWidth ? `border:${p.borderWidth}px solid ${p.borderColor || 'transparent'}` : ''}"></div>`;
    }

    case 'icon':
      return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:${p.color || '#fff'};font-size:${p.size || 32}px">${p.emoji || '⭐'}</div>`;

    case 'video':
      if (p.src) return `<video src="${escapeHtml(p.src)}" ${p.autoplay ? 'autoplay' : ''} ${p.loop ? 'loop' : ''} ${p.muted ? 'muted' : ''} style="width:100%;height:100%;object-fit:cover;border-radius:${p.borderRadius || 0}px"></video>`;
      return `<div style="width:100%;height:100%;background:#1e293b;display:flex;align-items:center;justify-content:center;color:#64748b">Vídeo</div>`;

    case 'qrcode':
      return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${p.bgColor || '#fff'};border-radius:${p.borderRadius || 8}px;padding:16px"><img src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(p.data || 'https://example.com')}&color=${(p.fgColor || '#000000').replace('#', '')}" style="width:100%;height:100%;object-fit:contain" alt="QR Code" /></div>`;

    case 'clock':
      return `<div id="clock-${el.id}" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:${p.color || '#fff'};font-size:${p.fontSize || 48}px;font-weight:${p.fontWeight || '700'};font-family:${p.fontFamily || 'Inter'},monospace"><script>setInterval(()=>{const d=new Date();document.getElementById('clock-${el.id}').textContent=d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'${p.showSeconds ? ",second:'2-digit'" : ''}})},1000)</script></div>`;

    case 'iframe':
      if (isHtmlIframeMode(p) && p.htmlContent) {
        // Embed raw HTML directly (most common use case for HTML Puro templates)
        return p.htmlContent;
      }
      if (p.src) return `<iframe src="${escapeHtml(p.src)}" style="width:100%;height:100%;border:none;border-radius:${p.borderRadius || 0}px" allowfullscreen></iframe>`;
      return `<div style="width:100%;height:100%;background:#1e293b"></div>`;

    case 'carousel': {
      const images = p.images || [];
      if (images.length === 0) return `<div style="width:100%;height:100%;background:#1e293b"></div>`;
      const carouselId = `carousel-${el.id}`;
      return `<div id="${carouselId}" style="width:100%;height:100%;position:relative;overflow:hidden;border-radius:${p.borderRadius || 0}px">
        ${images.map((img: any, i: number) => `<img src="${escapeHtml(typeof img === 'string' ? img : img.src || '')}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:${i === 0 ? 1 : 0};transition:opacity 0.6s" class="carousel-slide" />`).join('')}
        <script>(function(){const s=document.querySelectorAll('#${carouselId} .carousel-slide');let c=0;setInterval(()=>{s[c].style.opacity='0';c=(c+1)%s.length;s[c].style.opacity='1'},${p.interval || 5000})})()</script>
      </div>`;
    }

    case 'social': {
      const links = p.links || [];
      return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap">${
        links.map((l: any) => `<a href="${escapeHtml(l.url || '#')}" target="_blank" style="color:${p.color || '#fff'};font-size:${p.iconSize || 28}px;text-decoration:none">${l.icon || '🔗'}</a>`).join('')
      }</div>`;
    }

    case 'avatar':
      return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1e293b,#0f172a);border-radius:${p.borderRadius || 0}px"><div style="color:#64748b;font-size:14px">Avatar 3D</div></div>`;

    case 'chat':
      return `<div data-component="chat" style="width:100%;height:100%;display:flex;flex-direction:column;background:${p.bgColor || 'rgba(0,0,0,0.3)'};border-radius:${p.borderRadius || 16}px;overflow:hidden">
        <div style="padding:16px;font-size:14px;color:${p.textColor || '#fff'};flex:1;display:flex;align-items:flex-end;justify-content:center">Chat IA</div>
        <div style="padding:12px;border-top:1px solid rgba(255,255,255,0.1)"><input type="text" placeholder="${escapeHtml(p.placeholder || 'Digite sua mensagem...')}" style="width:100%;padding:12px 16px;border-radius:24px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.05);color:#fff;font-size:14px;outline:none" /></div>
      </div>`;

    case 'form': {
      const fields = p.fields || [{ label: 'Nome', type: 'text' }];
      return `<form data-component="form" style="width:100%;height:100%;display:flex;flex-direction:column;gap:12px;padding:16px;color:#fff">
        ${p.title ? `<h3 style="font-size:20px;font-weight:700;margin:0" data-editable="true">${escapeHtml(p.title)}</h3>` : ''}
        ${fields.map((f: any) => `<div><label style="font-size:12px;color:#94a3b8;margin-bottom:4px;display:block">${escapeHtml(f.label)}</label><input type="${f.type || 'text'}" placeholder="${escapeHtml(f.placeholder || f.label)}" style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.05);color:#fff;font-size:14px;outline:none" /></div>`).join('')}
        <button type="submit" style="padding:12px;border-radius:8px;background:${p.buttonColor || '#6366f1'};color:#fff;font-weight:700;border:none;cursor:pointer;font-size:16px">${escapeHtml(p.buttonText || 'Enviar')}</button>
      </form>`;
    }

    case 'list': {
      const items = p.items || [];
      return `<div style="width:100%;height:100%;display:flex;flex-direction:column;gap:8px;padding:8px;overflow:auto">
        ${items.map((item: any) => `<div style="padding:12px;border-radius:8px;background:rgba(255,255,255,0.05);color:#fff;font-size:14px" data-editable="true">${escapeHtml(typeof item === 'string' ? item : item.text || item.label || '')}</div>`).join('')}
      </div>`;
    }

    case 'gallery': {
      const imgs = p.images || [];
      const cols = p.columns || 3;
      return `<div style="width:100%;height:100%;display:grid;grid-template-columns:repeat(${cols},1fr);gap:${p.gap || 8}px;padding:8px;overflow:auto">
        ${imgs.map((img: any) => `<img src="${escapeHtml(typeof img === 'string' ? img : img.src || '')}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:${p.borderRadius || 8}px" />`).join('')}
      </div>`;
    }

    case 'animated-number':
      return `<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:${p.color || '#fff'}"><span style="font-size:${p.fontSize || 48}px;font-weight:900">${p.prefix || ''}${p.value || '0'}${p.suffix || ''}</span>${p.label ? `<span style="font-size:14px;color:#94a3b8;margin-top:4px">${escapeHtml(p.label)}</span>` : ''}</div>`;

    case 'bigcta':
      return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${p.bgColor || 'linear-gradient(135deg,#6366f1,#8b5cf6)'};border-radius:${p.borderRadius || 24}px;cursor:pointer" ${p.navigateTo ? `data-navigate="${escapeHtml(p.navigateTo)}"` : ''}>
        <span style="font-size:${p.fontSize || 32}px;font-weight:900;color:${p.textColor || '#fff'}" data-editable="true">${escapeHtml(p.label || 'Toque aqui')}</span>
      </div>`;

    case 'qrpix':
      return `<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:${p.bgColor || '#fff'};border-radius:${p.borderRadius || 16}px;padding:16px;gap:8px">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(p.pixCode || 'PIX')}" style="max-width:80%;max-height:70%;object-fit:contain" />
        ${p.label ? `<span style="font-size:14px;color:#333;font-weight:600">${escapeHtml(p.label)}</span>` : ''}
      </div>`;

    case 'ticket':
      return `<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:${p.bgColor || '#1e293b'};border-radius:${p.borderRadius || 16}px;padding:24px;color:#fff;gap:12px">
        <span style="font-size:64px;font-weight:900">${escapeHtml(p.number || '001')}</span>
        ${p.label ? `<span style="font-size:18px;color:#94a3b8">${escapeHtml(p.label)}</span>` : ''}
      </div>`;

    case 'numpad':
      return `<div style="width:100%;height:100%;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:16px">
        ${[1,2,3,4,5,6,7,8,9,'*',0,'#'].map(n => `<button style="padding:16px;font-size:24px;font-weight:700;border:1px solid rgba(255,255,255,0.15);border-radius:12px;background:rgba(255,255,255,0.05);color:#fff;cursor:pointer">${n}</button>`).join('')}
      </div>`;

    case 'feed':
      return `<div style="width:100%;height:100%;display:flex;flex-direction:column;gap:12px;padding:12px;overflow:auto">
        <div style="padding:16px;border-radius:12px;background:rgba(255,255,255,0.05);color:#fff"><strong>Feed</strong><p style="margin:8px 0 0;color:#94a3b8;font-size:13px">Conteúdo dinâmico</p></div>
      </div>`;

    case 'weather':
      return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:${p.color || '#fff'};font-size:48px">☀️ ${p.temp || '28'}°</div>`;

    case 'countdown':
      return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:${p.color || '#fff'};font-size:${p.fontSize || 36}px;font-weight:700">00:00:00</div>`;

    case 'map':
      return `<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15000!2d${p.lng || -48.5}!3d${p.lat || -1.4}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1" style="width:100%;height:100%;border:none;border-radius:${p.borderRadius || 0}px" allowfullscreen loading="lazy"></iframe>`;

    case 'store':
    case 'catalog':
      return `<div style="width:100%;height:100%;display:flex;flex-direction:column;gap:12px;padding:12px;overflow:auto;color:#fff">
        <h3 style="font-size:18px;font-weight:700;margin:0">${escapeHtml(p.title || (el.type === 'store' ? 'Loja' : 'Catálogo'))}</h3>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">
          ${(p.items || []).slice(0, 4).map((item: any) => `<div style="padding:12px;border-radius:8px;background:rgba(255,255,255,0.05)"><div style="font-size:13px;font-weight:600">${escapeHtml(item.name || item.label || '')}</div>${item.price ? `<div style="font-size:12px;color:#94a3b8">${escapeHtml(item.price)}</div>` : ''}</div>`).join('')}
        </div>
      </div>`;

    default:
      return `<div style="width:100%;height:100%;background:rgba(255,255,255,0.03);border-radius:8px"></div>`;
  }
}

/**
 * Generate a complete standalone HTML document from a CanvasState.
 */
export function canvasToHtml(state: CanvasState): string {
  const idleScreenEnabled = state.idleScreenEnabled ?? false;
  const idleScreenTimeout = state.idleScreenTimeout ?? 60;
  const views = state.views?.length ? state.views : [{ id: '__default__', name: 'Home', isDefault: true }];
  const defaultView = views.find(v => v.isDefault) || views[0];

  // Group elements by view
  const elementsByView = new Map<string, CanvasElement[]>();
  for (const v of views) elementsByView.set(v.id, []);
  for (const el of state.elements) {
    const vid = el.viewId || '__default__';
    if (!elementsByView.has(vid)) elementsByView.set(vid, []);
    elementsByView.get(vid)!.push(el);
  }

  // Collect all Google Fonts used
  const fonts = new Set<string>();
  for (const el of state.elements) {
    if (el.props?.fontFamily && el.props.fontFamily !== 'Inter') {
      fonts.add(el.props.fontFamily);
    }
  }
  fonts.add('Inter');
  const fontImport = `@import url('https://fonts.googleapis.com/css2?${Array.from(fonts).map(f => `family=${f.replace(/\s+/g, '+')}:wght@400;500;600;700;800;900`).join('&')}&display=swap');`;

  // Check if any element is an iframe with HTML content covering the full canvas.
  // In that case, just use the raw HTML directly (HTML Puro mode)
  for (const v of views) {
    const viewEls = elementsByView.get(v.id) || [];
    if (viewEls.length === 1) {
      const el = viewEls[0];
      if (el.type === 'iframe' && isHtmlIframeMode(el.props) && el.props?.htmlContent &&
          el.width >= 1080 && el.height >= 1920 && el.x === 0 && el.y === 0) {
        // Single full-canvas HTML element on one page — if it's the only view, return raw HTML
        if (views.length === 1) {
          return el.props.htmlContent;
        }
      }
    }
  }

  const pageBgColors = state.pageBgColors || {};

  const pagesHtml = views.map(v => {
    const viewElements = (elementsByView.get(v.id) || [])
      .filter(e => e.visible !== false)
      .sort((a, b) => a.zIndex - b.zIndex);

    const bgColor = pageBgColors[v.id] || state.bgColor || '#0f172a';
    const isDefault = v.id === defaultView.id;

    const elementsHtml = viewElements.map(el => {
      // For full-canvas iframe HTML, embed directly without wrapper
      if (el.type === 'iframe' && isHtmlIframeMode(el.props) && el.props?.htmlContent &&
          el.width >= 1080 && el.height >= 1920) {
        return `<div style="position:absolute;left:0;top:0;width:1080px;height:1920px;z-index:${el.zIndex};opacity:${el.opacity ?? 1};${el.rotation ? `transform:rotate(${el.rotation}deg)` : ''}">${el.props.htmlContent}</div>`;
      }

      return `<div style="position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;z-index:${el.zIndex};opacity:${el.opacity ?? 1};${el.rotation ? `transform:rotate(${el.rotation}deg)` : ''};overflow:hidden" data-element-id="${el.id}" data-element-type="${el.type}">${renderElementHtml(el, views)}</div>`;
    }).join('\n      ');

    return `    <div data-page="${v.id}" data-page-name="${escapeHtml(v.name)}" style="position:absolute;top:0;left:0;width:${CANVAS_WIDTH}px;height:${CANVAS_HEIGHT}px;background:${bgColor};display:${isDefault ? 'block' : 'none'};overflow:hidden">
      ${elementsHtml}
    </div>`;
  }).join('\n');

  const hasMultiplePages = views.length > 1;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080, height=1920, initial-scale=1">
  <title>Totem Display</title>
  <style>
    ${fontImport}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${CANVAS_WIDTH}px;
      height: ${CANVAS_HEIGHT}px;
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
      background: ${state.bgColor || '#0f172a'};
      position: relative;
    }
    button { cursor: pointer; }
    input, textarea { box-sizing: border-box; }
    [data-page] { transition: opacity 0.4s ease, transform 0.4s ease; }
  </style>
</head>
<body>
${pagesHtml}
${hasMultiplePages ? `
  <script>
    // Page navigation system
    (function() {
      const pages = document.querySelectorAll('[data-page]');
      let currentPage = '${escapeHtml(defaultView.id)}';
      const idleTimeout = ${state.viewIdleTimeout || 0};
      let idleTimer = null;

      function navigateTo(pageId) {
        pages.forEach(p => {
          if (p.dataset.page === pageId || p.dataset.pageName === pageId) {
            p.style.display = 'block';
            currentPage = p.dataset.page;
          } else {
            p.style.display = 'none';
          }
        });
        resetIdleTimer();
      }

      function resetIdleTimer() {
        if (idleTimer) clearTimeout(idleTimer);
        if (idleTimeout > 0) {
          idleTimer = setTimeout(() => navigateTo('${escapeHtml(defaultView.id)}'), idleTimeout * 1000);
        }
      }

      // Navigation via data-navigate attribute
      document.addEventListener('click', function(e) {
        const btn = e.target.closest('[data-navigate]');
        if (btn) {
          e.preventDefault();
          navigateTo(btn.dataset.navigate);
        }
        resetIdleTimer();
      });

      // Touch interaction tracking
      document.addEventListener('touchstart', resetIdleTimer);

      // Prompt handler (for AI chat buttons)
      document.addEventListener('click', function(e) {
        const btn = e.target.closest('[data-prompt]');
        if (btn && window.__totemSendMessage) {
          window.__totemSendMessage(btn.dataset.prompt);
        }
      });

      resetIdleTimer();
    })();
  </script>
` : ''}
${idleScreenEnabled ? `
<!-- Netflix-style Idle Screen -->
<style>
  #idle-screen {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    z-index: 99999; opacity: 0; pointer-events: none;
    transition: opacity 0.8s ease; background: #141414;
    overflow: hidden; font-family: 'Inter', 'Helvetica Neue', sans-serif;
  }
  #idle-screen.active { opacity: 1; pointer-events: auto; }

  /* ── Billboard hero ── */
  #idle-screen .nf-billboard {
    position: absolute; top: 0; left: 0; width: 100%; height: 75%;
    overflow: hidden;
  }
  #idle-screen .nf-hero-img {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    object-fit: cover; opacity: 0;
    transition: opacity 1.2s ease, transform 8s ease;
    transform: scale(1);
  }
  #idle-screen .nf-hero-img.active {
    opacity: 1; transform: scale(1.05);
  }
  #idle-screen .nf-billboard-gradient {
    position: absolute; bottom: 0; left: 0; width: 100%; height: 65%;
    background: linear-gradient(0deg, #141414 0%, rgba(20,20,20,0.9) 30%, rgba(20,20,20,0.4) 60%, transparent 100%);
    pointer-events: none;
  }
  #idle-screen .nf-billboard-side {
    position: absolute; top: 0; left: 0; width: 40%; height: 100%;
    background: linear-gradient(90deg, rgba(20,20,20,0.6) 0%, transparent 100%);
    pointer-events: none;
  }

  /* ── Info overlay on billboard ── */
  #idle-screen .nf-info {
    position: absolute; bottom: 28%; left: 50px; right: 50px;
    display: flex; flex-direction: column; gap: 16px;
    opacity: 0; transform: translateY(30px);
    transition: opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s;
  }
  #idle-screen .nf-info.visible { opacity: 1; transform: translateY(0); }
  #idle-screen .nf-info-tag {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 14px; color: rgba(255,255,255,0.5);
    text-transform: uppercase; letter-spacing: 3px; font-weight: 500;
  }
  #idle-screen .nf-info-tag::before {
    content: ''; display: block; width: 4px; height: 20px;
    background: #e50914; border-radius: 2px;
  }
  #idle-screen .nf-info-title {
    font-size: 48px; font-weight: 800; color: #fff;
    line-height: 1.1; letter-spacing: -1px;
    text-shadow: 0 4px 30px rgba(0,0,0,0.6);
    max-width: 80%;
  }
  #idle-screen .nf-info-desc {
    font-size: 18px; color: rgba(255,255,255,0.75);
    line-height: 1.5; max-width: 70%;
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ── Clock top-right ── */
  #idle-screen .nf-clock {
    position: absolute; top: 40px; right: 50px;
    text-align: right; z-index: 5;
  }
  #idle-screen .nf-clock-time {
    font-size: 56px; font-weight: 200; color: #fff;
    letter-spacing: -2px; line-height: 1;
  }
  #idle-screen .nf-clock-date {
    font-size: 15px; color: rgba(255,255,255,0.45);
    margin-top: 6px; line-height: 1.4;
  }

  /* ── Carousel row at bottom ── */
  #idle-screen .nf-row {
    position: absolute; bottom: 0; left: 0; width: 100%;
    padding: 0 50px 50px;
  }
  #idle-screen .nf-row-title {
    font-size: 16px; font-weight: 600; color: rgba(255,255,255,0.6);
    margin-bottom: 14px; text-transform: uppercase; letter-spacing: 2px;
  }
  #idle-screen .nf-carousel {
    display: flex; gap: 14px; overflow: hidden;
    transition: transform 0.6s cubic-bezier(0.4,0,0.2,1);
  }
  #idle-screen .nf-card {
    flex-shrink: 0; width: 200px; height: 280px;
    border-radius: 8px; overflow: hidden; position: relative;
    cursor: pointer; transition: transform 0.35s ease, box-shadow 0.35s ease;
    border: 2px solid transparent;
  }
  #idle-screen .nf-card.active-card {
    border-color: #fff; transform: scale(1.08);
    box-shadow: 0 12px 40px rgba(0,0,0,0.6);
  }
  #idle-screen .nf-card img {
    width: 100%; height: 100%; object-fit: cover;
  }
  #idle-screen .nf-card-overlay {
    position: absolute; bottom: 0; left: 0; width: 100%;
    padding: 12px 10px 10px;
    background: linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%);
  }
  #idle-screen .nf-card-label {
    font-size: 12px; font-weight: 600; color: #fff;
    line-height: 1.3; display: -webkit-box;
    -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  #idle-screen .nf-progress-bar {
    position: absolute; bottom: 0; left: 0; height: 3px;
    background: #e50914; border-radius: 0 0 8px 8px;
    transition: width linear;
  }

  /* ── Hint ── */
  #idle-screen .nf-hint {
    position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
    font-size: 12px; color: rgba(255,255,255,0.25);
    letter-spacing: 3px; text-transform: uppercase;
    animation: nf-pulse 2.5s ease infinite;
  }
  @keyframes nf-pulse { 0%,100% { opacity: 0.2; } 50% { opacity: 0.5; } }
</style>
<div id="idle-screen">
  <div class="nf-billboard">
    <div class="nf-billboard-side"></div>
    <div class="nf-billboard-gradient"></div>
  </div>
  <div class="nf-info" id="nf-info">
    <div class="nf-info-tag">Em destaque</div>
    <div class="nf-info-title" id="nf-info-title"></div>
    <div class="nf-info-desc" id="nf-info-desc"></div>
  </div>
  <div class="nf-clock">
    <div class="nf-clock-time" id="nf-clock-time"></div>
    <div class="nf-clock-date" id="nf-clock-date"></div>
  </div>
  <div class="nf-row">
    <div class="nf-row-title">Destaques</div>
    <div class="nf-carousel" id="nf-carousel"></div>
  </div>
  <div class="nf-hint">Toque para continuar</div>
</div>
<script>
(function() {
  var IDLE_TIMEOUT = ${idleScreenTimeout} * 1000;
  var SLIDE_INTERVAL = 7000;
  var screen = document.getElementById('idle-screen');
  var timer = null;
  var slideTimer = null;
  var progressTimer = null;
  var isActive = false;

  function extractContent() {
    var items = []; // {image, title, desc}
    var seenImages = {};
    var seenTitles = {};

    // Strategy 1: Pair images with nearby text (per page/section)
    var containers = document.querySelectorAll('[data-page], [data-view], .page, section, article, .card, [class*="card"], [class*="item"], [class*="slide"]');
    if (containers.length === 0) containers = [document.body];

    containers.forEach(function(container) {
      if (container.closest('#idle-screen')) return;
      var imgs = container.querySelectorAll('img');
      imgs.forEach(function(img) {
        var src = img.src || img.getAttribute('src');
        if (!src || src.includes('qrserver') || src.includes('data:') || src.length < 10 || seenImages[src]) return;
        seenImages[src] = true;

        // Find closest title/text
        var parent = img.closest('[data-page], [data-view], .card, article, section, [class*="card"], [class*="item"], [class*="slide"]') || img.parentElement;
        var titleEl = parent ? parent.querySelector('h1,h2,h3,[data-editable],strong,b') : null;
        var title = titleEl ? (titleEl.textContent || '').trim() : '';

        // Find description text
        var descEls = parent ? parent.querySelectorAll('p, span, div') : [];
        var desc = '';
        for (var d = 0; d < descEls.length; d++) {
          var t = (descEls[d].textContent || '').trim();
          if (t.length > 15 && t.length < 300 && t !== title) { desc = t; break; }
        }

        if (title && !seenTitles[title]) {
          seenTitles[title] = true;
          items.push({ image: src, title: title, desc: desc });
        } else if (!title) {
          items.push({ image: src, title: '', desc: '' });
        }
      });
    });

    // Strategy 2: Background images
    document.querySelectorAll('[style]').forEach(function(el) {
      if (el.closest('#idle-screen')) return;
      var bg = el.style.backgroundImage;
      if (bg && bg.includes('url(')) {
        var match = bg.match(/url\\(['"]?([^'"\\)]+)['"]?\\)/);
        if (match && match[1] && !seenImages[match[1]] && !match[1].includes('qrserver')) {
          seenImages[match[1]] = true;
          var t = '';
          var heading = el.querySelector('h1,h2,h3,[data-editable]');
          if (heading) t = (heading.textContent || '').trim();
          items.push({ image: match[1], title: t, desc: '' });
        }
      }
    });

    // Strategy 3: Video posters
    document.querySelectorAll('video[poster]').forEach(function(v) {
      if (!seenImages[v.poster]) {
        seenImages[v.poster] = true;
        items.push({ image: v.poster, title: '', desc: '' });
      }
    });

    // Strategy 4: Embedded events in scripts
    document.querySelectorAll('script').forEach(function(s) {
      try {
        var c = s.textContent || '';
        var m = c.match(/var\\s+events\\s*=\\s*(\\[.*?\\]);/s);
        if (m) {
          var evts = JSON.parse(m[1].replace(/'/g, '"'));
          evts.forEach(function(ev) {
            var img = ev.image || ev.img || '';
            if (img && !seenImages[img]) {
              seenImages[img] = true;
              items.push({
                image: img,
                title: ev.title || ev.name || '',
                desc: ev.description || ev.date || ev.local || ''
              });
            }
          });
        }
      } catch(e) {}
    });

    // Collect orphan titles (without images) for fallback
    var orphanTexts = [];
    document.querySelectorAll('h1,h2,h3,[data-editable]').forEach(function(el) {
      if (el.closest('#idle-screen')) return;
      var t = (el.textContent || '').trim();
      if (t.length > 2 && t.length < 200 && !seenTitles[t]) {
        seenTitles[t] = true;
        orphanTexts.push(t);
      }
    });

    // Assign orphan titles to untitled items
    var orphanIdx = 0;
    items.forEach(function(item) {
      if (!item.title && orphanIdx < orphanTexts.length) {
        item.title = orphanTexts[orphanIdx++];
      }
    });

    return items.length > 0 ? items : [{ image: '', title: 'Tela de Descanso', desc: '' }];
  }

  var items = [];
  var currentIndex = 0;
  var heroImgs = [];

  function buildScreen() {
    items = extractContent();
    var billboard = screen.querySelector('.nf-billboard');
    // Remove old hero images
    billboard.querySelectorAll('.nf-hero-img').forEach(function(el) { el.remove(); });
    heroImgs = [];

    // Create hero images (max 10)
    items.slice(0, 10).forEach(function(item, i) {
      if (!item.image) return;
      var img = document.createElement('img');
      img.className = 'nf-hero-img';
      img.src = item.image;
      img.onerror = function() { img.style.display = 'none'; };
      billboard.insertBefore(img, billboard.firstChild);
      heroImgs.push(img);
    });

    // Build carousel cards
    var carousel = document.getElementById('nf-carousel');
    carousel.innerHTML = '';
    items.forEach(function(item, i) {
      var card = document.createElement('div');
      card.className = 'nf-card' + (i === 0 ? ' active-card' : '');
      card.innerHTML =
        (item.image ? '<img src="' + item.image + '" alt="" onerror="this.parentElement.style.background=\\'#333\\'">' : '<div style="width:100%;height:100%;background:#333"></div>') +
        '<div class="nf-card-overlay"><div class="nf-card-label">' + (item.title || 'Item ' + (i + 1)) + '</div></div>' +
        '<div class="nf-progress-bar" style="width:0%"></div>';
      carousel.appendChild(card);
    });

    currentIndex = 0;
    showItem(0);
  }

  function showItem(index) {
    currentIndex = index;
    var item = items[index] || items[0];

    // Hero image
    heroImgs.forEach(function(img, i) {
      img.classList.toggle('active', i === index);
      // Reset transform for re-triggering zoom
      if (i === index) {
        img.style.transform = 'scale(1)';
        void img.offsetWidth; // force reflow
        img.style.transform = 'scale(1.05)';
      }
    });

    // Info
    var info = document.getElementById('nf-info');
    var titleEl = document.getElementById('nf-info-title');
    var descEl = document.getElementById('nf-info-desc');
    info.classList.remove('visible');
    setTimeout(function() {
      titleEl.textContent = item.title || '';
      descEl.textContent = item.desc || '';
      if (item.title) info.classList.add('visible');
    }, 200);

    // Card active state
    var cards = screen.querySelectorAll('.nf-card');
    cards.forEach(function(c, i) { c.classList.toggle('active-card', i === index); });

    // Scroll carousel to keep active visible
    var carousel = document.getElementById('nf-carousel');
    var activeCard = cards[index];
    if (activeCard) {
      var scrollLeft = activeCard.offsetLeft - 50;
      carousel.style.transform = 'translateX(-' + Math.max(0, scrollLeft) + 'px)';
    }

    // Progress bar animation
    var progressBars = screen.querySelectorAll('.nf-progress-bar');
    progressBars.forEach(function(bar) { bar.style.width = '0%'; bar.style.transition = 'none'; });
    if (progressBars[index]) {
      void progressBars[index].offsetWidth;
      progressBars[index].style.transition = 'width ' + (SLIDE_INTERVAL / 1000) + 's linear';
      progressBars[index].style.width = '100%';
    }
  }

  function nextItem() {
    var next = (currentIndex + 1) % items.length;
    showItem(next);
  }

  function updateClock() {
    var now = new Date();
    var timeEl = document.getElementById('nf-clock-time');
    var dateEl = document.getElementById('nf-clock-date');
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (dateEl) {
      var weekday = now.toLocaleDateString('pt-BR', { weekday: 'long' });
      dateEl.innerHTML = weekday.charAt(0).toUpperCase() + weekday.slice(1) +
        '<br>' + now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    }
  }

  function activate() {
    if (isActive) return;
    isActive = true;
    buildScreen();
    updateClock();
    screen.classList.add('active');
    slideTimer = setInterval(function() { nextItem(); updateClock(); }, SLIDE_INTERVAL);
  }

  function deactivate() {
    if (!isActive) return;
    isActive = false;
    screen.classList.remove('active');
    if (slideTimer) { clearInterval(slideTimer); slideTimer = null; }
    resetTimer();
  }

  function resetTimer() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(activate, IDLE_TIMEOUT);
  }

  ['click', 'touchstart', 'mousemove', 'keydown'].forEach(function(evt) {
    document.addEventListener(evt, function() {
      if (isActive) { deactivate(); } else { resetTimer(); }
    }, { passive: true });
  });

  screen.addEventListener('click', deactivate);
  screen.addEventListener('touchstart', deactivate);

  resetTimer();
})();
</script>
` : ''}
</body>
</html>`;
}
