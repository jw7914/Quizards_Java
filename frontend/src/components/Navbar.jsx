import { AppBar, Avatar, Box, Button, Chip, IconButton, Stack, Toolbar, Typography } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import BookmarkAddedRounded from '@mui/icons-material/BookmarkAddedRounded'
import LogoutRounded from '@mui/icons-material/LogoutRounded'
import LockOpenRounded from '@mui/icons-material/LockOpenRounded'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Create Deck', to: '/create', requiresAuth: true },
  { label: 'Library', to: '/library' },
]

export default function Navbar({ authUser, onLogout }) {
  const location = useLocation()
  const visibleNavItems = navItems.filter((item) => !item.requiresAuth || authUser?.authenticated)

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
          {visibleNavItems.map((item) => (
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
              sx={{
                height: 40,
                '& .MuiChip-label': {
                  px: 1.5,
                },
              }}
            />
            <IconButton
              color="inherit"
              onClick={onLogout}
              aria-label="log out"
              sx={{
                width: 40,
                height: 40,
                border: '1px solid #dadce0',
                borderRadius: 0,
              }}
            >
              <LogoutRounded />
            </IconButton>
          </Stack>
        ) : (
          <Button component={RouterLink} to="/login" startIcon={<LockOpenRounded />} variant="outlined" color="primary">
            Account
          </Button>
        )
        }
      </Toolbar>
    </AppBar>
  )
}
