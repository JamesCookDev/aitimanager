import { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { Globe, Pencil, MousePointer, Link2, Eye, X } from 'lucide-react';
import { Placeholder } from './Placeholder';
import { applyFieldOverrides } from '../../utils/htmlEditableFields';

const DESIGN_W = 1080;
const DESIGN_H = 1920;

type EditTool = 'off' | 'text' | 'navigate' | 'inspect';

interface IframeProps {
  _iframeMode?: 'html' | 'url';
  url?: string;
  htmlContent?: string;
  fieldOverrides?: Record<string, string>;
  borderRadius?: number;
  scrolling?: boolean;
  editMode?: boolean;
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

  // Observe container size for responsive scaling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Sync editMode prop from properties panel
  useEffect(() => {
    if (props.editMode && !prevEditMode.current) {
      setTool('text');
    } else if (!props.editMode && prevEditMode.current) {
      setTool('off');
    }
    prevEditMode.current = props.editMode;
  }, [props.editMode]);

  // Apply editable field overrides to raw HTML
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
</style>
<script>
(function() {
  var currentMode = 'off';
  var inspectTooltip = null;

  // ── Page navigation via clicks ──
  document.addEventListener('click', function(e) {
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
    document.querySelectorAll('img').forEach(function(img) { img.style.cursor = ''; img.title = ''; });
    document.body.style.cursor = '';
    if (inspectTooltip) { inspectTooltip.remove(); inspectTooltip = null; }
  }

  function enableText() {
    document.body.style.cursor = 'text';
    var textEls = document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,li,td,th,label,button,div');
    textEls.forEach(function(el) {
      var hasText = Array.from(el.childNodes).some(function(n) { return n.nodeType === 3 && n.textContent.trim(); });
      if (hasText) {
        el.contentEditable = 'true';
        el.style.outline = 'none';
        el.style.cursor = 'text';
        el.addEventListener('focus', function() { el.setAttribute('data-edit-highlight', ''); });
        el.addEventListener('blur', function() {
          el.removeAttribute('data-edit-highlight');
          var changes = {};
          document.querySelectorAll('[contenteditable=true]').forEach(function(cel, i) {
            changes['inline_' + cel.tagName.toLowerCase() + '_' + i] = cel.textContent.trim();
          });
          window.parent.postMessage({ type: 'inline-edit', changes: changes }, '*');
        });
      }
    });
    document.querySelectorAll('img').forEach(function(img, i) {
      img.style.cursor = 'pointer';
      img.title = 'Duplo clique para trocar imagem';
      img.addEventListener('dblclick', function() {
        var url = prompt('Nova URL da imagem:', img.src);
        if (url) { img.src = url; window.parent.postMessage({ type: 'inline-edit-img', index: i, src: url }, '*'); }
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
    // Allow clicking any element to set data-navigate
    document.addEventListener('click', function navClick(e) {
      if (currentMode !== 'navigate') { document.removeEventListener('click', navClick, true); return; }
      var el = e.target;
      if (el.hasAttribute && el.hasAttribute('data-nav-highlight')) return; // already has nav
      // If clicking a non-nav element, prompt to add navigation
      if (el.tagName && !el.hasAttribute('data-navigate') && el !== document.body) {
        e.preventDefault(); e.stopPropagation();
        var page = prompt('Navegar para qual página? (nome do data-page)');
        if (page) {
          el.setAttribute('data-navigate', page);
          el.setAttribute('data-nav-highlight', '');
          el.setAttribute('data-nav-label', '→ ' + page);
          el.style.position = 'relative';
          // Notify parent to persist
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
      // Highlight
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

  // ── Message handler ──
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

  // Listen for messages from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'inline-edit' && props.onInlineEdit) {
        props.onInlineEdit(e.data.changes);
      }
      if (e.data?.type === 'inline-edit-img' && props.onInlineEdit) {
        props.onInlineEdit({ [`img_${e.data.index + 1}`]: e.data.src });
      }
      if (e.data?.type === 'navigate-page-click' && props.onNavigatePage) {
        props.onNavigatePage(e.data.page);
      }
      if (e.data?.type === 'set-navigate' && props.onInlineEdit) {
        // Persist the data-navigate attribute change
        props.onInlineEdit({ [`__nav_${e.data.selector}`]: e.data.page });
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [props.onInlineEdit, props.onNavigatePage]);

  // Sync data-page navigation when activeViewName changes
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

  // Send tool mode to iframe
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

  // Raw HTML mode
  if (activeMode === 'html' && finalHtml) {
    const tools: { id: EditTool; icon: typeof Pencil; label: string; color: string }[] = [
      { id: 'text', icon: Pencil, label: 'Editar textos/imagens', color: 'bg-indigo-500' },
      { id: 'navigate', icon: Link2, label: 'Vincular páginas', color: 'bg-amber-500' },
      { id: 'inspect', icon: Eye, label: 'Inspecionar elemento', color: 'bg-emerald-500' },
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
              activeTool === 'text' ? 'bg-indigo-500/90' : activeTool === 'navigate' ? 'bg-amber-500/90' : 'bg-emerald-500/90'
            }`}
            style={{ pointerEvents: 'none' }}
          >
            {activeTool === 'text' && 'Clique em textos para editar • Duplo clique em imagens para trocar'}
            {activeTool === 'navigate' && 'Clique em um elemento para definir navegação entre páginas'}
            {activeTool === 'inspect' && 'Passe o mouse para inspecionar • Clique para ver detalhes'}
          </div>
        )}
      </div>
    );
  }

  // URL mode
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
