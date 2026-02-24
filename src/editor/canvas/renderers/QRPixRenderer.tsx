/**
 * QR Pix renderer - displays a Pix QR code for payments.
 */

interface Props {
  pixKey?: string;
  amount?: string;
  recipientName?: string;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  borderRadius?: number;
  showAmount?: boolean;
  label?: string;
}

export function QRPixRenderer({
  pixKey = '12345678901',
  amount = 'R$ 0,00',
  recipientName = 'Empresa LTDA',
  bgColor = 'rgba(0,0,0,0.5)',
  textColor = '#ffffff',
  accentColor = '#32bcad',
  borderRadius = 20,
  showAmount = true,
  label = 'Pague com Pix',
}: Props) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        borderRadius,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 20,
      }}
    >
      {/* Pix logo/label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 24 }}>💠</span>
        <span style={{ color: accentColor, fontSize: 18, fontWeight: 700 }}>{label}</span>
      </div>

      {/* QR placeholder */}
      <div
        style={{
          width: '60%',
          aspectRatio: '1/1',
          maxWidth: 200,
          backgroundColor: '#ffffff',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 12,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: `repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 0 0 / 10px 10px`,
            borderRadius: 4,
            opacity: 0.3,
          }}
        />
      </div>

      {/* Recipient */}
      <span style={{ color: `${textColor}99`, fontSize: 13, textAlign: 'center' }}>
        {recipientName}
      </span>

      {/* Amount */}
      {showAmount && (
        <span style={{ color: accentColor, fontSize: 28, fontWeight: 800 }}>
          {amount}
        </span>
      )}

      {/* Pix key hint */}
      <span style={{ color: `${textColor}44`, fontSize: 10, fontFamily: 'monospace' }}>
        Chave: {pixKey.replace(/(.{4})/g, '$1 ').trim()}
      </span>
    </div>
  );
}
