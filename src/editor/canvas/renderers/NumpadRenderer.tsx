/**
 * Virtual numpad renderer - premium numeric input for kiosks.
 */
import { useState } from 'react';

interface Props {
  label?: string;
  placeholder?: string;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  borderRadius?: number;
  maxLength?: number;
  mask?: 'none' | 'cpf' | 'phone';
  buttonLabel?: string;
}

function applyMask(value: string, mask: string): string {
  const digits = value.replace(/\D/g, '');
  if (mask === 'cpf') {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  if (mask === 'phone') {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
  return digits;
}

export function NumpadRenderer({
  label = 'Digite seu CPF',
  placeholder = '000.000.000-00',
  bgColor = 'rgba(0,0,0,0.5)',
  textColor = '#ffffff',
  accentColor = '#6366f1',
  borderRadius = 20,
  maxLength = 11,
  mask = 'cpf',
  buttonLabel = 'Confirmar',
}: Props) {
  const [value, setValue] = useState('');
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const digits = value.replace(/\D/g, '');
  const display = mask !== 'none' ? applyMask(digits, mask) : digits;

  const handleKey = (key: string) => {
    setPressedKey(key);
    setTimeout(() => setPressedKey(null), 150);
    if (key === 'C') {
      setValue('');
    } else if (key === '⌫') {
      setValue(v => v.slice(0, -1));
    } else if (digits.length < maxLength) {
      setValue(v => v + key);
    }
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: `linear-gradient(160deg, ${bgColor}, rgba(0,0,0,0.65))`,
        borderRadius,
        display: 'flex',
        flexDirection: 'column',
        padding: 20,
        gap: 12,
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Label */}
      <span style={{
        color: `${textColor}99`, fontSize: 14, fontWeight: 600,
        textAlign: 'center', letterSpacing: '0.02em',
      }}>
        {label}
      </span>

      {/* Display */}
      <div
        style={{
          padding: '14px 16px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
          borderRadius: 14,
          textAlign: 'center',
          fontSize: 28,
          fontFamily: 'monospace',
          fontWeight: 700,
          color: digits.length > 0 ? textColor : `${textColor}30`,
          letterSpacing: '0.06em',
          minHeight: 54,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1.5px solid ${digits.length > 0 ? accentColor + '44' : 'rgba(255,255,255,0.06)'}`,
          boxShadow: digits.length > 0 ? `0 0 20px ${accentColor}15` : 'none',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
      >
        {display || placeholder}
      </div>

      {/* Numpad grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          flex: 1,
        }}
      >
        {keys.map((key) => {
          const isAction = key === 'C' || key === '⌫';
          const isPressed = pressedKey === key;
          return (
            <button
              key={key}
              onClick={() => handleKey(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isAction ? 18 : 26,
                fontWeight: 700,
                color: key === 'C' ? '#ef4444' : key === '⌫' ? '#f59e0b' : textColor,
                background: isPressed
                  ? `${accentColor}30`
                  : 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                border: `1px solid ${isPressed ? accentColor + '44' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 14,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                minHeight: 0,
                boxShadow: isPressed ? `0 0 16px ${accentColor}20` : '0 2px 8px rgba(0,0,0,0.2)',
                transform: isPressed ? 'scale(0.95)' : 'scale(1)',
              }}
            >
              {key}
            </button>
          );
        })}
      </div>

      {/* Confirm button */}
      <button
        style={{
          padding: '14px 24px',
          background: digits.length >= 3
            ? `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`
            : 'rgba(255,255,255,0.05)',
          color: digits.length >= 3 ? '#ffffff' : `${textColor}40`,
          border: digits.length >= 3
            ? `1px solid rgba(255,255,255,0.15)`
            : '1px solid rgba(255,255,255,0.06)',
          borderRadius: 999,
          fontSize: 18,
          fontWeight: 700,
          cursor: digits.length >= 3 ? 'pointer' : 'default',
          boxShadow: digits.length >= 3 ? `0 4px 24px ${accentColor}40` : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
