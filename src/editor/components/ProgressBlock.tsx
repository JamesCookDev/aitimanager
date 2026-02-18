import { useNode, UserComponent } from '@craftjs/core';
import { ProgressBlockSettings } from '../settings/ProgressBlockSettings';

export interface ProgressBlockProps {
  value: number;
  maxValue: number;
  label: string;
  showLabel: boolean;
  showPercentage: boolean;
  barColor: string;
  trackColor: string;
  height: number;
  borderRadius: number;
  animated: boolean;
  striped: boolean;
  labelColor: string;
  labelFontSize: number;
}

export const ProgressBlock: UserComponent<Partial<ProgressBlockProps>> = (props) => {
  const {
    value = 65,
    maxValue = 100,
    label = 'Progresso',
    showLabel = true,
    showPercentage = true,
    barColor = '#6366f1',
    trackColor = 'rgba(255,255,255,0.08)',
    height = 12,
    borderRadius = 99,
    animated = true,
    striped = false,
    labelColor = '#ffffff',
    labelFontSize = 12,
  } = props;

  const { connectors: { connect, drag }, isActive } = useNode((node) => ({
    isActive: node.events.selected,
  }));

  const pct = Math.min(100, Math.max(0, (value / maxValue) * 100));

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`relative transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/30'}`}
      style={{ padding: 8, cursor: 'move', pointerEvents: 'auto' }}
    >
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span style={{ color: labelColor, fontSize: labelFontSize, fontWeight: 600 }}>{label}</span>
          {showPercentage && (
            <span style={{ color: labelColor, fontSize: labelFontSize - 1, opacity: 0.7 }}>{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div
        style={{
          backgroundColor: trackColor,
          borderRadius,
          height,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius,
            background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
            transition: animated ? 'width 1s ease' : 'none',
            backgroundSize: striped ? '20px 20px' : undefined,
            backgroundImage: striped
              ? 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)'
              : undefined,
            animation: striped ? 'stripe-move 1s linear infinite' : undefined,
          }}
        />
      </div>
      <style>{`@keyframes stripe-move { 0% { background-position: 0 0; } 100% { background-position: 20px 0; } }`}</style>
    </div>
  );
};

ProgressBlock.craft = {
  props: {
    value: 65,
    maxValue: 100,
    label: 'Progresso',
    showLabel: true,
    showPercentage: true,
    barColor: '#6366f1',
    trackColor: 'rgba(255,255,255,0.08)',
    height: 12,
    borderRadius: 99,
    animated: true,
    striped: false,
    labelColor: '#ffffff',
    labelFontSize: 12,
  },
  related: { settings: ProgressBlockSettings },
  displayName: 'Progresso',
};
