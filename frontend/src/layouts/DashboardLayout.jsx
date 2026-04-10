import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, Drawer, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Button, Avatar } from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

export default function DashboardLayout({ session }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { if (!session.authenticated) navigate('/login', { replace: true }); }, [navigate, session.authenticated]);
  if (!session.authenticated) return null;

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  const drawerWidth = 280;

  const drawerContext = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'rgba(24, 24, 27, 0.4)' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
        <AutoAwesomeIcon color="primary" sx={{ mr: 1.5, fontSize: 32 }} />
        <Typography variant="h5" sx={{ flexGrow: 1 }}>Quizards</Typography>
      </Box>
      <Divider />
      <Box sx={{ flexGrow: 1, px: 2, py: 3 }}>
        <Button component={RouterLink} to="/create" variant="contained" color="secondary" fullWidth startIcon={<AddCircleIcon />} sx={{ mb: 4, py: 1.5 }}>
          New Study Set
        </Button>
        <Typography variant="overline" color="text.secondary" sx={{ px: 1 }}>My Learning</Typography>
        <List sx={{ mt: 1 }}>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton component={RouterLink} to="/library" selected={location.pathname === '/library'} sx={{ borderRadius: 3, '&.Mui-selected': { bgcolor: 'rgba(139, 92, 246, 0.15)' } }}>
              <ListItemIcon sx={{ minWidth: 40 }}><LibraryBooksIcon color={location.pathname === '/library' ? 'primary' : 'inherit'} /></ListItemIcon>
              <ListItemText primary="Library" primaryTypographyProps={{ fontWeight: location.pathname === '/library' ? 700 : 500 }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1, mb: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', mr: 2 }}>{session.username?.charAt(0).toUpperCase()}</Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{session.username}</Typography>
        </Box>
        <Button onClick={handleLogout} variant="text" color="error" fullWidth startIcon={<ExitToAppIcon />} sx={{ justifyContent: 'flex-start', px: 2 }}>
          Log Out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="fixed" elevation={0} sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` }, bgcolor: 'rgba(9, 9, 11, 0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
            {location.pathname === '/create' ? 'Create with AI' : 'Study Library'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundImage: 'none', borderRight: '1px solid rgba(255,255,255,0.08)' } }}>
          {drawerContext}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundImage: 'none', borderRight: '1px solid rgba(255,255,255,0.08)' } }} open>
          {drawerContext}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 4 }, width: { md: `calc(100% - ${drawerWidth}px)` }, mt: '64px' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
