import React from 'react';
import { useNode, UserComponent } from '@craftjs/core';

interface CanvasDropAreaProps {
  bgColor: string;
  children?: React.ReactNode;
}

export const CanvasDropArea: UserComponent<CanvasDropAreaProps> = ({ bgColor, children }) => {
  const { connectors: { connect } } = useNode();

  const hasChildren = React.Children.count(children) > 0;

  return (
    <div
      ref={(ref) => { if (ref) connect(ref); }}
      style={{
        backgroundColor: bgColor === 'transparent' ? 'transparent' : bgColor,
        /* 
         * CRITICAL for absolute positioning:
         * - position: relative → makes this the offsetParent for all absolute children
         * - min-height → ensures canvas has enough space even when empty
         * - width: 100% → fills the container
         * NO display:flex here — flex changes offsetParent calculations and
         * breaks top/left pixel values for absolutely-positioned children.
         */
        position: 'relative',
        width: '100%',
        minHeight: '740px',
        padding: 0,
      }}
    >
      {children}
      {!hasChildren && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              border: '2px dashed rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: '48px 32px',
              textAlign: 'center',
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
              Arraste blocos aqui para montar a tela
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

CanvasDropArea.craft = {
  props: { bgColor: '#0f172a' },
  displayName: 'Canvas',
  rules: { canDrag: () => false },
};
