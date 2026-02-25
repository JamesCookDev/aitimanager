export function AvatarRenderer(props: any) {
  const shirt = props.colors?.shirt || props.shirtColor || '#1E3A8A';
  const pants = props.colors?.pants || props.pantsColor || '#1F2937';
  const shoes = props.colors?.shoes || props.shoesColor || '#111';
  const skin = props.colors?.skin || props.skinColor || '#d4a088';
  const hair = props.colors?.hair || props.hairColor || '#8B4513';
  const bg = props.bgColor || '#0f3460';

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: bg }}>
      {/* Ambient particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 4, height: 4,
            background: 'rgba(74,144,255,0.4)',
            left: `${10 + i * 15}%`,
            top: `${15 + (i % 4) * 20}%`,
            animation: `pulse ${2 + i * 0.4}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* Floor gradient */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        height: '30%',
        background: 'linear-gradient(to top, #4a556880, transparent)',
      }} />

      {/* Floor grid */}
      <div className="absolute bottom-0 left-0 right-0 opacity-[0.06]" style={{
        height: '28%',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        maskImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
      }} />

      {/* Glow behind avatar */}
      <div className="absolute pointer-events-none" style={{
        width: '50%',
        height: '40%',
        left: '25%',
        bottom: '10%',
        background: `radial-gradient(circle, ${shirt}44 0%, transparent 70%)`,
        filter: 'blur(30px)',
      }} />

      {/* SVG avatar — fills entire container */}
      <svg
        viewBox="0 0 200 400"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMax meet"
      >
        {/* Ground shadow */}
        <ellipse cx="100" cy="375" rx="40" ry="8" fill="rgba(0,0,0,0.3)" />

        {/* Head */}
        <circle cx="100" cy="120" r="28" fill={skin} />
        {/* Hair */}
        <ellipse cx="100" cy="104" rx="26" ry="18" fill={hair} />
        <ellipse cx="100" cy="112" rx="24" ry="12" fill={hair} opacity="0.6" />
        {/* Eyes */}
        <circle cx="91" cy="122" r="3" fill="#2d3748" />
        <circle cx="109" cy="122" r="3" fill="#2d3748" />
        <circle cx="92" cy="121" r="1" fill="white" />
        <circle cx="110" cy="121" r="1" fill="white" />
        {/* Nose */}
        <path d="M97 128 Q100 132 103 128" stroke={skin} strokeWidth="1.2" fill="none" opacity="0.5" />
        {/* Mouth */}
        <path d="M94 135 Q100 139 106 135" stroke="#b07d6a" strokeWidth="1.4" fill="none" />

        {/* Neck */}
        <rect x="93" y="146" width="14" height="12" rx="3" fill={skin} />

        {/* Torso / Shirt */}
        <path d="M58 162 Q58 156 72 152 L93 158 L107 158 L128 152 Q142 156 142 162 L146 270 Q146 273 143 273 L57 273 Q54 273 54 270 Z" fill={shirt} />
        {/* Collar */}
        <path d="M93 158 Q100 164 107 158" stroke="rgba(255,255,255,0.15)" strokeWidth="1.8" fill="none" />
        {/* Shirt fold lines */}
        <path d="M78 170 L75 270" stroke="rgba(0,0,0,0.08)" strokeWidth="3" />
        <path d="M122 170 L125 270" stroke="rgba(0,0,0,0.08)" strokeWidth="3" />

        {/* Left arm */}
        <path d="M58 162 L42 230 Q40 237 46 237 L58 234 L62 184 Z" fill={shirt} opacity="0.9" />
        {/* Right arm */}
        <path d="M142 162 L158 230 Q160 237 154 237 L142 234 L138 184 Z" fill={shirt} opacity="0.9" />
        {/* Hands */}
        <ellipse cx="44" cy="237" rx="7" ry="6" fill={skin} />
        <ellipse cx="156" cy="237" rx="7" ry="6" fill={skin} />

        {/* Belt */}
        <rect x="57" y="271" width="86" height="8" rx="2" fill="rgba(0,0,0,0.3)" />

        {/* Left leg */}
        <path d="M57 279 L62 355 Q62 360 69 360 L98 360 L100 279 Z" fill={pants} />
        {/* Right leg */}
        <path d="M143 279 L138 355 Q138 360 131 360 L102 360 L100 279 Z" fill={pants} />
        {/* Pants shading */}
        <path d="M75 279 L74 355" stroke="rgba(0,0,0,0.08)" strokeWidth="2.5" />
        <path d="M125 279 L126 355" stroke="rgba(0,0,0,0.08)" strokeWidth="2.5" />

        {/* Left shoe */}
        <path d="M62 355 L56 370 Q54 376 62 376 L98 376 Q101 376 100 370 L98 360 L69 360 Z" fill={shoes} />
        {/* Right shoe */}
        <path d="M138 355 L144 370 Q146 376 138 376 L102 376 Q99 376 100 370 L102 360 L131 360 Z" fill={shoes} />
        {/* Shoe shine */}
        <ellipse cx="76" cy="368" rx="8" ry="2.5" fill="rgba(255,255,255,0.06)" />
        <ellipse cx="124" cy="368" rx="8" ry="2.5" fill="rgba(255,255,255,0.06)" />
      </svg>

      {/* "AO VIVO" badge */}
      <div className="absolute top-3 right-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{
          background: 'rgba(239,68,68,0.15)',
          border: '1px solid rgba(239,68,68,0.3)',
          backdropFilter: 'blur(8px)',
        }}>
          <div className="w-2 h-2 rounded-full bg-red-500" style={{
            boxShadow: '0 0 8px rgba(239,68,68,0.6)',
            animation: 'pulse 1.5s infinite',
          }} />
          <span className="text-[10px] font-bold tracking-wider" style={{ color: 'rgba(239,68,68,0.9)' }}>
            AO VIVO
          </span>
        </div>
      </div>
    </div>
  );
}
