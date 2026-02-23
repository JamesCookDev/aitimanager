import type { CanvasElement } from '../../types/canvas';
import { TextRenderer } from './TextRenderer';
import { ImageRenderer } from './ImageRenderer';
import { ButtonRenderer } from './ButtonRenderer';
import { ShapeRenderer } from './ShapeRenderer';
import { IconRenderer } from './IconRenderer';
import { VideoRenderer } from './VideoRenderer';
import { QRPlaceholder } from './QRRenderer';
import { MapPlaceholder } from './MapRenderer';
import { SocialRenderer } from './SocialRenderer';
import { ChatPlaceholder } from './ChatRenderer';
import { ClockRenderer } from './ClockRenderer';
import { WeatherPlaceholder, CountdownPlaceholder } from './WeatherRenderer';
import { IframePlaceholder } from './IframeRenderer';
import { CarouselRenderer } from './CarouselRenderer';
import { AvatarRenderer } from './AvatarRenderer';
import { StoreRenderer } from './StoreRenderer';

interface Props {
  element: CanvasElement;
}

export function ElementRenderer({ element }: Props) {
  switch (element.type) {
    case 'text':
      return <TextRenderer {...element.props} />;
    case 'image':
      return <ImageRenderer {...element.props} />;
    case 'button':
      return <ButtonRenderer {...element.props} />;
    case 'shape':
      return <ShapeRenderer {...element.props} />;
    case 'icon':
      return <IconRenderer {...element.props} />;
    case 'video':
      return <VideoRenderer {...element.props} />;
    case 'qrcode':
      return <QRPlaceholder {...element.props} />;
    case 'map':
      return <MapPlaceholder {...element.props} />;
    case 'social':
      return <SocialRenderer {...element.props} />;
    case 'chat':
      return <ChatPlaceholder {...element.props} />;
    case 'clock':
      return <ClockRenderer {...element.props} />;
    case 'weather':
      return <WeatherPlaceholder {...element.props} />;
    case 'countdown':
      return <CountdownPlaceholder {...element.props} />;
    case 'iframe':
      return <IframePlaceholder {...element.props} />;
    case 'carousel':
      return <CarouselRenderer {...element.props} />;
    case 'avatar':
      return <AvatarRenderer {...element.props} />;
    case 'store':
      return <StoreRenderer {...element.props} />;
    default:
      return <div className="w-full h-full bg-muted/20 flex items-center justify-center text-xs text-muted-foreground">?</div>;
  }
}
