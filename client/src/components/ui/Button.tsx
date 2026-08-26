import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'navy' | 'primary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] rounded-xl tracking-wide';

    const variants = {
      primary: 'bg-charcoal-900 hover:bg-charcoal-800 text-white shadow-card focus:ring-2 focus:ring-charcoal-900/30',
      navy: 'bg-charcoal-900 hover:bg-charcoal-800 text-white shadow-card focus:ring-2 focus:ring-charcoal-900/30',
      accent: 'bg-bronze-500 hover:bg-bronze-600 text-white font-semibold shadow-bronze focus:ring-2 focus:ring-bronze-500/40',
      gold: 'bg-bronze-500 hover:bg-bronze-600 text-white font-semibold shadow-bronze focus:ring-2 focus:ring-bronze-500/40',
      outline:
        'border border-charcoal-900/80 text-charcoal-900 hover:bg-charcoal-900 hover:text-white bg-transparent font-medium transition-colors',
      ghost: 'text-charcoal-700 hover:bg-cream-100 hover:text-charcoal-950 bg-transparent',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-2 focus:ring-rose-500/30 shadow-sm',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5',
      md: 'text-sm px-5 py-2.5 gap-2',
      lg: 'text-base px-7 py-3.5 gap-2.5 font-medium',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';
