/**
 * Ticket/Senha renderer - premium queue management display.
 */
import { useState } from 'react';

interface Props {
  prefix?: string;
  currentNumber?: number;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  fontSize?: number;
  borderRadius?: number;
  label?: string;
  labelSize?: number;
  showPrint?: boolean;
  printLabel?: string;
}

export function TicketRenderer({
  prefix = 'A',
  currentNumber = 42,
  bgColor = 'rgba(0,0,0,0.5)',
  textColor = '#ffffff',
  accentColor = '#6366f1',
  fontSize = 72,
  borderRadius = 20,
  label = 'Sua senha',
  labelSize = 16,
  showPrint = true,
  printLabel = '🖨️ Retirar Senha',
}: Props) {
  const [number, setNumber] = useState(currentNumber);
  const [animating, setAnimating] = useState(false);

  const formattedNumber = `${prefix}${String(number).padStart(3, '0')}`;

  const handleClick = () => {
    setAnimating(true);
    setNumber(n => n + 1);
    setTimeout(() => setAnimating(false), 600);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: `linear-gradient(160deg, ${bgColor}, rgba(0,0,0,0.65))`,
        borderRadius,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        padding: 24,
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes ticket-pop {
          0% { transform: scale(1); }
          30% { transform: scale(1.15); }
          60% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes ticket-glow {
          0%, 100% { text-shadow: 0 0 20px ${accentColor}40; }
          50% { text-shadow: 0 0 40px ${accentColor}60, 0 0 80px ${accentColor}30; }
        }
      `}</style>

      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: -30, left: -30,
        width: 100, height: 100,
        background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -30, right: -30,
        width: 80, height: 80,
        background: `radial-gradient(circle, ${accentColor}10 0%, transparent 70%)`,
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Dashed ticket border */}
      <div style={{
        position: 'absolute', top: 12, left: 12, right: 12, bottom: 12,
        border: `2px dashed ${textColor}12`,
        borderRadius: borderRadius - 8,
        pointerEvents: 'none',
      }} />

      <span style={{
        color: `${textColor}88`, fontSize: labelSize, fontWeight: 500,
        letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        {label}
      </span>

      {/* Number display */}
      <div style={{
        padding: '12px 28px',
        background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}08)`,
        borderRadius: 16,
        border: `1px solid ${accentColor}30`,
      }}>
        <span
          style={{
            color: accentColor,
            fontSize,
            fontWeight: 800,
            fontFamily: 'monospace',
            letterSpacing: '0.08em',
            animation: animating ? 'ticket-pop 0.6s ease-out' : 'ticket-glow 3s ease-in-out infinite',
            display: 'block',
          }}
        >
          {formattedNumber}
        </span>
      </div>

      {showPrint && (
        <button
          onClick={handleClick}
          style={{
            marginTop: 4,
            padding: '14px 36px',
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
            color: '#ffffff',
            border: 'none',
            borderRadius: 999,
            fontSize: 17,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: `0 4px 24px ${accentColor}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Button shine */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
            borderRadius: '999px 999px 0 0',
            pointerEvents: 'none',
          }} />
          <span style={{ position: 'relative' }}>{printLabel}</span>
        </button>
      )}
    </div>
  );
}
