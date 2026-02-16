import { User, MessageSquare } from 'lucide-react';
import type { PageBuilderConfig } from '@/types/page-builder';

interface TotemCanvasProps {
  config: PageBuilderConfig;
  className?: string;
}

export function TotemCanvas({ config, className = '' }: TotemCanvasProps) {
  const { canvas, components } = config;
  const isVertical = canvas.orientation === 'vertical';

  const getBackground = (): React.CSSProperties => {
    const bg = canvas.background;
    if (bg.type === 'gradient' && bg.gradient) return { background: bg.gradient };
    if (bg.type === 'image' && bg.image_url) return { background: `url(${bg.image_url}) center/cover no-repeat` };
    return { backgroundColor: bg.color };
  };

  const chatSide = components.chat_interface.position.includes('right') ? 'right' : 'left';
  const chatVertical = components.chat_interface.position.includes('top') ? 'top' : 'bottom';

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 border-border shadow-2xl ${className}`}
      style={{
        ...getBackground(),
        aspectRatio: isVertical ? '9/16' : '16/9',
      }}
    >
      {/* Particles */}
      {canvas.environment.show_particles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/15 animate-pulse"
              style={{
                width: `${2 + (i % 4)}px`,
                height: `${2 + (i % 4)}px`,
                left: `${5 + i * 4.5}%`,
                top: `${5 + (i % 7) * 13}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + (i % 3) * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Avatar */}
      {components.avatar.enabled && (
        <div
          className="absolute bottom-0 flex flex-col items-center transition-all duration-300"
          style={{
            left: components.avatar.position === 'left' ? '20%' : components.avatar.position === 'center' ? '50%' : '80%',
            transform: `translateX(-50%) scale(${components.avatar.scale / 1.8})`,
            transformOrigin: 'bottom center',
            bottom: canvas.environment.show_floor ? '12%' : '0',
          }}
        >
          <div
            className="w-20 h-28 rounded-xl border-2 border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-sm"
            style={{ backgroundColor: components.avatar.colors.shirt + '99' }}
          >
            <User className="w-10 h-10 text-white/70" />
          </div>
          <div
            className="w-12 h-8 rounded-b-lg -mt-1"
            style={{ backgroundColor: components.avatar.colors.pants + '99' }}
          />
        </div>
      )}

      {/* Header */}
      {components.chat_interface.enabled && components.chat_interface.header.show && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
          <span className="text-base">{components.chat_interface.header.icon}</span>
          <div>
            <p className="text-[10px] font-bold text-white leading-tight">{components.chat_interface.header.title}</p>
            <p className="text-[8px] text-white/60">{components.chat_interface.header.subtitle}</p>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {components.chat_interface.enabled && (
        <div
          className="absolute w-[45%] transition-all duration-300"
          style={{
            [chatSide]: '4%',
            [chatVertical]: chatVertical === 'top' ? '15%' : '18%',
          }}
        >
          {/* CTA bubble */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 p-3 mb-2">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-sm">{components.chat_interface.menu.cta_icon}</span>
              <span className="text-[9px] text-white/80 font-medium">{components.chat_interface.menu.cta_text}</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-4/5 rounded-full bg-white/15" />
              <div className="h-1.5 w-3/5 rounded-full bg-white/10" />
            </div>
          </div>

          {/* Menu categories */}
          <div className="space-y-2 max-h-[50%] overflow-hidden">
            {components.chat_interface.menu.categories.slice(0, 3).map((cat, ci) => (
              <div key={ci}>
                <p className="text-[8px] font-semibold text-white/40 mb-1 uppercase tracking-wider">
                  {cat.icon} {cat.title}
                </p>
                <div className="flex flex-wrap gap-1">
                  {cat.buttons.slice(0, 4).map((btn, bi) => (
                    <div
                      key={bi}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r ${btn.color} text-white text-[8px] font-medium shadow-md`}
                    >
                      <span className="text-[8px]">{btn.emoji}</span>
                      <span>{btn.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floor */}
      {canvas.environment.show_floor && (
        <div
          className="absolute bottom-0 w-full h-[10%] transition-all duration-300"
          style={{ backgroundColor: canvas.environment.floor_color || '#1a1a2e' }}
        />
      )}

      {/* Orientation label */}
      <div className="absolute top-2 right-2 bg-black/50 text-white/40 text-[7px] px-1.5 py-0.5 rounded font-mono uppercase">
        {canvas.orientation === 'vertical' ? '9:16' : '16:9'}
      </div>
    </div>
  );
}
