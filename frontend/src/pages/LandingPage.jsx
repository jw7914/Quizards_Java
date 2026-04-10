import React from 'react';
import { AppBar, Box, Button, Chip, Container, Stack, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GradientText from '../components/GradientText';

export default function LandingPage({ session }) {
  return (
    <Box sx={{ minHeight: '100vh', background: 'radial-gradient(circle at top left, rgba(139,92,246,0.15), transparent 30%), radial-gradient(circle at bottom right, rgba(59,130,246,0.15), transparent 30%)', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ top: 0, zIndex: 1100, backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(9, 9, 11, 0.6)' }}>
        <Toolbar sx={{ mx: 'auto', width: '100%', maxWidth: 1200, justifyContent: 'space-between' }}>
          <Button component={RouterLink} to="/" sx={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'none' }}>
            <AutoAwesomeIcon color="primary" sx={{ mr: 1 }} /> Quizards
          </Button>
          <Stack direction="row" spacing={2}>
            {session.authenticated ? (
              <Button component={RouterLink} to="/library" variant="contained" color="secondary">Go to App</Button>
            ) : (
              <>
                <Button component={RouterLink} to="/login" color="inherit">Sign In</Button>
                <Button component={RouterLink} to="/register" variant="contained" color="primary">Get Started</Button>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 16 } }}>
        <Stack spacing={6} alignItems="center" textAlign="center">
          <Chip label="React + Spring Boot + AI" color="primary" sx={{ fontWeight: 700, px: 1 }} />
          <Typography variant="h1" sx={{ fontSize: { xs: '3rem', md: '5rem' }, lineHeight: 1.1, maxWidth: 900 }}>
            Master Any Topic With <GradientText>AI-Generated Flashcards</GradientText>
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 640 }}>
            Turn your notes or prompt into complete study sets in seconds. Review, edit, and master your subjects with an intelligent studying platform.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button component={RouterLink} to={session.authenticated ? "/create" : "/register"} size="large" variant="contained" sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}>
              Start Creating Now
            </Button>
            <Button component={RouterLink} to="/login" size="large" variant="outlined" sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}>
              Log In
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
