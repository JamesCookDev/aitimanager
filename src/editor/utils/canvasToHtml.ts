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
<!-- Idle Screen / Screensaver -->
<style>
  #idle-screen {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    z-index: 99999; opacity: 0; pointer-events: none;
    transition: opacity 1s ease;
    background: #000;
    overflow: hidden;
  }
  #idle-screen.active { opacity: 1; pointer-events: auto; }
  #idle-screen .idle-bg {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    object-fit: cover; opacity: 0; transition: opacity 1.5s ease;
    animation: kenburns 20s ease infinite alternate;
  }
  #idle-screen .idle-bg.visible { opacity: 0.45; }
  @keyframes kenburns {
    0% { transform: scale(1) translate(0, 0); }
    100% { transform: scale(1.15) translate(-2%, -1%); }
  }
  #idle-screen .idle-overlay {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.85) 100%);
    display: flex; flex-direction: column; justify-content: flex-end;
    padding: 60px 50px; gap: 24px;
  }
  #idle-screen .idle-clock {
    position: absolute; top: 50px; left: 50px; right: 50px;
    display: flex; justify-content: space-between; align-items: flex-start;
  }
  #idle-screen .idle-time {
    font-size: 72px; font-weight: 200; color: #fff;
    font-family: 'Inter', sans-serif; letter-spacing: -2px;
  }
  #idle-screen .idle-date {
    font-size: 18px; color: rgba(255,255,255,0.6);
    font-family: 'Inter', sans-serif; text-align: right; line-height: 1.5;
  }
  #idle-screen .idle-texts {
    display: flex; flex-direction: column; gap: 12px;
    max-height: 600px; overflow: hidden;
  }
  #idle-screen .idle-title {
    font-size: 36px; font-weight: 700; color: #fff;
    font-family: 'Inter', sans-serif; line-height: 1.2;
    text-shadow: 0 2px 20px rgba(0,0,0,0.5);
  }
  #idle-screen .idle-subtitle {
    font-size: 18px; color: rgba(255,255,255,0.7);
    font-family: 'Inter', sans-serif; line-height: 1.4;
  }
  #idle-screen .idle-thumbnails {
    display: flex; gap: 12px; overflow: hidden; padding-top: 16px;
  }
  #idle-screen .idle-thumb {
    width: 160px; height: 120px; border-radius: 12px; object-fit: cover;
    border: 2px solid rgba(255,255,255,0.15); flex-shrink: 0;
  }
  #idle-screen .idle-hint {
    position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
    font-size: 13px; color: rgba(255,255,255,0.35);
    font-family: 'Inter', sans-serif; letter-spacing: 2px; text-transform: uppercase;
    animation: pulse-hint 2s ease infinite;
  }
  @keyframes pulse-hint { 0%,100% { opacity: 0.35; } 50% { opacity: 0.7; } }
</style>
<div id="idle-screen">
  <div class="idle-overlay">
    <div class="idle-clock">
      <div class="idle-time" id="idle-time"></div>
      <div class="idle-date" id="idle-date"></div>
    </div>
    <div class="idle-texts" id="idle-texts"></div>
    <div class="idle-thumbnails" id="idle-thumbnails"></div>
  </div>
  <div class="idle-hint">Toque para continuar</div>
