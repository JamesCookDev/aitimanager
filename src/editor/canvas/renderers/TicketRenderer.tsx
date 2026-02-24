/**
 * Ticket/Senha renderer - displays a ticket number for queue management.
 */
import { useState, useEffect } from 'react';

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
    setTimeout(() => setAnimating(false), 500);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        borderRadius,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 20,
      }}
    >
      <span style={{ color: `${textColor}99`, fontSize: labelSize, fontWeight: 500 }}>
        {label}
      </span>
      <span
        style={{
          color: accentColor,
          fontSize,
          fontWeight: 800,
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
          transition: 'transform 0.3s, opacity 0.3s',
          transform: animating ? 'scale(1.1)' : 'scale(1)',
          opacity: animating ? 0.7 : 1,
        }}
      >
        {formattedNumber}
      </span>
      {showPrint && (
        <button
          onClick={handleClick}
          style={{
            marginTop: 8,
            padding: '12px 32px',
            backgroundColor: accentColor,
            color: '#ffffff',
            border: 'none',
            borderRadius: 999,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {printLabel}
        </button>
      )}
    </div>
  );
}
