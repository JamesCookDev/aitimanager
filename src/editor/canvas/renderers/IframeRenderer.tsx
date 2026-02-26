import { useMemo } from 'react';
import { Globe } from 'lucide-react';
import { Placeholder } from './Placeholder';
import { applyFieldOverrides } from '../../utils/htmlEditableFields';

export function IframePlaceholder(props: any) {
  const url = props.url || '';
  const htmlContent = props.htmlContent || '';
  const overrides = props.fieldOverrides;

  // Apply editable field overrides to raw HTML
  const finalHtml = useMemo(() => {
    if (!htmlContent) return '';
    if (!overrides || Object.keys(overrides).length === 0) return htmlContent;
    return applyFieldOverrides(htmlContent, overrides);
  }, [htmlContent, overrides]);

  // Raw HTML mode — render via srcdoc
  if (finalHtml) {
    return (
      <div className="w-full h-full relative overflow-hidden" style={{ borderRadius: props.borderRadius || 0 }}>
        <iframe
          srcDoc={finalHtml}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
          scrolling={props.scrolling === false ? 'no' : 'auto'}
          title="HTML embed"
          style={{ pointerEvents: 'none' }}
        />
      </div>
    );
  }

  // URL mode
  if (!url) {
    return <Placeholder icon={Globe} label="Cole a URL do site ou HTML" gradient="bg-gradient-to-br from-gray-800 to-gray-900" />;
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
