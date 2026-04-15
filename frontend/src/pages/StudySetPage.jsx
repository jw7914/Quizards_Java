import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Card,
  Chip,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useParams } from 'react-router-dom'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import CollectionsBookmarkRounded from '@mui/icons-material/CollectionsBookmarkRounded'
import SectionHeading from '../components/SectionHeading'
import { fetchStudySetDetail } from '../api'

export default function StudySetPage({ authUser }) {
  const { studySetId } = useParams()
  const [studySet, setStudySet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    let active = true

    async function loadStudySet() {
      setLoading(true)
      setError('')
      try {
        const detail = await fetchStudySetDetail(studySetId)
        if (active) {
          setStudySet(detail)
          setActiveIndex(0)
          setFlipped(false)
        }
      } catch (loadError) {
        if (active) setError(loadError.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadStudySet()
    return () => {
      active = false
    }
  }, [studySetId, authUser?.authenticated])

  if (loading) {
    return <LinearProgress />
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (!studySet) {
    return <Alert severity="info">Study deck not found.</Alert>
  }

  const flashcards = studySet.flashcards ?? []
  const cardCount = flashcards.length
  const visibleIndex = Math.min(activeIndex, Math.max(cardCount - 1, 0))
  const activeCard = flashcards[visibleIndex]
  const progressValue = cardCount > 0 ? ((visibleIndex + 1) / cardCount) * 100 : 0

  const goToCard = (nextIndex) => {
    setActiveIndex(nextIndex)
    setFlipped(false)
  }

  if (!activeCard) {
    return <Alert severity="info">This deck does not have any flashcards yet.</Alert>
  }

  return (
    <Stack spacing={4}>
      <SectionHeading title={studySet.title} subtitle={studySet.description || 'No description provided.'} />

      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <Chip label={studySet.visibility} color={studySet.visibility === 'PUBLIC' ? 'primary' : 'default'} variant="outlined" />
        <Chip label={`${studySet.flashcardCount} cards`} icon={<CollectionsBookmarkRounded />} color="primary" />
      </Stack>

      <Card sx={{ overflow: 'hidden' }}>
        <Box
          sx={{
            height: 6,
            width: `${progressValue}%`,
            bgcolor: 'primary.main',
            transition: 'width 180ms ease',
          }}
        />

        <Stack spacing={3} sx={{ p: { xs: 3, md: 4 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            sx={{ width: '100%' }}
          >
            <Box>
              <Typography variant="h6">
                Card {visibleIndex + 1} of {cardCount}
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />

            <TextField
              select
              size="small"
              label="Card"
              value={visibleIndex}
              onChange={(event) => goToCard(Number(event.target.value))}
              sx={{ minWidth: 120, ml: { sm: 'auto' } }}
            >
              {flashcards.map((_, index) => (
                <MenuItem key={index} value={index}>
                  {index + 1}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            <IconButton
              aria-label="Previous card"
              onClick={() => goToCard(Math.max(visibleIndex - 1, 0))}
              disabled={visibleIndex === 0}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <ArrowBackRounded />
            </IconButton>
            <IconButton
              aria-label={flipped ? 'Show prompt' : 'Show answer'}
              onClick={() => setFlipped((current) => !current)}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <CollectionsBookmarkRounded />
            </IconButton>
            <IconButton
              aria-label="Next card"
              onClick={() => goToCard(Math.min(visibleIndex + 1, cardCount - 1))}
              disabled={visibleIndex === cardCount - 1}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <ArrowForwardRounded />
            </IconButton>
          </Stack>

          <Box
            onClick={() => setFlipped((current) => !current)}
            sx={{
              perspective: 1600,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                minHeight: { xs: 340, md: 420 },
                transformStyle: 'preserve-3d',
                transition: 'transform 0.55s ease',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {[
                {
                  key: 'front',
                  label: 'Prompt',
                  body: activeCard.prompt,
                  rotate: 'rotateY(0deg)',
                  background:
                    'linear-gradient(145deg, rgba(244,247,255,1) 0%, rgba(255,255,255,1) 75%)',
                },
                {
                  key: 'back',
                  label: 'Answer',
                  body: activeCard.answer,
                  rotate: 'rotateY(180deg)',
                  background:
                    'linear-gradient(145deg, rgba(233,245,255,1) 0%, rgba(255,255,255,1) 75%)',
                },
              ].map((face) => (
                <Card
                  key={`${activeCard.id}-${face.key}`}
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    borderRadius: 3,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: face.rotate,
                    background: face.background,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 24px 48px rgba(15, 23, 42, 0.08)',
                  }}
                >
                  <Stack spacing={3} sx={{ p: { xs: 3, md: 5 }, width: '100%' }}>
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.08em' }}>
                      {face.label}
                    </Typography>
                    <Box
                      sx={{
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        px: { md: 4 },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: '1.4rem', md: '2rem' },
                          lineHeight: 1.35,
                          fontWeight: 500,
                          color: 'text.primary',
                        }}
                      >
                        {face.body}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              ))}
            </Box>
          </Box>
        </Stack>
      </Card>
    </Stack>
  )
}
