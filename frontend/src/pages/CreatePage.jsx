import React, { useState } from 'react';
import { Check, Plus, Sparkles, WandSparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { fetchJson } from '@/utils/api';

export default function CreatePage({ session }) {
  const navigate = useNavigate();
  const [promptConsumed, setPromptConsumed] = useState(false);
  const [status, setStatus] = useState(null);
  const [takeaways, setTakeaways] = useState([]);
  const [deck, setDeck] = useState({ title: '', description: '', visibility: 'PRIVATE', flashcards: [{ prompt: '', answer: '' }] });

  async function handleGenerate(e) {
    e.preventDefault();
    if (promptConsumed) return;
    const form = new FormData(e.currentTarget);
    const prompt = String(form.get('prompt') || '').trim();
    if (!prompt) return;

    setPromptConsumed(true);
    setStatus({ type: 'info', message: 'AI is generating your deck...' });

    try {
      const resp = await fetchJson('/api/ai/generate-draft', { method: 'POST', body: JSON.stringify({ prompt, visibility: deck.visibility }) });
      setDeck({ title: resp.title || 'Untitled Deck', description: resp.summary || '', visibility: deck.visibility, flashcards: resp.flashcards?.length ? resp.flashcards : [{ prompt: '', answer: '' }] });
      setTakeaways(resp.keyTakeaways || []);
      setStatus(null);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
      setPromptConsumed(false);
    }
  }

  async function handleSave() {
    const cleaned = deck.flashcards.map(c => ({ prompt: c.prompt.trim(), answer: c.answer.trim() })).filter(c => c.prompt && c.answer);
    if (!cleaned.length) { setStatus({ type: 'error', message: 'Add at least one valid flashcard.' }); return; }

    setStatus({ type: 'info', message: 'Saving deck to library...' });
    try {
      await fetchJson('/api/ai/save-generated-study-set', { method: 'POST', body: JSON.stringify({ ...deck, flashcards: cleaned }) });
      navigate('/library');
    } catch (err) { setStatus({ type: 'error', message: err.message }); }
  }

  function updateCard(idx, key, val) {
    const next = [...deck.flashcards];
    next[idx] = { ...next[idx], [key]: val };
    setDeck({ ...deck, flashcards: next });
  }

  return (
    <div className="space-y-6">
      <section className="surface-panel rounded-[36px] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge>Create with AI</Badge>
            <h1 className="font-display text-4xl sm:text-5xl">Turn rough notes into a study-ready deck.</h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Start with a prompt, then edit the generated cards before saving them to your library.
            </p>
          </div>
          <div className="rounded-[28px] border border-border/70 bg-white/60 px-5 py-4">
            <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Signed in</div>
            <div className="mt-1 font-semibold">{session.username}</div>
          </div>
        </div>
      </section>

      {!promptConsumed ? (
        <Card className="rounded-[36px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <WandSparkles className="h-6 w-6 text-secondary" />
              Generate a deck
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Be specific about scope, number of cards, or the exact concepts you want to review.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleGenerate}>
              {status ? <Alert tone={status.type === 'error' ? 'error' : 'info'}>{status.message}</Alert> : null}
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt or notes</Label>
                <Textarea
                  disabled={promptConsumed}
                  id="prompt"
                  name="prompt"
                  placeholder="Generate a 15-card deck on World War II causes, major events, and outcomes. Emphasize chronology and key leaders."
                  required
                  rows={8}
                />
              </div>
              <Button className="w-full sm:w-auto" size="lg" type="submit">
                <Sparkles className="h-4 w-4" />
                Generate deck
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
          <Card className="rounded-[36px]">
            <CardHeader>
              <CardTitle className="text-2xl">Review summary</CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">
                Adjust the high-level details before saving the deck.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {status ? <Alert tone={status.type === 'error' ? 'error' : 'info'}>{status.message}</Alert> : null}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" onChange={e => setDeck({ ...deck, title: e.target.value })} value={deck.title} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" onChange={e => setDeck({ ...deck, description: e.target.value })} rows={4} value={deck.description} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <select
                  className="flex h-11 w-full rounded-2xl border border-input bg-white/70 px-4 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  id="visibility"
                  onChange={e => setDeck({ ...deck, visibility: e.target.value })}
                  value={deck.visibility}
                >
                  <option value="PRIVATE">Private</option>
                  <option value="PUBLIC">Public</option>
                </select>
              </div>
              {takeaways.length ? (
                <div className="space-y-3 rounded-[28px] bg-muted/70 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Key takeaways</div>
                  <div className="space-y-2">
                    {takeaways.map(item => (
                      <div className="flex items-start gap-2 text-sm leading-6 text-muted-foreground" key={item}>
                        <Check className="mt-1 h-4 w-4 shrink-0 text-accent" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <Button className="w-full" size="lg" variant="secondary" onClick={handleSave} type="button">
                Save to library
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[36px]">
            <CardHeader>
              <CardTitle className="text-2xl">Edit flashcards</CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">
                Tighten wording, remove weak cards, or add your own before you save.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{deck.flashcards.length} cards</Badge>
                <Button
                  onClick={() => setDeck({ ...deck, flashcards: [...deck.flashcards, { prompt: '', answer: '' }] })}
                  type="button"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  Add card
                </Button>
              </div>
              <div className="space-y-4">
                {deck.flashcards.map((card, i) => (
                  <div className="rounded-[28px] border border-border/70 bg-white/55 p-4 sm:p-5" key={`${i}-${card.prompt}`}>
                    <div className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Card {i + 1}</div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Prompt</Label>
                        <Textarea onChange={e => updateCard(i, 'prompt', e.target.value)} rows={5} value={card.prompt} />
                      </div>
                      <div className="space-y-2">
                        <Label>Answer</Label>
                        <Textarea onChange={e => updateCard(i, 'answer', e.target.value)} rows={5} value={card.answer} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
