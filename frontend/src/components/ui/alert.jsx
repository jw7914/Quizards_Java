import React from 'react';
import { cn } from '@/lib/utils';

export function Alert({ className, tone = 'info', ...props }) {
  const tones = {
    info: 'border-primary/20 bg-primary/10 text-foreground',
    error: 'border-destructive/20 bg-destructive/10 text-destructive',
    success: 'border-accent/20 bg-accent/10 text-accent'
  };

  return <div className={cn('rounded-3xl border px-4 py-3 text-sm', tones[tone], className)} {...props} />;
}
