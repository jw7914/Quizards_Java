import { Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import CollectionsBookmarkRounded from '@mui/icons-material/CollectionsBookmarkRounded'
import VisibilityRounded from '@mui/icons-material/VisibilityRounded'

export default function StudySetCard({ studySet }) {
  return (
    <Card
      sx={{
        height: '100%',
        bgcolor: '#ffffff',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
          <Typography variant="h6" sx={{ fontWeight: 500 }}>{studySet.title}</Typography>
          <Chip
            size="small"
            label={studySet.visibility}
            color={studySet.visibility === 'PUBLIC' ? 'primary' : 'default'}
            variant="outlined"
          />
        </Stack>
        <Typography color="text.secondary" sx={{ flexGrow: 1, fontSize: '0.9rem' }}>
          {studySet.description || 'No description provided.'}
        </Typography>
        <Divider />
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 'auto' }}>
          <Chip icon={<CollectionsBookmarkRounded sx={{ fontSize: 16 }} />} label={`${studySet.flashcardCount} cards`} variant="outlined" />
          {studySet.ownerUsername && <Chip icon={<VisibilityRounded sx={{ fontSize: 16 }} />} label={`by ${studySet.ownerUsername}`} variant="outlined" color="primary" />}
        </Stack>
        <Button component={RouterLink} to={`/study-set/${studySet.id}`} variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Open Deck
        </Button>
      </CardContent>
    </Card>
  )
}
