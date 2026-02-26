import { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { Globe, Pencil, Link2, Eye, X, Paintbrush, Move, Trash2 } from 'lucide-react';
import { Placeholder } from './Placeholder';
import { applyFieldOverrides } from '../../utils/htmlEditableFields';

const DESIGN_W = 1080;
const DESIGN_H = 1920;

type EditTool = 'off' | 'text' | 'navigate' | 'inspect' | 'style' | 'layout';

interface IframeProps {
  _iframeMode?: 'html' | 'url';
  url?: string;
  htmlContent?: string;
  fieldOverrides?: Record<string, string>;
  borderRadius?: number;
  scrolling?: boolean;
  editMode?: boolean;
  _activeTool?: string;
  onInlineEdit?: (overrides: Record<string, string>) => void;
  activeViewName?: string;
  htmlPages?: { id: string; name: string; selector: string }[];
  onNavigatePage?: (pageName: string) => void;
}

export function IframePlaceholder(props: IframeProps) {
  const url = props.url || '';
  const htmlContent = props.htmlContent || '';
  const activeMode = props._iframeMode || (htmlContent ? 'html' : 'url');
  const overrides = props.fieldOverrides;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<EditTool>('off');
  const prevEditMode = useRef(props.editMode);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (props.editMode && !prevEditMode.current) {
      setTool('text');
    } else if (!props.editMode && prevEditMode.current) {
      setTool('off');
    }
    prevEditMode.current = props.editMode;
  }, [props.editMode]);

  // Sync tool from props panel
  useEffect(() => {
    if (props._activeTool && props.editMode) {
      setTool(props._activeTool as EditTool);
    }
  }, [props._activeTool]);

  const finalHtml = useMemo(() => {
    if (!htmlContent) return '';
    let html = htmlContent;
    if (overrides && Object.keys(overrides).length > 0) {
      html = applyFieldOverrides(html, overrides);
    }
    const editScript = `
<style>
  [data-edit-highlight] { outline: 2px solid #818cf8 !important; outline-offset: 2px; border-radius: 4px; }
  [data-nav-highlight] { outline: 2px dashed #f59e0b !important; outline-offset: 2px; border-radius: 4px; cursor: pointer !important; }
  [data-nav-highlight]::after { content: attr(data-nav-label); position: absolute; top: -18px; left: 0; background: #f59e0b; color: #000; font-size: 10px; padding: 1px 6px; border-radius: 4px; white-space: nowrap; pointer-events: none; z-index: 9999; }
  .inspect-tooltip { position: fixed; background: rgba(0,0,0,.85); color: #fff; font: 11px/1.4 monospace; padding: 6px 10px; border-radius: 6px; z-index: 99999; pointer-events: none; max-width: 320px; word-break: break-all; }
  [data-style-highlight] { outline: 2px solid #ec4899 !important; outline-offset: 2px; border-radius: 4px; }
  /* Layout mode */
  [data-layout-selected] { outline: 2px solid #3b82f6 !important; outline-offset: 2px; position: relative; }
  [data-layout-hover] { outline: 1px dashed #60a5fa !important; outline-offset: 1px; }
  .layout-toolbar {
    position: absolute; z-index: 999999; background: #1e293b; border: 1px solid rgba(59,130,246,0.4);
    border-radius: 8px; padding: 4px; display: flex; gap: 2px; box-shadow: 0 8px 30px rgba(0,0,0,0.5);
    font-family: system-ui, sans-serif;
  }
  .layout-toolbar button {
    display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px;
    border: none; font-size: 10px; font-weight: 600; color: #fff; cursor: pointer;
    background: transparent; white-space: nowrap;
  }
  .layout-toolbar button:hover { background: rgba(255,255,255,0.1); }
  .layout-toolbar .btn-delete { color: #f87171; }
  .layout-toolbar .btn-delete:hover { background: rgba(248,113,113,0.2); }
  .layout-toolbar .btn-bg { color: #a78bfa; }
  .layout-toolbar .btn-move { color: #60a5fa; }
  .layout-toolbar .btn-resize { color: #34d399; }
  .layout-toolbar .btn-duplicate { color: #fbbf24; }
  .layout-toolbar .btn-hide { color: #94a3b8; }
  .layout-drag-ghost { position: absolute; z-index: 999990; pointer-events: none; opacity: 0.5; border: 2px dashed #3b82f6; }
  .style-panel {
    position: fixed; z-index: 999999; background: #1a1a2e; border: 1px solid rgba(255,255,255,0.15);
    border-radius: 12px; padding: 12px; min-width: 220px; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    font-family: system-ui, sans-serif; color: #fff; font-size: 11px;
  }
  .style-panel-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #ec4899; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
  .style-panel-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .style-panel-label { width: 70px; font-size: 10px; color: rgba(255,255,255,0.6); flex-shrink: 0; }
  .style-panel-input { flex: 1; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; padding: 4px 8px; color: #fff; font-size: 11px; outline: none; }
  .style-panel-input:focus { border-color: #ec4899; }
  .style-panel-color { width: 28px; height: 28px; border-radius: 6px; border: 2px solid rgba(255,255,255,0.2); cursor: pointer; padding: 0; }
  .style-panel-close { position: absolute; top: 6px; right: 8px; background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; font-size: 14px; }
  .style-panel-close:hover { color: #fff; }
  .style-panel-select { flex: 1; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; padding: 4px 6px; color: #fff; font-size: 11px; outline: none; appearance: auto; }
</style>
<script>
(function() {
  var currentMode = 'off';
  var inspectTooltip = null;
  var stylePanel = null;
  var styledEl = null;
  var layoutSelected = null;
  var layoutToolbar = null;
  var isDragging = false;
  var dragStart = { x: 0, y: 0 };
  var dragElStart = { x: 0, y: 0 };

  document.addEventListener('click', function(e) {
    if (currentMode !== 'off') return;
    var el = e.target;
    while (el && el !== document.body) {
      var nav = el.getAttribute('data-navigate');
      if (nav) { e.preventDefault(); e.stopPropagation(); window.parent.postMessage({ type: 'navigate-page-click', page: nav }, '*'); return; }
      if (el.tagName === 'A') {
        var href = el.getAttribute('href') || '';
        if (href.startsWith('#')) { var p = href.substring(1); if (p) { e.preventDefault(); e.stopPropagation(); window.parent.postMessage({ type: 'navigate-page-click', page: p }, '*'); return; } }
      }
      el = el.parentElement;
    }
  }, true);

  function clearAll() {
    document.querySelectorAll('[contenteditable=true]').forEach(function(el) { el.contentEditable = 'false'; el.style.cursor = ''; el.removeAttribute('data-edit-highlight'); });
    document.querySelectorAll('[data-nav-highlight]').forEach(function(el) { el.removeAttribute('data-nav-highlight'); el.removeAttribute('data-nav-label'); });
    document.querySelectorAll('[data-style-highlight]').forEach(function(el) { el.removeAttribute('data-style-highlight'); });
    document.querySelectorAll('[data-layout-selected]').forEach(function(el) { el.removeAttribute('data-layout-selected'); });
    document.querySelectorAll('[data-layout-hover]').forEach(function(el) { el.removeAttribute('data-layout-hover'); });
    document.querySelectorAll('img').forEach(function(img) { img.style.cursor = ''; img.title = ''; });
    document.body.style.cursor = '';
    if (inspectTooltip) { inspectTooltip.remove(); inspectTooltip = null; }
    if (stylePanel) { stylePanel.remove(); stylePanel = null; styledEl = null; }
    if (layoutToolbar) { layoutToolbar.remove(); layoutToolbar = null; }
    layoutSelected = null;
    isDragging = false;
  }

  function isLeafText(el) {
    var directText = '';
    for (var i = 0; i < el.childNodes.length; i++) {
      if (el.childNodes[i].nodeType === 3) directText += el.childNodes[i].textContent.trim();
    }
    if (directText.length > 0) return true;
    var tag = el.tagName.toLowerCase();
    if ((tag === 'button' || tag === 'a' || tag === 'span' || tag === 'label') && el.textContent.trim().length > 0) {
      var blocks = el.querySelectorAll('div,p,h1,h2,h3,h4,h5,h6,li,td,th');
      return blocks.length === 0;
    }
    return false;
  }

  function enableText() {
    document.body.style.cursor = 'text';
    var textEls = document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,li,td,th,label,button');
    var editedSet = new Set();
    textEls.forEach(function(el) {
      if (editedSet.has(el)) return;
      if (!isLeafText(el)) return;
      var parent = el.parentElement;
      while (parent && parent !== document.body) {
        if (parent.contentEditable === 'true') return;
        parent = parent.parentElement;
      }
      editedSet.add(el);
      el.contentEditable = 'true';
      el.style.outline = 'none';
      el.style.cursor = 'text';
      el.setAttribute('data-edit-highlight', '');
      el.addEventListener('focus', function() { el.style.outline = '2px solid #818cf8'; el.style.outlineOffset = '2px'; });
      el.addEventListener('blur', function() {
        el.style.outline = 'none';
        var sel = buildSel(el);
        var newText = el.textContent.trim();
        window.parent.postMessage({ type: 'inline-edit-text', selector: sel, text: newText }, '*');
      });
    });
    document.querySelectorAll('img').forEach(function(img) {
      img.style.cursor = 'pointer';
      img.style.outline = '2px dashed #818cf8';
      img.style.outlineOffset = '2px';
      img.title = 'Clique para trocar imagem';
      img.addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        var url = prompt('Nova URL da imagem:', img.src);
        if (url) {
          img.src = url;
          var sel = buildSel(img);
          window.parent.postMessage({ type: 'inline-edit-img', selector: sel, src: url }, '*');
        }
      });
    });
  }

  function enableNavigate() {
    var navEls = document.querySelectorAll('[data-navigate], a[href^="#"]');
    navEls.forEach(function(el) {
      var target = el.getAttribute('data-navigate') || (el.getAttribute('href') || '').substring(1);
      el.setAttribute('data-nav-highlight', '');
      el.setAttribute('data-nav-label', '→ ' + target);
      el.style.position = 'relative';
    });
    document.addEventListener('click', function navClick(e) {
      if (currentMode !== 'navigate') { document.removeEventListener('click', navClick, true); return; }
      var el = e.target;
      if (el.hasAttribute && el.hasAttribute('data-nav-highlight')) return;
      if (el.tagName && !el.hasAttribute('data-navigate') && el !== document.body) {
        e.preventDefault(); e.stopPropagation();
        var page = prompt('Navegar para qual página? (nome do data-page)');
        if (page) {
          el.setAttribute('data-navigate', page);
          el.setAttribute('data-nav-highlight', '');
          el.setAttribute('data-nav-label', '→ ' + page);
          el.style.position = 'relative';
          window.parent.postMessage({ type: 'set-navigate', selector: buildSel(el), page: page }, '*');
        }
      }
    }, true);
  }

  function enableInspect() {
    inspectTooltip = document.createElement('div');
    inspectTooltip.className = 'inspect-tooltip';
    inspectTooltip.style.display = 'none';
    document.body.appendChild(inspectTooltip);
    document.addEventListener('mousemove', function inspMove(e) {
      if (currentMode !== 'inspect') { if (inspectTooltip) inspectTooltip.style.display = 'none'; return; }
      var el = e.target;
      if (!el || !el.tagName) return;
      var tag = el.tagName.toLowerCase();
      var cls = el.className ? '.' + String(el.className).split(' ').filter(Boolean).join('.') : '';
      var id = el.id ? '#' + el.id : '';
      var size = el.offsetWidth + '×' + el.offsetHeight;
      inspectTooltip.textContent = tag + id + cls + ' [' + size + ']';
      inspectTooltip.style.display = 'block';
      inspectTooltip.style.left = Math.min(e.clientX + 12, window.innerWidth - 330) + 'px';
      inspectTooltip.style.top = (e.clientY + 16) + 'px';
      document.querySelectorAll('[data-edit-highlight]').forEach(function(h) { h.removeAttribute('data-edit-highlight'); });
      el.setAttribute('data-edit-highlight', '');
    });
    document.addEventListener('click', function inspClick(e) {
      if (currentMode !== 'inspect') return;
      e.preventDefault(); e.stopPropagation();
      var el = e.target;
      window.parent.postMessage({ type: 'inspect-element', tag: el.tagName.toLowerCase(), html: el.outerHTML.substring(0, 500), text: (el.textContent || '').trim().substring(0, 100) }, '*');
    }, true);
  }

  function enableStyle() {
    document.body.style.cursor = 'crosshair';
    document.addEventListener('mouseover', function styleHover(e) {
      if (currentMode !== 'style') return;
      var el = e.target;
      if (!el || !el.tagName || el === document.body || el.closest('.style-panel')) return;
      document.querySelectorAll('[data-style-highlight]').forEach(function(h) { if (h !== styledEl) h.removeAttribute('data-style-highlight'); });
      if (el !== styledEl) el.setAttribute('data-style-highlight', '');
    });
    document.addEventListener('mouseout', function styleOut(e) {
      if (currentMode !== 'style') return;
      var el = e.target;
      if (el !== styledEl) el.removeAttribute('data-style-highlight');
    });
    document.addEventListener('click', function styleClick(e) {
      if (currentMode !== 'style') return;
      var el = e.target;
      if (!el || !el.tagName || el === document.body) return;
      if (el.closest('.style-panel')) return;
      e.preventDefault(); e.stopPropagation();
      if (styledEl) styledEl.removeAttribute('data-style-highlight');
      styledEl = el;
      el.setAttribute('data-style-highlight', '');
      showStylePanel(el, e.clientX, e.clientY);
    }, true);
  }

  function showStylePanel(el, mx, my) {
    if (stylePanel) stylePanel.remove();
    var cs = window.getComputedStyle(el);
    var panel = document.createElement('div');
    panel.className = 'style-panel';
    var px = Math.min(mx + 10, window.innerWidth - 250);
    var py = Math.min(my + 10, window.innerHeight - 360);
    panel.style.left = px + 'px';
    panel.style.top = py + 'px';
    var tag = el.tagName.toLowerCase();
    var sel = buildSel(el);

    // Check for background image
    var bgImg = cs.backgroundImage;
    var hasBgImg = bgImg && bgImg !== 'none';
    var bgImgRow = '';
    if (hasBgImg) {
      var urlMatch = bgImg.match(/url\\(["']?([^"')]+)["']?\\)/);
      var bgUrl = urlMatch ? urlMatch[1] : '';
      bgImgRow = '<div class="style-panel-row"><span class="style-panel-label">Bg Image</span><input class="style-panel-input" data-prop="backgroundImage" value="' + bgUrl + '" placeholder="URL da imagem"></div>';
    } else {
      bgImgRow = '<div class="style-panel-row"><span class="style-panel-label">Bg Image</span><input class="style-panel-input" data-prop="backgroundImage" value="" placeholder="URL da imagem de fundo"></div>';
    }

    panel.innerHTML = '<div class="style-panel-title">🎨 Estilos — ' + tag + '</div>'
      + '<button class="style-panel-close" data-close>✕</button>'
      + '<div class="style-panel-row"><span class="style-panel-label">Bg Color</span><input type="color" class="style-panel-color" data-prop="backgroundColor" value="' + rgbToHex(cs.backgroundColor) + '"><input class="style-panel-input" data-prop="backgroundColor" data-text="1" value="' + cs.backgroundColor + '" style="width:90px"></div>'
      + '<div class="style-panel-row"><span class="style-panel-label">Cor texto</span><input type="color" class="style-panel-color" data-prop="color" value="' + rgbToHex(cs.color) + '"><input class="style-panel-input" data-prop="color" data-text="1" value="' + cs.color + '" style="width:90px"></div>'
      + bgImgRow
      + '<div class="style-panel-row"><span class="style-panel-label">Bg Size</span><select class="style-panel-select" data-prop="backgroundSize"><option value="cover"' + (cs.backgroundSize === 'cover' ? ' selected' : '') + '>cover</option><option value="contain"' + (cs.backgroundSize === 'contain' ? ' selected' : '') + '>contain</option><option value="auto"' + (cs.backgroundSize === 'auto' ? ' selected' : '') + '>auto</option><option value="100% 100%">stretch</option></select></div>'
      + '<div class="style-panel-row"><span class="style-panel-label">Font size</span><input class="style-panel-input" data-prop="fontSize" value="' + cs.fontSize + '"></div>'
      + '<div class="style-panel-row"><span class="style-panel-label">Font family</span><select class="style-panel-select" data-prop="fontFamily">'
        + ['inherit','Arial','Helvetica','Georgia','Times New Roman','Courier New','Verdana','Impact','system-ui'].map(function(f) {
            return '<option value="' + f + '"' + (cs.fontFamily.indexOf(f) >= 0 ? ' selected' : '') + '>' + f + '</option>';
          }).join('')
      + '</select></div>'
      + '<div class="style-panel-row"><span class="style-panel-label">Font weight</span><select class="style-panel-select" data-prop="fontWeight">'
        + ['100','200','300','400','500','600','700','800','900'].map(function(w) {
            return '<option value="' + w + '"' + (cs.fontWeight === w ? ' selected' : '') + '>' + w + '</option>';
          }).join('')
      + '</select></div>'
      + '<div class="style-panel-row"><span class="style-panel-label">Padding</span><input class="style-panel-input" data-prop="padding" value="' + cs.padding + '"></div>'
      + '<div class="style-panel-row"><span class="style-panel-label">Margin</span><input class="style-panel-input" data-prop="margin" value="' + cs.margin + '"></div>'
      + '<div class="style-panel-row"><span class="style-panel-label">Width</span><input class="style-panel-input" data-prop="width" value="' + cs.width + '"></div>'
      + '<div class="style-panel-row"><span class="style-panel-label">Height</span><input class="style-panel-input" data-prop="height" value="' + cs.height + '"></div>'
      + '<div class="style-panel-row"><span class="style-panel-label">Radius</span><input class="style-panel-input" data-prop="borderRadius" value="' + cs.borderRadius + '"></div>'
      + '<div class="style-panel-row"><span class="style-panel-label">Borda</span><input class="style-panel-input" data-prop="border" value="' + cs.border + '"></div>'
      + '<div class="style-panel-row"><span class="style-panel-label">Opacity</span><input class="style-panel-input" data-prop="opacity" value="' + cs.opacity + '" type="number" min="0" max="1" step="0.1"></div>'
      + '<div class="style-panel-row"><span class="style-panel-label">Display</span><select class="style-panel-select" data-prop="display"><option value="block"' + (cs.display === 'block' ? ' selected' : '') + '>block</option><option value="flex"' + (cs.display === 'flex' ? ' selected' : '') + '>flex</option><option value="none"' + (cs.display === 'none' ? ' selected' : '') + '>none</option><option value="inline-block"' + (cs.display === 'inline-block' ? ' selected' : '') + '>inline-block</option><option value="grid"' + (cs.display === 'grid' ? ' selected' : '') + '>grid</option></select></div>';

    document.body.appendChild(panel);
    stylePanel = panel;

    panel.querySelector('[data-close]').addEventListener('click', function() {
      panel.remove(); stylePanel = null;
      if (styledEl) { styledEl.removeAttribute('data-style-highlight'); styledEl = null; }
    });

    panel.querySelectorAll('[data-prop]').forEach(function(input) {
      input.addEventListener('input', function() {
        var prop = input.getAttribute('data-prop');
        var val = input.value;
        // Special handling for backgroundImage
        if (prop === 'backgroundImage') {
          if (val) {
            el.style.backgroundImage = 'url("' + val + '")';
          } else {
            el.style.backgroundImage = 'none';
          }
          window.parent.postMessage({ type: 'style-change', selector: sel, prop: 'backgroundImage', value: val ? 'url("' + val + '")' : 'none' }, '*');
          return;
        }
        el.style[prop] = val;
        var peers = panel.querySelectorAll('[data-prop="' + prop + '"]');
        peers.forEach(function(p) { if (p !== input) { if (p.type === 'color') p.value = rgbToHex(val); else p.value = val; } });
        window.parent.postMessage({ type: 'style-change', selector: sel, prop: prop, value: val }, '*');
      });
    });
  }

  /* ── Layout mode: select, drag, delete, hide ── */
  function enableLayout() {
    document.body.style.cursor = 'default';
    
    document.addEventListener('mouseover', function layoutHover(e) {
      if (currentMode !== 'layout') return;
      var el = e.target;
      if (!el || !el.tagName || el === document.body || el === document.documentElement) return;
      if (el.closest('.layout-toolbar')) return;
      document.querySelectorAll('[data-layout-hover]').forEach(function(h) { h.removeAttribute('data-layout-hover'); });
      if (el !== layoutSelected) el.setAttribute('data-layout-hover', '');
    });
    
    document.addEventListener('mouseout', function layoutOut(e) {
      if (currentMode !== 'layout') return;
      var el = e.target;
      if (el) el.removeAttribute('data-layout-hover');
    });

    document.addEventListener('click', function layoutClick(e) {
      if (currentMode !== 'layout') return;
      var el = e.target;
      if (!el || !el.tagName || el === document.body || el === document.documentElement) return;
      if (el.closest('.layout-toolbar')) return;
      e.preventDefault(); e.stopPropagation();

      // Deselect previous
      if (layoutSelected) layoutSelected.removeAttribute('data-layout-selected');
      if (layoutToolbar) { layoutToolbar.remove(); layoutToolbar = null; }

      layoutSelected = el;
      el.setAttribute('data-layout-selected', '');
      showLayoutToolbar(el);
    }, true);

    // Keyboard shortcuts
    document.addEventListener('keydown', function layoutKey(e) {
      if (currentMode !== 'layout' || !layoutSelected) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      }
      if (e.key === 'Escape') {
        if (layoutSelected) layoutSelected.removeAttribute('data-layout-selected');
        if (layoutToolbar) { layoutToolbar.remove(); layoutToolbar = null; }
        layoutSelected = null;
      }
      // Arrow key nudge
      var nudge = e.shiftKey ? 10 : 1;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.key) >= 0) {
        e.preventDefault();
        var cs = window.getComputedStyle(layoutSelected);
        if (cs.position === 'static') layoutSelected.style.position = 'relative';
        var top = parseInt(layoutSelected.style.top || '0') || 0;
        var left = parseInt(layoutSelected.style.left || '0') || 0;
        if (e.key === 'ArrowUp') layoutSelected.style.top = (top - nudge) + 'px';
        if (e.key === 'ArrowDown') layoutSelected.style.top = (top + nudge) + 'px';
        if (e.key === 'ArrowLeft') layoutSelected.style.left = (left - nudge) + 'px';
        if (e.key === 'ArrowRight') layoutSelected.style.left = (left + nudge) + 'px';
        notifyPositionChange(layoutSelected);
      }
    });
  }

  function showLayoutToolbar(el) {
    if (layoutToolbar) layoutToolbar.remove();
    var toolbar = document.createElement('div');
    toolbar.className = 'layout-toolbar';

    var rect = el.getBoundingClientRect();
    toolbar.style.left = Math.max(0, Math.min(rect.left, window.innerWidth - 300)) + 'px';
    toolbar.style.top = Math.max(0, rect.top - 36) + 'px';

    var tag = el.tagName.toLowerCase();
    var isImg = tag === 'img';
    var hasBg = window.getComputedStyle(el).backgroundImage !== 'none';

    toolbar.innerHTML = '<button class="btn-move" data-action="move" title="Arrastar (ou use setas do teclado)">↕ Mover</button>'
      + (isImg ? '<button class="btn-bg" data-action="change-img" title="Trocar imagem">🖼 Imagem</button>' : '')
      + (hasBg || !isImg ? '<button class="btn-bg" data-action="change-bg" title="Trocar imagem de fundo">🎨 Fundo</button>' : '')
      + '<button class="btn-duplicate" data-action="duplicate" title="Duplicar elemento">⧉ Duplicar</button>'
      + '<button class="btn-hide" data-action="hide" title="Ocultar elemento">👁 Ocultar</button>'
      + '<button class="btn-delete" data-action="delete" title="Excluir elemento (Delete)">✕ Excluir</button>';

    document.body.appendChild(toolbar);
    layoutToolbar = toolbar;

    toolbar.querySelectorAll('button').forEach(function(btn) {
      btn.addEventListener('mousedown', function(e) { e.stopPropagation(); });
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var action = btn.getAttribute('data-action');
        if (action === 'delete') deleteSelected();
        else if (action === 'hide') hideSelected();
        else if (action === 'change-img') changeImage();
        else if (action === 'change-bg') changeBackground();
        else if (action === 'duplicate') duplicateSelected();
        else if (action === 'move') startDrag(e);
      });
    });
  }

  function deleteSelected() {
    if (!layoutSelected) return;
    var sel = buildSel(layoutSelected);
    layoutSelected.remove();
    if (layoutToolbar) { layoutToolbar.remove(); layoutToolbar = null; }
    window.parent.postMessage({ type: 'layout-delete', selector: sel }, '*');
    layoutSelected = null;
  }

  function hideSelected() {
    if (!layoutSelected) return;
    var sel = buildSel(layoutSelected);
    layoutSelected.style.display = 'none';
    if (layoutToolbar) { layoutToolbar.remove(); layoutToolbar = null; }
    window.parent.postMessage({ type: 'style-change', selector: sel, prop: 'display', value: 'none' }, '*');
    layoutSelected = null;
  }

  function changeImage() {
    if (!layoutSelected) return;
    var img = layoutSelected;
    var currentSrc = img.getAttribute('src') || '';
    var url = prompt('Nova URL da imagem:', currentSrc);
    if (url) {
      img.src = url;
      var sel = buildSel(img);
      window.parent.postMessage({ type: 'inline-edit-img', selector: sel, src: url }, '*');
    }
  }

  function changeBackground() {
    if (!layoutSelected) return;
    var el = layoutSelected;
    var cs = window.getComputedStyle(el);
    var current = '';
    var bgMatch = cs.backgroundImage.match(/url\\(["']?([^"')]+)["']?\\)/);
    if (bgMatch) current = bgMatch[1];
    var url = prompt('URL da imagem de fundo:', current);
    if (url !== null) {
      var sel = buildSel(el);
      if (url) {
        el.style.backgroundImage = 'url("' + url + '")';
        el.style.backgroundSize = el.style.backgroundSize || 'cover';
        el.style.backgroundPosition = el.style.backgroundPosition || 'center';
        window.parent.postMessage({ type: 'style-change', selector: sel, prop: 'backgroundImage', value: 'url("' + url + '")' }, '*');
        window.parent.postMessage({ type: 'style-change', selector: sel, prop: 'backgroundSize', value: 'cover' }, '*');
        window.parent.postMessage({ type: 'style-change', selector: sel, prop: 'backgroundPosition', value: 'center' }, '*');
      } else {
        el.style.backgroundImage = 'none';
        window.parent.postMessage({ type: 'style-change', selector: sel, prop: 'backgroundImage', value: 'none' }, '*');
      }
    }
  }

  function duplicateSelected() {
    if (!layoutSelected) return;
    var clone = layoutSelected.cloneNode(true);
    clone.removeAttribute('data-layout-selected');
    clone.style.position = 'relative';
    clone.style.top = '10px';
    layoutSelected.parentElement.insertBefore(clone, layoutSelected.nextSibling);
    // Notify parent about the new HTML
    var sel = buildSel(clone);
    window.parent.postMessage({ type: 'layout-duplicate', selector: buildSel(layoutSelected), newHtml: clone.outerHTML }, '*');
  }

  function startDrag(startEvent) {
    if (!layoutSelected) return;
    var el = layoutSelected;
    isDragging = true;
    var cs = window.getComputedStyle(el);
    if (cs.position === 'static') el.style.position = 'relative';
    dragStart = { x: startEvent.clientX, y: startEvent.clientY };
    dragElStart = { x: parseInt(el.style.left || '0') || 0, y: parseInt(el.style.top || '0') || 0 };
    el.style.zIndex = '9999';
    el.style.transition = 'none';

    function onMove(e) {
      if (!isDragging) return;
      var dx = e.clientX - dragStart.x;
      var dy = e.clientY - dragStart.y;
      el.style.left = (dragElStart.x + dx) + 'px';
      el.style.top = (dragElStart.y + dy) + 'px';
    }
    function onUp() {
      isDragging = false;
      el.style.zIndex = '';
      el.style.transition = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      notifyPositionChange(el);
      if (layoutToolbar) showLayoutToolbar(el);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function notifyPositionChange(el) {
    var sel = buildSel(el);
    if (el.style.position) window.parent.postMessage({ type: 'style-change', selector: sel, prop: 'position', value: el.style.position }, '*');
    if (el.style.top) window.parent.postMessage({ type: 'style-change', selector: sel, prop: 'top', value: el.style.top }, '*');
    if (el.style.left) window.parent.postMessage({ type: 'style-change', selector: sel, prop: 'left', value: el.style.left }, '*');
  }

  function rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#000000';
    if (rgb.startsWith('#')) return rgb;
    var m = rgb.match(/\\d+/g);
    if (!m || m.length < 3) return '#000000';
    return '#' + ((1 << 24) + (parseInt(m[0]) << 16) + (parseInt(m[1]) << 8) + parseInt(m[2])).toString(16).slice(1);
  }

  function buildSel(el) {
    var parts = [];
    while (el && el !== document.body) {
      var s = el.tagName.toLowerCase();
      if (el.id) { parts.unshift('#' + el.id); break; }
      var parent = el.parentElement;
      if (parent) { var sibs = Array.from(parent.children).filter(function(c) { return c.tagName === el.tagName; }); if (sibs.length > 1) s += ':nth-of-type(' + (sibs.indexOf(el) + 1) + ')'; }
      parts.unshift(s);
      el = el.parentElement;
    }
    return parts.join(' > ');
  }

  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'navigate-page') {
      document.querySelectorAll('[data-page]').forEach(function(p) { p.classList.remove('active'); p.style.display = 'none'; });
      var target = document.querySelector('[data-page="' + e.data.page + '"]');
      if (target) { target.classList.add('active'); target.style.display = 'flex'; }
    }
    if (e.data && e.data.type === 'set-tool') {
      clearAll();
      currentMode = e.data.tool || 'off';
      if (currentMode === 'text') enableText();
      else if (currentMode === 'navigate') enableNavigate();
      else if (currentMode === 'inspect') enableInspect();
      else if (currentMode === 'style') enableStyle();
      else if (currentMode === 'layout') enableLayout();
    }
  });
})();
</script>`;
    if (html.includes('</body>')) {
      html = html.replace('</body>', editScript + '</body>');
    } else {
      html += editScript;
    }
    return html;
  }, [htmlContent, overrides]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'inline-edit-text' && props.onInlineEdit) {
        props.onInlineEdit({ [`__text_${e.data.selector}`]: e.data.text });
      }
      if (e.data?.type === 'inline-edit-img' && props.onInlineEdit) {
        props.onInlineEdit({ [`__img_${e.data.selector}`]: e.data.src });
      }
      if (e.data?.type === 'navigate-page-click' && props.onNavigatePage) {
        props.onNavigatePage(e.data.page);
      }
      if (e.data?.type === 'set-navigate' && props.onInlineEdit) {
        props.onInlineEdit({ [`__nav_${e.data.selector}`]: e.data.page });
      }
      if (e.data?.type === 'style-change' && props.onInlineEdit) {
        props.onInlineEdit({ [`__style_${e.data.selector}__${e.data.prop}`]: e.data.value });
      }
      if (e.data?.type === 'layout-delete' && props.onInlineEdit) {
        props.onInlineEdit({ [`__style_${e.data.selector}__display`]: 'none' });
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [props.onInlineEdit, props.onNavigatePage]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow || !props.activeViewName || !props.htmlPages?.length) return;
    const match = props.htmlPages.find(p => p.name === props.activeViewName);
    if (match) {
      const m = match.selector.match(/data-page="([^"]+)"/);
      if (m) {
        iframe.contentWindow.postMessage({ type: 'navigate-page', page: m[1] }, '*');
      }
    }
  }, [props.activeViewName, props.htmlPages]);

  const setTool = useCallback((tool: EditTool) => {
    const iframe = iframeRef.current;
    setActiveTool(tool);
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'set-tool', tool }, '*');
    }
  }, []);

  const iframeScale = containerSize.w > 0
    ? Math.min(containerSize.w / DESIGN_W, containerSize.h / DESIGN_H)
    : 1;

  const isActive = activeTool !== 'off';

  if (activeMode === 'html' && finalHtml) {
    const tools: { id: EditTool; icon: typeof Pencil; label: string; color: string }[] = [
      { id: 'layout', icon: Move, label: 'Layout', color: 'bg-blue-500' },
      { id: 'text', icon: Pencil, label: 'Textos/Imagens', color: 'bg-indigo-500' },
      { id: 'style', icon: Paintbrush, label: 'Estilos CSS', color: 'bg-pink-500' },
      { id: 'navigate', icon: Link2, label: 'Navegação', color: 'bg-amber-500' },
      { id: 'inspect', icon: Eye, label: 'Inspecionar', color: 'bg-emerald-500' },
    ];

    return (
      <div ref={containerRef} className="w-full h-full relative overflow-hidden group" style={{ borderRadius: props.borderRadius || 0 }}>
        <iframe
          ref={iframeRef}
          srcDoc={finalHtml}
          sandbox="allow-scripts allow-same-origin"
          scrolling={props.scrolling === false ? 'no' : 'auto'}
          title="HTML embed"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: DESIGN_W,
            height: DESIGN_H,
            border: 'none',
            transformOrigin: 'top left',
            transform: `scale(${iframeScale})`,
            pointerEvents: (isActive || props.onNavigatePage) ? 'auto' : 'none',
          }}
        />
        {/* Floating toolbar */}
        <div
          className={`absolute top-1.5 right-1.5 z-50 flex items-center gap-0.5 rounded-lg shadow-xl backdrop-blur-md transition-all ${
            isActive ? 'bg-black/80 p-1' : 'bg-black/50 p-0.5 opacity-0 group-hover:opacity-100'
          }`}
          style={{ pointerEvents: 'auto' }}
        >
          {tools.map(({ id, icon: Icon, label, color }) => (
            <button
              key={id}
              onClick={(e) => { e.stopPropagation(); setTool(activeTool === id ? 'off' : id); }}
              className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-[9px] font-semibold transition-all ${
                activeTool === id
                  ? `${color} text-white ring-1 ring-white/30`
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={label}
            >
              <Icon className="w-3 h-3" />
              {isActive && activeTool === id && <span className="max-w-[80px] truncate">{label}</span>}
            </button>
          ))}
          {isActive && (
            <button
              onClick={(e) => { e.stopPropagation(); setTool('off'); }}
              className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10"
              title="Desativar"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        {/* Status bar */}
        {isActive && (
          <div
            className={`absolute bottom-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full text-white text-[10px] font-medium shadow-lg backdrop-blur-sm ${
              activeTool === 'layout' ? 'bg-blue-500/90' : activeTool === 'text' ? 'bg-indigo-500/90' : activeTool === 'style' ? 'bg-pink-500/90' : activeTool === 'navigate' ? 'bg-amber-500/90' : 'bg-emerald-500/90'
            }`}
            style={{ pointerEvents: 'none' }}
          >
            {activeTool === 'layout' && 'Clique para selecionar • Arraste para mover • Delete para excluir • Setas para ajustar'}
            {activeTool === 'text' && 'Clique em textos para editar • Clique em imagens para trocar'}
            {activeTool === 'style' && 'Clique em qualquer elemento para editar cores, fontes, fundo e tamanhos'}
            {activeTool === 'navigate' && 'Clique em um elemento para definir navegação entre páginas'}
            {activeTool === 'inspect' && 'Passe o mouse para inspecionar • Clique para ver detalhes'}
          </div>
        )}
      </div>
    );
  }

  if (activeMode === 'url' && !url) {
    return <Placeholder icon={Globe} label="Cole a URL do site ou HTML" gradient="bg-gradient-to-br from-gray-800 to-gray-900" />;
  }
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ borderRadius: props.borderRadius || 0 }}>
      <iframe
        src={url}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-popups"
        loading="lazy"
        title="Iframe embed"
      />
      <div className="absolute inset-0" />
    </div>
  );
}
