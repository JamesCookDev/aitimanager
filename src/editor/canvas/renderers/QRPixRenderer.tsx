/**
 * QR Pix renderer - premium Pix QR code display for payments.
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
        background: `linear-gradient(145deg, ${bgColor}, rgba(0,0,0,0.7))`,
        borderRadius,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        padding: 20,
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes pix-glow {
          0%, 100% { box-shadow: 0 0 20px ${accentColor}30, 0 0 60px ${accentColor}10; }
          50% { box-shadow: 0 0 30px ${accentColor}50, 0 0 80px ${accentColor}20; }
        }
        @keyframes pix-ring {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Decorative gradient orb */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 120, height: 120,
        background: `radial-gradient(circle, ${accentColor}20 0%, transparent 70%)`,
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Pix label */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 16px',
        background: `${accentColor}18`,
        borderRadius: 999,
        border: `1px solid ${accentColor}33`,
      }}>
        <span style={{ fontSize: 20 }}>💠</span>
        <span style={{ color: accentColor, fontSize: 16, fontWeight: 700, letterSpacing: '0.02em' }}>{label}</span>
      </div>

      {/* QR container with animated border */}
      <div style={{
        position: 'relative',
        width: '55%',
        aspectRatio: '1/1',
        maxWidth: 200,
        animation: 'pix-glow 3s ease-in-out infinite',
        borderRadius: 16,
        padding: 3,
        background: `conic-gradient(from 0deg, ${accentColor}, ${accentColor}44, ${accentColor})`,
      }}>
        <div style={{
          width: '100%', height: '100%',
          backgroundColor: '#ffffff',
          borderRadius: 13,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 10,
        }}>
          <div style={{
            width: '100%', height: '100%',
            background: `repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 0 0 / 10px 10px`,
            borderRadius: 4, opacity: 0.35,
          }} />
        </div>
      </div>

      {/* Recipient */}
      <span style={{ color: `${textColor}88`, fontSize: 13, textAlign: 'center', fontWeight: 500 }}>
        {recipientName}
      </span>

      {/* Amount */}
      {showAmount && (
        <div style={{
          padding: '8px 24px',
          background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}11)`,
          borderRadius: 12,
          border: `1px solid ${accentColor}33`,
        }}>
          <span style={{ color: accentColor, fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>
            {amount}
          </span>
        </div>
      )}

      {/* Pix key */}
      <span style={{
        color: `${textColor}40`, fontSize: 10, fontFamily: 'monospace',
        padding: '3px 10px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 6,
      }}>
        Chave: {pixKey.replace(/(.{4})/g, '$1 ').trim()}
      </span>
    </div>
  );
}
