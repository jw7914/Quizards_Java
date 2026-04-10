import React, { useState, useEffect } from 'react';
import { Box, Button, Stack, TextField, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { fetchJson } from '../utils/api';

export default function LoginPage({ session, onSessionChange }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);

  useEffect(() => { if (session.authenticated) navigate('/library', { replace: true }); }, [session.authenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus({ type: 'info', message: 'Authenticating...' });
    try {
      const me = await fetchJson('/api/auth/login', { method: 'POST', body: JSON.stringify({ username: form.get('username'), password: form.get('password') }) });
      onSessionChange({ loading: false, authenticated: true, username: me.username });
      navigate('/library');
    } catch (error) { setStatus({ type: 'error', message: error.message }); }
  }

  return (
    <AuthLayout title="Welcome Back" alternateText="Don't have an account?" alternateAction="Sign up" alternateTo="/register">
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField label="Username" name="username" fullWidth required />
          <TextField label="Password" name="password" type="password" fullWidth required />
          {status && <Alert severity={status.type}>{status.message}</Alert>}
          <Button type="submit" variant="contained" color="primary" size="large" fullWidth>Log In</Button>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
