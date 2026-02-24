import { useState, useEffect } from 'react';

export function ClockRenderer(props: any) {
  const [time, setTime] = useState(new Date());
  const color = props.color || '#fff';
  const fontSize = props.fontSize || 36;

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const seconds = time.getSeconds().toString().padStart(2, '0');

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center select-none"
      style={{ position: 'relative' }}
    >
      <style>{`
        @keyframes clock-colon {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{
          color,
          fontSize,
          fontWeight: 800,
          fontFamily: 'monospace',
          letterSpacing: '0.04em',
          textShadow: `0 0 30px ${color}30, 0 2px 4px rgba(0,0,0,0.3)`,
        }}>
          {hours}
        </span>
        <span style={{
          color: `${color}60`,
          fontSize: fontSize * 0.45,
          fontWeight: 600,
          fontFamily: 'monospace',
        }}>
          {seconds}
        </span>
      </div>
    </div>
  );
}
