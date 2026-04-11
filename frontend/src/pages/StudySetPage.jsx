import { useEffect, useState } from 'react'
import { Alert, Box, Card, CardContent, Chip, Divider, Grid, LinearProgress, Stack, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import CollectionsBookmarkRounded from '@mui/icons-material/CollectionsBookmarkRounded'
import SectionHeading from '../components/SectionHeading'
import { fetchStudySetDetail } from '../api'

export default function StudySetPage({ authUser }) {
  const { studySetId } = useParams()
  const [studySet, setStudySet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function loadStudySet() {
      setLoading(true)
      setError('')
      try {
        const detail = await fetchStudySetDetail(studySetId)
        if (active) setStudySet(detail)
      } catch (loadError) {
        if (active) setError(loadError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadStudySet()
    return () => { active = false }
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

  return (
    <Stack spacing={4}>
      <SectionHeading title={studySet.title} subtitle={studySet.description || 'No description provided.'} />
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <Chip label={studySet.visibility} color={studySet.visibility === 'PUBLIC' ? 'primary' : 'default'} variant="outlined" />
        <Chip label={`${studySet.flashcardCount} cards`} icon={<CollectionsBookmarkRounded />} color="primary" />
      </Stack>
      <Grid container spacing={3}>
        {studySet.flashcards.map((card, index) => (
          <Grid item key={card.id} xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="overline" color="secondary.main" sx={{ mb: 1, display: 'block' }}>
                  Card {index + 1}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 500, mb: 3 }}>{card.prompt}</Typography>
                <Box sx={{ mt: 'auto' }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography color="text.secondary" sx={{ fontSize: '1rem' }}>{card.answer}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
