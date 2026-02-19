import React from 'react';
import { useNode, UserComponent } from '@craftjs/core';
import { SceneBlockSettings } from '../settings/SceneBlockSettings';
import { DEFAULT_LAYOUT_PROPS, getLayoutStyle } from '../shared/layoutProps';
import type { LayoutProps } from '../shared/layoutProps';

// ── Environment presets disponíveis no drei ──────────────────────────────────
export const ENV_PRESETS = [
  'apartment', 'city', 'dawn', 'forest', 'lobby',
  'night', 'park', 'studio', 'sunset', 'warehouse',
] as const;
export type EnvPreset = typeof ENV_PRESETS[number];

export interface DirectionalLight {
  position: [number, number, number];
  intensity: number;
  color: string;
  castShadow: boolean;
}

export interface SpotLight {
  position: [number, number, number];
  intensity: number;
  angle: number;
  penumbra: number;
  color: string;
  castShadow: boolean;
}

export interface PointLight {
  position: [number, number, number];
  intensity: number;
  color: string;
}

export interface SceneBlockProps extends Partial<LayoutProps> {
  // Environment
  envPreset: EnvPreset;

  // Camera
  camPosX: number; camPosY: number; camPosZ: number;
  camTargetX: number; camTargetY: number; camTargetZ: number;
  camMinDist: number; camMaxDist: number;

  // Lighting — ambient
  ambientEnabled: boolean;
  ambientIntensity: number;
  // Lighting — directional (main)
  dirLightEnabled: boolean;
  dirLightIntensity: number;
  dirLightColor: string;
  dirLightPosX: number; dirLightPosY: number; dirLightPosZ: number;
  dirLightCastShadow: boolean;
  // Lighting — fill directional
  fillLightEnabled: boolean;
  fillLightIntensity: number;
  fillLightColor: string;
  // Lighting — spot
  spotLightEnabled: boolean;
  spotLightIntensity: number;
  spotLightColor: string;
  spotLightPosX: number; spotLightPosY: number; spotLightPosZ: number;
  spotLightAngle: number;
  spotLightPenumbra: number;
  spotLightCastShadow: boolean;
  // Lighting — point (accent 1 + 2)
  pointLight1Enabled: boolean;
  pointLight1Color: string;
  pointLight1Intensity: number;
  pointLight2Enabled: boolean;
  pointLight2Color: string;
  pointLight2Intensity: number;

  // Floor
  showFloor: boolean;
  floorColor: string;
  floorWidth: number; floorHeight: number;
  floorRoughness: number; floorMetalness: number;

  // Wall
  showWall: boolean;
  wallColor: string;
  wallWidth: number; wallHeight: number;
  wallRoughness: number; wallMetalness: number;
  wallPosY: number; wallPosZ: number;

  // Particles
  showParticles: boolean;
  particleCount: number;
  particleColor: string;
  particleSize: number;
  particleSpeed: number;
  particleOpacity: number;
  particleScale: number;

  // Shadows
  shadowOpacity: number;
  shadowBlur: number;
  shadowScale: number;
  shadowColor: string;
}

// ── Mini-preview do cenário (2D representation) ───────────────────────────────
function ScenePreview({
  envPreset, floorColor, wallColor, showFloor, showWall, showParticles,
  particleColor, particleCount, ambientIntensity,
  dirLightColor, spotLightColor, pointLight1Color, pointLight2Color,
}: Partial<SceneBlockProps>) {
  const particles = showParticles
    ? Array.from({ length: Math.min(particleCount || 12, 20) }, (_, i) => ({
        x: 5 + Math.random() * 90,
        y: 10 + Math.random() * 70,
        r: 1 + Math.random() * 2,
        o: 0.3 + Math.random() * 0.5,
      }))
    : [];

  // Ambient glow mix
  const aI = Math.min(ambientIntensity || 0.4, 1);

  return (
    <svg width="100%" height="100%" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      {/* Sky / wall */}
      <rect x="0" y="0" width="200" height="120" fill={wallColor || '#0f3460'} opacity={0.95} />
      {showWall && <rect x="0" y="0" width="200" height="90" fill={wallColor || '#0f3460'} />}

      {/* Environment gradient overlay */}
      <defs>
        <radialGradient id="envGlow" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor={dirLightColor || '#fff'} stopOpacity={aI * 0.18} />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="p1glow" cx="25%" cy="60%" r="30%">
          <stop offset="0%" stopColor={pointLight1Color || '#4a90ff'} stopOpacity="0.25" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="p2glow" cx="75%" cy="60%" r="30%">
          <stop offset="0%" stopColor={pointLight2Color || '#ff6b9d'} stopOpacity="0.25" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={floorColor || '#1a1a2e'} />
          <stop offset="100%" stopColor="#080810" />
        </linearGradient>
      </defs>

      {/* Lights overlay */}
      <rect x="0" y="0" width="200" height="120" fill="url(#envGlow)" />
      <rect x="0" y="0" width="200" height="120" fill="url(#p1glow)" />
      <rect x="0" y="0" width="200" height="120" fill="url(#p2glow)" />

      {/* Floor */}
      {showFloor && (
        <>
          <rect x="0" y="85" width="200" height="35" fill="url(#floorGrad)" />
          {/* Floor grid */}
          {[20, 40, 60, 80, 100, 120, 140, 160, 180].map(x => (
            <line key={x} x1={x} y1="85" x2={x} y2="120" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          ))}
          <line x1="0" y1="100" x2="200" y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <line x1="0" y1="112" x2="200" y2="112" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        </>
      )}

      {/* Particles */}
      {particles.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={particleColor || '#4a90ff'} opacity={p.o} />
      ))}

      {/* Spotlight cone */}
      {true && (
        <polygon
          points="100,0 70,85 130,85"
          fill={spotLightColor || '#ffd4a3'}
          opacity={0.04}
        />
      )}

      {/* Avatar silhouette placeholder */}
      <g opacity={0.7}>
        {/* Head */}
        <circle cx="100" cy="38" r="10" fill="#e8beac" />
        {/* Body */}
        <rect x="88" y="48" width="24" height="24" rx="4" fill="#1E3A8A" opacity={0.9} />
        {/* Legs */}
        <rect x="88" y="72" width="10" height="14" rx="2" fill="#1F2937" />
        <rect x="102" y="72" width="10" height="14" rx="2" fill="#1F2937" />
        {/* Shadow */}
        <ellipse cx="100" cy="87" rx="14" ry="3" fill="rgba(0,0,0,0.35)" />
      </g>

      {/* Env preset label */}
      <text x="4" y="10" fontSize="6" fill="rgba(255,255,255,0.3)" fontFamily="monospace">
        env: {envPreset || 'city'}
      </text>
    </svg>
  );
}

