import { useNode, UserComponent } from '@craftjs/core';

interface CanvasDropAreaProps {
  bgColor: string;
  children?: React.ReactNode;
}

export const CanvasDropArea: UserComponent<CanvasDropAreaProps> = ({ bgColor, children }) => {
  const { connectors: { connect } } = useNode();

  return (
    <div
      ref={(ref) => { if (ref) connect(ref); }}
      className="w-full min-h-full"
      style={{
        backgroundColor: bgColor === 'transparent' ? 'transparent' : bgColor,
        padding: bgColor === 'transparent' ? 0 : 16,
        minHeight: bgColor === 'transparent' ? '100%' : undefined,
        pointerEvents: 'none',
      }}
    >
      <div style={{ pointerEvents: 'auto' }}>
        {children}
      </div>
    </div>
  );
};

CanvasDropArea.craft = {
  props: { bgColor: '#0f172a' },
  displayName: 'Canvas',
  rules: { canDrag: () => false },
};
