import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/AuthLayout';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchJson } from '@/utils/api';

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
    <AuthLayout
      alternateAction="create one."
      alternateText="Need an account?"
      alternateTo="/register"
      description="Use your Quizards account to pick up where you left off."
      eyebrow="Sign in"
      title="Welcome back"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Field label="Username" name="username" />
        <Field label="Password" name="password" type="password" />
        {status ? <Alert tone={status.type === 'error' ? 'error' : 'info'}>{status.message}</Alert> : null}
        <Button className="w-full" size="lg" type="submit">
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}

function Field({ label, ...props }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input {...props} required />
    </div>
  );
}
