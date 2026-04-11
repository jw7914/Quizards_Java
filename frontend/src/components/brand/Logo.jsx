import React from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Logo({ className, to = '/' }) {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-3 text-foreground', className)}>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
        <Sparkles className="h-5 w-5" />
      </span>
      <span className="flex flex-col">
        <span className="font-display text-2xl leading-none">Quizards</span>
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Study sharper</span>
      </span>
    </Link>
  );
}
