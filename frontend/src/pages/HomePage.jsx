import { Alert, Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded'
import BoltRounded from '@mui/icons-material/BoltRounded'
import LockOpenRounded from '@mui/icons-material/LockOpenRounded'
import MenuBookRounded from '@mui/icons-material/MenuBookRounded'
import PersonAddAltRounded from '@mui/icons-material/PersonAddAltRounded'
import PsychologyRounded from '@mui/icons-material/PsychologyRounded'
import SectionHeading from '../components/SectionHeading'

function FeatureCard({ icon, title, description }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box
            sx={{
              width: 52,
              height: 52,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" sx={{ color: 'text.primary' }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default function OverviewPage({ authUser, dashboardError, publicSets, mySets }) {
  const isAuthenticated = authUser?.authenticated

  return (
    <Stack spacing={5}>
      <Card
        sx={{
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #eef4ff 55%, #f8fbff 100%)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 6 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <Chip
                  icon={<AutoAwesomeRounded fontSize="small" />}
                  label="AI-powered study decks"
                  color="primary"
                  variant="outlined"
                  sx={{ alignSelf: 'flex-start', bgcolor: 'rgba(255,255,255,0.72)' }}
                />
                <SectionHeading
                  title="Study faster with simpler flashcard workflows."
                  subtitle="Quizards helps you turn notes into clean study decks, browse public sets, and keep your workspace organized without extra setup."
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    component={RouterLink}
                    to={isAuthenticated ? '/create' : '/library'}
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<MenuBookRounded />}
                  >
                    {isAuthenticated ? 'Create Deck' : 'Explore Decks'}
                  </Button>
                  {isAuthenticated ? (
                    <Button component={RouterLink} to="/library" variant="outlined" color="primary" size="large">
                      View Library
                    </Button>
                  ) : (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Button component={RouterLink} to="/login" variant="outlined" color="primary" size="large" startIcon={<LockOpenRounded />}>
                        Login
                      </Button>
                      <Button component={RouterLink} to="/register" variant="text" color="primary" size="large" startIcon={<PersonAddAltRounded />}>
                        Register
                      </Button>
                    </Stack>
                  )}
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                  <Box>
                    <Typography variant="h4">{publicSets.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      public decks
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4">{isAuthenticated ? mySets.length : 'AI'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {isAuthenticated ? 'saved in your workspace' : 'deck generation built in'}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {dashboardError && <Alert severity="error">{dashboardError}</Alert>}
    </Stack>
  )
}
