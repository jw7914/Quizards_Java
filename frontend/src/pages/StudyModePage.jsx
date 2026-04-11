import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { fetchJson } from '@/utils/api';

export default function StudyModePage({ session }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    fetchJson(`/api/study-sets/${id}`)
      .then(d => { setDeck(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [id]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading study mode...</div>;
  if (error || !deck) return <StateScreen action="Back to library" message={error || 'Deck not found'} navigate={navigate} tone="error" />;
  if (!deck.flashcards || !deck.flashcards.length) return <StateScreen action="Back to library" message="This deck is empty." navigate={navigate} tone="info" />;

  const currentCard = deck.flashcards[currentIndex];

  function handleNext() {
    if (currentIndex < deck.flashcards.length - 1) {
      setFlipped(false);
      setTimeout(() => setCurrentIndex(i => i + 1), 300); // Wait for unflip animation
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setFlipped(false);
      setTimeout(() => setCurrentIndex(i => i - 1), 300);
    }
  }

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="page-shell space-y-6">
        <header className="surface-panel rounded-[32px] p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate('/library')} variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Library
              </Button>
              <div>
                <h1 className="font-display text-3xl">{deck.title}</h1>
                <p className="text-sm text-muted-foreground">{deck.description || 'Focus mode for active recall.'}</p>
              </div>
            </div>
            <div className="min-w-[220px] space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{currentIndex + 1} / {deck.flashcards.length}</span>
              </div>
              <Progress value={((currentIndex + 1) / deck.flashcards.length) * 100} />
            </div>
          </div>
        </header>

        <Card className="rounded-[40px]">
          <CardContent className="p-4 sm:p-8">
            <button
              className="group relative mx-auto block min-h-[60vh] w-full max-w-5xl cursor-pointer [perspective:1400px]"
              onClick={() => setFlipped(!flipped)}
              type="button"
            >
              <div
                className="relative min-h-[60vh] w-full transition-transform duration-500 [transform-style:preserve-3d]"
                style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
              >
                <StudyFace
                  badge="Question"
                  copy={currentCard.prompt}
                  helper="Tap or click to reveal the answer"
                  tone="front"
                />
                <StudyFace badge="Answer" copy={currentCard.answer} helper="Tap or click to return to the prompt" tone="back" />
              </div>
            </button>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Badge variant="outline">Card {currentIndex + 1}</Badge>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button disabled={currentIndex === 0} onClick={handlePrev} variant="outline">
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button onClick={() => setFlipped(!flipped)} variant="secondary">
                  <RotateCcw className="h-4 w-4" />
                  Flip
                </Button>
                <Button disabled={currentIndex === deck.flashcards.length - 1} onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StudyFace({ badge, copy, helper, tone }) {
  return (
    <div
      className={`absolute inset-0 flex min-h-[60vh] flex-col rounded-[36px] border p-6 text-left shadow-[0_30px_100px_-45px_rgba(32,26,22,0.45)] [backface-visibility:hidden] sm:p-10 ${
        tone === 'front'
          ? 'border-border/80 bg-white/80'
          : 'border-primary/20 bg-linear-to-br from-primary to-accent text-white [transform:rotateY(180deg)]'
      }`}
    >
      <div className={`text-xs font-semibold uppercase tracking-[0.3em] ${tone === 'front' ? 'text-secondary' : 'text-white/75'}`}>{badge}</div>
      <div className="flex flex-1 items-center py-10">
        <p className="max-w-3xl text-3xl leading-tight sm:text-4xl">{copy}</p>
      </div>
      <div className={`text-sm ${tone === 'front' ? 'text-muted-foreground' : 'text-white/80'}`}>{helper}</div>
    </div>
  );
}

function StateScreen({ message, navigate, action, tone }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="surface-panel w-full max-w-xl rounded-[32px] p-8">
        <Alert tone={tone}>{message}</Alert>
        <Button className="mt-4" onClick={() => navigate('/library')}>
          {action}
        </Button>
      </div>
    </div>
  );
}
