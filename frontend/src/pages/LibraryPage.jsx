import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpenCheck, Globe, Lock, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchJson } from '@/utils/api';

export default function LibraryPage() {
  const [studySets, setStudySets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson('/api/my/study-sets')
      .then(data => { setStudySets(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="surface-panel flex min-h-[50vh] items-center justify-center rounded-[32px]">
        <div className="text-sm font-medium text-muted-foreground">Loading your study sets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="surface-panel rounded-[36px] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="secondary">My library</Badge>
            <div>
              <h1 className="font-display text-4xl sm:text-5xl">Study sets you can actually return to.</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                You have {studySets.length} saved study {studySets.length === 1 ? 'set' : 'sets'}. Pick one up where you left off
                or generate a new deck in a few clicks.
              </p>
            </div>
          </div>
          <Link to="/create">
            <Button size="lg" variant="secondary">
              <Plus className="h-4 w-4" />
              Create a deck
            </Button>
          </Link>
        </div>
      </section>

      {!studySets.length ? (
        <Card className="rounded-[36px] border-dashed">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary/10 text-primary">
              <BookOpenCheck className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-semibold">Your library is empty</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Start with an AI draft, clean it up, and save it here for repeat study sessions.
            </p>
            <Link className="mt-6" to="/create">
              <Button variant="secondary">Create your first set</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {studySets.map(set => (
            <Card className="rounded-[32px] transition hover:-translate-y-1" key={set.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-2xl">{set.title}</CardTitle>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {set.description || 'No description yet. Open the deck to start reviewing it.'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-muted p-3 text-muted-foreground">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{set.flashcardCount} cards</Badge>
                  <Badge variant={set.visibility === 'PUBLIC' ? 'accent' : 'secondary'}>
                    {set.visibility === 'PUBLIC' ? <Globe className="mr-1 h-3.5 w-3.5" /> : <Lock className="mr-1 h-3.5 w-3.5" />}
                    {set.visibility}
                  </Badge>
                </div>
                <Link to={`/study-set/${set.id}`}>
                  <Button className="w-full">
                    Study now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
