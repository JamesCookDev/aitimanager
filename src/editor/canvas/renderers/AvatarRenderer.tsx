export function AvatarRenderer(props: any) {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: '#0f3460' }}>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 3, height: 3,
            background: 'rgba(74,144,255,0.5)',
            left: `${12 + i * 22}%`,
            top: `${25 + (i % 3) * 22}%`,
            animation: `pulse ${2 + i * 0.5}s ease-in-out infinite`,
          }}
        />
      ))}

      <svg viewBox="0 0 200 380" className="w-full h-full absolute inset-0" preserveAspectRatio="xMidYMax slice">
        <rect x="0" y="0" width="200" height="380" fill="#0f3460" />
        <rect x="0" y="280" width="200" height="100" fill="#4a5568" />
        <rect x="0" y="280" width="200" height="6" fill="rgba(255,255,255,0.06)" />
        <ellipse cx="100" cy="283" rx="35" ry="6" fill="rgba(0,0,0,0.35)" />
        <circle cx="100" cy="48" r="24" fill="#d4a088" />
        <ellipse cx="100" cy="34" rx="22" ry="16" fill="#8B4513" />
        <ellipse cx="100" cy="40" rx="20" ry="10" fill="#8B4513" opacity="0.6" />
        <circle cx="92" cy="50" r="2.5" fill="#2d3748" />
        <circle cx="108" cy="50" r="2.5" fill="#2d3748" />
        <circle cx="93" cy="49" r="0.8" fill="white" />
        <circle cx="109" cy="49" r="0.8" fill="white" />
        <path d="M97 55 Q100 58 103 55" stroke="#c4956e" strokeWidth="1" fill="none" />
        <path d="M94 61 Q100 64 106 61" stroke="#b07d6a" strokeWidth="1.2" fill="none" />
        <rect x="92" y="70" width="16" height="12" rx="3" fill="#d4a088" />
        <path d="M60 86 Q60 80 72 77 L92 84 L108 84 L128 77 Q140 80 140 86 L144 190 Q144 193 141 193 L59 193 Q56 193 56 190 Z" fill={props.colors?.shirt || '#1E3A8A'} />
        <path d="M92 84 Q100 89 108 84" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none" />
        <path d="M78 95 L76 190" stroke="rgba(0,0,0,0.08)" strokeWidth="3" />
        <path d="M122 95 L124 190" stroke="rgba(0,0,0,0.08)" strokeWidth="3" />
        <path d="M60 86 L46 150 Q44 156 49 156 L60 154 L64 110 Z" fill={props.colors?.shirt || '#1E3A8A'} opacity="0.9" />
        <path d="M140 86 L154 150 Q156 156 151 156 L140 154 L136 110 Z" fill={props.colors?.shirt || '#1E3A8A'} opacity="0.9" />
        <ellipse cx="47" cy="156" rx="6" ry="5.5" fill="#d4a088" />
        <ellipse cx="153" cy="156" rx="6" ry="5.5" fill="#d4a088" />
        <rect x="59" y="191" width="82" height="7" rx="1.5" fill="rgba(0,0,0,0.25)" />
        <path d="M59 198 L64 272 Q64 276 70 276 L98 276 L100 198 Z" fill={props.colors?.pants || '#1F2937'} />
        <path d="M141 198 L136 272 Q136 276 130 276 L102 276 L100 198 Z" fill={props.colors?.pants || '#1F2937'} />
        <path d="M64 272 L58 283 Q56 288 64 288 L98 288 Q101 288 100 283 L98 276 L70 276 Z" fill={props.colors?.shoes || '#111'} />
        <path d="M136 272 L142 283 Q144 288 136 288 L102 288 Q99 288 100 283 L102 276 L130 276 Z" fill={props.colors?.shoes || '#111'} />
      </svg>

      <div className="absolute bottom-1 left-0 right-0 text-center">
        <span className="text-[9px] font-semibold text-white/50 bg-black/30 px-2 py-0.5 rounded-full">
          Avatar 3D
        </span>
      </div>
    </div>
  );
}
