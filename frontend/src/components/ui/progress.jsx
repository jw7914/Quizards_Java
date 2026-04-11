import React from 'react';
import { cn } from '@/lib/utils';

export function Progress({ className, value = 0, ...props }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)} {...props}>
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}
