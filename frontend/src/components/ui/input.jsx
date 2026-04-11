import React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-2xl border border-input bg-white/70 px-4 py-2 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      {...props}
    />
  );
});
