import { useNode, UserComponent } from '@craftjs/core';
import { ImageBlockSettings } from '../settings/ImageBlockSettings';
import { DEFAULT_LAYOUT_PROPS, getLayoutStyle } from '../shared/layoutProps';

export interface ImageBlockProps {
  src: string;
  alt: string;
  width: string;
  height: string;
  objectFit: 'cover' | 'contain' | 'fill';
  borderRadius: number;
  padding: number;
  opacity: number;
  shadow: 'none' | 'sm' | 'md' | 'lg';
  borderEnabled: boolean;
  borderColor: string;
  borderWidth: number;
}

export const ImageBlock: UserComponent<Partial<ImageBlockProps>> = (props) => {
  const {
    src = '',
    alt = 'Imagem',
    width = '100%',
    height = 'auto',
    objectFit = 'cover',
    borderRadius = 8,
    padding = 4,
    opacity = 1,
    shadow = 'none',
    borderEnabled = false,
    borderColor = '#ffffff',
    borderWidth = 2,
  } = props;

  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  const shadowMap = { none: 'none', sm: '0 2px 8px rgba(0,0,0,0.2)', md: '0 4px 20px rgba(0,0,0,0.3)', lg: '0 8px 40px rgba(0,0,0,0.4)' };

  const layoutStyle = getLayoutStyle(props as any);

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      style={{ padding, cursor: 'move', pointerEvents: 'auto', ...layoutStyle }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            width,
            height,
            objectFit,
            borderRadius,
            display: 'block',
            opacity,
            boxShadow: shadowMap[shadow],
            border: borderEnabled ? `${borderWidth}px solid ${borderColor}` : undefined,
          }}
        />
      ) : (
        <div
          className="flex items-center justify-center border-2 border-dashed border-white/20 text-white/40 text-sm"
          style={{
            width,
            height,
            borderRadius,
            minHeight: 80,
            backgroundColor: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(4px)',
          }}
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
    opacity: 1,
    shadow: 'none',
    borderEnabled: false,
    borderColor: '#ffffff',
    borderWidth: 2,
    ...DEFAULT_LAYOUT_PROPS,
  },
  related: { settings: ImageBlockSettings },
  displayName: 'Imagem',
};
