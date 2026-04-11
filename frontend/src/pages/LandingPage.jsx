import React from 'react';
import { ArrowRight, Brain, Clock3, LibraryBig, Sparkles, WandSparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '@/components/brand/Logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage({ session }) {
  return (
    <div className="min-h-screen pb-12">
      <header className="page-shell pt-5">
        <div className="surface-panel flex items-center justify-between rounded-full px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            {session.authenticated ? (
              <Link to="/library">
                <Button variant="secondary">Open app</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link to="/register">
                  <Button>Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="page-shell pt-12 sm:pt-16 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-7">
            <Badge className="rounded-full px-4 py-2 text-sm" variant="secondary">
              React + Vite + Spring Boot + shadcn-inspired UI
            </Badge>
            <div className="space-y-5">
              <h1 className="max-w-3xl font-display text-5xl leading-none sm:text-6xl lg:text-7xl">
                Make studying feel calm, fast, and hard to put off.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Quizards turns class notes or a rough topic prompt into polished flashcards, then gives you a cleaner way
                to review them without fighting the interface.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to={session.authenticated ? '/create' : '/register'}>
                <Button className="w-full sm:w-auto" size="lg">
                  Build a study set
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={session.authenticated ? '/library' : '/login'}>
                <Button className="w-full sm:w-auto" size="lg" variant="outline">
                  {session.authenticated ? 'Browse my library' : 'Log in'}
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Metric value="Seconds" label="to get a first draft" />
              <Metric value="Editable" label="before you save" />
              <Metric value="Focused" label="study mode flow" />
            </div>
          </div>

          <Card className="overflow-hidden rounded-[36px]">
            <CardContent className="p-0">
              <div className="bg-linear-to-br from-primary/12 via-white/45 to-accent/12 p-6 sm:p-8">
                <div className="grid gap-4">
                  <FeatureCard
                    icon={WandSparkles}
                    title="Generate from messy notes"
                    copy="Paste a lecture outline, textbook bullets, or a direct prompt and get a structured deck immediately."
                  />
                  <FeatureCard
                    icon={LibraryBig}
                    title="Keep decks organized"
                    copy="Browse your saved sets, see card counts, and jump back into review without digging around."
                  />
                  <FeatureCard
                    icon={Brain}
                    title="Study one card at a time"
                    copy="Use a cleaner flip-card experience with visible progress and simple next-step controls."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="page-shell mt-16 grid gap-4 md:grid-cols-3">
        <Panel icon={Sparkles} title="Draft quickly" text="The creation flow is split into prompt, review, and save stages so users always know where they are." />
        <Panel icon={Clock3} title="Waste less time" text="Important actions stay visible, forms are simpler, and empty states point directly to the next step." />
        <Panel icon={LibraryBig} title="Study more often" text="The library and study screens now prioritize readability, mobile use, and fast re-entry into a deck." />
      </section>
    </div>
  );
}

function Metric({ value, label }) {
  return (
    <div className="rounded-[28px] border border-border/70 bg-white/60 p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, copy }) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
    </div>
  );
}

function Panel({ icon: Icon, title, text }) {
  return (
    <Card className="rounded-[30px]">
      <CardContent className="p-6">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}
