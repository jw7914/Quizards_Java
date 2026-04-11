import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { fetchJson } from '@/utils/api';
import DashboardLayout from '@/layouts/DashboardLayout';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import LibraryPage from '@/pages/LibraryPage';
import CreatePage from '@/pages/CreatePage';
import StudyModePage from '@/pages/StudyModePage';

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="surface-panel flex items-center gap-3 rounded-full px-6 py-4">
          <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Loading your workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage session={session} />} />
      <Route path="/auth" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage session={session} onSessionChange={setSession} />} />
      <Route path="/register" element={<RegisterPage session={session} onSessionChange={setSession} />} />
      <Route element={<DashboardLayout session={session} />}>
        <Route path="/library" element={<LibraryPage session={session} />} />
        <Route path="/create" element={<CreatePage session={session} />} />
      </Route>
      <Route path="/study-set/:id" element={<StudyModePage session={session} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
