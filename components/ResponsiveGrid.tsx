import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useContainerWidth } from '../hooks/useContainerWidth';

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface ResponsiveGridProps {
  layout: Layout[];
  onLayoutChange: (layout: Layout[]) => void;
  isLayoutLocked: boolean;
  isCompact: boolean;
  children: React.ReactNode;
}

/**
 * Touch-first responsive grid shell.
 * - Breakpoints: lg/md/sm/xs/xxs with 12→2 columns
 * - Auto-compact on mobile; resize disabled under 768px
 * - Drag via `.drag-handle` only; inputs/buttons cancelled
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  layout,
  onLayoutChange,
  isLayoutLocked,
  isCompact,
  children,
}) => {
  const isMobile = useIsMobile();
  const { width, containerRef, mounted } = useContainerWidth();
  const effectiveCompact = isCompact || isMobile;

  return (
    <div ref={containerRef} className="w-full min-h-full touch-pan-y">
      {mounted && (
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={isMobile ? 36 : 30}
          width={width}
          draggableHandle=".drag-handle"
          draggableCancel=".no-drag,input,textarea,button,a,select,[role='button']"
          onLayoutChange={onLayoutChange}
          compactType={effectiveCompact ? 'vertical' : null}
          preventCollision={false}
          margin={isMobile ? ([8, 8] as [number, number]) : ([16, 16] as [number, number])}
          containerPadding={
            isMobile ? ([4, 4] as [number, number]) : ([0, 0] as [number, number])
          }
          isDraggable={!isLayoutLocked}
          isResizable={!isLayoutLocked && !isMobile}
          resizeHandles={['se']}
          useCSSTransforms
        >
          {children}
        </ResponsiveGridLayout>
      )}
    </div>
  );
};
