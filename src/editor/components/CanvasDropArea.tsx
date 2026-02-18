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
      style={{ backgroundColor: bgColor, padding: 16 }}
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
