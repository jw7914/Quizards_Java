import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/brand/Logo';
import { Card, CardContent } from '@/components/ui/card';

export default function AuthLayout({ eyebrow, title, description, alternateText, alternateAction, alternateTo, children }) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="page-shell grid min-h-[calc(100vh-4rem)] items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden lg:block">
          <Logo className="mb-10" />
          <div className="max-w-xl space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-secondary">{eyebrow}</p>
            <h1 className="font-display text-6xl leading-none text-foreground">
              Flashcards that feel built for actual studying.
            </h1>
            <p className="max-w-lg text-lg leading-8 text-muted-foreground">
              Generate a draft from raw notes, clean it up quickly, and move straight into distraction-free review.
            </p>
            <div className="grid max-w-md grid-cols-3 gap-4">
              <Stat value="AI draft" label="From prompt to deck" />
              <Stat value="Edit fast" label="Review before saving" />
              <Stat value="Study mode" label="Focus on recall" />
            </div>
          </div>
        </section>

        <Card className="mx-auto w-full max-w-xl rounded-[32px]">
          <CardContent className="p-8 sm:p-10">
            <Logo className="mb-8 lg:hidden" />
            <div className="mb-8 space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-secondary">{eyebrow}</p>
              <h2 className="font-display text-4xl leading-tight">{title}</h2>
              <p className="text-sm text-muted-foreground">
                {description}{' '}
                <Link className="font-semibold text-primary hover:underline" to={alternateTo}>
                  {alternateText} {alternateAction}
                </Link>
              </p>
            </div>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-white/60 p-4">
      <div className="text-lg font-semibold text-foreground">{value}</div>
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    </div>
  );
}
