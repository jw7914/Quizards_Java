import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Stack, TextField, Alert, MenuItem, Grid, Card } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { fetchJson } from '../utils/api';

export default function CreatePage({ session }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [promptConsumed, setPromptConsumed] = useState(false);
  const [status, setStatus] = useState(null);
  
  // Deck State
  const [deck, setDeck] = useState({ title: '', description: '', visibility: 'PRIVATE', flashcards: [{ prompt: '', answer: '' }] });

  async function handleGenerate(e) {
    e.preventDefault();
    if (promptConsumed) return;
    const form = new FormData(e.currentTarget);
    const prompt = String(form.get('prompt') || '').trim();
    if (!prompt) return;

    setPromptConsumed(true);
    setMessages([{ role: 'user', content: prompt }]);
    setStatus({ type: 'info', message: 'AI is generating your deck...' });

    try {
      const resp = await fetchJson('/api/ai/generate-draft', { method: 'POST', body: JSON.stringify({ prompt, visibility: deck.visibility }) });
      setDeck({ title: resp.title || 'Untitled Deck', description: resp.summary || '', visibility: deck.visibility, flashcards: resp.flashcards?.length ? resp.flashcards : [{ prompt: '', answer: '' }] });
      setMessages(m => [...m, { role: 'assistant', content: `Done! Generated "${resp.title}" with ${resp.flashcards?.length} cards.` }]);
      setStatus(null);
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: `Error: ${err.message}` }]);
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
    <Box sx={{ minHeight: 'calc(100vh - 128px)', display: 'flex', flexDirection: 'column' }}>
      {(!promptConsumed || messages.length < 2) ? (
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, width: '100%', maxWidth: 720, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>Generate Study Deck</Typography>
            <Typography color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
              Describe the topic, paste your notes, or specify exactly what you need. AI will instantly build a custom study deck.
            </Typography>
            
            <Box component="form" onSubmit={handleGenerate}>
              {status && <Alert severity={status.type} sx={{ mb: 3 }}>{status.message}</Alert>}
              <TextField 
                name="prompt" 
                multiline 
                minRows={6} 
                maxRows={12} 
                placeholder="E.g., Generate a study deck about European history focusing on WW2 with 15 cards." 
                fullWidth 
                required 
                disabled={promptConsumed} 
                sx={{ mb: 3 }} 
              />
              <Button type="submit" variant="contained" color="secondary" size="large" fullWidth disabled={promptConsumed} sx={{ py: 1.5, fontSize: '1.1rem' }}>
                {promptConsumed ? 'AI is generating...' : 'Generate Deck'}
              </Button>
            </Box>
          </Paper>
        </Box>
      ) : (
        <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 6, flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)', pb: 4, mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Review Your Deck</Typography>
            <Grid container spacing={3}>
               <Grid item xs={12} md={6}>
                 <TextField label="Title" value={deck.title} onChange={e => setDeck({...deck, title: e.target.value})} fullWidth />
               </Grid>
               <Grid item xs={12} md={6}>
                 <Stack direction="row" spacing={2} sx={{ height: '100%', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                   <TextField select label="Visibility" value={deck.visibility} onChange={e => setDeck({...deck, visibility: e.target.value})} sx={{ minWidth: 160 }}>
                     <MenuItem value="PRIVATE">Private</MenuItem>
                     <MenuItem value="PUBLIC">Public</MenuItem>
                   </TextField>
                   <Button variant="contained" size="large" onClick={handleSave} color="secondary" sx={{ py: 1.5 }}>Save to Library</Button>
                 </Stack>
               </Grid>
               <Grid item xs={12}>
                 <TextField label="Description" value={deck.description} onChange={e => setDeck({...deck, description: e.target.value})} fullWidth multiline minRows={2} />
               </Grid>
            </Grid>
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>Flashcards ({deck.flashcards.length})</Typography>
            <Stack spacing={3}>
              {deck.flashcards.map((card, i) => (
                <Card key={i} sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 3, border: '1px solid rgba(255,255,255,0.03)' }}>
                   <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>Card {i + 1}</Typography>
                   <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                     <TextField label="Prompt" value={card.prompt} onChange={e => updateCard(i, 'prompt', e.target.value)} multiline minRows={3} fullWidth />
                     <TextField label="Answer" value={card.answer} onChange={e => updateCard(i, 'answer', e.target.value)} multiline minRows={3} fullWidth />
                   </Stack>
                </Card>
              ))}
            </Stack>
            <Button variant="outlined" sx={{ mt: 4, py: 1.5 }} fullWidth onClick={() => setDeck({...deck, flashcards: [...deck.flashcards, {prompt: '', answer: ''}]})}>
              + Add Another Card
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
