import { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { Globe, Pencil, Link2, Eye, X, Paintbrush, Move, Trash2 } from 'lucide-react';
import { Placeholder } from './Placeholder';
import { applyFieldOverrides } from '../../utils/htmlEditableFields';

const DESIGN_W = 1080;
const DESIGN_H = 1920;

type EditTool = 'off' | 'text' | 'navigate' | 'inspect' | 'style' | 'layout';

interface NavElementInfo {
  selector: string;
  tag: string;
  text: string;
  currentNavigate: string;
}

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
  availableViews?: { id: string; name: string }[];
  onNavElementSelected?: (info: NavElementInfo) => void;
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
  // Freeze the srcDoc while editing so iframe doesn't reload on every change
  const frozenHtmlRef = useRef<string | null>(null);
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const setToolRef = useRef<(tool: EditTool) => void>(() => {});

  useEffect(() => {
    if (props.editMode && !prevEditMode.current) {
      frozenHtmlRef.current = null;
      // Default to layout mode — click any element to see CRUD toolbar
      setTimeout(() => setToolRef.current('layout'), 0);
    } else if (!props.editMode && prevEditMode.current) {
      frozenHtmlRef.current = null;
      setTimeout(() => setToolRef.current('off'), 0);
    }
    prevEditMode.current = props.editMode;
  }, [props.editMode]);

  // Escape key exits editing
  useEffect(() => {
    if (activeTool === 'off') return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setToolRef.current('off');
      }
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [activeTool]);

  // Sync tool from props panel
  useEffect(() => {
    if (props._activeTool && props.editMode) {
      setTool(props._activeTool as EditTool);
    }
  }, [props._activeTool]);

  const finalHtml = useMemo(() => {
    if (!htmlContent) return '';
    // While in edit mode, freeze the srcDoc so edits don't reload the iframe
    if (props.editMode && frozenHtmlRef.current) {
      return frozenHtmlRef.current;
    }
    let html = htmlContent;
    if (overrides && Object.keys(overrides).length > 0) {
      html = applyFieldOverrides(html, overrides);
    }
    const editScript = `
<style>
  [data-edit-highlight] { outline: 2px solid #818cf8 !important; outline-offset: 2px; border-radius: 4px; }
  [data-nav-highlight] { outline: 2px dashed #f59e0b !important; outline-offset: 2px; border-radius: 4px; cursor: pointer !important; }
  [data-nav-highlight]::after { content: attr(data-nav-label); position: absolute; top: -18px; left: 0; background: #f59e0b; color: #000; font-size: 10px; padding: 1px 6px; border-radius: 4px; white-space: nowrap; pointer-events: none; z-index: 9999; }
  /* Persistent badge for linked elements */
  [data-navigate] { position: relative !important; }
  .nav-linked-badge { position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 9998; pointer-events: none; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
  .nav-linked-badge svg { width: 12px; height: 12px; fill: none; stroke: #fff; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
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

  function refreshNavBadges() {
    document.querySelectorAll('.nav-linked-badge').forEach(function(b) { b.remove(); });
    document.querySelectorAll('[data-navigate]').forEach(function(el) {
      var badge = document.createElement('div');
      badge.className = 'nav-linked-badge';
      badge.innerHTML = '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
      badge.title = '→ ' + el.getAttribute('data-navigate');
      el.appendChild(badge);
    });
  }
  // Run on load
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', refreshNavBadges); } else { refreshNavBadges(); }

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
    // Highlight existing navigable elements
    var navEls = document.querySelectorAll('[data-navigate], a[href^="#"]');
    navEls.forEach(function(el) {
      var target = el.getAttribute('data-navigate') || (el.getAttribute('href') || '').substring(1);
      el.setAttribute('data-nav-highlight', '');
      el.setAttribute('data-nav-label', '→ ' + target);
      el.style.position = 'relative';
    });
    // Highlight all interactive elements
    var interactiveEls = document.querySelectorAll('button, [role="button"], a, [class*="btn"], [class*="button"], [onclick], input[type="button"], input[type="submit"], [class*="card"], [class*="item"], [class*="arrow"]');
    interactiveEls.forEach(function(el) {
      if (!el.hasAttribute('data-nav-highlight')) {
        el.style.outline = '2px dashed rgba(245,158,11,0.4)';
        el.style.outlineOffset = '2px';
        el.style.cursor = 'pointer';
      }
    });

    document.addEventListener('click', function navClick(e) {
      if (currentMode !== 'navigate') { document.removeEventListener('click', navClick, true); return; }
      e.preventDefault(); e.stopPropagation();
      var el = e.target;
      // Walk up to find the best interactive parent
      while (el && el !== document.body) {
        var tag = el.tagName.toLowerCase();
        if (tag === 'button' || tag === 'a' || el.getAttribute('role') === 'button' ||
            el.hasAttribute('data-navigate') || el.className.match && el.className.match(/btn|button|card|item|arrow/i)) {
          break;
        }
        el = el.parentElement;
      }
      if (!el || el === document.body) el = e.target;
      
      // Clear previous selection
      document.querySelectorAll('[data-nav-selected]').forEach(function(s) { s.removeAttribute('data-nav-selected'); s.style.outline = ''; });
      el.setAttribute('data-nav-selected', '');
      el.style.outline = '3px solid #f59e0b';
      el.style.outlineOffset = '2px';
      
      var selector = buildSel(el);
      var currentNav = el.getAttribute('data-navigate') || '';
      var text = (el.textContent || '').trim().substring(0, 60);
      var tagName = el.tagName.toLowerCase();
      
      window.parent.postMessage({
        type: 'nav-element-selected',
        selector: selector,
        tag: tagName,
        text: text,
        currentNavigate: currentNav,
      }, '*');
    }, true);
  }

  // Listen for nav assignment from parent props panel
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'assign-navigate') {
      var el = document.querySelector(e.data.selector);
      if (!el) return;
      if (e.data.page) {
        el.setAttribute('data-navigate', e.data.page);
        el.setAttribute('data-nav-highlight', '');
        el.setAttribute('data-nav-label', '→ ' + (e.data.pageName || e.data.page));
        el.style.position = 'relative';
        el.style.cursor = 'pointer';
        el.style.outline = '3px solid #22c55e';
        el.style.outlineOffset = '2px';
        setTimeout(function() { el.style.outline = '2px dashed #f59e0b'; }, 1500);
      } else {
        el.removeAttribute('data-navigate');
        el.removeAttribute('data-nav-highlight');
        el.removeAttribute('data-nav-label');
        el.style.outline = '2px dashed rgba(245,158,11,0.4)';
      }
      refreshNavBadges();
    }
  });

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
    if (e.data && e.data.type === 'set-available-views') {
      window.__availableViews = e.data.views || [];
    }
  });
})();
</script>`;
    if (html.includes('</body>')) {
      html = html.replace('</body>', editScript + '</body>');
    } else {
      html += editScript;
    }
    // Freeze this result if we're in edit mode
    if (props.editMode) {
      frozenHtmlRef.current = html;
    }
    return html;
  }, [htmlContent, overrides, props.editMode]);

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
      if (e.data?.type === 'nav-element-selected' && props.onNavElementSelected) {
        props.onNavElementSelected({
          selector: e.data.selector,
          tag: e.data.tag,
          text: e.data.text,
          currentNavigate: e.data.currentNavigate,
        });
      }
      if (e.data?.type === 'style-change' && props.onInlineEdit) {
        props.onInlineEdit({ [`__style_${e.data.selector}__${e.data.prop}`]: e.data.value });
      }
      if (e.data?.type === 'layout-delete' && props.onInlineEdit) {
        props.onInlineEdit({ [`__delete_${e.data.selector}`]: 'true' });
      }
      if (e.data?.type === 'layout-duplicate' && props.onInlineEdit) {
        props.onInlineEdit({ [`__duplicate_${e.data.selector}`]: 'true' });
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [props.onInlineEdit, props.onNavigatePage, props.onNavElementSelected]);

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
      if (props.availableViews) {
        iframe.contentWindow.postMessage({ type: 'set-available-views', views: props.availableViews }, '*');
      }
      iframe.contentWindow.postMessage({ type: 'set-tool', tool }, '*');
    }
  }, [props.availableViews]);

  // Keep ref in sync for early effects
  setToolRef.current = setTool;

  const iframeScale = containerSize.w > 0
    ? Math.min(containerSize.w / DESIGN_W, containerSize.h / DESIGN_H)
    : 1;

  const isActive = activeTool !== 'off';

  if (activeMode === 'html' && finalHtml) {
    // Simplified tools — hide technical ones by default
    const mainTools: { id: EditTool; icon: typeof Pencil; label: string; color: string; hint: string }[] = [
      { id: 'text', icon: Pencil, label: 'Editar', color: 'bg-indigo-500', hint: 'Clique em textos ou imagens para editar' },
      { id: 'layout', icon: Move, label: 'Mover', color: 'bg-blue-500', hint: 'Arraste elementos para reposicionar' },
      { id: 'navigate', icon: Link2, label: 'Links', color: 'bg-amber-500', hint: 'Vincule botões a páginas' },
    ];

    const advancedTools: { id: EditTool; icon: typeof Pencil; label: string; color: string; hint: string }[] = [
      { id: 'style', icon: Paintbrush, label: 'CSS', color: 'bg-pink-500', hint: 'Edite estilos visuais' },
      { id: 'inspect', icon: Eye, label: 'DOM', color: 'bg-emerald-500', hint: 'Inspecione a estrutura' },
    ];

    const allVisibleTools = showAdvancedTools ? [...mainTools, ...advancedTools] : mainTools;
    const activeToolData = [...mainTools, ...advancedTools].find(t => t.id === activeTool);

    return (
      <div ref={containerRef} className="w-full h-full relative overflow-hidden" style={{ borderRadius: props.borderRadius || 0 }}>
        {/* Glowing border when editing */}
        {isActive && (
          <div
            className="absolute inset-0 z-40 pointer-events-none rounded-lg"
            style={{
              border: `3px solid ${activeToolData?.color === 'bg-blue-500' ? '#3b82f6' : activeToolData?.color === 'bg-indigo-500' ? '#6366f1' : activeToolData?.color === 'bg-pink-500' ? '#ec4899' : activeToolData?.color === 'bg-amber-500' ? '#f59e0b' : '#10b981'}`,
              boxShadow: `0 0 20px ${activeToolData?.color === 'bg-blue-500' ? '#3b82f640' : activeToolData?.color === 'bg-indigo-500' ? '#6366f140' : activeToolData?.color === 'bg-pink-500' ? '#ec489940' : activeToolData?.color === 'bg-amber-500' ? '#f59e0b40' : '#10b98140'}`,
            }}
          />
        )}

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
            pointerEvents: isActive ? 'auto' : 'none',
          }}
        />

        {/* ── Simplified floating toolbar ── */}
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-xl shadow-2xl backdrop-blur-lg transition-all bg-black/85 border border-white/10 p-1.5"
          style={{ pointerEvents: 'auto' }}
        >
          {allVisibleTools.map(({ id, icon: Icon, label, color }) => (
            <button
              key={id}
              onClick={(e) => { e.stopPropagation(); setTool(activeTool === id ? 'off' : id); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
                activeTool === id
                  ? `${color} text-white shadow-lg ring-2 ring-white/20 scale-105`
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title={label}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}

          {/* Toggle advanced tools */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowAdvancedTools(!showAdvancedTools); }}
            className={`px-2 py-2 rounded-lg text-[11px] font-bold transition-all ${
              showAdvancedTools ? 'text-white/80 bg-white/10' : 'text-white/30 hover:text-white/60'
            }`}
            title={showAdvancedTools ? 'Ocultar avançados' : 'Mais ferramentas'}
          >
            ⋯
          </button>

          {isActive && (
            <>
              <div className="w-px h-6 bg-white/20 mx-0.5" />
              <button
                onClick={(e) => { e.stopPropagation(); setTool('off'); }}
                className="p-2 rounded-lg text-red-400/80 hover:text-red-300 hover:bg-red-500/20 transition-all"
                title="Sair da edição (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* ── Hint bar at bottom ── */}
        {isActive && activeToolData && (
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-xl shadow-xl backdrop-blur-md border border-white/10 bg-black/75 pointer-events-none"
          >
            <activeToolData.icon className="w-4 h-4 text-white/80 shrink-0" />
            <span className="text-white/90 text-[11px] font-medium">{activeToolData.hint}</span>
            <span className="text-white/40 text-[10px] ml-2">Esc para sair</span>
          </div>
        )}

        {/* ── Hint when NOT editing ── */}
        {!isActive && !props.editMode && (
          <div
            className="absolute inset-0 z-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          >
            <div className="bg-black/70 backdrop-blur-sm text-white/90 text-xs font-semibold px-4 py-2 rounded-xl border border-white/10 shadow-xl flex items-center gap-2">
              <Pencil className="w-4 h-4" />
              Duplo-clique para editar no canvas
            </div>
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
