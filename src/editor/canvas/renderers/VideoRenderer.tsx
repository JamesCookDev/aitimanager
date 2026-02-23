import { Play } from 'lucide-react';
import { Placeholder } from './Placeholder';

function getVideoEmbedUrl(url: string, autoplay: boolean, muted: boolean, loop: boolean): string | null {
  try {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
    if (ytMatch) {
      const p = new URLSearchParams();
      if (autoplay) p.set('autoplay', '1');
      if (muted) p.set('mute', '1');
      if (loop) { p.set('loop', '1'); p.set('playlist', ytMatch[1]); }
      p.set('controls', '0');
      p.set('modestbranding', '1');
      return `https://www.youtube.com/embed/${ytMatch[1]}?${p.toString()}`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      const p = new URLSearchParams();
      if (autoplay) p.set('autoplay', '1');
      if (muted) p.set('muted', '1');
      if (loop) p.set('loop', '1');
      p.set('controls', '0');
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?${p.toString()}`;
    }
    if (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg')) return url;
    if (url.includes('embed')) return url;
  } catch {}
  return null;
}

export function VideoRenderer(props: any) {
  const url = props.url || '';
  if (!url) {
    return <Placeholder icon={Play} label="Cole uma URL de vídeo" gradient="bg-gradient-to-br from-purple-900/80 to-indigo-900/80" />;
  }

  const embedUrl = getVideoEmbedUrl(url, props.autoplay !== false, props.muted !== false, props.loop !== false);
  const isDirectVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg');

  if (isDirectVideo || (embedUrl && (embedUrl.endsWith('.mp4') || embedUrl.endsWith('.webm')))) {
    return (
      <video
        src={embedUrl || url}
        autoPlay={props.autoplay !== false}
        muted={props.muted !== false}
        loop={props.loop !== false}
        playsInline
        className="w-full h-full object-cover pointer-events-none"
        style={{ borderRadius: props.borderRadius || 0 }}
      />
    );
  }

  if (embedUrl) {
    return (
      <iframe
        src={embedUrl}
        className="w-full h-full border-none pointer-events-none"
        style={{ borderRadius: props.borderRadius || 0 }}
        allow="autoplay; fullscreen; encrypted-media"
        allowFullScreen
      />
    );
  }

  return <Placeholder icon={Play} label="URL inválida" gradient="bg-gradient-to-br from-red-900/80 to-purple-900/80" />;
}
