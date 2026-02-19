import React from 'react';

/**
 * Shared layout/positioning properties for ALL blocks.
 * These are applied as a wrapper style around every block.
 */
export interface LayoutProps {
  /** Width: 'auto', '100%', '75%', '50%', 'fit-content', or fixed px value like '200px' */
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

/**
 * Converts LayoutProps into a CSSProperties object for the block OUTER wrapper.
 * IMPORTANT: This must be applied to the outermost div, NOT to a div that also
 * has className="relative", because Tailwind's `relative` overrides `position: absolute`.
 */
export function getLayoutStyle(props: Partial<LayoutProps>): React.CSSProperties {
  const p = { ...DEFAULT_LAYOUT_PROPS, ...props };
  const isAbs = p.positionType === 'absolute';

  if (isAbs) {
    // Absolute mode: position relative to the CanvasDropArea (the nearest `position:relative` parent)
    // right overrides left; bottom overrides top when explicitly set (not null/undefined)
    const hasRight = p.positionRight != null;
    const hasBottom = p.positionBottom != null;
    return {
      position: 'absolute',
      top: hasBottom ? undefined : (p.positionTop ?? 0),
      bottom: hasBottom ? p.positionBottom : undefined,
      left: hasRight ? undefined : (p.positionLeft ?? 0),
      right: hasRight ? p.positionRight : undefined,
      width: p.layoutWidth === 'auto' ? undefined : p.layoutWidth,
      height: p.layoutHeight === 'auto' ? undefined : p.layoutHeight,
      zIndex: p.zIndex != null && p.zIndex !== 0 ? p.zIndex : undefined,
      overflow: p.overflow === 'visible' ? undefined : p.overflow,
    };
  }

  // Relative mode: normal document flow
  return {
    position: 'relative',
    width: p.layoutWidth === 'auto' ? undefined : p.layoutWidth,
    height: p.layoutHeight === 'auto' ? undefined : p.layoutHeight,
    marginTop: p.marginTop || undefined,
    marginBottom: p.marginBottom || undefined,
    marginLeft: p.marginLeft || undefined,
    marginRight: p.marginRight || undefined,
    alignSelf: p.alignSelf === 'auto' ? undefined : p.alignSelf,
    overflow: p.overflow === 'visible' ? undefined : p.overflow,
    zIndex: p.zIndex != null && p.zIndex !== 0 ? p.zIndex : undefined,
  };
}
