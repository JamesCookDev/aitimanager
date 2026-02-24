/**
 * Virtual numpad renderer - numeric input for kiosks (e.g., CPF, phone, room number).
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
  const digits = value.replace(/\D/g, '');
  const display = mask !== 'none' ? applyMask(digits, mask) : digits;

  const handleKey = (key: string) => {
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
        backgroundColor: bgColor,
        borderRadius,
        display: 'flex',
        flexDirection: 'column',
        padding: 20,
        gap: 12,
      }}
    >
      {/* Label */}
      <span style={{ color: `${textColor}99`, fontSize: 14, fontWeight: 500, textAlign: 'center' }}>
        {label}
      </span>

      {/* Display */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: 12,
          textAlign: 'center',
          fontSize: 28,
          fontFamily: 'monospace',
          fontWeight: 700,
          color: digits.length > 0 ? textColor : `${textColor}33`,
          letterSpacing: '0.05em',
          minHeight: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
        {keys.map((key) => (
          <button
            key={key}
            onClick={() => handleKey(key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: key === '⌫' || key === 'C' ? 18 : 24,
              fontWeight: 600,
              color: key === 'C' ? '#ef4444' : key === '⌫' ? '#f59e0b' : textColor,
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'background 0.15s',
              minHeight: 0,
            }}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Confirm button */}
      <button
        style={{
          padding: '14px 24px',
          backgroundColor: accentColor,
          color: '#ffffff',
          border: 'none',
          borderRadius: 999,
          fontSize: 18,
          fontWeight: 700,
          cursor: 'pointer',
          opacity: digits.length >= 3 ? 1 : 0.4,
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
