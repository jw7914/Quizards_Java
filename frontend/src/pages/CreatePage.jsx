import { useState } from 'react'
import { Alert, Button, Card, CardContent, CircularProgress, InputAdornment, Stack, Tab, Tabs, TextField } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded'
import SectionHeading from '../components/SectionHeading'
import DraftPreview from '../components/DraftPreview'
import { createStudySet, generateDraft, saveGeneratedStudySet } from '../api'

const initialManualForm = {
  title: '',
  description: '',
  visibility: 'PRIVATE',
}

export default function CreatePage({ authUser, onCreated }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [manualForm, setManualForm] = useState(initialManualForm)
  const [manualState, setManualState] = useState({ loading: false, error: '', success: '' })
  const [prompt, setPrompt] = useState('')
  const [draft, setDraft] = useState(null)
  const [draftState, setDraftState] = useState({ loading: false, error: '', saving: false })

  const createTemplate = async () => {
    setManualState({ loading: true, error: '', success: '' })
    try {
      const created = await createStudySet(manualForm)
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
      const generated = await generateDraft({ prompt, visibility: manualForm.visibility })
      setDraft(generated)
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
        title: draft.title,
        description: draft.summary,
        visibility: manualForm.visibility,
        flashcards: draft.flashcards,
      })
      await onCreated(authUser)
      navigate(`/study-set/${saved.id}`)
    } catch (error) {
      setDraftState((current) => ({ ...current, saving: false, error: error.message }))
    }
  }

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
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <TextField
                fullWidth
                label="Deck Title"
                variant="outlined"
                value={manualForm.title}
                onChange={(event) => setManualForm((current) => ({ ...current, title: event.target.value }))}
              />
              <TextField
                select
                label="Visibility"
                variant="outlined"
                value={manualForm.visibility}
                onChange={(event) => setManualForm((current) => ({ ...current, visibility: event.target.value }))}
                sx={{ minWidth: { md: 220 } }}
                SelectProps={{ native: true }}
              >
                <option value="PRIVATE">Private</option>
                <option value="PUBLIC">Public</option>
              </TextField>
            </Stack>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              variant="outlined"
              value={manualForm.description}
              onChange={(event) => setManualForm((current) => ({ ...current, description: event.target.value }))}
            />
            {tab === 0 ? (
              <Stack spacing={3}>
                {manualState.error && <Alert severity="error">{manualState.error}</Alert>}
                {manualState.success && <Alert severity="success">{manualState.success}</Alert>}
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={manualState.loading || !manualForm.title.trim()}
                  onClick={createTemplate}
                >
                  {manualState.loading ? 'Creating...' : 'Create Shell'}
                </Button>
              </Stack>
            ) : (
              <Stack spacing={3}>
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
                {draftState.error && <Alert severity="error">{draftState.error}</Alert>}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={draftState.loading || !prompt.trim()}
                    onClick={handleGenerateDraft}
                    startIcon={draftState.loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeRounded />}
                  >
                    {draftState.loading ? 'Generating...' : 'Generate Flashcards'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    disabled={!draft || draftState.saving}
                    onClick={handleSaveDraft}
                  >
                    {draftState.saving ? 'Saving...' : 'Save Deck'}
                  </Button>
                </Stack>
                {draft ? <DraftPreview draft={draft} /> : null}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
