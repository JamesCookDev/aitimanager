import { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { Placeholder } from './Placeholder';
import { applyFieldOverrides } from '../../utils/htmlEditableFields';

const DESIGN_W = 1080;
const DESIGN_H = 1920;

interface IframeProps {
  _iframeMode?: 'html' | 'url';
  url?: string;
  htmlContent?: string;
  fieldOverrides?: Record<string, string>;
  borderRadius?: number;
  scrolling?: boolean;
  /** When true, enable inline text editing inside the iframe */
  editMode?: boolean;
  /** Callback when text is edited inline */
  onInlineEdit?: (overrides: Record<string, string>) => void;
  /** Active view/page name to sync data-page navigation */
  activeViewName?: string;
  /** Pages detected in HTML */
  htmlPages?: { id: string; name: string; selector: string }[];
  /** Callback when a button/link inside the iframe requests page navigation */
  onNavigatePage?: (pageName: string) => void;
}

export function IframePlaceholder(props: IframeProps) {
  const url = props.url || '';
  const htmlContent = props.htmlContent || '';
  // Determine active mode: explicit flag or fallback to content detection
  const activeMode = props._iframeMode || (htmlContent ? 'html' : 'url');
  const overrides = props.fieldOverrides;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
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

  // Apply editable field overrides to raw HTML
  const finalHtml = useMemo(() => {
    if (!htmlContent) return '';
    let html = htmlContent;
    if (overrides && Object.keys(overrides).length > 0) {
      html = applyFieldOverrides(html, overrides);
    }
    const editScript = `
<script>
(function() {
  // ── Page navigation via clicks ──
  document.addEventListener('click', function(e) {
    var el = e.target;
    // Walk up to find navigable element
    while (el && el !== document.body) {
      var nav = el.getAttribute('data-navigate');
      if (nav) {
        e.preventDefault();
        e.stopPropagation();
        window.parent.postMessage({ type: 'navigate-page-click', page: nav }, '*');
        return;
      }
      // Check href="#page-name" links
      if (el.tagName === 'A') {
        var href = el.getAttribute('href') || '';
        if (href.startsWith('#')) {
          var pageName = href.substring(1);
          if (pageName) {
            e.preventDefault();
            e.stopPropagation();
            window.parent.postMessage({ type: 'navigate-page-click', page: pageName }, '*');
            return;
          }
        }
      }
      el = el.parentElement;
    }
  }, true);

  // ── Page navigation via postMessage ──
  var editing = false;
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'navigate-page') {
      document.querySelectorAll('[data-page]').forEach(function(p) { p.classList.remove('active'); p.style.display = 'none'; });
      var target = document.querySelector('[data-page="' + e.data.page + '"]');
      if (target) { target.classList.add('active'); target.style.display = 'flex'; }
    }
    if (e.data === 'enable-edit') {
      editing = true;
      document.body.style.cursor = 'text';
      var textEls = document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,li,td,th,label,button');
      textEls.forEach(function(el) {
        if (el.childNodes.length > 0) {
          var hasText = Array.from(el.childNodes).some(function(n) { return n.nodeType === 3 && n.textContent.trim(); });
          if (hasText) {
            el.contentEditable = 'true';
            el.style.outline = 'none';
            el.style.cursor = 'text';
            el.addEventListener('focus', function() {
              el.style.outline = '2px solid #818cf8';
              el.style.outlineOffset = '2px';
              el.style.borderRadius = '4px';
            });
            el.addEventListener('blur', function() {
              el.style.outline = 'none';
              var changes = {};
              document.querySelectorAll('[contenteditable=true]').forEach(function(cel, i) {
                var tag = cel.tagName.toLowerCase();
                var text = cel.textContent.trim();
                changes['inline_' + tag + '_' + i] = text;
              });
              window.parent.postMessage({ type: 'inline-edit', changes: changes }, '*');
            });
          }
        }
      });
      document.querySelectorAll('img').forEach(function(img, i) {
        img.style.cursor = 'pointer';
        img.title = 'Duplo clique para trocar imagem';
        img.addEventListener('dblclick', function() {
          var url = prompt('Nova URL da imagem:', img.src);
          if (url) {
            img.src = url;
            window.parent.postMessage({ type: 'inline-edit-img', index: i, src: url }, '*');
          }
        });
      });
    }
    if (e.data === 'disable-edit') {
      editing = false;
      document.body.style.cursor = '';
      document.querySelectorAll('[contenteditable]').forEach(function(el) {
        el.contentEditable = 'false';
        el.style.cursor = '';
        el.style.outline = 'none';
      });
    }
  });
})();
</script>`;
    // Insert script before </body>
    if (html.includes('</body>')) {
      html = html.replace('</body>', editScript + '</body>');
    } else {
      html += editScript;
    }
    return html;
  }, [htmlContent, overrides]);

  // Listen for inline edit and navigation messages from iframe
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
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [props.onInlineEdit, props.onNavigatePage]);

  // Sync data-page navigation when activeViewName changes
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow || !props.activeViewName || !props.htmlPages?.length) return;
    // Find matching htmlPage by view name
    const match = props.htmlPages.find(p => p.name === props.activeViewName);
    if (match) {
      // Extract data-page value from selector like [data-page="home"]
      const m = match.selector.match(/data-page="([^"]+)"/);
      if (m) {
        iframe.contentWindow.postMessage({ type: 'navigate-page', page: m[1] }, '*');
      }
    }
  }, [props.activeViewName, props.htmlPages]);

  // Toggle edit mode
  const toggleEdit = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    const newState = !isEditing;
    setIsEditing(newState);
    iframe.contentWindow.postMessage(newState ? 'enable-edit' : 'disable-edit', '*');
  }, [isEditing]);

  // Calculate scale to fit design size into container
  const iframeScale = containerSize.w > 0
    ? Math.min(containerSize.w / DESIGN_W, containerSize.h / DESIGN_H)
    : 1;

  // Raw HTML mode — render via srcdoc with CSS transform scaling
  if (activeMode === 'html' && finalHtml) {
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
            pointerEvents: (isEditing || props.onNavigatePage) ? 'auto' : 'none',
          }}
        />
        {/* Edit mode toggle button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleEdit(); }}
          className={`absolute top-2 right-2 z-50 px-2 py-1 rounded-md text-[10px] font-semibold shadow-lg transition-all backdrop-blur-sm ${
            isEditing
              ? 'bg-indigo-500 text-white ring-2 ring-indigo-300'
              : 'bg-black/60 text-white/80 hover:bg-black/80 opacity-0 group-hover:opacity-100'
          }`}
          style={{ pointerEvents: 'auto' }}
          title={isEditing ? 'Sair do modo edição' : 'Editar textos e imagens'}
        >
          {isEditing ? '✏️ Editando — Clique para sair' : '✏️ Editar'}
        </button>
        {isEditing && (
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full bg-indigo-500/90 text-white text-[10px] font-medium shadow-lg backdrop-blur-sm"
            style={{ pointerEvents: 'none' }}
          >
            Clique em qualquer texto para editar • Duplo clique em imagens para trocar
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
