import { Box, Typography } from '@mui/material'

export default function SectionHeading({ title, subtitle }) {
  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h2" sx={{ mb: 1, color: '#202124' }}>
        {title}
      </Typography>
      <Typography color="text.secondary" variant="h6">
        {subtitle}
      </Typography>
    </Box>
  )
}
