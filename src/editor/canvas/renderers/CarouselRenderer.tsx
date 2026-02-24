import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Placeholder } from './Placeholder';

export function CarouselRenderer(props: any) {
  const images: string[] = (props.images || []).filter((s: string) => !!s);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoplay = props.autoplay !== false;
  const interval = (props.interval || 5) * 1000;
  const transition = props.transition || 'fade';

  const next = useCallback(() => {
    if (images.length <= 1) return;
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    if (images.length <= 1) return;
    setCurrent((c) => (c - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!autoplay || images.length <= 1) return;
    intervalRef.current = setInterval(next, interval);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoplay, interval, next, images.length]);

  useEffect(() => {
    if (current >= images.length) setCurrent(0);
  }, [images.length, current]);

  if (images.length === 0) {
    return <Placeholder icon={ImageIcon} label="Adicione imagens ao carrossel" gradient="bg-gradient-to-br from-pink-900/80 to-rose-900/80" />;
  }

  return (
    <div className="w-full h-full relative overflow-hidden select-none" style={{ borderRadius: props.borderRadius || 0 }}>
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            objectFit: props.objectFit || 'contain',
            opacity: transition === 'fade' ? (i === current ? 1 : 0) : 1,
            transform: transition === 'slide' ? `translateX(${(i - current) * 100}%)` : undefined,
            transition: 'opacity 0.7s ease, transform 0.6s ease',
          }}
        />
      ))}

      {/* Subtle vignette overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.15) 100%)',
        pointerEvents: 'none',
      }} />

      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-all z-10"
            style={{
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-all z-10"
            style={{
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all"
              style={{
                width: i === current ? 20 : 7,
                height: 7,
                background: i === current ? 'white' : 'rgba(255,255,255,0.35)',
                boxShadow: i === current ? '0 0 8px rgba(255,255,255,0.4)' : 'none',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
