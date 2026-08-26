import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gold' | 'bronze' | 'navy' | 'primary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'md', ...props }: BadgeProps) {
  const base =
    'inline-flex items-center font-semibold rounded-full tracking-wider transition-colors';

  const variants = {
    default: 'bg-charcoal-100 text-charcoal-800 border border-charcoal-200/80',
    gold: 'bg-bronze-50 text-bronze-800 border border-bronze-200',
    bronze: 'bg-bronze-50 text-bronze-800 border border-bronze-200',
    navy: 'bg-charcoal-900 text-white border border-charcoal-950',
    primary: 'bg-charcoal-900 text-white border border-charcoal-950',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200',
    outline: 'bg-transparent text-charcoal-700 border border-charcoal-300',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 uppercase',
    md: 'text-xs px-2.5 py-1',
  };

  return <span className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
