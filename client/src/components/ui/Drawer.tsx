import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: 'left' | 'right';
  width?: 'sm' | 'md' | 'lg' | 'xl';
  showShippingBar?: boolean;
  cartSubtotal?: number;
  freeShippingThreshold?: number;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  position = 'right',
  width = 'md',
  showShippingBar = false,
  cartSubtotal = 0,
  freeShippingThreshold = 250,
}: DrawerProps) {
  const drawerRef = useRef<HTMLHeadingElement>(null);

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

  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const active = document.activeElement;
      if (!active || !drawerRef.current.contains(active)) {
        drawerRef.current.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const widths = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const positionStyles = {
    left: 'left-0 translate-x-0',
    right: 'right-0 translate-x-0',
  };

  const amountRemaining = Math.max(0, freeShippingThreshold - cartSubtotal);
  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        className={cn(
          'fixed top-0 bottom-0 w-full bg-white shadow-2xl z-10 flex flex-col transition-transform duration-300 ease-in-out border-l border-slate-200/80',
          widths[width],
          positionStyles[position],
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/60">
          {title ? (
            <h3 ref={drawerRef} tabIndex={-1} id="drawer-title" className="text-lg font-bold text-slate-950 font-serif outline-none">{title}</h3>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-200/70 transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Optional Free Shipping Threshold Progress Bar */}
        {showShippingBar && (
          <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 text-xs font-semibold text-slate-800 space-y-1.5">
            <div className="flex justify-between items-center">
              <span>
                {amountRemaining > 0 ? (
                  <>
                    Add <strong className="text-amber-700 font-bold">${amountRemaining.toFixed(2)}</strong> more for <strong className="text-amber-800 font-bold">Complimentary Express Shipping</strong>
                  </>
                ) : (
                  <span className="text-emerald-700 font-bold">🎉 You qualify for Free Express Shipping!</span>
                )}
              </span>
              <span className="text-[11px] font-mono text-amber-800 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && <div className="p-6 border-t border-slate-100 bg-slate-50/40">{footer}</div>}
      </aside>
    </div>
  );
}

