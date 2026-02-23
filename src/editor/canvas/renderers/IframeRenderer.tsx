import { Globe } from 'lucide-react';
import { Placeholder } from './Placeholder';

export function IframePlaceholder(props: any) {
  const url = props.url || '';
  if (!url) {
    return <Placeholder icon={Globe} label="Cole a URL do site" gradient="bg-gradient-to-br from-gray-800 to-gray-900" />;
  }
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ borderRadius: props.borderRadius || 0 }}>
      <iframe
        src={url}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-popups"
        loading="lazy"
        title="Iframe embed"
      />
      <div className="absolute inset-0" />
    </div>
  );
}
