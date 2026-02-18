import { useNode, UserComponent } from '@craftjs/core';
import { ImageBlockSettings } from '../settings/ImageBlockSettings';

export interface ImageBlockProps {
  src: string;
  alt: string;
  width: string;
  height: string;
  objectFit: 'cover' | 'contain' | 'fill';
  borderRadius: number;
  padding: number;
}

export const ImageBlock: UserComponent<Partial<ImageBlockProps>> = ({
  src = '', alt = 'Imagem', width = '100%', height = 'auto', objectFit = 'cover', borderRadius = 8, padding = 4,
}) => {
  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      style={{ padding, cursor: 'move', pointerEvents: 'auto' }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{ width, height, objectFit, borderRadius, display: 'block' }}
        />
      ) : (
        <div
          className="flex items-center justify-center bg-muted/30 border-2 border-dashed border-muted-foreground/20 text-muted-foreground text-sm"
          style={{ width, height, borderRadius, minHeight: 80 }}
        >
          📷 Adicionar imagem
        </div>
      )}
    </div>
  );
};

ImageBlock.craft = {
  props: {
    src: '',
    alt: 'Imagem',
    width: '100%',
    height: 'auto',
    objectFit: 'cover',
    borderRadius: 8,
    padding: 4,
  },
  related: { settings: ImageBlockSettings },
  displayName: 'Imagem',
};
