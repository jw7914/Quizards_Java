import { AppBar, Avatar, Box, Button, Chip, IconButton, Stack, Toolbar, Typography } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import BookmarkAddedRounded from '@mui/icons-material/BookmarkAddedRounded'
import LogoutRounded from '@mui/icons-material/LogoutRounded'
import LockOpenRounded from '@mui/icons-material/LockOpenRounded'

const navItems = [
  { label: 'Overview', to: '/' },
  { label: 'Create Deck', to: '/create' },
  { label: 'Library', to: '/library' },
]

export default function TopBar({ authUser, onLogin, onLogout }) {
  const location = useLocation()

  return (
    <AppBar position="sticky" elevation={0} color="inherit">
      <Toolbar sx={{ gap: 2, minHeight: 70 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
          <Avatar
            variant="square"
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              width: 44,
              height: 44,
              fontWeight: 600,
              fontSize: '1.25rem',
            }}
          >
            Q
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ lineHeight: 1, color: 'text.primary', fontWeight: 500 }}>
              Quizards
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Advanced Study Platform
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
          {navItems.map((item) => (
            <Button
              key={item.to}
              component={RouterLink}
              to={item.to}
              color={location.pathname === item.to ? 'primary' : 'inherit'}
              variant={location.pathname === item.to ? 'contained' : 'text'}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
        {authUser?.authenticated ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              icon={<BookmarkAddedRounded />}
              label={authUser.username}
              color="primary"
              variant="outlined"
            />
            <IconButton color="inherit" onClick={onLogout} aria-label="log out" sx={{ border: '1px solid #dadce0', borderRadius: 0 }}>
              <LogoutRounded />
            </IconButton>
          </Stack>
        ) : (
          <Button startIcon={<LockOpenRounded />} variant="outlined" color="primary" onClick={() => onLogin('login')}>
            Sign In
          </Button>
        )}
      </Toolbar>
    </AppBar>
  )
}
