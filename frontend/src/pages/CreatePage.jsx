import { useState } from 'react'
import { Alert, Box, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, InputAdornment, MenuItem, Pagination, Stack, Tab, Tabs, TextField, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded'
import AddRounded from '@mui/icons-material/AddRounded'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import SectionHeading from '../components/SectionHeading'
import { createStudySet, generateDraft, saveGeneratedStudySet } from '../api'

const initialManualForm = {
  title: '',
  description: '',
  visibility: 'PRIVATE',
}

const createEmptyCard = () => ({
  prompt: '',
  answer: '',
})

export default function CreatePage({ authUser, onCreated }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [manualForm, setManualForm] = useState(initialManualForm)
  const [aiVisibility, setAiVisibility] = useState('PRIVATE')
  const [manualCards, setManualCards] = useState([createEmptyCard()])
  const [manualCardsOpen, setManualCardsOpen] = useState(false)
  const [manualCardPage, setManualCardPage] = useState(0)
  const [manualState, setManualState] = useState({ loading: false, error: '', success: '' })
  const [prompt, setPrompt] = useState('')
  const [draft, setDraft] = useState(null)
  const [draftOpen, setDraftOpen] = useState(false)
  const [draftCardPage, setDraftCardPage] = useState(0)
  const [draftState, setDraftState] = useState({ loading: false, error: '', saving: false })

  const createTemplate = async () => {
    const sanitizedCards = manualCards
      .map((card) => ({
        prompt: card.prompt.trim(),
        answer: card.answer.trim(),
      }))
      .filter((card) => card.prompt || card.answer)

    if (sanitizedCards.length === 0) {
      setManualState({ loading: false, error: 'Add at least one flashcard before creating the deck.', success: '' })
      return
    }

    if (sanitizedCards.some((card) => !card.prompt || !card.answer)) {
      setManualState({ loading: false, error: 'Each flashcard needs both a prompt and an answer.', success: '' })
      return
    }

    setManualState({ loading: true, error: '', success: '' })
    try {
      const created = await createStudySet({
        ...manualForm,
        description: manualForm.description.trim() || 'No description provided.',
        flashcards: sanitizedCards,
      })
      setManualState({ loading: false, error: '', success: 'Deck created.' })
      await onCreated(authUser)
      navigate(`/study-set/${created.id}`)
    } catch (error) {
      setManualState({ loading: false, error: error.message, success: '' })
    }
  }

  const handleGenerateDraft = async () => {
    setDraftState({ loading: true, error: '', saving: false })
    try {
      const generated = await generateDraft({ prompt, visibility: aiVisibility })
      setDraft(generated)
      setDraftCardPage(0)
      setDraftOpen(true)
      setDraftState({ loading: false, error: '', saving: false })
    } catch (error) {
      setDraftState({ loading: false, error: error.message, saving: false })
    }
  }

  const handleSaveDraft = async () => {
    if (!draft) return

    setDraftState((current) => ({ ...current, saving: true, error: '' }))
    try {
      const saved = await saveGeneratedStudySet({
        title: draft.title.trim(),
        description: draft.summary.trim() || 'No description provided.',
        visibility: aiVisibility,
        flashcards: draft.flashcards,
      })
      await onCreated(authUser)
      navigate(`/study-set/${saved.id}`)
    } catch (error) {
      setDraftState((current) => ({ ...current, saving: false, error: error.message }))
    }
  }

  const handleManualCardChange = (index, field, value) => {
    setManualCards((current) =>
      current.map((card, cardIndex) => (cardIndex === index ? { ...card, [field]: value } : card)),
    )
    setManualState((current) => (current.error === 'Finish the current card before adding another one.' ? { ...current, error: '' } : current))
  }

  const handleAddManualCard = () => {
    const currentCard = manualCards[visibleManualCardPage]
    if (!currentCard.prompt.trim() || !currentCard.answer.trim()) {
      setManualState({ loading: false, error: 'Finish the current card before adding another one.', success: '' })
      return
    }

    setManualCards((current) => [...current, createEmptyCard()])
    setManualCardPage(manualCards.length)
  }

  const handleRemoveManualCard = (index) => {
    setManualCards((current) => {
      if (current.length === 1) {
        return current
      }

      const nextCards = current.filter((_, cardIndex) => cardIndex !== index)
      setManualCardPage((currentPage) => {
        if (currentPage > index) {
          return currentPage - 1
        }

        return Math.min(currentPage, nextCards.length - 1)
      })
      return nextCards
    })
  }

  const handleDraftChange = (field, value) => {
    setDraft((current) => (current ? { ...current, [field]: value } : current))
    setDraftState((current) => (current.error === 'Finish the current card before adding another one.' ? { ...current, error: '' } : current))
  }

  const handleDraftCardChange = (index, field, value) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            flashcards: current.flashcards.map((card, cardIndex) =>
              cardIndex === index ? { ...card, [field]: value } : card,
            ),
          }
        : current,
    )
    setDraftState((current) => (current.error === 'Finish the current card before adding another one.' ? { ...current, error: '' } : current))
  }

  const handleAddDraftCard = () => {
    const currentCard = draft?.flashcards?.[visibleDraftCardPage]
    if (!currentCard?.prompt.trim() || !currentCard?.answer.trim()) {
      setDraftState((current) => ({ ...current, error: 'Finish the current card before adding another one.' }))
      return
    }

    setDraft((current) =>
      current
        ? {
            ...current,
            flashcards: [...current.flashcards, createEmptyCard()],
          }
        : current,
    )
    setDraftCardPage(draft?.flashcards?.length ?? 0)
  }

  const handleRemoveDraftCard = (index) => {
    setDraft((current) => {
      if (!current || current.flashcards.length === 1) {
        return current
      }

      const nextCards = current.flashcards.filter((_, cardIndex) => cardIndex !== index)
      setDraftCardPage((currentPage) => {
        if (currentPage > index) {
          return currentPage - 1
        }

        return Math.min(currentPage, nextCards.length - 1)
      })
      return {
        ...current,
        flashcards: nextCards,
      }
    })
  }

  const completedManualCards = manualCards.filter((card) => card.prompt.trim() && card.answer.trim()).length
  const hasIncompleteManualCards = manualCards.some(
    (card) => (card.prompt.trim() && !card.answer.trim()) || (!card.prompt.trim() && card.answer.trim()),
  )
  const visibleManualCardPage = Math.min(manualCardPage, Math.max(manualCards.length - 1, 0))
  const activeManualCard = manualCards[visibleManualCardPage] ?? manualCards[0]
  const activeManualCardComplete = Boolean(activeManualCard?.prompt.trim() && activeManualCard?.answer.trim())
  const draftCards = draft?.flashcards ?? []
  const completedDraftCards = draftCards.filter((card) => card.prompt.trim() && card.answer.trim()).length
  const hasIncompleteDraftCards = draftCards.some(
    (card) => (card.prompt.trim() && !card.answer.trim()) || (!card.prompt.trim() && card.answer.trim()),
  )
  const visibleDraftCardPage = Math.min(draftCardPage, Math.max(draftCards.length - 1, 0))
  const activeDraftCard = draftCards[visibleDraftCardPage] ?? draftCards[0]
  const activeDraftCardComplete = Boolean(activeDraftCard?.prompt.trim() && activeDraftCard?.answer.trim())

  return (
    <Stack spacing={4}>
      <SectionHeading
        title="Create Deck"
        subtitle="Build your deck manually or let AI generate from your notes."
      />
      <Card sx={{ borderTop: '4px solid #34a853' }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Stack spacing={4}>
            <Tabs 
              value={tab} 
              onChange={(_, value) => setTab(value)}
              sx={{ borderBottom: '1px solid #dadce0' }}
            >
              <Tab label="Manual Setup" />
              <Tab label="Generate with AI" />
            </Tabs>
            {tab === 0 ? (
              <Stack spacing={3}>
                <Typography color="text.secondary">
                  Start with the deck details, then add your flashcards in a separate modal. You need at least one complete card before the deck can be saved.
                </Typography>
                <TextField
                  fullWidth
                  label="Deck Title"
                  placeholder="Example: Biology Midterm Review"
                  helperText="Use the topic or exam name so the deck is easy to recognize later."
                  variant="outlined"
                  value={manualForm.title}
                  onChange={(event) => setManualForm((current) => ({ ...current, title: event.target.value }))}
                />
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Description"
                    placeholder="What is this deck for? Add a quick note to remind yourself what it covers."
                    helperText="Optional, but useful if you plan to save multiple decks."
                    variant="outlined"
                    value={manualForm.description}
                    onChange={(event) => setManualForm((current) => ({ ...current, description: event.target.value }))}
                  />
                  <TextField
                    select
                    label="Visibility"
                    helperText="Private decks stay in your workspace. Public decks appear in the shared library."
                    variant="outlined"
                    value={manualForm.visibility}
                    onChange={(event) => setManualForm((current) => ({ ...current, visibility: event.target.value }))}
                    sx={{ minWidth: { md: 260 } }}
                  >
                    <MenuItem value="PRIVATE">Private</MenuItem>
                    <MenuItem value="PUBLIC">Public</MenuItem>
                  </TextField>
                </Stack>
                {manualState.error && <Alert severity="error">{manualState.error}</Alert>}
                {manualState.success && <Alert severity="success">{manualState.success}</Alert>}
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={!manualForm.title.trim()}
                  onClick={() => setManualCardsOpen(true)}
                >
                  Add Cards
                </Button>
              </Stack>
            ) : (
              <Stack spacing={3}>
                {!draft ? (
                  <>
                    <Typography color="text.secondary">
                      Paste your notes, reading material, or a clear prompt for the deck you want. The more specific the input is, the better the generated flashcards will be.
                    </Typography>
                    <Card variant="outlined" sx={{ bgcolor: '#f8f9fa' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Stack spacing={1}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            Tips for better results
                          </Typography>
                          <Typography color="text.secondary">
                            Include the topic, the level of detail you want, and any important terms or concepts that must be covered.
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                    <TextField
                      fullWidth
                      multiline
                      minRows={8}
                      label="Source Text / Prompt"
                      placeholder="Paste your notes or provide instructions for the AI on what flashcards to generate..."
                      variant="outlined"
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                            <AutoAwesomeRounded color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </>
                ) : (
                  <Stack spacing={1}>
                    <Typography color="text.secondary">
                      Your generated deck is ready. Open the modal to review, edit, and save the flashcards.
                    </Typography>
                    <Button variant="outlined" sx={{ alignSelf: 'flex-start' }} onClick={() => setDraftOpen(true)}>
                      View Generated Flashcards
                    </Button>
                  </Stack>
                )}
                {draftState.error && <Alert severity="error">{draftState.error}</Alert>}
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={draftState.loading || (!draft && !prompt.trim())}
                  onClick={
                    draft
                      ? () => {
                          setDraft(null)
                          setDraftOpen(false)
                          setDraftCardPage(0)
                          setDraftState({ loading: false, error: '', saving: false })
                        }
                      : handleGenerateDraft
                  }
                  startIcon={!draft && draftState.loading ? <CircularProgress size={20} color="inherit" /> : !draft ? <AutoAwesomeRounded /> : undefined}
                >
                  {!draft ? (draftState.loading ? 'Generating...' : 'Generate Flashcards') : 'Generate Again'}
                </Button>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
      <Dialog open={manualCardsOpen} onClose={() => setManualCardsOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 500, borderBottom: '1px solid #dadce0' }}>
          Add Flashcards
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            <Typography color="text.secondary">
              Add at least one prompt and answer. You can add more cards now or come back and edit the deck later.
            </Typography>
            {manualState.error ? <Alert severity="error">{manualState.error}</Alert> : null}
            {!activeManualCardComplete ? (
              <Alert severity="info">
                Finish the current card before adding another one.
              </Alert>
            ) : null}
            <Divider />
            <Stack key={`manual-card-${visibleManualCardPage}-${manualCards.length}`} spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                  Card {visibleManualCardPage + 1} of {manualCards.length}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton
                  color="error"
                  aria-label={`remove card ${visibleManualCardPage + 1}`}
                  onClick={() => handleRemoveManualCard(visibleManualCardPage)}
                  disabled={manualCards.length === 1}
                  sx={{
                    flexShrink: 0,
                    border: '1px solid',
                    borderColor: 'error.main',
                    borderRadius: 0,
                  }}
                >
                  <DeleteOutlineRounded />
                </IconButton>
              </Stack>
              <TextField
                fullWidth
                label="Prompt"
                placeholder="Example: What is the powerhouse of the cell?"
                value={activeManualCard.prompt}
                onChange={(event) => handleManualCardChange(visibleManualCardPage, 'prompt', event.target.value)}
              />
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Answer"
                placeholder="Example: The mitochondria."
                value={activeManualCard.answer}
                onChange={(event) => handleManualCardChange(visibleManualCardPage, 'answer', event.target.value)}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, justifyContent: 'space-between' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <Pagination
              count={manualCards.length}
              page={visibleManualCardPage + 1}
              onChange={(_, page) => setManualCardPage(page - 1)}
              color="primary"
              shape="rounded"
              siblingCount={0}
              boundaryCount={1}
            />
            <TextField
              select
              size="small"
              label="Jump To"
              value={visibleManualCardPage}
              onChange={(event) => setManualCardPage(Number(event.target.value))}
              sx={{ minWidth: 120 }}
            >
              {manualCards.map((_, index) => (
                <MenuItem key={index} value={index}>
                  Card {index + 1}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button onClick={handleAddManualCard} startIcon={<AddRounded />} disabled={!activeManualCardComplete}>
              Add Another Card
            </Button>
            <Button variant="outlined" onClick={() => setManualCardsOpen(false)}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={createTemplate}
              disabled={manualState.loading || completedManualCards === 0 || hasIncompleteManualCards}
            >
              {manualState.loading ? 'Creating...' : 'Create Deck'}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
      <Dialog open={draftOpen} onClose={() => setDraftOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 500, borderBottom: '1px solid #dadce0' }}>
          Generated Flashcards
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            <Typography color="text.secondary">
              Review and edit the generated deck before saving. You can change the title, description, and flashcards here.
            </Typography>
            {draftState.error ? <Alert severity="error">{draftState.error}</Alert> : null}
            {!activeDraftCardComplete ? (
              <Alert severity="info">
                Finish the current card before adding another one.
              </Alert>
            ) : null}
            {draft ? (
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Deck Title"
                  value={draft.title}
                  onChange={(event) => handleDraftChange('title', event.target.value)}
                />
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Description"
                  value={draft.summary}
                  onChange={(event) => handleDraftChange('summary', event.target.value)}
                />
                <TextField
                  select
                  label="Visibility"
                  helperText="Choose whether the AI-generated deck stays private or appears in the shared library."
                  variant="outlined"
                  value={aiVisibility}
                  onChange={(event) => setAiVisibility(event.target.value)}
                  sx={{ maxWidth: 260 }}
                >
                  <MenuItem value="PRIVATE">Private</MenuItem>
                  <MenuItem value="PUBLIC">Public</MenuItem>
                </TextField>
                <Divider />
                <Stack key={`draft-card-${visibleDraftCardPage}-${draftCards.length}`} spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                      Card {visibleDraftCardPage + 1} of {draftCards.length}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton
                      color="error"
                      aria-label={`remove generated card ${visibleDraftCardPage + 1}`}
                      onClick={() => handleRemoveDraftCard(visibleDraftCardPage)}
                      disabled={draftCards.length === 1}
                      sx={{
                        flexShrink: 0,
                        border: '1px solid',
                        borderColor: 'error.main',
                        borderRadius: 0,
                      }}
                    >
                      <DeleteOutlineRounded />
                    </IconButton>
                  </Stack>
                  <TextField
                    fullWidth
                    label="Prompt"
                    value={activeDraftCard?.prompt ?? ''}
                    onChange={(event) => handleDraftCardChange(visibleDraftCardPage, 'prompt', event.target.value)}
                  />
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Answer"
                    value={activeDraftCard?.answer ?? ''}
                    onChange={(event) => handleDraftCardChange(visibleDraftCardPage, 'answer', event.target.value)}
                  />
                </Stack>
              </Stack>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, justifyContent: 'space-between' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <Pagination
              count={Math.max(draftCards.length, 1)}
              page={visibleDraftCardPage + 1}
              onChange={(_, page) => setDraftCardPage(page - 1)}
              color="primary"
              shape="rounded"
              siblingCount={0}
              boundaryCount={1}
            />
            <TextField
              select
              size="small"
              label="Jump To"
              value={visibleDraftCardPage}
              onChange={(event) => setDraftCardPage(Number(event.target.value))}
              sx={{ minWidth: 120 }}
            >
              {draftCards.map((_, index) => (
                <MenuItem key={index} value={index}>
                  Card {index + 1}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button onClick={handleAddDraftCard} startIcon={<AddRounded />} disabled={!activeDraftCardComplete}>
              Add Another Card
            </Button>
            <Button variant="outlined" onClick={() => setDraftOpen(false)}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveDraft}
              disabled={!draft || draftState.saving || !draft.title.trim() || completedDraftCards === 0 || hasIncompleteDraftCards}
            >
              {draftState.saving ? 'Saving...' : 'Save Deck'}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
