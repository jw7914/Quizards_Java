import React from 'react';
import { cn } from '@/lib/utils';

export function Avatar({ className, children, ...props }) {
  return (
    <div
      className={cn('flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground', className)}
      {...props}
    >
      {children}
    </div>
  );
}
