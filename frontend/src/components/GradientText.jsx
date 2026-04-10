import React from 'react';
import { Box } from '@mui/material';

export default function GradientText({ children, sx }) {
  return (
    <Box component="span" sx={{ background: 'linear-gradient(90deg, #a78bfa 0%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', ...sx }}>
      {children}
    </Box>
  );
}
