import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, startIcon, endIcon, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute left-3.5 text-charcoal-400 pointer-events-none flex items-center">
              {startIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 bg-white border border-charcoal-200 rounded-xl text-sm text-charcoal-950 placeholder-charcoal-400 transition-all duration-200 focus:outline-none focus:border-bronze-500 focus:ring-2 focus:ring-bronze-500/20 disabled:bg-cream-100 disabled:cursor-not-allowed',
              startIcon && 'pl-10',
              endIcon && 'pr-10',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
              className,
            )}
            aria-invalid={!!error}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3.5 text-charcoal-400 pointer-events-none flex items-center">
              {endIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-charcoal-500">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
