/**
 * Shared layout/positioning properties for ALL blocks.
 * These are applied as a wrapper style around every block.
 */
export interface LayoutProps {
  /** Width: 'auto', '100%', or fixed px value like '200px' */
  layoutWidth: string;
  /** Height: 'auto' or fixed px like '100px' */
  layoutHeight: string;
  /** Margin top in px */
  marginTop: number;
  /** Margin bottom in px */
  marginBottom: number;
  /** Margin left in px */
  marginLeft: number;
  /** Margin right in px */
  marginRight: number;
  /** Self alignment within parent flex/grid */
  alignSelf: 'auto' | 'flex-start' | 'center' | 'flex-end' | 'stretch';
  /** Overflow behavior */
  overflow: 'visible' | 'hidden' | 'auto';
  /** CSS position */
  positionType: 'relative' | 'absolute';
  /** Top offset (only for absolute) */
  positionTop: number;
  /** Left offset (only for absolute) */
  positionLeft: number;
  /** Z-index layering */
  zIndex: number;
}

export const DEFAULT_LAYOUT_PROPS: LayoutProps = {
  layoutWidth: 'auto',
  layoutHeight: 'auto',
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  alignSelf: 'auto',
  overflow: 'visible',
  positionType: 'relative',
  positionTop: 0,
  positionLeft: 0,
  zIndex: 0,
};

/** Converts LayoutProps into a CSSProperties object for the block wrapper */
export function getLayoutStyle(props: Partial<LayoutProps>): React.CSSProperties {
  const p = { ...DEFAULT_LAYOUT_PROPS, ...props };
  return {
    width: p.layoutWidth === 'auto' ? undefined : p.layoutWidth,
    height: p.layoutHeight === 'auto' ? undefined : p.layoutHeight,
    marginTop: p.marginTop || undefined,
    marginBottom: p.marginBottom || undefined,
    marginLeft: p.marginLeft || undefined,
    marginRight: p.marginRight || undefined,
    alignSelf: p.alignSelf === 'auto' ? undefined : p.alignSelf,
    overflow: p.overflow === 'visible' ? undefined : p.overflow,
    position: p.positionType === 'relative' ? undefined : p.positionType,
    top: p.positionType === 'absolute' && p.positionTop ? p.positionTop : undefined,
    left: p.positionType === 'absolute' && p.positionLeft ? p.positionLeft : undefined,
    zIndex: p.zIndex || undefined,
  };
}
