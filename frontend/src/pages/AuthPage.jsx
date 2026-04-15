import { useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom'
import LockOpenRounded from '@mui/icons-material/LockOpenRounded'

const initialForm = {
  username: '',
  password: '',
}

export default function AuthPage({ mode, authUser, onSubmit }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const from = location.state?.from || '/'
  const isLogin = mode === 'login'

  if (authUser?.authenticated) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await onSubmit(form)
      navigate(from, { replace: true })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100%', display: 'grid', placeItems: 'center' }}>
      <Card sx={{ width: '100%', maxWidth: 520 }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Stack spacing={1}>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.08em' }}>
                Quizards
              </Typography>
              <Typography variant="h3">
                {isLogin ? 'Sign in' : 'Create account'}
              </Typography>
              <Typography color="text.secondary">
                {isLogin
                  ? 'Access your saved decks and continue studying.'
                  : 'Create an account to save decks and use AI generation.'}
              </Typography>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              autoFocus
              label="Username"
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
            />
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ sm: 'center' }}>
              <Button
                component={RouterLink}
                to={isLogin ? '/register' : '/login'}
                state={location.state}
              >
                {isLogin ? 'Create an account' : 'Sign in instead'}
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<LockOpenRounded />}
                disabled={submitting || !form.username.trim() || !form.password.trim()}
              >
                {submitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Register'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
