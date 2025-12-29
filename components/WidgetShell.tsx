import React from 'react';
import { X, Download, Upload } from 'lucide-react';
import { useAppStore } from '../store';

interface WidgetShellProps {
  id: string;
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  accentColor: string;
  className?: string;
  // Passed by react-grid-layout
  style?: React.CSSProperties;
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onTouchEnd?: React.TouchEventHandler;
  // Persistence props
  onExport?: () => void;
  onImport?: () => void;
}

export const WidgetShell = React.forwardRef<HTMLDivElement, WidgetShellProps>(
  (
    {
      id,
      title,
      children,
      icon,
      accentColor,
      style,
      className,
      onMouseDown,
      onMouseUp,
      onTouchEnd,
      onExport,
      onImport,
      ...props
    },
    ref
  ) => {
    // Optimization: Select only specific state to prevent re-render on unrelated store changes
    const toggleWidget = useAppStore(s => s.toggleWidget);
    const isLayoutLocked = useAppStore(s => s.isLayoutLocked);

    // Cyberpunk dynamic border colors mapping
    const borderColor =
      accentColor.replace('text-', 'border-').replace('400', '500').replace('300', '500') ||
      'border-cyan-500';

    const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
      e.stopPropagation();
      e.preventDefault();
      action();
    };

    const handleButtonMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation();
    };

    return (
      <div
        ref={ref}
        style={style}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        className={`flex flex-col bg-slate-900/90 backdrop-blur-lg shadow-lg group transition-all duration-300 ${className || ''}`}
        {...props}
        role="region"
        aria-label={`${title} Widget`}
      >
        {/* Cyberpunk Decorative Border/Container with Clip Path */}
        <div
          className={`absolute inset-0 pointer-events-none border ${borderColor} opacity-30 group-hover:opacity-60 transition-opacity`}
          style={{
            clipPath:
              'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
          }}
        ></div>

        {/* Glowing Corner Accents */}
        <div
          className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${borderColor} opacity-80`}
        ></div>
        <div
          className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${borderColor} opacity-80`}
        ></div>

        {/* Header */}
        <div
          className={`drag-handle relative flex items-center justify-between px-3 py-2 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent ${isLayoutLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
        >
          {/* Angled header background */}
          <div className="absolute top-0 left-0 w-full h-full opacity-50 bg-[linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>

          <div className="relative flex items-center gap-2 z-10">
            <span className={`${accentColor} drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]`}>
              {icon}
            </span>
            <span className="font-display text-xs font-bold tracking-widest text-slate-200 uppercase">
              {title}
            </span>
          </div>

          <div className="relative flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity z-10">
            {onExport && (
              <button
                className="p-1 hover:bg-cyan-900/50 hover:text-cyan-400 rounded mr-1 transition-colors"
                onClick={e => handleButtonClick(e, onExport)}
                onMouseDown={handleButtonMouseDown}
                title="Dump Memory"
                aria-label={`Export ${title} Data`}
              >
                <Download size={12} />
              </button>
            )}
            {onImport && (
              <button
                className="p-1 hover:bg-fuchsia-900/50 hover:text-fuchsia-400 rounded mr-1 transition-colors"
                onClick={e => handleButtonClick(e, onImport)}
                onMouseDown={handleButtonMouseDown}
                title="Inject Data"
                aria-label={`Import ${title} Data`}
              >
                <Upload size={12} />
              </button>
            )}
            <button
              className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors"
              onClick={e => handleButtonClick(e, () => toggleWidget(id))}
              onMouseDown={handleButtonMouseDown}
              aria-label={`Close ${title} Widget`}
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 custom-scrollbar relative z-10">{children}</div>
      </div>
    );
  }
);

WidgetShell.displayName = 'WidgetShell';
