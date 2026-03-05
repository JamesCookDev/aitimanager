import { Paintbrush, Check } from 'lucide-react';
import { useState } from 'react';

export interface ThemePalette {
  id: string;
  name: string;
  emoji: string;
  bgColor: string;
  accentColor: string;
  textColor: string;
  cardBgColor: string;
  secondaryColor: string;
}

export const THEME_PALETTES: ThemePalette[] = [
  // Dark themes
  { id: 'midnight', name: 'Midnight', emoji: '🌙', bgColor: '#0f172a', accentColor: '#6366f1', textColor: '#ffffff', cardBgColor: 'rgba(255,255,255,0.08)', secondaryColor: '#818cf8' },
  { id: 'ocean', name: 'Oceano', emoji: '🌊', bgColor: '#0c4a6e', accentColor: '#06b6d4', textColor: '#ffffff', cardBgColor: 'rgba(255,255,255,0.1)', secondaryColor: '#22d3ee' },
  { id: 'forest', name: 'Floresta', emoji: '🌿', bgColor: '#14532d', accentColor: '#22c55e', textColor: '#ffffff', cardBgColor: 'rgba(255,255,255,0.08)', secondaryColor: '#4ade80' },
  { id: 'sunset', name: 'Pôr do Sol', emoji: '🌅', bgColor: '#7c2d12', accentColor: '#f97316', textColor: '#ffffff', cardBgColor: 'rgba(255,255,255,0.1)', secondaryColor: '#fb923c' },
  { id: 'rose', name: 'Rosé', emoji: '🌸', bgColor: '#4c0519', accentColor: '#f43f5e', textColor: '#ffffff', cardBgColor: 'rgba(255,255,255,0.08)', secondaryColor: '#fb7185' },
  { id: 'gold', name: 'Luxo', emoji: '✨', bgColor: '#1c1917', accentColor: '#eab308', textColor: '#ffffff', cardBgColor: 'rgba(255,255,255,0.06)', secondaryColor: '#facc15' },
  { id: 'neon', name: 'Neon', emoji: '💜', bgColor: '#0a0a0a', accentColor: '#a855f7', textColor: '#ffffff', cardBgColor: 'rgba(168,85,247,0.08)', secondaryColor: '#c084fc' },
  { id: 'corporate', name: 'Corporativo', emoji: '🏢', bgColor: '#1e293b', accentColor: '#0ea5e9', textColor: '#ffffff', cardBgColor: 'rgba(255,255,255,0.07)', secondaryColor: '#38bdf8' },
  { id: 'food', name: 'Gastro', emoji: '🍽️', bgColor: '#1a1a2e', accentColor: '#ef4444', textColor: '#ffffff', cardBgColor: 'rgba(239,68,68,0.08)', secondaryColor: '#f87171' },
  { id: 'hotel', name: 'Hotel', emoji: '🏨', bgColor: '#1e1b4b', accentColor: '#c4b5fd', textColor: '#ffffff', cardBgColor: 'rgba(196,181,253,0.08)', secondaryColor: '#a78bfa' },
  // Light themes
  { id: 'clean-light', name: 'Clean Light', emoji: '☀️', bgColor: '#f8fafc', accentColor: '#2563eb', textColor: '#0f172a', cardBgColor: 'rgba(0,0,0,0.04)', secondaryColor: '#3b82f6' },
  { id: 'health', name: 'Saúde', emoji: '🏥', bgColor: '#ecfdf5', accentColor: '#059669', textColor: '#064e3b', cardBgColor: 'rgba(5,150,105,0.06)', secondaryColor: '#10b981' },
  // New palettes
  { id: 'cyberpunk', name: 'Cyberpunk', emoji: '🤖', bgColor: '#0d0d0d', accentColor: '#00ff88', textColor: '#00ff88', cardBgColor: 'rgba(0,255,136,0.06)', secondaryColor: '#ff0055' },
  { id: 'aurora', name: 'Aurora', emoji: '🌌', bgColor: '#0f0f23', accentColor: '#22d3ee', textColor: '#ffffff', cardBgColor: 'rgba(34,211,238,0.08)', secondaryColor: '#a855f7' },
  { id: 'terra', name: 'Terra', emoji: '🏔️', bgColor: '#292524', accentColor: '#d97706', textColor: '#fef3c7', cardBgColor: 'rgba(217,119,6,0.08)', secondaryColor: '#78716c' },
  { id: 'candy', name: 'Candy', emoji: '🍬', bgColor: '#fdf2f8', accentColor: '#ec4899', textColor: '#831843', cardBgColor: 'rgba(236,72,153,0.06)', secondaryColor: '#f472b6' },
  { id: 'arctic', name: 'Ártico', emoji: '❄️', bgColor: '#0e1729', accentColor: '#7dd3fc', textColor: '#e0f2fe', cardBgColor: 'rgba(125,211,252,0.06)', secondaryColor: '#38bdf8' },
  { id: 'vintage', name: 'Vintage', emoji: '📜', bgColor: '#faf5ef', accentColor: '#92400e', textColor: '#451a03', cardBgColor: 'rgba(146,64,14,0.05)', secondaryColor: '#b45309' },
  { id: 'gaming', name: 'Gaming', emoji: '🎮', bgColor: '#09090b', accentColor: '#ef4444', textColor: '#fafafa', cardBgColor: 'rgba(239,68,68,0.06)', secondaryColor: '#f97316' },
  { id: 'nature', name: 'Natureza', emoji: '🌳', bgColor: '#f0fdf4', accentColor: '#16a34a', textColor: '#14532d', cardBgColor: 'rgba(22,163,74,0.06)', secondaryColor: '#22c55e' },
];

interface Props {
  currentBgColor: string;
  onApply: (palette: ThemePalette) => void;
}

export function ThemePalettesPicker({ currentBgColor, onApply }: Props) {
  const [appliedId, setAppliedId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-1">
        <Paintbrush className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">Temas</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {THEME_PALETTES.map((palette) => {
          const isActive = appliedId === palette.id;
          return (
            <button
              key={palette.id}
              onClick={() => { onApply(palette); setAppliedId(palette.id); }}
              className={`relative flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                isActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40 hover:bg-muted/30'
              }`}
            >
              {isActive && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{palette.emoji}</span>
                  <span className="text-[10px] font-medium">{palette.name}</span>
                </div>
                <div className="flex gap-0.5">
                  <div className="w-4 h-4 rounded-sm border border-white/10" style={{ background: palette.bgColor }} />
                  <div className="w-4 h-4 rounded-sm" style={{ background: palette.accentColor }} />
                  <div className="w-4 h-4 rounded-sm" style={{ background: palette.secondaryColor }} />
                  <div className="w-4 h-4 rounded-sm border border-white/10" style={{ background: palette.textColor }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
