import { useState, useEffect, useRef } from 'react';

export function AnimatedNumberRenderer(props: any) {
  const targetValue = props.value ?? 1234;
  const prefix = props.prefix || '';
  const suffix = props.suffix || '';
  const label = props.label || '';
  const color = props.color || '#ffffff';
  const labelColor = props.labelColor || 'rgba(255,255,255,0.6)';
  const fontSize = props.fontSize || 64;
  const labelSize = props.labelSize || 18;
  const duration = props.duration || 2000;
  const fontWeight = props.fontWeight || '800';

  const [displayValue, setDisplayValue] = useState(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = typeof targetValue === 'number' ? targetValue : parseInt(targetValue) || 0;

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    }

    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [targetValue, duration]);

  const formatted = props.useGrouping !== false
    ? displayValue.toLocaleString('pt-BR')
    : displayValue.toString();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center px-4">
      <p style={{ color, fontSize, fontWeight, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
        {prefix}{formatted}{suffix}
      </p>
      {label && (
        <p style={{ color: labelColor, fontSize: labelSize, fontWeight: 500, marginTop: 8 }}>
          {label}
        </p>
      )}
    </div>
  );
}
