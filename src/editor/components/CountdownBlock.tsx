import { useState, useEffect } from 'react';
import { useNode, UserComponent } from '@craftjs/core';
import { CountdownBlockSettings } from '../settings/CountdownBlockSettings';
import { DEFAULT_LAYOUT_PROPS, getLayoutStyle } from '../shared/layoutProps';
import type { LayoutProps } from '../shared/layoutProps';

export interface CountdownBlockProps {
  mode: 'clock' | 'countdown' | 'date'; targetDate: string; countdownMinutes: number;
  showSeconds: boolean; showLabels: boolean; fontSize: number; color: string;
  bgColor: string; bgEnabled: boolean; borderRadius: number; separator: string;
  fontWeight: 'normal' | 'bold'; labelFontSize: number; gap: number;
}

export const CountdownBlock: UserComponent<Partial<CountdownBlockProps & LayoutProps>> = (props) => {
  const {
    mode = 'clock', targetDate = '', countdownMinutes = 60, showSeconds = true,
    showLabels = true, fontSize = 28, color = '#ffffff', bgColor = 'rgba(255,255,255,0.06)',
    bgEnabled = true, borderRadius = 16, separator = ':', fontWeight = 'bold',
    labelFontSize = 9, gap = 8,
  } = props;
  const { connectors: { connect, drag }, isActive } = useNode((node) => ({ isActive: node.events.selected }));
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const getTimeSegments = () => {
    if (mode === 'clock') return { h: String(now.getHours()).padStart(2,'0'), m: String(now.getMinutes()).padStart(2,'0'), s: String(now.getSeconds()).padStart(2,'0'), labels: ['Horas','Min','Seg'] };
    let diffMs = mode === 'countdown' ? countdownMinutes * 60000 : Math.max(0, new Date(targetDate).getTime() - now.getTime());
    const totalSec = Math.floor(diffMs / 1000);
    return { h: String(Math.floor(totalSec/3600)).padStart(2,'0'), m: String(Math.floor((totalSec%3600)/60)).padStart(2,'0'), s: String(totalSec%60).padStart(2,'0'), labels: mode==='date'?['Dias','Horas','Min']:['Horas','Min','Seg'] };
  };
  const { h, m, s, labels } = getTimeSegments();
  const segments = showSeconds ? [h, m, s] : [h, m];
  const segLabels = showSeconds ? labels : labels.slice(0, 2);
  const digitBoxStyle: React.CSSProperties = bgEnabled ? { backgroundColor: bgColor, borderRadius: borderRadius/2, padding:'8px 12px', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.08)' } : {};
  const layoutStyle = getLayoutStyle(props as any);
  return (
    <div style={{ ...layoutStyle, cursor: 'move', pointerEvents: 'auto' }}>
      <div
        ref={(ref) => { if (ref) connect(drag(ref)); }}
        className={`transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2 rounded-sm' : 'hover:ring-1 hover:ring-primary/30 rounded-sm'}`}
        style={{ padding: 8 }}
      >
        <div className="flex items-center justify-center" style={{ gap, borderRadius, padding: bgEnabled ? 0 : 12 }}>
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-1" style={{ gap: gap/2 }}>
              <div className="flex flex-col items-center" style={digitBoxStyle}>
                <span style={{ fontSize, color, fontWeight, fontFamily:'monospace', lineHeight:1.1 }}>{seg}</span>
                {showLabels && <span style={{ fontSize:labelFontSize, color, opacity:0.5, fontWeight:'normal', marginTop:2 }}>{segLabels[i]}</span>}
              </div>
              {i < segments.length-1 && <span style={{ fontSize:fontSize*0.8, color, opacity:0.4, fontWeight, fontFamily:'monospace' }}>{separator}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

CountdownBlock.craft = {
  props: {
    mode:'clock', targetDate:'', countdownMinutes:60, showSeconds:true, showLabels:true,
    fontSize:28, color:'#ffffff', bgColor:'rgba(255,255,255,0.06)', bgEnabled:true,
    borderRadius:16, separator:':', fontWeight:'bold', labelFontSize:9, gap:8,
    ...DEFAULT_LAYOUT_PROPS,
  },
  related: { settings: CountdownBlockSettings },
  displayName: 'Relógio',
};
