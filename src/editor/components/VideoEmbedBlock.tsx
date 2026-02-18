import { useNode, UserComponent } from '@craftjs/core';
import { VideoEmbedBlockSettings } from '../settings/VideoEmbedBlockSettings';

export interface VideoEmbedBlockProps {
  url: string;
  aspectRatio: '16:9' | '9:16' | '4:3' | '1:1';
  borderRadius: number;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  opacity: number;
}

function getEmbedUrl(url: string, autoplay: boolean, muted: boolean, loop: boolean): string | null {
  try {
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
    if (ytMatch) {
      const params = new URLSearchParams();
      if (autoplay) params.set('autoplay', '1');
      if (muted) params.set('mute', '1');
      if (loop) params.set('loop', '1');
      return `https://www.youtube.com/embed/${ytMatch[1]}?${params.toString()}`;
    }
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      const params = new URLSearchParams();
      if (autoplay) params.set('autoplay', '1');
      if (muted) params.set('muted', '1');
      if (loop) params.set('loop', '1');
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?${params.toString()}`;
    }
    // Direct embed URL
    if (url.includes('embed') || url.endsWith('.mp4')) return url;
  } catch { /* ignore */ }
  return null;
}

const aspectRatioMap = { '16:9': '56.25%', '9:16': '177.78%', '4:3': '75%', '1:1': '100%' };

export const VideoEmbedBlock: UserComponent<Partial<VideoEmbedBlockProps>> = (props) => {
  const {
    url = '',
    aspectRatio = '16:9',
    borderRadius = 12,
    autoplay = false,
    muted = true,
    loop = true,
    opacity = 1,
  } = props;

  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  const embedUrl = url ? getEmbedUrl(url, autoplay, muted, loop) : null;

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      style={{ borderRadius, opacity, cursor: 'move', overflow: 'hidden' }}
    >
      {embedUrl ? (
        <div style={{ position: 'relative', paddingBottom: aspectRatioMap[aspectRatio], height: 0 }}>
          <iframe
            src={embedUrl}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius }}
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
          />
        </div>
      ) : (
        <div
          style={{ paddingBottom: aspectRatioMap[aspectRatio], position: 'relative' }}
          className="bg-muted/30 border-2 border-dashed border-muted-foreground/20"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground/60">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/></svg>
            <span className="text-xs">Cole uma URL de vídeo</span>
          </div>
        </div>
      )}
    </div>
  );
};

VideoEmbedBlock.craft = {
  props: {
    url: '',
    aspectRatio: '16:9',
    borderRadius: 12,
    autoplay: false,
    muted: true,
    loop: true,
    opacity: 1,
  },
  related: { settings: VideoEmbedBlockSettings },
  rules: { canDrag: () => true },
  displayName: 'Video Embed',
};
