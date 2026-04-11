import { useState } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material'

const initialAuthForm = {
  username: '',
  password: '',
}

export default function AuthDialog({ open, mode, error, submitting, onClose, onSwitchMode, onSubmit }) {
  const [form, setForm] = useState(initialAuthForm)
  const title = mode === 'login' ? 'Sign In' : 'Create Account'

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 500, color: 'text.primary', borderBottom: '1px solid #dadce0', pb: 2 }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ pt: 4 }}>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            autoFocus
            label="Username"
            variant="outlined"
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 1, justifyContent: 'space-between' }}>
        <Button onClick={() => onSwitchMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Create an account' : 'Sign in instead'}
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={submitting || !form.username.trim() || !form.password.trim()}
          onClick={() => onSubmit(form)}
        >
          {submitting ? 'Please wait...' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
