import { useEffect, useMemo, useState } from 'react'
import { Alert, Grid, LinearProgress, MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material'
import SearchRounded from '@mui/icons-material/SearchRounded'
import PublicRounded from '@mui/icons-material/PublicRounded'
import SectionHeading from '../components/SectionHeading'
import StudySetCard from '../components/StudySetCard'

const PAGE_SIZE = 6

function matchesQuery(studySet, normalizedQuery) {
  if (!normalizedQuery) return true

  const haystack = [
    studySet.title,
    studySet.description,
    studySet.ownerUsername,
    studySet.deckType === 'QUIZ' ? 'quiz' : 'flashcards',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(normalizedQuery)
}

export default function BrowsePage({ publicSets, loadingSets, dashboardError }) {
  const [query, setQuery] = useState('')
  const [deckTypeFilter, setDeckTypeFilter] = useState('ALL')
  const [page, setPage] = useState(1)

  const filteredSets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return publicSets.filter((studySet) => {
      const matchesDeckType = deckTypeFilter === 'ALL' || studySet.deckType === deckTypeFilter
      return matchesDeckType && matchesQuery(studySet, normalizedQuery)
    })
  }, [publicSets, query, deckTypeFilter])

  const pageCount = Math.max(1, Math.ceil(filteredSets.length / PAGE_SIZE))
  const visiblePage = Math.min(page, pageCount)
  const visibleSets = filteredSets.slice((visiblePage - 1) * PAGE_SIZE, visiblePage * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [query, deckTypeFilter])

  return (
    <Stack spacing={4}>
      <SectionHeading
        title="Browse Public Decks"
        subtitle="Search through decks shared by the community. Open any deck to review cards or start a study session."
      />

      {loadingSets ? <LinearProgress /> : null}
      {dashboardError ? <Alert severity="error">{dashboardError}</Alert> : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            fullWidth
            label="Search Public Decks"
            placeholder="Search by title, description, owner, or deck type"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            InputProps={{
              startAdornment: <SearchRounded sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            select
            fullWidth
            label="Deck Type"
            value={deckTypeFilter}
            onChange={(event) => setDeckTypeFilter(event.target.value)}
          >
            <MenuItem value="ALL">All Decks</MenuItem>
            <MenuItem value="TEXT">Flashcards</MenuItem>
            <MenuItem value="QUIZ">Quiz Decks</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Stack
        spacing={2}
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr auto' },
          alignItems: 'center',
          columnGap: 2,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <PublicRounded color="primary" sx={{ fontSize: 18 }} />
          <Typography color="text.secondary">
            Only publicly shared decks appear here.
          </Typography>
        </Stack>
        <Typography color="text.secondary" sx={{ justifySelf: { sm: 'end' }, textAlign: 'right' }}>
          {filteredSets.length === 1 ? '1 public deck found' : `${filteredSets.length} public decks found`}
        </Typography>
      </Stack>

      {filteredSets.length === 0 ? (
        <Alert severity="info">
          No public decks match your current search.
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {visibleSets.map((studySet) => (
              <Grid key={studySet.id} size={{ xs: 12, md: 6, xl: 4 }} sx={{ display: 'flex' }}>
                <StudySetCard studySet={studySet} />
              </Grid>
            ))}
          </Grid>

          {filteredSets.length > PAGE_SIZE ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ sm: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Showing {(visiblePage - 1) * PAGE_SIZE + 1}-{Math.min(visiblePage * PAGE_SIZE, filteredSets.length)} of {filteredSets.length}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                <Pagination
                  count={pageCount}
                  page={visiblePage}
                  onChange={(_, nextPage) => setPage(nextPage)}
                  color="primary"
                  shape="rounded"
                  siblingCount={0}
                  boundaryCount={1}
                />
                <TextField
                  select
                  size="small"
                  label="Jump To"
                  value={visiblePage}
                  onChange={(event) => setPage(Number(event.target.value))}
                  sx={{ minWidth: 120 }}
                >
                  {Array.from({ length: pageCount }, (_, index) => (
                    <MenuItem key={index + 1} value={index + 1}>
                      Page {index + 1}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Stack>
          ) : null}
        </>
      )}
    </Stack>
  )
}
