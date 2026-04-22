import { Button, Card, CardContent, Chip, Divider, Stack, Tooltip, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded'
import CollectionsBookmarkRounded from '@mui/icons-material/CollectionsBookmarkRounded'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import LockOutlined from '@mui/icons-material/LockOutlined'
import PublicRounded from '@mui/icons-material/PublicRounded'
import VisibilityRounded from '@mui/icons-material/VisibilityRounded'
import { aiGeneratedChipSx, studySetMetaChipSx, visibilityIconChipSx } from './studySetChipStyles'

export default function StudySetCard({ studySet, showDelete = false, deleting = false, onDelete }) {
  const deckTypeLabel = studySet.deckType === 'QUIZ' ? 'Quiz Deck' : 'Flashcards'
  const visibilityIsPublic = studySet.visibility === 'PUBLIC'

  return (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: '#ffffff',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent
        sx={{
          p: { xs: 3.5, sm: 3 },
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 2.5, sm: 2 },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ width: '100%' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              minWidth: 0,
              flexGrow: 1,
              overflowWrap: 'anywhere',
            }}
          >
            {studySet.title}
          </Typography>
          <Tooltip title={visibilityIsPublic ? 'Public' : 'Private'}>
            <Chip
              size="small"
              icon={visibilityIsPublic ? <PublicRounded sx={{ fontSize: 18 }} /> : <LockOutlined sx={{ fontSize: 18 }} />}
              color={visibilityIsPublic ? 'primary' : 'default'}
              variant="outlined"
              sx={{ ...visibilityIconChipSx, ml: 'auto' }}
            />
          </Tooltip>
        </Stack>
        <Typography
          color="text.secondary"
          sx={{
            flexGrow: 1,
            fontSize: '0.9rem',
            whiteSpace: 'normal',
            overflowWrap: 'anywhere',
          }}
        >
          {studySet.description || 'No description provided.'}
        </Typography>
        <Divider />
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 'auto', alignContent: 'flex-start', pt: 0.5 }}>
          <Chip icon={<CollectionsBookmarkRounded sx={{ fontSize: 16 }} />} label={`${studySet.flashcardCount} cards`} variant="outlined" sx={studySetMetaChipSx} />
          <Chip label={deckTypeLabel} variant="outlined" sx={studySetMetaChipSx} />
          {studySet.createdByAi ? <Chip icon={<AutoAwesomeRounded sx={{ fontSize: 16 }} />} label="Originally AI Generated" variant="outlined" sx={aiGeneratedChipSx} /> : null}
          {studySet.ownerUsername && <Chip icon={<VisibilityRounded sx={{ fontSize: 16 }} />} label={`by ${studySet.ownerUsername}`} variant="outlined" color="primary" sx={studySetMetaChipSx} />}
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: { xs: 2.5, sm: 2 } }}>
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
