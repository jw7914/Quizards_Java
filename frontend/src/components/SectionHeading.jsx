import { Box, Typography } from '@mui/material'

export default function SectionHeading({ title, subtitle }) {
  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography
        variant="h2"
        sx={{
          mb: 1,
          color: '#202124',
          fontSize: { xs: 'clamp(2.5rem, 12vw, 4.5rem)', sm: 'clamp(3.25rem, 8vw, 5rem)', md: '3.75rem' },
          lineHeight: { xs: 1.08, sm: 1.05 },
          overflowWrap: 'anywhere',
        }}
      >
        {title}
      </Typography>
      <Typography
        color="text.secondary"
        variant="h6"
        sx={{
          fontSize: { xs: '1.05rem', sm: '1.2rem' },
          lineHeight: 1.5,
          overflowWrap: 'anywhere',
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  )
}
