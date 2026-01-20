
import React, { useState, useEffect, useRef } from 'react';
import IconRenderer from './IconRenderer';

interface MockWindowProps {
  id: string;
  title: string;
  icon: string;
  isMaximized: boolean;
  isMinimized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
  children: React.ReactNode;
}

const MockWindow: React.FC<MockWindowProps> = ({ 
  id, title, icon, isMaximized, isMinimized, 
  x, y, width, height, zIndex,
  onClose, onMinimize, onMaximize, onFocus, onMove, onResize, children 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartDim = useRef({ w: 0, h: 0, x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    onFocus();
    if (isMaximized) return;
    
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - x,
      y: e.clientY - y,
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus();
    setIsResizing(true);
    resizeStartDim.current = {
      w: width,
      h: height,
      x: e.clientX,
      y: e.clientY
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onMove(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
      }
      if (isResizing) {
        const dx = e.clientX - resizeStartDim.current.x;
        const dy = e.clientY - resizeStartDim.current.y;
        onResize(
          Math.max(400, resizeStartDim.current.w + dx),
          Math.max(300, resizeStartDim.current.h + dy)
        );
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, onMove, onResize]);

  if (isMinimized) return null;

  const style: React.CSSProperties = isMaximized 
    ? { top: 0, left: 0, width: '100vw', height: 'calc(100vh - 48px)', zIndex }
    : { top: y, left: x, width, height, zIndex };

  return (
    <div 
      className={`fixed flex flex-col overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl transition-all duration-75 ease-out ${isMaximized ? 'rounded-none' : 'rounded-xl'}`}
      style={style}
      onMouseDown={onFocus}
    >
      {/* Title Bar */}
      <div 
        className="h-10 bg-slate-800 flex items-center justify-between px-4 select-none cursor-default active:cursor-grabbing shrink-0"
        onMouseDown={handleMouseDown}
        onDoubleClick={onMaximize}
      >
        <div className="flex items-center gap-2 pointer-events-none">
          <IconRenderer name={icon} size={16} className="text-slate-300" />
          <span className="text-xs font-medium text-slate-200">{title}</span>
        </div>
        <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
          <button 
            onClick={onMinimize} 
            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 transition-colors"
            title="Minimize"
          >
            <div className="w-3 h-0.5 bg-current" />
          </button>
          <button 
            onClick={onMaximize} 
            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 transition-colors"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            <IconRenderer name={isMaximized ? "Minimize2" : "Maximize2"} size={14} />
          </button>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-red-500 hover:text-white rounded text-slate-400 transition-colors"
            title="Close"
          >
            <IconRenderer name="X" size={14} />
          </button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-slate-950 p-0 relative">
        <div className="w-full h-full p-6">
          {children}
        </div>
        
        {/* Resize Handle */}
        {!isMaximized && (
          <div 
            onMouseDown={handleResizeMouseDown}
            className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize z-50 group"
          >
            <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-r-2 border-b-2 border-slate-600 group-hover:border-blue-500 transition-colors" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MockWindow;
