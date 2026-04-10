import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Stack, Chip, Grid, Card, CardContent, Divider, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { fetchJson } from '../utils/api';

export default function LibraryPage() {
  const [studySets, setStudySets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson('/api/my/study-sets')
      .then(data => { setStudySets(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, []);

  if (loading) return <CircularProgress color="primary" />;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ mb: 1 }}>My Library</Typography>
          <Typography color="text.secondary">You have {studySets.length} saved study {studySets.length === 1 ? 'set' : 'sets'}.</Typography>
        </Box>
      </Stack>

      {!studySets.length ? (
        <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 8, bgcolor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <LibraryBooksIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 1 }}>No study sets yet</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Generate your first deck using AI to start learning.</Typography>
          <Button component={RouterLink} to="/create" variant="contained" color="secondary">Create First Set</Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {studySets.map(set => (
            <Grid item xs={12} sm={6} lg={4} key={set.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', transform: 'translateY(-4px)' } }}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h5" sx={{ mb: 1 }}>{set.title}</Typography>
                  <Typography color="text.secondary" sx={{ mb: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{set.description}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                    <Chip size="small" label={`${set.flashcardCount} cards`} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                    <Chip size="small" label={set.visibility} color={set.visibility === 'PUBLIC' ? 'success' : 'default'} variant="outlined" />
                  </Stack>
                </CardContent>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <Button component={RouterLink} to={`/study-set/${set.id}`} variant="contained" fullWidth>Study Now</Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
