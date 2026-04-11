import { Box, Stack, Typography } from '@mui/material'
import SchoolRounded from '@mui/icons-material/SchoolRounded'

export default function MetricCard({ label, value, icon, color = 'primary.main' }) {
  return (
    <Box
      sx={{
        p: 2.5,
        bgcolor: '#f8f9fa',
        border: '1px solid #dadce0',
        borderLeft: '4px solid',
        borderLeftColor: color,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
        {icon ?? <SchoolRounded sx={{ color }} />}
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.05em' }}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="h6" sx={{ fontWeight: 500 }}>{value}</Typography>
    </Box>
  )
}
