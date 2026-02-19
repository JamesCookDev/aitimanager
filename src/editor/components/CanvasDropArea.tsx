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
      className="w-full"
      style={{
        backgroundColor: bgColor === 'transparent' ? 'transparent' : bgColor,
        padding: 16,
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        position: 'relative', // CRITICAL: absolute children need this reference
      }}
    >
      {children}
      {!hasChildren && (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl min-h-[200px]">
          <p className="text-white/30 text-sm text-center px-4">
            Arraste blocos aqui para montar a tela
          </p>
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
