import { usePageVariables, interpolateVariables } from '../PageVariablesContext';

export function TextRenderer(props: any) {
  const { variables } = usePageVariables();
  const rawText = props.text || 'Texto';
  const displayText = interpolateVariables(rawText, variables);

  return (
    <div
      className="w-full h-full flex items-center p-2 select-none"
      style={{
        color: props.color || '#fff',
        fontSize: props.fontSize || 24,
        fontWeight: props.fontWeight || 'normal',
        textAlign: props.align || 'left',
        fontFamily: props.fontFamily || 'Inter',
        justifyContent: props.align === 'center' ? 'center' : props.align === 'right' ? 'flex-end' : 'flex-start',
        lineHeight: 1.2,
      }}
    >
      {displayText}
    </div>
  );
}
