import { useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Chip, Divider, IconButton, LinearProgress, MenuItem, Pagination, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import ArrowOutwardRounded from '@mui/icons-material/ArrowOutwardRounded'
import BookmarkAddedRounded from '@mui/icons-material/BookmarkAddedRounded'
import CollectionsBookmarkRounded from '@mui/icons-material/CollectionsBookmarkRounded'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import LockOpenRounded from '@mui/icons-material/LockOpenRounded'
import PersonAddAltRounded from '@mui/icons-material/PersonAddAltRounded'
import VisibilityRounded from '@mui/icons-material/VisibilityRounded'
import SectionHeading from '../components/SectionHeading'

const PAGE_SIZE = 4

function LibraryDeckItem({ studySet, showDelete = false, deleting = false, updatingVisibility = false, onDelete, onToggleVisibility }) {
  return (
    <Card
      sx={{
        borderRadius: 0,
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, width: '100%' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    minWidth: 0,
                    flexShrink: 1,
                  }}
                >
                  {studySet.title}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                {showDelete ? (
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={studySet.visibility}
                    onChange={(_, nextVisibility) => {
                      if (!nextVisibility || nextVisibility === studySet.visibility) {
                        return
                      }
                      onToggleVisibility?.(studySet)
                    }}
                    disabled={updatingVisibility || deleting}
                    sx={{
                      '& .MuiToggleButton-root': {
                        px: 1.5,
                        py: 0.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        color: 'primary.main',
                        borderColor: 'primary.main',
                      },
                      '& .MuiToggleButton-root.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                      },
                      '& .MuiToggleButton-root.Mui-selected:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiToggleButtonGroup-grouped:not(:first-of-type)': {
                        borderLeftColor: 'primary.main',
                      },
                    }}
                  >
                    <ToggleButton value="PRIVATE">
                      Private
                    </ToggleButton>
                    <ToggleButton value="PUBLIC">
                      {updatingVisibility ? 'Saving...' : 'Public'}
                    </ToggleButton>
                  </ToggleButtonGroup>
                ) : null}
              </Stack>
              <Typography
                color="text.secondary"
                sx={{
                  fontSize: '0.9rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '2.7em',
                }}
              >
                {studySet.description || 'No description provided.'}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              icon={<CollectionsBookmarkRounded sx={{ fontSize: 16 }} />}
              label={`${studySet.flashcardCount} cards`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={studySet.deckType === 'QUIZ' ? 'Quiz Deck' : 'Flashcards'}
              size="small"
              variant="outlined"
            />
            {studySet.ownerUsername ? (
              <Chip
                icon={<VisibilityRounded sx={{ fontSize: 16 }} />}
                label={`by ${studySet.ownerUsername}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            ) : null}
          </Stack>

          <Divider />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
            <Button
              component={RouterLink}
              to={`/study-set/${studySet.id}`}
              variant="text"
              color="primary"
              endIcon={<ArrowOutwardRounded />}
              sx={{ alignSelf: 'flex-start', px: 0 }}
            >
              Open Deck
            </Button>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />

            {showDelete ? (
              <IconButton
                color="error"
                aria-label={`delete ${studySet.title}`}
                onClick={() => onDelete?.(studySet)}
                disabled={deleting || updatingVisibility}
                sx={{
                  border: '1px solid',
                  borderColor: 'error.main',
                  borderRadius: 0,
                  flexShrink: 0,
                  alignSelf: { xs: 'flex-start', sm: 'center' },
                  ml: { sm: 'auto' },
                }}
              >
                <DeleteOutlineRounded />
              </IconButton>
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

function LibraryPane({ title, subtitle, icon, items, emptyLabel, showDelete = false, deletingId = null, updatingVisibilityId = null, onDelete, onToggleVisibility }) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const visiblePage = Math.min(page, pageCount)
  const visibleItems = items.slice((visiblePage - 1) * PAGE_SIZE, visiblePage * PAGE_SIZE)

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent
        sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {icon}
          <Box>
            <Typography variant="h5">{title}</Typography>
            <Typography color="text.secondary" variant="body2">
              {subtitle}
            </Typography>
          </Box>
        </Stack>
      </CardContent>

      <Box
        sx={{
          p: 3,
          flexGrow: 1,
          minHeight: 240,
        }}
      >
        {items.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 0 }}>
            {emptyLabel}
          </Alert>
        ) : (
          <Stack spacing={2}>
            {visibleItems.map((item) => (
              <LibraryDeckItem
                key={item.id}
                studySet={item}
                showDelete={showDelete}
                deleting={deletingId === item.id}
                updatingVisibility={updatingVisibilityId === item.id}
                onDelete={onDelete}
                onToggleVisibility={onToggleVisibility}
              />
            ))}
          </Stack>
        )}
      </Box>

      {items.length > PAGE_SIZE ? (
        <Box
          sx={{
            px: 3,
            pb: 3,
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ sm: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {(visiblePage - 1) * PAGE_SIZE + 1}-{Math.min(visiblePage * PAGE_SIZE, items.length)} of {items.length}
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
        </Box>
      ) : null}
    </Card>
  )
}

export default function LibraryPage({ authUser, mySets, deletingId, updatingVisibilityId, loadingSets, onDelete, onToggleVisibility }) {
  return (
    <Stack spacing={4}>
      <SectionHeading
        title="Library"
        subtitle="A compact view of your saved decks."
      />

      {loadingSets ? <LinearProgress /> : null}

      <Stack spacing={4}>
        <LibraryPane
          title="My Decks"
          subtitle="Your saved and created study sets."
          icon={<BookmarkAddedRounded color="secondary" />}
          items={authUser?.authenticated ? mySets : []}
          showDelete={authUser?.authenticated}
          deletingId={deletingId}
          updatingVisibilityId={updatingVisibilityId}
          onDelete={onDelete}
          onToggleVisibility={onToggleVisibility}
          emptyLabel={authUser?.authenticated ? 'You have no decks yet.' : 'Sign in to access your library.'}
        />

        {!authUser?.authenticated ? (
          <Stack direction="row" spacing={2}>
            <Button component={RouterLink} to="/login" variant="outlined" color="primary" startIcon={<LockOpenRounded />}>
              Login
            </Button>
            <Button component={RouterLink} to="/register" variant="text" color="primary" startIcon={<PersonAddAltRounded />}>
              Register
            </Button>
          </Stack>
        ) : null}
      </Stack>
    </Stack>
  )
}
