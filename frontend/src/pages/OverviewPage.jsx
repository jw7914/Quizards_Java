import { Alert, Box, Button, Card, CardContent, Chip, Grid, LinearProgress, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import PsychologyRounded from '@mui/icons-material/PsychologyRounded'
import PublicRounded from '@mui/icons-material/PublicRounded'
import MetricCard from '../components/MetricCard'
import SpotlightPanel from '../components/SpotlightPanel'
import ShelfSection from '../components/ShelfSection'

function HeroPanel({ authUser, onLogin, featuredSet }) {
  return (
    <Card sx={{ bgcolor: 'white' }}>
      <CardContent sx={{ p: { xs: 4, md: 6 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              <Chip
                icon={<MenuBookIcon fontSize="small" />}
                label="Study Smart"
                color="primary"
                variant="outlined"
                sx={{ alignSelf: 'flex-start' }}
              />
              <Typography variant="h1">
                Learn faster with AI-generated flashcards.
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600 }}>
                Turn your notes into high-quality flashcard decks in seconds. Create study sets, browse the public library, and master your subjects.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
                <Button
                  component={RouterLink}
                  to={authUser?.authenticated ? '/create' : '/library'}
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<AutoAwesomeRounded />}
                >
                  {authUser?.authenticated ? 'Create Deck' : 'Browse Library'}
                </Button>
                {!authUser?.authenticated && (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={onLogin}
                  >
                    Sign In to Save
                  </Button>
                )}
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={5}>
            <Stack spacing={2}>
              <MetricCard label="Featured Deck" value={featuredSet ? featuredSet.title : 'No Decks Available'} />
              <MetricCard label="Deck Size" value={featuredSet ? `${featuredSet.flashcardCount} cards` : '-'} color="secondary.main" />
              <MetricCard
                label="Built With"
                value="Manual & AI Generation"
                icon={<PsychologyRounded sx={{ color: 'secondary.main' }} />}
              />
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default function OverviewPage({ authUser, loadingSets, dashboardError, publicSets, mySets, onLogin }) {
  const featuredSet = publicSets[0]

  return (
    <Stack spacing={4}>
      <HeroPanel authUser={authUser} onLogin={onLogin} featuredSet={featuredSet} />
      {loadingSets && <LinearProgress sx={{ height: 2 }} />}
      {dashboardError && <Alert severity="error">{dashboardError}</Alert>}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <ShelfSection
            title="Public Decks"
            subtitle="Browse flashcards created by the Quizards community."
            icon={<PublicRounded color="primary" />}
            items={publicSets}
            emptyLabel="No public decks available."
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SpotlightPanel authUser={authUser} mySets={mySets} />
        </Grid>
      </Grid>
    </Stack>
  )
}
