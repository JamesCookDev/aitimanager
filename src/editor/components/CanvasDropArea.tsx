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
      className="w-full min-h-full"
      style={{
        backgroundColor: bgColor === 'transparent' ? 'transparent' : bgColor,
        padding: bgColor === 'transparent' ? 0 : 16,
        minHeight: '100%',
        // Empty area passes clicks through to TotemCanvas behind
        pointerEvents: hasChildren ? 'auto' : 'none',
      }}
    >
      {children}
    </div>
  );
};

CanvasDropArea.craft = {
  props: { bgColor: '#0f172a' },
  displayName: 'Canvas',
  rules: { canDrag: () => false },
};
