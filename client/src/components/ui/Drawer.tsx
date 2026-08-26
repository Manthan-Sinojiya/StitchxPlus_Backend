import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: 'left' | 'right';
  width?: 'sm' | 'md' | 'lg';
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  position = 'right',
  width = 'md',
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  const positionStyles = {
    left: 'left-0 translate-x-0',
    right: 'right-0 translate-x-0',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-950/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        className={cn(
          'fixed top-0 bottom-0 w-full bg-white shadow-modal z-10 flex flex-col transition-transform duration-300 ease-in-out border-l border-charcoal-200/60',
          widths[width],
          positionStyles[position],
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-100 bg-cream-50/50">
          {title ? (
            <h3 id="drawer-title" className="text-lg font-bold text-charcoal-950 font-heading">{title}</h3>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="text-charcoal-400 hover:text-charcoal-800 p-1.5 rounded-lg hover:bg-cream-100 transition-colors focus-visible:ring-2 focus-visible:ring-bronze-500"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && <div className="p-6 border-t border-charcoal-100 bg-cream-50/40">{footer}</div>}
      </aside>
    </div>
  );
}
