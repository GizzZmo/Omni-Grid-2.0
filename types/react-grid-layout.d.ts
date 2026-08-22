/**
 * Local ambient module for react-grid-layout@1.4.x.
 * @types/react-grid-layout@2.x is a deprecated stub ("package provides its own types")
 * but 1.4.4 does not ship types — without this file, named imports fail typecheck in CI.
 */
declare module 'react-grid-layout' {
  import * as React from 'react';

  export interface Layout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    maxW?: number;
    minH?: number;
    maxH?: number;
    static?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
    resizeHandles?: Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>;
    isBounded?: boolean;
  }

  export type Layouts = Record<string, Layout[]>;

  export interface CoreProps {
    className?: string;
    style?: React.CSSProperties;
    width?: number;
    autoSize?: boolean;
    draggableCancel?: string;
    draggableHandle?: string;
    compactType?: 'vertical' | 'horizontal' | null;
    rowHeight?: number;
    maxRows?: number;
    isDraggable?: boolean;
    isResizable?: boolean;
    isBounded?: boolean;
    preventCollision?: boolean;
    useCSSTransforms?: boolean;
    transformScale?: number;
    margin?: [number, number];
    containerPadding?: [number, number] | null;
    resizeHandles?: Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>;
    onLayoutChange?: (layout: Layout[]) => void;
    children?: React.ReactNode;
  }

  export interface ReactGridLayoutProps extends CoreProps {
    layout?: Layout[];
    cols?: number;
  }

  export interface ResponsiveProps extends CoreProps {
    breakpoints?: Record<string, number>;
    cols?: Record<string, number>;
    layouts?: Layouts;
    onLayoutChange?: (layout: Layout[], layouts: Layouts) => void;
    onBreakpointChange?: (newBreakpoint: string, cols: number) => void;
  }

  export interface WidthProviderProps {
    measureBeforeMount?: boolean;
  }

  export class Responsive extends React.Component<ResponsiveProps> {}

  export function WidthProvider<P>(
    component: React.ComponentType<P>
  ): React.ComponentClass<P & WidthProviderProps>;

  export default class ReactGridLayout extends React.Component<ReactGridLayoutProps> {}
}
