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
import { ListRenderer } from './ListRenderer';
import { GalleryRenderer } from './GalleryRenderer';
import { AnimatedNumberRenderer } from './AnimatedNumberRenderer';
import { CatalogRenderer } from './CatalogRenderer';
import { FormRenderer } from './FormRenderer';
import { TicketRenderer } from './TicketRenderer';
import { QRPixRenderer } from './QRPixRenderer';
import { NumpadRenderer } from './NumpadRenderer';
import { BigCTARenderer } from './BigCTARenderer';
import { FeedRenderer } from './FeedRenderer';

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
    case 'list':
      return <ListRenderer {...element.props} />;
    case 'gallery':
      return <GalleryRenderer {...element.props} />;
    case 'animated-number':
      return <AnimatedNumberRenderer {...element.props} />;
    case 'catalog':
      return <CatalogRenderer {...element.props} />;
    case 'form':
      return <FormRenderer {...element.props} />;
    case 'ticket':
      return <TicketRenderer {...element.props} />;
    case 'qrpix':
      return <QRPixRenderer {...element.props} />;
    case 'numpad':
      return <NumpadRenderer {...element.props} />;
    case 'bigcta':
      return <BigCTARenderer {...element.props} />;
    case 'feed':
      return <FeedRenderer {...element.props} />;
    default:
      return <div className="w-full h-full bg-muted/20 flex items-center justify-center text-xs text-muted-foreground">?</div>;
  }
}
