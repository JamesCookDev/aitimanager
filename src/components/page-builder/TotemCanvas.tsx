import { useState, useRef, useEffect } from 'react';
import { User, MessageSquare, Play, Clock, ImageIcon } from 'lucide-react';
import type { PageBuilderConfig, SnapPosition, Layer } from '@/types/page-builder';
import { snapPositionToStyle, getSnapFromRelative } from '@/types/page-builder';

// Selection can be a fixed element name or a layer ID
export type CanvasSelection = string | null;

interface TotemCanvasProps {
  config: PageBuilderConfig;
  className?: string;
  interactive?: boolean;
  selectedElement?: CanvasSelection;
  onSelectElement?: (element: CanvasSelection) => void;
  onUpdateConfig?: (config: PageBuilderConfig) => void;
}

export function TotemCanvas({
  config, className = '', interactive = false,
  selectedElement = null, onSelectElement, onUpdateConfig,
}: TotemCanvasProps) {
  const { canvas, components } = config;
  const isVertical = canvas.orientation === 'vertical';
  const chatStyle = components.chat_interface.style || { opacity: 0.85, blur: 12 };
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [clockTime, setClockTime] = useState(new Date());

  // Clock tick
  useEffect(() => {
    const t = setInterval(() => setClockTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const getBackground = (): React.CSSProperties => {
    const bg = canvas.background;
    if (bg.type === 'gradient' && bg.gradient) return { background: bg.gradient };
    if (bg.type === 'image' && bg.image_url) return { background: `url(${bg.image_url}) center/cover no-repeat` };
    return { backgroundColor: bg.color };
  };

  const chatSide = components.chat_interface.position.includes('right') ? 'right' : 'left';
  const chatVertical = components.chat_interface.position.includes('top') ? 'top' : 'bottom';

  const panelStyle: React.CSSProperties = {
    backgroundColor: `rgba(0, 0, 0, ${chatStyle.opacity * 0.4})`,
    backdropFilter: `blur(${chatStyle.blur}px)`,
    WebkitBackdropFilter: `blur(${chatStyle.blur}px)`,
  };

  // Selection ring
  const selRing = (el: string) =>
    interactive && selectedElement === el
      ? 'ring-2 ring-primary ring-offset-1 ring-offset-transparent'
      : interactive ? 'cursor-pointer hover:ring-2 hover:ring-primary/40 hover:ring-offset-1' : '';

  const handleClick = (el: string, e: React.MouseEvent) => {
    if (!interactive || !onSelectElement) return;
    e.stopPropagation();
    onSelectElement(el);
  };

  // ── Universal drag-to-snap ──────────────────────────────────────────
  const startDrag = (elementId: string, e: React.MouseEvent) => {
    if (!interactive || !onUpdateConfig) return;
    e.stopPropagation();
    e.preventDefault();
    setDragging(elementId);

    const handleMove = (ev: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relX = (ev.clientX - rect.left) / rect.width;
      const relY = (ev.clientY - rect.top) / rect.height;

      if (elementId === 'avatar') {
        const pos = relX < 0.33 ? 'left' : relX > 0.66 ? 'right' : 'center';
        if (pos !== config.components.avatar.position) {
          onUpdateConfig({
            ...config,
            components: { ...config.components, avatar: { ...config.components.avatar, position: pos } },
          });
        }
      } else if (elementId === 'chat') {
        const isRight = relX > 0.5;
        const isTop = relY < 0.5;
        const newPos = `${isTop ? 'top' : 'bottom'}_${isRight ? 'right' : 'left'}` as any;
        if (newPos !== config.components.chat_interface.position) {
          onUpdateConfig({
            ...config,
            components: { ...config.components, chat_interface: { ...config.components.chat_interface, position: newPos } },
          });
        }
      } else if (elementId === 'logo') {
        const snap = getSnapFromRelative(relX, relY);
        if (snap !== config.components.logo.position) {
          onUpdateConfig({
            ...config,
            components: { ...config.components, logo: { ...config.components.logo, position: snap } },
          });
        }
      } else if (elementId.startsWith('text-')) {
        const textId = elementId.replace('text-', '');
        const snap = getSnapFromRelative(relX, relY);
        const items = (config.components.text_banners?.items || []).map(i =>
          i.id === textId ? { ...i, position: snap } : i
        );
        onUpdateConfig({
          ...config,
          components: { ...config.components, text_banners: { ...config.components.text_banners, items } },
        });
      } else if (elementId.startsWith('layer-')) {
        const layerId = elementId;
        const snap = getSnapFromRelative(relX, relY);
        const layers = (config.layers || []).map(l =>
          l.id === layerId ? { ...l, position: snap } : l
        );
        onUpdateConfig({ ...config, layers });
      }
    };

    const handleUp = () => {
      setDragging(null);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  // ── Inline editing ──────────────────────────────────────────────────
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startInlineEdit = (field: string, value: string, e: React.MouseEvent) => {
    if (!interactive || !onUpdateConfig) return;
    e.stopPropagation();
    setEditingField(field);
    setEditValue(value);
  };

  const commitInlineEdit = () => {
    if (!onUpdateConfig || !editingField) return;
    const c = { ...config };
    if (editingField === 'header_title') {
      c.components = { ...c.components, chat_interface: { ...c.components.chat_interface, header: { ...c.components.chat_interface.header, title: editValue } } };
    } else if (editingField === 'header_subtitle') {
      c.components = { ...c.components, chat_interface: { ...c.components.chat_interface, header: { ...c.components.chat_interface.header, subtitle: editValue } } };
    } else if (editingField === 'cta_text') {
      c.components = { ...c.components, chat_interface: { ...c.components.chat_interface, menu: { ...c.components.chat_interface.menu, cta_text: editValue } } };
    }
    onUpdateConfig(c);
    setEditingField(null);
  };

  const InlineInput = ({ field, value, className: cls = '' }: { field: string; value: string; className?: string }) => {
    if (editingField === field) {
      return (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitInlineEdit}
          onKeyDown={(e) => { if (e.key === 'Enter') commitInlineEdit(); if (e.key === 'Escape') setEditingField(null); }}
          className={`bg-white/20 border border-white/40 rounded px-1 outline-none text-white ${cls}`}
          style={{ width: `${Math.max(editValue.length, 4)}ch` }}
          onClick={(e) => e.stopPropagation()}
        />
      );
    }
    return (
      <span
        className={`${interactive ? 'cursor-text hover:bg-white/10 rounded px-0.5 transition-colors' : ''} ${cls}`}
        onDoubleClick={(e) => startInlineEdit(field, value, e)}
      >
        {value}
      </span>
    );
  };

  // Font size mapping
  const fontSizeMap = { sm: '10px', md: '14px', lg: '20px', xl: '28px' };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl border-2 border-border shadow-2xl ${className} ${dragging ? 'cursor-grabbing' : ''}`}
      style={{ ...getBackground(), aspectRatio: isVertical ? '9/16' : '16/9' }}
      onClick={(e) => handleClick('background', e)}
    >
      {/* Particles */}
      {canvas.environment.show_particles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/15 animate-pulse"
              style={{
                width: `${2 + (i % 4)}px`, height: `${2 + (i % 4)}px`,
                left: `${5 + i * 4.5}%`, top: `${5 + (i % 7) * 13}%`,
                animationDelay: `${i * 0.2}s`, animationDuration: `${2 + (i % 3) * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Logo */}
      {components.logo?.enabled && components.logo.url && (
        <div
          style={snapPositionToStyle(components.logo.position)}
          className={`transition-all rounded-lg ${selRing('logo')} ${interactive ? 'cursor-grab active:cursor-grabbing' : ''}`}
          onClick={(e) => handleClick('logo', e)}
          onMouseDown={(e) => startDrag('logo', e)}
        >
          <img
            src={components.logo.url} alt="Logo"
            className="object-contain pointer-events-none"
            style={{ height: `${components.logo.scale * 32}px`, maxWidth: '40%' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          {interactive && dragging === 'logo' && (
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-white/60 bg-black/40 rounded px-1.5 py-0.5 whitespace-nowrap">
              Arraste para posicionar
            </div>
          )}
        </div>
      )}

      {/* Avatar */}
      {components.avatar.enabled && (
        <div
          className={`absolute bottom-0 flex flex-col items-center transition-all duration-300 rounded-lg ${selRing('avatar')} ${
            components.avatar.animation === 'waving' ? 'animate-[wave_1.5s_ease-in-out_infinite]' :
            components.avatar.animation === 'talking' ? 'animate-[talk_1s_ease-in-out_infinite]' :
            components.avatar.animation === 'thinking' ? 'animate-[think_2s_ease-in-out_infinite]' : ''
          } ${interactive ? 'cursor-grab active:cursor-grabbing' : ''}`}
          style={{
            left: components.avatar.position === 'left' ? '20%' : components.avatar.position === 'center' ? '50%' : '80%',
            transform: `translateX(-50%) scale(${components.avatar.scale / 1.8})`,
            transformOrigin: 'bottom center',
            bottom: canvas.environment.show_floor ? '12%' : '0',
          }}
          onClick={(e) => handleClick('avatar', e)}
          onMouseDown={(e) => startDrag('avatar', e)}
        >
          <div
            className="w-20 h-28 rounded-xl border-2 border-white/20 flex items-center justify-center shadow-2xl relative"
            style={{ backgroundColor: components.avatar.colors.shirt + '99', ...panelStyle }}
          >
            <User className="w-10 h-10 text-white/70" />
            {components.avatar.animation === 'talking' && <div className="absolute -top-3 -right-2 text-sm animate-bounce">💬</div>}
            {components.avatar.animation === 'waving' && <div className="absolute -top-3 -right-2 text-sm animate-bounce">👋</div>}
            {components.avatar.animation === 'thinking' && <div className="absolute -top-3 -right-2 text-sm animate-pulse">🤔</div>}
          </div>
          <div className="w-12 h-8 rounded-b-lg -mt-1" style={{ backgroundColor: components.avatar.colors.pants + '99' }} />
          {interactive && dragging === 'avatar' && (
            <div className="absolute -bottom-6 text-[8px] text-white/60 bg-black/40 rounded px-1.5 py-0.5 whitespace-nowrap">
              Arraste para posicionar
            </div>
          )}
        </div>
      )}

      {/* Header */}
      {components.chat_interface.enabled && components.chat_interface.header.show && (
        <div
          className={`absolute z-10 flex items-center gap-2 rounded-full px-4 py-2 border border-white/10 transition-all ${selRing('chat')} ${interactive ? 'cursor-grab active:cursor-grabbing' : ''}`}
          style={{
            ...panelStyle,
            [chatVertical]: chatVertical === 'top' ? '3%' : '3%',
            [chatSide]: '4%',
          }}
          onClick={(e) => handleClick('chat', e)}
          onMouseDown={(e) => startDrag('chat', e)}
        >
          <span className="text-base">{components.chat_interface.header.icon}</span>
          <div>
            <p className="text-[10px] font-bold text-white leading-tight">
              <InlineInput field="header_title" value={components.chat_interface.header.title} />
            </p>
            <p className="text-[8px] text-white/60">
              <InlineInput field="header_subtitle" value={components.chat_interface.header.subtitle} />
            </p>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {components.chat_interface.enabled && (
        <div
          className={`absolute w-[45%] transition-all duration-300 rounded-xl ${selRing('chat')} ${interactive ? 'cursor-grab active:cursor-grabbing' : ''}`}
          style={{ [chatSide]: '4%', [chatVertical]: chatVertical === 'top' ? '15%' : '18%' }}
          onClick={(e) => handleClick('chat', e)}
          onMouseDown={(e) => startDrag('chat', e)}
        >
          <div className="rounded-xl border border-white/10 p-3 mb-2" style={panelStyle}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-sm">{components.chat_interface.menu.cta_icon}</span>
              <span className="text-[9px] text-white/80 font-medium">
                <InlineInput field="cta_text" value={components.chat_interface.menu.cta_text} />
              </span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-4/5 rounded-full bg-white/15" />
              <div className="h-1.5 w-3/5 rounded-full bg-white/10" />
            </div>
          </div>
          <div className="space-y-2 max-h-[50%] overflow-hidden">
            {components.chat_interface.menu.categories.slice(0, 3).map((cat, ci) => (
              <div key={ci}>
                <p className="text-[8px] font-semibold text-white/40 mb-1 uppercase tracking-wider">{cat.icon} {cat.title}</p>
                <div className="flex flex-wrap gap-1">
                  {cat.buttons.slice(0, 4).map((btn, bi) => (
                    <div key={bi} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r ${btn.color} text-white text-[8px] font-medium shadow-md`}>
                      <span className="text-[8px]">{btn.emoji}</span><span>{btn.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {interactive && dragging === 'chat' && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-white/60 bg-black/40 rounded px-1.5 py-0.5 whitespace-nowrap">
              Arraste para posicionar
            </div>
          )}
        </div>
      )}

      {/* Text Banners */}
      {components.text_banners?.enabled && components.text_banners.items.map((item) => (
        <div
          key={item.id}
          style={snapPositionToStyle(item.position)}
          className={`transition-all rounded ${selRing(`text-${item.id}`)} ${interactive ? 'cursor-grab active:cursor-grabbing' : ''}`}
          onClick={(e) => handleClick(`text-${item.id}`, e)}
          onMouseDown={(e) => startDrag(`text-${item.id}`, e)}
        >
          <span style={{
            fontSize: fontSizeMap[item.fontSize], color: item.color,
            fontWeight: item.bold ? 700 : 400,
            backgroundColor: item.bgEnabled ? item.bgColor : 'transparent',
            padding: item.bgEnabled ? '2px 8px' : '0',
            borderRadius: '4px', lineHeight: 1.3,
          }}>
            {item.text}
          </span>
          {interactive && dragging === `text-${item.id}` && (
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-white/60 bg-black/40 rounded px-1.5 py-0.5 whitespace-nowrap">
              Arraste para posicionar
            </div>
          )}
        </div>
      ))}

      {/* ── Generic Layers ──────────────────────────────────────────── */}
      {(config.layers || []).filter(l => l.visible).map((layer) => (
        <div
          key={layer.id}
          style={snapPositionToStyle(layer.position)}
          className={`transition-all rounded ${selRing(layer.id)} ${interactive ? 'cursor-grab active:cursor-grabbing' : ''}`}
          onClick={(e) => handleClick(layer.id, e)}
          onMouseDown={(e) => startDrag(layer.id, e)}
        >
          {layer.type === 'image' && layer.url && (
            <img
              src={layer.url} alt={layer.label}
              className="pointer-events-none object-contain"
              style={{
                maxHeight: `${layer.scale * 60}px`, maxWidth: '45%',
                opacity: layer.opacity, borderRadius: `${layer.borderRadius}px`,
              }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          {layer.type === 'image' && !layer.url && (
            <div className="w-16 h-16 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center bg-white/5">
              <ImageIcon className="w-6 h-6 text-white/40" />
            </div>
          )}

          {layer.type === 'video' && (
            <div className="relative" style={{ width: `${layer.scale * 80}px` }}>
              {layer.url ? (
                <video
                  src={layer.url}
                  className="w-full rounded-lg pointer-events-none"
                  autoPlay={layer.autoplay} loop={layer.loop} muted={layer.muted}
                  playsInline
                />
              ) : (
                <div className="w-20 h-14 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center bg-white/5">
                  <Play className="w-6 h-6 text-white/40" />
                </div>
              )}
            </div>
          )}

          {layer.type === 'shape' && (
            <div style={{
              width: `${layer.width}px`, height: layer.shape === 'divider' ? '2px' : `${layer.height}px`,
              backgroundColor: layer.color, opacity: layer.opacity,
              borderRadius: layer.shape === 'circle' ? '50%' : layer.shape === 'divider' ? '1px' : '4px',
            }} />
          )}

          {layer.type === 'clock' && (
            <div style={{ color: layer.color, fontSize: fontSizeMap[layer.fontSize] }} className="font-mono whitespace-nowrap">
              <div className="font-bold">
                {layer.format === '12h'
                  ? clockTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: true })
                  : clockTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })
                }
              </div>
              {layer.showDate && (
                <div style={{ fontSize: '0.6em' }} className="opacity-70">
                  {clockTime.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              )}
            </div>
          )}

          {interactive && dragging === layer.id && (
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-white/60 bg-black/40 rounded px-1.5 py-0.5 whitespace-nowrap">
              Arraste para posicionar
            </div>
          )}
        </div>
      ))}

      {/* Floor */}
      {canvas.environment.show_floor && (
        <div className="absolute bottom-0 w-full h-[10%] transition-all duration-300" style={{ backgroundColor: canvas.environment.floor_color || '#1a1a2e' }} />
      )}

      {/* Orientation label */}
      <div className="absolute top-2 right-2 bg-black/50 text-white/40 text-[7px] px-1.5 py-0.5 rounded font-mono uppercase pointer-events-none">
        {canvas.orientation === 'vertical' ? '9:16' : '16:9'}
      </div>

      {/* Snap grid overlay when dragging */}
      {interactive && dragging && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {/* 3x3 grid lines */}
          <div className="absolute top-[33%] left-0 right-0 h-px bg-white/10" />
          <div className="absolute top-[66%] left-0 right-0 h-px bg-white/10" />
          <div className="absolute left-[33%] top-0 bottom-0 w-px bg-white/10" />
          <div className="absolute left-[66%] top-0 bottom-0 w-px bg-white/10" />
        </div>
      )}

      {/* Interaction hint */}
      {interactive && !selectedElement && !dragging && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white/70 text-[9px] px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none animate-pulse">
          Clique num elemento para editar • Arraste para mover
        </div>
      )}
    </div>
  );
}
