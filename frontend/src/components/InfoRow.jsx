import { Stack, Typography } from '@mui/material'

export default function InfoRow({ label, value, color = 'text.primary' }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography color="text.secondary" variant="body2">{label}</Typography>
      <Typography fontWeight={500} color={color} variant="body2">{value}</Typography>
    </Stack>
  )
}