</div>
<script>
(function() {
  var IDLE_TIMEOUT = ${idleScreenTimeout} * 1000;
  var screen = document.getElementById('idle-screen');
  var timer = null;
  var slideTimer = null;
  var isActive = false;

  // Extract content from DOM
  function extractContent() {
    var images = [];
    var texts = [];

    // Collect images
    document.querySelectorAll('img').forEach(function(img) {
      if (img.closest('#idle-screen')) return;
      var src = img.src || img.getAttribute('src');
      if (src && !src.includes('qrserver') && !src.includes('data:') && src.length > 10) {
        images.push(src);
      }
    });

    // Collect background images from styles
    document.querySelectorAll('[style]').forEach(function(el) {
      if (el.closest('#idle-screen')) return;
      var bg = el.style.backgroundImage;
      if (bg && bg.includes('url(')) {
        var match = bg.match(/url\\(['"]?([^'"\\)]+)['"]?\\)/);
        if (match && match[1] && !match[1].includes('qrserver')) images.push(match[1]);
      }
    });

    // Collect carousel/video poster images
    document.querySelectorAll('video[poster]').forEach(function(v) {
      if (v.poster) images.push(v.poster);
    });

    // Collect texts - prioritize headings and larger text
    var selectors = ['h1','h2','h3','[data-editable]','strong','b','button'];
    selectors.forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(el) {
        if (el.closest('#idle-screen')) return;
        var t = (el.textContent || '').trim();
        if (t.length > 2 && t.length < 200 && texts.indexOf(t) === -1) {
          texts.push(t);
        }
      });
    });

    // Also extract from data-page elements (all pages, not just visible)
    document.querySelectorAll('[data-page]').forEach(function(page) {
      page.querySelectorAll('img').forEach(function(img) {
        var src = img.src || img.getAttribute('src');
        if (src && !src.includes('qrserver') && !src.includes('data:') && images.indexOf(src) === -1) {
          images.push(src);
        }
      });
      page.querySelectorAll('h1,h2,h3,[data-editable],strong').forEach(function(el) {
        var t = (el.textContent || '').trim();
        if (t.length > 2 && t.length < 200 && texts.indexOf(t) === -1) {
          texts.push(t);
        }
      });
    });

    // Extract from embedded HTML (iframes with srcdoc or raw HTML)
    document.querySelectorAll('script').forEach(function(s) {
      try {
        var content = s.textContent || '';
        var eventMatch = content.match(/var\\s+events\\s*=\\s*(\\[.*?\\]);/s);
        if (eventMatch) {
          var events = JSON.parse(eventMatch[1].replace(/'/g, '"'));
          events.forEach(function(ev) {
            if (ev.title && texts.indexOf(ev.title) === -1) texts.push(ev.title);
            if (ev.image && images.indexOf(ev.image) === -1) images.push(ev.image);
            if (ev.img && images.indexOf(ev.img) === -1) images.push(ev.img);
          });
        }
      } catch(e) {}
    });

    return { images: images.filter(function(v,i,a){ return a.indexOf(v) === i; }), texts: texts };
  }

  var content = { images: [], texts: [] };
  var currentSlide = 0;
  var bgElements = [];

  function buildIdleScreen() {
    content = extractContent();

    // Build background images
    var existing = screen.querySelectorAll('.idle-bg');
    existing.forEach(function(el) { el.remove(); });
    bgElements = [];

    content.images.slice(0, 8).forEach(function(src) {
      var img = document.createElement('img');
      img.className = 'idle-bg';
      img.src = src;
      img.onerror = function() { img.style.display = 'none'; };
      screen.insertBefore(img, screen.firstChild);
      bgElements.push(img);
    });

    // Build texts
    var textsContainer = document.getElementById('idle-texts');
    textsContainer.innerHTML = '';
    content.texts.slice(0, 5).forEach(function(t, i) {
      var div = document.createElement('div');
      div.className = i === 0 ? 'idle-title' : 'idle-subtitle';
      div.textContent = t;
      textsContainer.appendChild(div);
    });

    // Build thumbnails
    var thumbsContainer = document.getElementById('idle-thumbnails');
    thumbsContainer.innerHTML = '';
    content.images.slice(0, 5).forEach(function(src) {
      var img = document.createElement('img');
      img.className = 'idle-thumb';
      img.src = src;
      img.onerror = function() { img.style.display = 'none'; };
      thumbsContainer.appendChild(img);
    });

    currentSlide = 0;
    showSlide(0);
  }

  function showSlide(index) {
    bgElements.forEach(function(img, i) {
      img.classList.toggle('visible', i === index);
      // Vary the ken burns direction per slide
      img.style.animationDuration = (15 + (i % 3) * 5) + 's';
      img.style.animationDirection = i % 2 === 0 ? 'alternate' : 'alternate-reverse';
    });
  }

  function nextSlide() {
    if (bgElements.length === 0) return;
    currentSlide = (currentSlide + 1) % bgElements.length;
    showSlide(currentSlide);
  }

  function updateClock() {
    var now = new Date();
    var timeEl = document.getElementById('idle-time');
    var dateEl = document.getElementById('idle-date');
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (dateEl) {
      dateEl.innerHTML = now.toLocaleDateString('pt-BR', { weekday: 'long' }).charAt(0).toUpperCase() +
        now.toLocaleDateString('pt-BR', { weekday: 'long' }).slice(1) +
        '<br>' + now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    }
  }

  function activate() {
    if (isActive) return;
    isActive = true;
    buildIdleScreen();
    updateClock();
    screen.classList.add('active');
    slideTimer = setInterval(function() { nextSlide(); updateClock(); }, 6000);
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

  // Listen for user interaction
  ['click', 'touchstart', 'mousemove', 'keydown'].forEach(function(evt) {
    document.addEventListener(evt, function() {
      if (isActive) { deactivate(); }
      else { resetTimer(); }
    }, { passive: true });
  });

  // Dismiss idle screen on touch
  screen.addEventListener('click', deactivate);
  screen.addEventListener('touchstart', deactivate);

  // Start timer
  resetTimer();
})();
</script>
` : ''}
</body>
</html>`;
}
