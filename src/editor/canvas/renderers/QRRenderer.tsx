import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode } from 'lucide-react';
import { Placeholder } from './Placeholder';

export function QRPlaceholder(props: any) {
  const value = props.value || '';
  const fgColor = props.fgColor || '#ffffff';
  const bgColor = !props.bgColor || props.bgColor === 'transparent' ? 'rgba(0,0,0,0)' : props.bgColor;
  const ecLevel = props.errorCorrectionLevel || 'M';
  const margin = props.margin ?? 1;
  const label = props.label || '';
  const labelColor = props.labelColor || '#ffffff';
  const labelSize = props.labelSize || 14;
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) { setDataUrl(null); return; }
    QRCode.toDataURL(value, {
      width: 512,
      margin,
      color: { dark: fgColor, light: bgColor },
      errorCorrectionLevel: ecLevel as any,
    }).then(setDataUrl).catch(() => setDataUrl(null));
  }, [value, fgColor, bgColor, ecLevel, margin]);

  if (!value || !dataUrl) {
    return <Placeholder icon={QrCode} label="Configure a URL" gradient="bg-gradient-to-br from-slate-800 to-slate-900" />;
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-[6%] gap-[4%]">
      <img src={dataUrl} alt="QR Code" className="max-w-full max-h-full object-contain flex-1" style={{ imageRendering: 'pixelated' }} />
      {label && <span style={{ color: labelColor, fontSize: labelSize, fontWeight: 500, textAlign: 'center', lineHeight: 1.2 }}>{label}</span>}
    </div>
  );
}
