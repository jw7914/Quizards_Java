import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Navigate, Route, Routes } from 'react-router-dom';

import theme from './theme';
import { fetchJson } from './utils/api';

import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LibraryPage from './pages/LibraryPage';
import CreatePage from './pages/CreatePage';
import StudyModePage from './pages/StudyModePage';

export default function App() {
  const [session, setSession] = useState({ loading: true, authenticated: false, username: null });

  useEffect(() => {
    let active = true;
    fetchJson('/api/auth/me')
      .then(me => { if (active) setSession({ loading: false, authenticated: me.authenticated, username: me.username ?? null }); })
      .catch(() => { if (active) setSession({ loading: false, authenticated: false, username: null }); });
    return () => { active = false; };
  }, []);

  if (session.loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
          <CircularProgress color="primary" />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<LandingPage session={session} />} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage session={session} onSessionChange={setSession} />} />
        <Route path="/register" element={<RegisterPage session={session} onSessionChange={setSession} />} />
        
        {/* Protected Dashboard Layout Routes */}
        <Route element={<DashboardLayout session={session} />}>
          <Route path="/library" element={<LibraryPage session={session} />} />
          <Route path="/create" element={<CreatePage session={session} />} />
        </Route>

        {/* Study Mode (Full Screen) */}
        <Route path="/study-set/:id" element={<StudyModePage session={session} />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
