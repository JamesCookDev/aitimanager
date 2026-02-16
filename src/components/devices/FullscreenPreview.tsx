import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Maximize2, User, MessageSquare } from 'lucide-react';

interface LayoutConfig {
  avatar_position: 'left' | 'center' | 'right';
  avatar_scale: number;
  chat_position: 'left' | 'right';
  show_chat_menu: boolean;
  bg_type: 'solid' | 'gradient' | 'image';
  bg_color: string;
  bg_gradient: string;
  bg_image: string;
  show_floor: boolean;
  floor_color: string;
  show_wall: boolean;
  show_particles: boolean;
}

interface MenuCategory {
  category_title: string;
  category_icon: string;
  buttons: { emoji: string; label: string; prompt: string; color: string }[];
}

interface FullscreenPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layout: LayoutConfig;
  title: string;
  subtitle: string;
  categories: MenuCategory[];
}

export function FullscreenPreview({ open, onOpenChange, layout, title, subtitle, categories }: FullscreenPreviewProps) {
  const getPreviewBg = (): string => {
    if (layout.bg_type === 'gradient') return layout.bg_gradient;
    if (layout.bg_type === 'image' && layout.bg_image) return `url(${layout.bg_image}) center/cover no-repeat`;
    return layout.bg_color;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-screen h-screen p-0 border-0 rounded-none bg-black [&>button]:hidden">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10"
          onClick={() => onOpenChange(false)}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Label */}
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-white/70" />
          <span className="text-xs text-white/70 font-medium">Preview em Tela Cheia</span>
        </div>

        {/* Totem simulation */}
        <div className="w-full h-full relative overflow-hidden" style={{ background: getPreviewBg() }}>
          {/* Wall */}
          {layout.show_wall && (
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.2) 100%)',
            }} />
          )}

          {/* Particles */}
          {layout.show_particles && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white/15 animate-pulse"
                  style={{
                    width: `${3 + (i % 4)}px`,
                    height: `${3 + (i % 4)}px`,
                    left: `${5 + i * 3}%`,
                    top: `${5 + (i % 8) * 12}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: `${2 + (i % 3) * 0.6}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Avatar */}
          <div
            className="absolute bottom-0 flex flex-col items-center transition-all duration-500"
            style={{
              left: layout.avatar_position === 'left' ? '20%' : layout.avatar_position === 'center' ? '50%' : '80%',
              transform: `translateX(-50%) scale(${layout.avatar_scale / 1.5})`,
              transformOrigin: 'bottom center',
            }}
          >
            <div className="w-32 h-48 rounded-2xl bg-primary/40 border-2 border-primary/30 flex items-center justify-center mb-2 shadow-2xl backdrop-blur-sm">
              <User className="w-16 h-16 text-primary-foreground/60" />
            </div>
          </div>

          {/* Chat panel */}
          <div
            className="absolute top-8 w-80 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 p-6 transition-all duration-500"
            style={{ [layout.chat_position === 'left' ? 'left' : 'right']: '5%' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/60 font-medium">Chat</span>
            </div>
            <div className="space-y-3">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-white">{title || 'Assistente Virtual'}</h3>
                <p className="text-sm text-white/60">{subtitle || 'Como posso ajudar?'}</p>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-4/5 rounded-full bg-white/15" />
                <div className="h-2 w-3/5 rounded-full bg-white/10" />
                <div className="h-2 w-2/3 rounded-full bg-white/8" />
              </div>
            </div>
          </div>

          {/* Menu categories */}
          {layout.show_chat_menu && (
            <div
              className="absolute bottom-32 w-96 transition-all duration-500"
              style={{ [layout.chat_position === 'left' ? 'left' : 'right']: '5%' }}
            >
              {categories.map((cat, ci) => (
                <div key={ci} className="mb-4">
                  <p className="text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">
                    {cat.category_icon} {cat.category_title}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cat.buttons.map((btn, bi) => (
                      <div
                        key={bi}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r ${btn.color} text-white text-sm font-medium shadow-lg cursor-pointer hover:scale-105 transition-transform`}
                      >
                        <span>{btn.emoji}</span>
                        <span>{btn.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Floor */}
          {layout.show_floor && (
            <div className="absolute bottom-0 w-full h-24 transition-all duration-500" style={{ background: layout.floor_color }} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
