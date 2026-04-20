import { useState } from 'react'
import { AppBar, Avatar, Box, Button, Chip, Divider, Drawer, IconButton, List, ListItemButton, ListItemText, Stack, Toolbar, Typography } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import BookmarkAddedRounded from '@mui/icons-material/BookmarkAddedRounded'
import MenuRounded from '@mui/icons-material/MenuRounded'
import LogoutRounded from '@mui/icons-material/LogoutRounded'
import LockOpenRounded from '@mui/icons-material/LockOpenRounded'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Browse', to: '/browse' },
  { label: 'Create Deck', to: '/create', requiresAuth: true },
  { label: 'Library', to: '/library', requiresAuth: true },
]

export default function Navbar({ authUser, onLogout }) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const visibleNavItems = navItems.filter((item) => !item.requiresAuth || authUser?.authenticated)
  const closeMobileMenu = () => setMobileOpen(false)

  return (
    <AppBar position="sticky" elevation={0} color="inherit">
      <Toolbar sx={{ gap: { xs: 1, md: 2 }, minHeight: { xs: 64, md: 70 } }}>
        <Stack
          direction="row"
          spacing={{ xs: 1.25, md: 2 }}
          alignItems="center"
          sx={{ flexGrow: 1, minWidth: 0 }}
        >
          <Avatar
            variant="square"
            src="/favicon.svg"
            alt="Quizards logo"
            sx={{
              width: { xs: 38, md: 44 },
              height: { xs: 38, md: 44 },
              bgcolor: 'transparent',
              flexShrink: 0,
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h5"
              sx={{
                lineHeight: 1,
                color: 'text.primary',
                fontWeight: 500,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
              }}
            >
              Quizards
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'block',
                fontSize: { xs: '0.68rem', sm: '0.75rem' },
                lineHeight: 1.2,
              }}
            >
              AI Study Platform
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
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
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
          <Button component={RouterLink} to="/login" startIcon={<LockOpenRounded />} variant="outlined" color="primary" sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
            Account
          </Button>
        )}

        <IconButton
          color="inherit"
          aria-label="open navigation menu"
          onClick={() => setMobileOpen(true)}
          sx={{
            display: { xs: 'inline-flex', md: 'none' },
            width: 42,
            height: 42,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 0,
            flexShrink: 0,
          }}
        >
          <MenuRounded />
        </IconButton>
      </Toolbar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={closeMobileMenu}
        PaperProps={{
          sx: {
            width: 'min(88vw, 320px)',
            borderRadius: 0,
          },
        }}
      >
        <Stack sx={{ height: '100%' }}>
          <Box sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                variant="square"
                src="/favicon.svg"
                alt="Quizards logo"
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: 'transparent',
                }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ lineHeight: 1.1, color: 'text.primary', fontWeight: 500 }}>
                  Quizards
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  AI Study Platform
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {authUser?.authenticated ? (
            <>
              <Box sx={{ p: 2.5, pb: 1.5 }}>
                <Chip
                  icon={<BookmarkAddedRounded />}
                  label={authUser.username}
                  color="primary"
                  variant="outlined"
                  sx={{
                    maxWidth: '100%',
                    '& .MuiChip-label': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                />
              </Box>
              <Divider />
            </>
          ) : null}

          <List sx={{ py: 1, flexGrow: 1 }}>
            {visibleNavItems.map((item) => (
              <ListItemButton
                key={item.to}
                component={RouterLink}
                to={item.to}
                selected={location.pathname === item.to}
                onClick={closeMobileMenu}
                sx={{
                  minHeight: 52,
                  borderLeft: '3px solid transparent',
                  '&.Mui-selected': {
                    borderLeftColor: 'primary.main',
                    bgcolor: 'rgba(26, 115, 232, 0.08)',
                  },
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
            {!authUser?.authenticated ? (
              <ListItemButton
                component={RouterLink}
                to="/login"
                selected={location.pathname === '/login'}
                onClick={closeMobileMenu}
                sx={{
                  minHeight: 52,
                  borderLeft: '3px solid transparent',
                  '&.Mui-selected': {
                    borderLeftColor: 'primary.main',
                    bgcolor: 'rgba(26, 115, 232, 0.08)',
                  },
                }}
              >
                <ListItemText primary="Account" />
              </ListItemButton>
            ) : null}
          </List>

          <Divider />

          <Box sx={{ p: 2 }}>
            {authUser?.authenticated ? (
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                startIcon={<LogoutRounded />}
                onClick={() => {
                  closeMobileMenu()
                  onLogout()
                }}
              >
                Log Out
              </Button>
            ) : null}
          </Box>
        </Stack>
      </Drawer>
    </AppBar>
  )
}
