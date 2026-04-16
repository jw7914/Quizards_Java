import { Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import CollectionsBookmarkRounded from '@mui/icons-material/CollectionsBookmarkRounded'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import VisibilityRounded from '@mui/icons-material/VisibilityRounded'

export default function StudySetCard({ studySet, showDelete = false, deleting = false, onDelete }) {
  return (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        minHeight: { xs: 320, sm: 340 },
        bgcolor: '#ffffff',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              minHeight: '3.6rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {studySet.title}
          </Typography>
          <Chip
            size="small"
            label={studySet.visibility}
            color={studySet.visibility === 'PUBLIC' ? 'primary' : 'default'}
            variant="outlined"
          />
        </Stack>
        <Typography
          color="text.secondary"
          sx={{
            flexGrow: 1,
            fontSize: '0.9rem',
            minHeight: '4.1rem',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {studySet.description || 'No description provided.'}
        </Typography>
        <Divider />
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 'auto', minHeight: '2rem', alignContent: 'flex-start' }}>
          <Chip icon={<CollectionsBookmarkRounded sx={{ fontSize: 16 }} />} label={`${studySet.flashcardCount} cards`} variant="outlined" />
          {studySet.ownerUsername && <Chip icon={<VisibilityRounded sx={{ fontSize: 16 }} />} label={`by ${studySet.ownerUsername}`} variant="outlined" color="primary" />}
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
          <Button component={RouterLink} to={`/study-set/${studySet.id}`} variant="contained" color="primary" fullWidth>
            Open Deck
          </Button>
          {showDelete ? (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineRounded />}
              onClick={() => onDelete?.(studySet)}
              disabled={deleting}
              fullWidth
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  )
}
