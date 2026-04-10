import React from 'react';
import { Box, Card, Container, Typography, Button } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Link as RouterLink } from 'react-router-dom';

export default function AuthLayout({ title, alternateText, alternateAction, alternateTo, children }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top left, rgba(139,92,246,0.15), transparent 40%)', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="sm">
        <Typography variant="h3" textAlign="center" sx={{ mb: 4 }}><AutoAwesomeIcon color="primary" sx={{ mr: 1, verticalAlign: 'text-bottom' }} /> Quizards</Typography>
        <Card elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 6 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>{title}</Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            {alternateText} <Button component={RouterLink} to={alternateTo} sx={{ minWidth: 0, p: 0 }}>{alternateAction}</Button>
          </Typography>
          {children}
        </Card>
      </Container>
    </Box>
  );
}