export const SceneBlock: UserComponent<Partial<SceneBlockProps>> = (props) => {
  const {
    envPreset = 'city',
    floorColor = '#1a1a2e', showFloor = true,
    wallColor = '#0f3460', showWall = true,
    showParticles = true, particleColor = '#4a90ff', particleCount = 50,
    ambientIntensity = 0.4,
    dirLightColor = '#ffffff', spotLightColor = '#ffd4a3',
    pointLight1Color = '#4a90ff', pointLight2Color = '#ff6b9d',
  } = props;

  const { connectors: { connect, drag }, isActive } = useNode(n => ({ isActive: n.events.selected }));
  const layoutStyle = getLayoutStyle(props as any);

  return (
    <div style={{ ...layoutStyle, cursor: 'move', pointerEvents: 'auto' }}>
      <div
        ref={ref => { if (ref) connect(drag(ref)); }}
        className={`transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2 rounded-sm' : 'hover:ring-1 hover:ring-primary/30 rounded-sm'}`}
      >
        {/* Header badge */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-bold text-primary/70 uppercase tracking-widest">🎬 Cenário 3D</span>
          <span className="text-[9px] text-muted-foreground font-mono bg-muted/40 px-1.5 py-0.5 rounded">{envPreset}</span>
        </div>

        {/* Scene preview */}
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', height: 140, position: 'relative' }}>
          <ScenePreview
            envPreset={envPreset}
            floorColor={floorColor} showFloor={showFloor}
            wallColor={wallColor} showWall={showWall}
            showParticles={showParticles} particleColor={particleColor} particleCount={particleCount}
            ambientIntensity={ambientIntensity}
            dirLightColor={dirLightColor} spotLightColor={spotLightColor}
            pointLight1Color={pointLight1Color} pointLight2Color={pointLight2Color}
          />
          <div className="absolute bottom-2 right-2 text-[8px] text-white/25 uppercase tracking-widest font-semibold">
            Cenário · Preview
          </div>
        </div>

        {/* Quick info row */}
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          {showFloor && <span className="text-[9px] bg-muted/30 text-muted-foreground px-1.5 py-0.5 rounded-full border border-border/40">🏢 Chão</span>}
          {showWall && <span className="text-[9px] bg-muted/30 text-muted-foreground px-1.5 py-0.5 rounded-full border border-border/40">🧱 Parede</span>}
          {showParticles && <span className="text-[9px] bg-muted/30 text-muted-foreground px-1.5 py-0.5 rounded-full border border-border/40">✨ Partículas ({particleCount})</span>}
        </div>
      </div>
    </div>
  );
};

SceneBlock.craft = {
  props: {
    envPreset: 'city',
    camPosX: 0, camPosY: 1.65, camPosZ: 4,
    camTargetX: 0, camTargetY: 1.5, camTargetZ: 0,
    camMinDist: 3, camMaxDist: 8,
    ambientEnabled: true, ambientIntensity: 0.4,
    dirLightEnabled: true, dirLightIntensity: 1.2, dirLightColor: '#ffffff',
    dirLightPosX: 5, dirLightPosY: 5, dirLightPosZ: 5,
    dirLightCastShadow: true,
    fillLightEnabled: true, fillLightIntensity: 0.5, fillLightColor: '#b8d4ff',
    spotLightEnabled: true, spotLightIntensity: 0.8, spotLightColor: '#ffd4a3',
    spotLightPosX: 0, spotLightPosY: 5, spotLightPosZ: -5,
    spotLightAngle: 0.6, spotLightPenumbra: 0.5, spotLightCastShadow: true,
    pointLight1Enabled: true, pointLight1Color: '#4a90ff', pointLight1Intensity: 0.3,
    pointLight2Enabled: true, pointLight2Color: '#ff6b9d', pointLight2Intensity: 0.3,
    showFloor: true, floorColor: '#1a1a2e', floorWidth: 20, floorHeight: 20,
    floorRoughness: 0.3, floorMetalness: 0.8,
    showWall: true, wallColor: '#0f3460', wallWidth: 20, wallHeight: 12,
    wallRoughness: 0.8, wallMetalness: 0.2,
    wallPosY: 4, wallPosZ: -5,
    showParticles: true, particleColor: '#4a90ff', particleCount: 50,
    particleSize: 2, particleSpeed: 0.3, particleOpacity: 0.4, particleScale: 10,
    shadowOpacity: 0.5, shadowBlur: 2, shadowScale: 10, shadowColor: '#000000',
    ...DEFAULT_LAYOUT_PROPS,
  },
  related: { settings: SceneBlockSettings },
  displayName: 'Cenário 3D',
};
