import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Stack, AppBar, Toolbar, IconButton, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchJson } from '../utils/api';

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

  if (loading) return <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (error || !deck) return <Box sx={{ p: 4 }}><Alert severity="error">{error || 'Deck not found'}</Alert><Button onClick={() => navigate('/library')} sx={{ mt: 2 }}>Go Back</Button></Box>;
  if (!deck.flashcards || !deck.flashcards.length) return <Box sx={{ p: 4 }}><Alert severity="info">This deck is empty.</Alert><Button onClick={() => navigate('/library')} sx={{ mt: 2 }}>Go Back</Button></Box>;

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
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Toolbar>
          <IconButton onClick={() => navigate('/library')} sx={{ mr: 2 }}><ArrowBackIcon /></IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>{deck.title}</Typography>
          <Typography color="text.secondary">{currentIndex + 1} / {deck.flashcards.length}</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, perspective: '1000px' }}>
        {/* Flip Card Container */}
        <Box 
          onClick={() => setFlipped(!flipped)}
          sx={{ 
            width: '100%', maxWidth: 800, aspectRatio: { xs: '3/4', md: '16/9' }, 
            position: 'relative', cursor: 'pointer',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateX(180deg)' : 'rotateX(0deg)'
          }}
        >
          {/* Front */}
          <Paper 
            elevation={24}
            sx={{
              position: 'absolute', width: '100%', height: '100%', 
              backfaceVisibility: 'hidden', p: { xs: 4, md: 8 }, 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, bgcolor: 'rgba(24, 24, 27, 0.8)', border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
             <Typography variant="overline" color="primary" sx={{ position: 'absolute', top: 32, letterSpacing: 2 }}>Question</Typography>
             <Typography variant="h3" textAlign="center" sx={{ maxWidth: '90%', flexGrow: 1, display: 'flex', alignItems: 'center' }}>
               {currentCard.prompt}
             </Typography>
             <Typography color="text.secondary" sx={{ position: 'absolute', bottom: 32 }}>Click to flip</Typography>
          </Paper>
          
          {/* Back */}
          <Paper 
            elevation={24}
            sx={{
              position: 'absolute', width: '100%', height: '100%', 
              backfaceVisibility: 'hidden', p: { xs: 4, md: 8 }, 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, bgcolor: 'primary.dark',
              transform: 'rotateX(180deg)'
            }}
          >
             <Typography variant="overline" sx={{ position: 'absolute', top: 32, color: 'rgba(255,255,255,0.7)', letterSpacing: 2 }}>Answer</Typography>
             <Typography variant="h4" textAlign="center" sx={{ maxWidth: '90%', flexGrow: 1, display: 'flex', alignItems: 'center' }}>
               {currentCard.answer}
             </Typography>
          </Paper>
        </Box>

        {/* Controls */}
        <Stack direction="row" spacing={4} sx={{ mt: 8, alignItems: 'center' }}>
           <Button variant="outlined" onClick={handlePrev} disabled={currentIndex === 0} sx={{ width: 140 }}>Previous</Button>
           <Button variant="contained" color="secondary" onClick={() => setFlipped(!flipped)} sx={{ width: 140 }}>Flip</Button>
           <Button variant="outlined" onClick={handleNext} disabled={currentIndex === deck.flashcards.length - 1} sx={{ width: 140 }}>Next</Button>
        </Stack>
      </Box>
    </Box>
  );
}
