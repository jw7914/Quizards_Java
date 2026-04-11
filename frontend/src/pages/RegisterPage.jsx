import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/AuthLayout';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchJson } from '@/utils/api';

export default function RegisterPage({ session, onSessionChange }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);

  useEffect(() => { if (session.authenticated) navigate('/library', { replace: true }); }, [session.authenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus({ type: 'info', message: 'Creating account...' });
    try {
      const me = await fetchJson('/api/auth/register', { method: 'POST', body: JSON.stringify({ username: form.get('username'), password: form.get('password') }) });
      onSessionChange({ loading: false, authenticated: true, username: me.username });
      navigate('/library');
    } catch (error) { setStatus({ type: 'error', message: error.message }); }
  }

  return (
    <AuthLayout
      alternateAction="sign in instead."
      alternateText="Already registered?"
      alternateTo="/login"
      description="Create an account to save decks, manage your library, and study anywhere."
      eyebrow="Register"
      title="Create your account"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Field label="Username" name="username" />
        <div className="space-y-2">
          <Label>Password</Label>
          <Input minLength={8} name="password" required type="password" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Minimum 8 characters</p>
        </div>
        {status ? <Alert tone={status.type === 'error' ? 'error' : 'info'}>{status.message}</Alert> : null}
        <Button className="w-full" size="lg" type="submit">
          Sign up
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
