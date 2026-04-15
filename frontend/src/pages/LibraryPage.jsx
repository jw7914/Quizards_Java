import { Button, Grid, LinearProgress, Stack } from '@mui/material'
import BookmarkAddedRounded from '@mui/icons-material/BookmarkAddedRounded'
import LockOpenRounded from '@mui/icons-material/LockOpenRounded'
import PersonAddAltRounded from '@mui/icons-material/PersonAddAltRounded'
import PublicRounded from '@mui/icons-material/PublicRounded'
import { Link as RouterLink } from 'react-router-dom'
import SectionHeading from '../components/SectionHeading'
import ShelfSection from '../components/ShelfSection'

export default function LibraryPage({ authUser, loadingSets, publicSets, mySets }) {
  return (
    <Stack spacing={4}>
      <SectionHeading
        title="Library"
        subtitle="Browse all available public decks and your personal items."
      />
      {loadingSets ? <LinearProgress /> : null}
      <Grid container spacing={4}>
        <Grid item xs={12} lg={6}>
          <ShelfSection
            title="My Decks"
            subtitle="Your privately saved and created study sets."
            icon={<BookmarkAddedRounded color="secondary" />}
            items={authUser?.authenticated ? mySets : []}
            emptyLabel={
              authUser?.authenticated ? 'You have no decks yet.' : 'Sign in to access your library.'
            }
          />
          {!authUser?.authenticated && (
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button component={RouterLink} to="/login" variant="outlined" color="primary" startIcon={<LockOpenRounded />}>
                Login
              </Button>
              <Button component={RouterLink} to="/register" variant="text" color="primary" startIcon={<PersonAddAltRounded />}>
                Register
              </Button>
            </Stack>
          )}
        </Grid>
        <Grid item xs={12} lg={6}>
          <ShelfSection
            title="Overview"
            subtitle="Public decks created by others."
            icon={<PublicRounded color="primary" />}
            items={publicSets}
            emptyLabel="No public decks available."
          />
        </Grid>
      </Grid>
    </Stack>
  )
}
