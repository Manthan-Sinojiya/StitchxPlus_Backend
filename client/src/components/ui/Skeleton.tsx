import React from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className, variant = 'text', ...props }: SkeletonProps) {
  const variants = {
    text: 'h-4 w-full rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div className={cn('animate-pulse bg-charcoal-100', variants[variant], className)} {...props} />
  );
}

export function Loader({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-bronze-500/20 border-t-bronze-500',
          sizes[size],
        )}
      />
    </div>
  );
}
