import { Card, CardContent, Divider, Stack, Typography } from '@mui/material'
import InfoRow from './InfoRow'

export default function SpotlightPanel({ authUser, mySets }) {
  return (
    <Card sx={{ height: '100%', borderTop: '4px solid #1a73e8' }}>
      <CardContent sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h5">Your Workspace</Typography>
          <Typography color="text.secondary">
            {authUser?.authenticated
              ? 'Manage your personal study sets and AI generations.'
              : 'Sign in to access your personal workspace and save decks.'}
          </Typography>
          <Divider />
          <Stack spacing={2}>
            <InfoRow label="Status" value={authUser?.authenticated ? 'Signed In' : 'Guest'} color={authUser?.authenticated ? 'success.main' : 'warning.main'} />
            <InfoRow label="My Decks" value={`${mySets.length}`} />
            <InfoRow label="Access" value={authUser?.authenticated ? 'Full' : 'Read-only'} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
