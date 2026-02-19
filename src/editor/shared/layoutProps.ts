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
  /** Right offset (only for absolute) — overrides left when set */
  positionRight?: number;
  /** Bottom offset (only for absolute) — overrides top when set */
  positionBottom?: number;
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
  const isAbs = p.positionType === 'absolute';
  return {
    width: p.layoutWidth === 'auto' ? undefined : p.layoutWidth,
    height: p.layoutHeight === 'auto' ? undefined : p.layoutHeight,
    marginTop: !isAbs ? (p.marginTop || undefined) : undefined,
    marginBottom: !isAbs ? (p.marginBottom || undefined) : undefined,
    marginLeft: !isAbs ? (p.marginLeft || undefined) : undefined,
    marginRight: !isAbs ? (p.marginRight || undefined) : undefined,
    alignSelf: p.alignSelf === 'auto' ? undefined : p.alignSelf,
    overflow: p.overflow === 'visible' ? undefined : p.overflow,
    position: isAbs ? 'absolute' : undefined,
    // Absolute coords: right/bottom take precedence over left/top when defined
    top: isAbs && p.positionBottom == null ? (p.positionTop ?? 0) : undefined,
    bottom: isAbs && p.positionBottom != null ? p.positionBottom : undefined,
    left: isAbs && p.positionRight == null ? (p.positionLeft ?? 0) : undefined,
    right: isAbs && p.positionRight != null ? p.positionRight : undefined,
    zIndex: p.zIndex || undefined,
  };
}
