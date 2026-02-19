import React, { useEffect, useRef, useState } from 'react';
import { useNode, UserComponent } from '@craftjs/core';
import { AvatarBlockSettings } from '../settings/AvatarBlockSettings';
import { DEFAULT_LAYOUT_PROPS, getLayoutStyle } from '../shared/layoutProps';

export interface AvatarBlockProps {
  enabled: boolean;
  avatarName: string;
  position: 'left' | 'center' | 'right';
  scale: number;
  height: number;
  borderRadius: number;
  bgColor: string;
  avatarUrl: string;
  animationsUrl: string;
  idleAnimation: string;
  talkingAnimation: string;
  roughness: number;
  metalness: number;
  shirtColor: string;
  pantsColor: string;
  shoesColor: string;
  // new: extra appearance
  skinColor: string;
  hairColor: string;
  showFloor: boolean;
  showGlow: boolean;
  ambientIntensity: number;
}

const positionX: Record<string, string> = { left: '22%', center: '50%', right: '78%' };

// ── Silhouette SVG — detalhada com skin/hair/clothing ──────────────────────────
function AvatarSilhouette({
  shirtColor, pantsColor, shoesColor, skinColor, hairColor, scale, isTalking,
}: {
  shirtColor: string; pantsColor: string; shoesColor: string;
  skinColor: string; hairColor: string; scale: number; isTalking: boolean;
}) {
  const s = Math.min(Math.max(scale, 0.5), 3);
  const h = 100 * (s / 1.5);

  // mouth morph (animated)
  const [mouthOpen, setMouthOpen] = useState(0);
  useEffect(() => {
    if (!isTalking) { setMouthOpen(0); return; }
    let animId: number;
    const step = () => {
      setMouthOpen(0.3 + Math.random() * 0.5);
      animId = window.setTimeout(step, 80 + Math.random() * 120);
    };
    step();
    return () => clearTimeout(animId);
  }, [isTalking]);

  // blink
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const schedule = () => setTimeout(() => {
      setBlink(true);
      setTimeout(() => { setBlink(false); schedule(); }, 130);
    }, 2500 + Math.random() * 3500);
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  const mouthH = 2 + mouthOpen * 5;
  const eyeScale = blink ? 0 : 1;

  return (
    <svg
      width="64"
      height={h}
      viewBox="0 0 60 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
    >
      {/* Hair top */}
      <ellipse cx="30" cy="11" rx="13" ry="9" fill={hairColor} />
      {/* Head */}
      <circle cx="30" cy="19" r="13" fill={skinColor} />
      {/* Hair back */}
      <ellipse cx="30" cy="13" rx="12" ry="7" fill={hairColor} opacity={0.7} />
      {/* Eyebrows */}
      <path d="M22 14 Q25 12 28 14" stroke={hairColor} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M32 14 Q35 12 38 14" stroke={hairColor} strokeWidth="1.5" strokeLinecap="round" />
      {/* Eyes */}
      <ellipse cx="25" cy="18" rx="3" ry={3 * eyeScale} fill="#1a1a2e" />
      <ellipse cx="35" cy="18" rx="3" ry={3 * eyeScale} fill="#1a1a2e" />
      {/* Eye shine */}
      {!blink && <><circle cx="26" cy="17" r="0.8" fill="white" /><circle cx="36" cy="17" r="0.8" fill="white" /></>}
      {/* Nose */}
      <path d="M28 21 Q30 24 32 21" stroke={skinColor} strokeWidth="1.2" fill="none" opacity={0.5} />
      {/* Mouth */}
      {isTalking ? (
        <ellipse cx="30" cy="26" rx="4" ry={mouthH} fill="#1a0a0a" />
      ) : (
        <path d="M26 26 Q30 29 34 26" stroke="#c4785a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      )}
      {/* Neck */}
      <rect x="26.5" y="30" width="7" height="6" rx="2" fill={skinColor} />
      {/* Torso / Shirt */}
      <path d="M14 36 Q14 33 20 31 L26.5 35 L33.5 35 L40 31 Q46 33 46 36 L49 64 Q49 66 47 66 L13 66 Q11 66 11 64 Z" fill={shirtColor} />
      {/* Collar */}
      <path d="M26.5 35 Q30 38 33.5 35" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" fill="none" />
      {/* Shirt shading */}
      <path d="M20 38 L18 64" stroke="rgba(0,0,0,0.12)" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 38 L42 64" stroke="rgba(0,0,0,0.12)" strokeWidth="3" strokeLinecap="round" />
      {/* Left arm */}
      <path d="M14 36 L5 58 Q4 62 8 62 L14 60 L16 44 Z" fill={shirtColor} opacity={0.9} />
      {/* Right arm */}
      <path d="M46 36 L55 58 Q56 62 52 62 L46 60 L44 44 Z" fill={shirtColor} opacity={0.9} />
      {/* Hands */}
      <ellipse cx="7" cy="62" rx="4" ry="3.5" fill={skinColor} />
      <ellipse cx="53" cy="62" rx="4" ry="3.5" fill={skinColor} />
      {/* Belt */}
      <rect x="13" y="64" width="34" height="4.5" rx="1.5" fill="rgba(0,0,0,0.35)" />
      <rect x="27" y="64" width="6" height="4.5" rx="1" fill="rgba(255,255,255,0.1)" />
      {/* Left leg */}
      <path d="M13 68.5 L15 104 Q15 107 19 107 L29 107 L30 68.5 Z" fill={pantsColor} />
      {/* Right leg */}
      <path d="M47 68.5 L45 104 Q45 107 41 107 L31 107 L30 68.5 Z" fill={pantsColor} />
      {/* Pants shading */}
      <path d="M21 68 L20 104" stroke="rgba(0,0,0,0.1)" strokeWidth="2" strokeLinecap="round" />
      <path d="M39 68 L40 104" stroke="rgba(0,0,0,0.1)" strokeWidth="2" strokeLinecap="round" />
      {/* Left shoe */}
      <path d="M15 104 L11 113 Q10 117 16 117 L29 117 Q32 117 30 113 L29 107 L19 107 Z" fill={shoesColor} />
      {/* Right shoe */}
      <path d="M45 104 L49 113 Q50 117 44 117 L31 117 Q28 117 30 113 L31 107 L41 107 Z" fill={shoesColor} />
      {/* Shoe shine */}
      <ellipse cx="19" cy="110" rx="5" ry="2" fill="rgba(255,255,255,0.08)" />
      <ellipse cx="41" cy="110" rx="5" ry="2" fill="rgba(255,255,255,0.08)" />
    </svg>
  );
}

// ── AvatarBlock ───────────────────────────────────────────────────────────────
export const AvatarBlock: UserComponent<Partial<AvatarBlockProps>> = (props) => {
  const {
    enabled = true,
    avatarName = 'Assistente',
    position = 'center',
    scale = 1.5,
    height = 300,
    borderRadius = 16,
    bgColor = 'rgba(255,255,255,0.03)',
    shirtColor = '#1E3A8A',
    pantsColor = '#1F2937',
    shoesColor = '#111111',
    skinColor = '#e8beac',
    hairColor = '#3d2b1f',
    showFloor = true,
    showGlow = true,
  } = props;

  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  const layoutStyle = getLayoutStyle(props as any);

  // Simulate speaking preview when block is selected
  const [previewTalking, setPreviewTalking] = useState(false);
  useEffect(() => {
    if (!isActive) { setPreviewTalking(false); return; }
    const cycle = () => setTimeout(() => {
      setPreviewTalking(true);
      setTimeout(() => { setPreviewTalking(false); cycle(); }, 1800 + Math.random() * 1200);
    }, 2000 + Math.random() * 2000);
    const t = cycle();
    return () => clearTimeout(t);
  }, [isActive]);

  const px = positionX[position] || '50%';

  return (
    <div style={{ ...layoutStyle, cursor: 'move', pointerEvents: 'auto' }}>
      <div
        ref={(ref) => { if (ref) connect(drag(ref)); }}
        className={`transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      >
      {enabled ? (
        <div
          className="relative overflow-hidden select-none"
          style={{ height, borderRadius, backgroundColor: bgColor, border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Floor grid */}
          {showFloor && (
            <div className="absolute inset-0 opacity-[0.07]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
              maskImage: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 55%)',
              WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 55%)',
            }} />
          )}

          {/* Ambient glow orb */}
          {showGlow && (
            <div className="absolute rounded-full pointer-events-none" style={{
              width: 140,
              height: 140,
              left: `calc(${px} - 70px)`,
              bottom: '8%',
              background: `radial-gradient(circle, ${shirtColor}55 0%, transparent 70%)`,
              filter: 'blur(24px)',
              animation: 'pulse 3s ease-in-out infinite',
            }} />
          )}

          {/* Ground shadow ellipse */}
          <div className="absolute pointer-events-none" style={{
            width: 60,
            height: 12,
            left: `calc(${px} - 30px)`,
            bottom: 12,
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '50%',
            filter: 'blur(6px)',
          }} />

          {/* Avatar silhouette */}
          <div className="absolute flex flex-col items-center" style={{
            left: px,
            bottom: 20,
            transform: 'translateX(-50%)',
            transition: 'left 0.3s ease',
          }}>
            <AvatarSilhouette
              shirtColor={shirtColor}
              pantsColor={pantsColor}
              shoesColor={shoesColor}
              skinColor={skinColor}
              hairColor={hairColor}
              scale={scale}
              isTalking={previewTalking}
            />
          </div>

          {/* Status bar top */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: previewTalking ? '#f59e0b' : '#10b981',
                  boxShadow: `0 0 6px ${previewTalking ? '#f59e0b' : '#10b981'}`,
                  animation: 'pulse 1.5s infinite',
                }}
              />
              <span className="text-[10px] text-white/70 font-medium">{avatarName}</span>
              {previewTalking && (
                <span className="text-[9px] text-amber-400/80 animate-pulse">falando…</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm text-[9px] text-white/40">
              <span>{position === 'left' ? '← Esq' : position === 'right' ? 'Dir →' : '● Centro'}</span>
              <span>•</span>
              <span>×{scale.toFixed(1)}</span>
            </div>
          </div>

          {/* Speaking wave indicator */}
          {previewTalking && (
            <div className="absolute bottom-6 flex items-end gap-[3px]" style={{ left: px, transform: 'translateX(-50%)' }}>
              {[1, 2, 3, 2, 1].map((h, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full bg-amber-400/70"
                  style={{
                    height: `${h * 4}px`,
                    animation: `pulse ${0.4 + i * 0.08}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 80}ms`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Bottom label */}
          <div className="absolute bottom-1.5 left-0 right-0 text-center">
            <span className="text-[8px] text-white/20 uppercase tracking-[0.2em] font-semibold">Avatar 3D · Preview</span>
          </div>
        </div>
      ) : (
        <div
          className="flex items-center justify-center gap-2"
          style={{ height: 80, borderRadius, backgroundColor: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.1)' }}
        >
          <span className="text-white/20 text-lg">👤</span>
          <span className="text-white/30 text-xs">Avatar desativado</span>
        </div>
      )}
      </div>
    </div>
  );
};

AvatarBlock.craft = {
  props: {
    enabled: true,
    avatarName: 'Assistente',
    position: 'center',
    scale: 1.5,
    height: 300,
    borderRadius: 16,
    bgColor: 'rgba(255,255,255,0.03)',
    avatarUrl: '/models/avatar.glb',
    animationsUrl: '/models/animations.glb',
    idleAnimation: 'Idle',
    talkingAnimation: 'TalkingOne',
    roughness: 0.5,
    metalness: 0.0,
    shirtColor: '#1E3A8A',
    pantsColor: '#1F2937',
    shoesColor: '#111111',
    skinColor: '#e8beac',
    hairColor: '#3d2b1f',
    showFloor: true,
    showGlow: true,
    ambientIntensity: 1.0,
    ...DEFAULT_LAYOUT_PROPS,
  },
  related: { settings: AvatarBlockSettings },
  rules: { canDrag: () => true },
  displayName: 'Avatar',
};
