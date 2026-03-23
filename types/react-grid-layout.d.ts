declare module 'react-grid-layout' {
  import { ComponentType, CSSProperties, ReactNode } from 'react';

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
  }

  export interface ReactGridLayoutProps {
    className?: string;
    style?: CSSProperties;
    layout?: Layout[];
    cols?: number;
    rowHeight?: number;
    width?: number;
    onLayoutChange?: (layout: Layout[]) => void;
    isDraggable?: boolean;
    isResizable?: boolean;
    margin?: [number, number];
    containerPadding?: [number, number] | null;
    children?: ReactNode;
    [key: string]: unknown;
  }

  const ReactGridLayout: ComponentType<ReactGridLayoutProps> & {
    WidthProvider: <P>(component: ComponentType<P>) => ComponentType<Omit<P, 'width'>>;
  };

  export default ReactGridLayout;
}
