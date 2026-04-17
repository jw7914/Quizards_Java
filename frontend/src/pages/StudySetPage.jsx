import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Divider,
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
import IosShareRounded from '@mui/icons-material/IosShareRounded'
import TimerOutlined from '@mui/icons-material/TimerOutlined'
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined'
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined'
import SectionHeading from '../components/SectionHeading'
import { fetchStudySession, fetchStudySetDetail } from '../api'

const STUDY_MODES = [
  { value: 'REPETITION', label: 'Repetition' },
  { value: 'TIMED_QUIZ', label: 'Timed Quiz' },
  { value: 'STREAK', label: 'Streak' },
]

function formatMode(mode) {
  return STUDY_MODES.find((option) => option.value === mode)?.label ?? mode
}

function formatTimeLimit(seconds) {
  if (!seconds) return null
  const minutes = Math.floor(seconds / 60)
  if (seconds % 60 === 0) {
    return `${minutes} min`
  }
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

function createQuizSessionState(session) {
  return {
    ...session,
    queue: session.queue ?? [],
    originalCount: session.queue?.length ?? 0,
    currentIndex: session.currentIndex ?? 0,
    correctAnswers: session.correctAnswers ?? 0,
    answeredCount: 0,
    currentStreak: 0,
    bestStreak: 0,
    remainingSeconds: session.timeLimitSeconds ?? 0,
    completed: false,
    endedEarly: false,
    lastAnswerCorrect: null,
  }
}

export default function StudySetPage({ authUser }) {
  const { studySetId } = useParams()
  const [studySet, setStudySet] = useState(null)
  const [session, setSession] = useState(null)
  const [quizSession, setQuizSession] = useState(null)
  const [pendingQuizSession, setPendingQuizSession] = useState(null)
  const [mode, setMode] = useState('REPETITION')
  const [loading, setLoading] = useState(true)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [timedMinutes, setTimedMinutes] = useState('10')
  const [selectedChoice, setSelectedChoice] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [revealedCards, setRevealedCards] = useState({})

  useEffect(() => {
    let active = true

    async function loadStudyPage() {
      setLoading(true)
      setError('')
      try {
        const detail = await fetchStudySetDetail(studySetId)

        if (!active) return

        setStudySet(detail)
        setSession(null)
        setQuizSession(null)
        setPendingQuizSession(null)
        setMode('REPETITION')
        setActiveIndex(0)
        setFlipped(false)
        setSelectedChoice('')
        setRevealedCards({})
      } catch (loadError) {
        if (active) {
          setError(loadError.message)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadStudyPage()
    return () => {
      active = false
    }
  }, [studySetId, authUser?.authenticated])

  useEffect(() => {
    if (!quizSession || quizSession.mode !== 'TIMED_QUIZ' || quizSession.completed) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setQuizSession((current) => {
        if (!current || current.mode !== 'TIMED_QUIZ' || current.completed) {
          return current
        }
        if (current.remainingSeconds <= 1) {
          return {
            ...current,
            remainingSeconds: 0,
            completed: true,
          }
        }
        return {
          ...current,
          remainingSeconds: current.remainingSeconds - 1,
        }
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [quizSession])

  const handleStartSession = async () => {
    setSessionLoading(true)
    setError('')
    try {
      const normalizedTimedMinutes = Number.parseInt(timedMinutes, 10)
      const nextSession = await fetchStudySession(
        studySetId,
        mode,
        mode === 'TIMED_QUIZ' ? { timeLimitMinutes: normalizedTimedMinutes } : {},
      )
      setSession(nextSession)
      setQuizSession(createQuizSessionState(nextSession))
      setPendingQuizSession(null)
      setActiveIndex(nextSession.currentIndex ?? 0)
      setFlipped(false)
      setSelectedChoice('')
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setSessionLoading(false)
    }
  }

  if (loading) {
    return <LinearProgress />
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (!studySet) {
    return <Alert severity="info">Study deck not found.</Alert>
  }

  const deckCardType = studySet.deckType ?? 'TEXT'
  const isQuizDeck = deckCardType === 'QUIZ'
  const flashcards = studySet.flashcards ?? []
  const quizQueue = quizSession?.queue ?? []
  const displayCards = isQuizDeck ? quizQueue : flashcards
  const cardCount = displayCards.length
  const visibleIndex = isQuizDeck
    ? Math.min(quizSession?.currentIndex ?? 0, Math.max(cardCount - 1, 0))
    : Math.min(activeIndex, Math.max(cardCount - 1, 0))
  const activeCard = displayCards[visibleIndex]
  const progressValue = isQuizDeck
    ? quizSession?.mode === 'REPETITION'
      ? (((quizSession?.originalCount ?? 0) - (quizSession?.queue?.length ?? 0)) / Math.max(quizSession?.originalCount ?? 1, 1)) * 100
      : quizSession?.mode === 'STREAK'
        ? ((quizSession?.currentStreak ?? 0) / Math.max(quizSession?.originalCount ?? 1, 1)) * 100
        : ((quizSession?.answeredCount ?? 0) / Math.max(quizSession?.originalCount ?? 1, 1)) * 100
    : cardCount > 0
      ? ((visibleIndex + 1) / cardCount) * 100
      : 0
  const timeLimitLabel = formatTimeLimit(
    isQuizDeck ? (quizSession?.remainingSeconds ?? session?.timeLimitSeconds ?? 0) : 0,
  )

  const goToCard = (nextIndex) => {
    setActiveIndex(nextIndex)
    setFlipped(false)
    setSelectedChoice('')
  }

  const hasSession = isQuizDeck ? Boolean(quizSession) : true
  const quizCompleted = Boolean(quizSession?.completed)

  const handleQuizAnswer = (choice) => {
    if (!quizSession || quizSession.completed || selectedChoice) {
      return
    }

    const currentCard = quizSession.queue[quizSession.currentIndex]
    if (!currentCard) {
      return
    }

    const isCorrect = choice === currentCard.answer
    setSelectedChoice(choice)
    const nextCorrectAnswers = quizSession.correctAnswers + (isCorrect ? 1 : 0)
    const nextAnsweredCount = quizSession.answeredCount + 1
    const nextCurrentStreak = isCorrect ? quizSession.currentStreak + 1 : 0
    const nextBestStreak = Math.max(quizSession.bestStreak, nextCurrentStreak)

    if (quizSession.mode === 'REPETITION') {
      const nextQueue = [...quizSession.queue]
      const [currentItem] = nextQueue.splice(quizSession.currentIndex, 1)
      if (!isCorrect) {
        nextQueue.push(currentItem)
      }
      setPendingQuizSession({
        ...quizSession,
        queue: nextQueue,
        currentIndex: Math.min(quizSession.currentIndex, Math.max(nextQueue.length - 1, 0)),
        correctAnswers: nextCorrectAnswers,
        answeredCount: nextAnsweredCount,
        currentStreak: nextCurrentStreak,
        bestStreak: nextBestStreak,
        completed: nextQueue.length === 0,
        lastAnswerCorrect: isCorrect,
      })
      return
    }

    if (quizSession.mode === 'STREAK') {
      const nextIndex = isCorrect ? quizSession.currentIndex + 1 : 0
      const completed = isCorrect && nextCurrentStreak >= quizSession.originalCount
      setPendingQuizSession({
        ...quizSession,
        correctAnswers: nextCorrectAnswers,
        answeredCount: nextAnsweredCount,
        currentIndex: completed ? quizSession.currentIndex : nextIndex,
        currentStreak: nextCurrentStreak,
        bestStreak: nextBestStreak,
        completed,
        lastAnswerCorrect: isCorrect,
      })
      return
    }

    const isLastCard = quizSession.currentIndex >= quizSession.queue.length - 1
    setPendingQuizSession({
      ...quizSession,
      correctAnswers: nextCorrectAnswers,
      answeredCount: nextAnsweredCount,
      currentIndex: isLastCard ? quizSession.currentIndex : quizSession.currentIndex + 1,
      currentStreak: nextCurrentStreak,
      bestStreak: nextBestStreak,
      completed: isLastCard || nextAnsweredCount >= quizSession.originalCount,
      lastAnswerCorrect: isCorrect,
    })
  }

  const handleNextQuizCard = () => {
    if (pendingQuizSession) {
      setQuizSession(pendingQuizSession)
      setPendingQuizSession(null)
    }
    setSelectedChoice('')
  }

  const handleEndQuizSession = () => {
    setPendingQuizSession(null)
    setSelectedChoice('')
    if (quizSession?.mode === 'TIMED_QUIZ') {
      setSession(null)
      setQuizSession(null)
      return
    }
    setQuizSession((current) =>
      current
        ? {
            ...current,
            completed: true,
            endedEarly: true,
          }
        : current,
    )
  }

  const handleRestartSession = () => {
    if (quizSession?.mode === 'TIMED_QUIZ') {
      setSession(null)
      setQuizSession(null)
      setPendingQuizSession(null)
      setSelectedChoice('')
      return
    }
    handleStartSession()
  }

  const handleShare = async () => {
    if (typeof window === 'undefined') {
      return
    }

    const shareUrl = `${window.location.origin}/study-set/${studySetId}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: studySet.title,
          text: `Study ${studySet.title} on Quizards`,
          url: shareUrl,
        })
        setShareMessage('Share sheet opened.')
        return
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        setShareMessage('Link copied to clipboard.')
        return
      }

      setShareMessage('Sharing is not available in this browser.')
    } catch {
      setShareMessage('Unable to share this deck right now.')
    }
  }

  const toggleCardReveal = (cardKey) => {
    setRevealedCards((current) => ({
      ...current,
      [cardKey]: !current[cardKey],
    }))
  }

  const allCardsRevealed = flashcards.length > 0 && flashcards.every((card, index) => {
    const cardKey = card.id ?? `${studySetId}-${index}`
    return Boolean(revealedCards[cardKey])
  })

  const handleToggleRevealAll = () => {
    if (allCardsRevealed) {
      setRevealedCards({})
      return
    }

    setRevealedCards(
      Object.fromEntries(
        flashcards.map((card, index) => [card.id ?? `${studySetId}-${index}`, true]),
      ),
    )
  }

  return (
    <Stack spacing={5}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'flex-start' }}
        sx={{ width: '100%' }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <SectionHeading title={studySet.title} subtitle={studySet.description || 'No description provided.'} />
        </Box>
        {studySet.visibility === 'PUBLIC' ? (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<IosShareRounded />}
            onClick={handleShare}
            sx={{ alignSelf: { xs: 'stretch', md: 'flex-start' }, flexShrink: 0, ml: { md: 'auto' } }}
          >
            Share
          </Button>
        ) : null}
      </Stack>

      {shareMessage ? (
        <Alert severity="success" onClose={() => setShareMessage('')}>
          {shareMessage}
        </Alert>
      ) : null}

      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <Chip label={studySet.visibility} color={studySet.visibility === 'PUBLIC' ? 'primary' : 'default'} variant="outlined" />
        <Chip label={`${studySet.flashcardCount} cards`} icon={<CollectionsBookmarkRounded />} color="primary" />
        <Chip label={isQuizDeck ? 'Quiz Deck' : 'Flashcards'} variant="outlined" />
        {isQuizDeck ? <Chip label={formatMode(quizSession?.mode ?? mode)} variant="outlined" /> : null}
        {isQuizDeck && quizSession?.mode !== 'STREAK' ? <Chip label={`${quizSession?.correctAnswers ?? 0} correct`} variant="outlined" /> : null}
        {isQuizDeck && quizSession?.mode === 'STREAK' ? <Chip label={`Streak ${quizSession?.currentStreak ?? 0}`} variant="outlined" /> : null}
      </Stack>

      <Card sx={{ overflow: 'hidden' }}>
        {(sessionLoading || loading) ? (
          <LinearProgress />
        ) : hasSession ? (
          <Box
            sx={{
              height: 6,
              width: `${progressValue}%`,
              bgcolor: 'primary.main',
              transition: 'width 180ms ease',
            }}
          />
        ) : null}

        <Stack spacing={3} sx={{ p: { xs: 3, md: 4 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            sx={{ width: '100%' }}
          >
            <Typography variant="h6">
              {hasSession ? `Card ${visibleIndex + 1} of ${cardCount}` : 'Choose a mode'}
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
              {isQuizDeck ? (
                <TextField
                  select
                  size="small"
                  label="Mode"
                  value={mode}
                  onChange={(event) => {
                    setMode(event.target.value)
                    setSession(null)
                    setQuizSession(null)
                    setPendingQuizSession(null)
                    setActiveIndex(0)
                    setFlipped(false)
                    setSelectedChoice('')
                  }}
                  disabled={hasSession && !quizCompleted}
                  sx={{ minWidth: 150 }}
                >
                  {STUDY_MODES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              ) : null}

              {isQuizDeck && !hasSession && mode === 'TIMED_QUIZ' ? (
                <TextField
                  size="small"
                  label="Minutes"
                  value={timedMinutes}
                  onChange={(event) => setTimedMinutes(event.target.value)}
                  type="number"
                  inputProps={{ min: 1, max: 180, step: 1 }}
                  sx={{ minWidth: 120 }}
                />
              ) : null}

              {isQuizDeck && quizSession?.mode === 'TIMED_QUIZ' && hasSession && !quizCompleted ? (
                <Box
                  sx={{
                    minWidth: 132,
                    px: 1.75,
                    py: 1,
                    border: '1px solid',
                    borderColor: quizSession.remainingSeconds <= 30 ? 'error.main' : 'divider',
                    borderRadius: 2,
                    bgcolor: quizSession.remainingSeconds <= 30 ? '#fff4f4' : '#f8fbff',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TimerOutlined
                      color={quizSession.remainingSeconds <= 30 ? 'error' : 'primary'}
                      sx={{ fontSize: 18 }}
                    />
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', lineHeight: 1.1, letterSpacing: '0.06em' }}
                      >
                        TIMER
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          lineHeight: 1.15,
                          color: quizSession.remainingSeconds <= 30 ? 'error.main' : 'text.primary',
                        }}
                      >
                        {timeLimitLabel}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ) : null}

              {hasSession && !isQuizDeck ? (
                <TextField
                  select
                  size="small"
                  label="Card"
                  value={visibleIndex}
                  onChange={(event) => goToCard(Number(event.target.value))}
                  sx={{ minWidth: 120 }}
                >
                  {displayCards.map((_, index) => (
                    <MenuItem key={index} value={index}>
                      {index + 1}
                    </MenuItem>
                  ))}
                </TextField>
              ) : !hasSession ? (
                <Button
                  variant="contained"
                  onClick={handleStartSession}
                  disabled={sessionLoading || (mode === 'TIMED_QUIZ' && !timedMinutes.trim())}
                >
                  {sessionLoading ? 'Starting...' : `Start ${formatMode(mode)}`}
                </Button>
              ) : null}
              {isQuizDeck && hasSession && !quizCompleted ? (
                <Button variant="outlined" onClick={handleEndQuizSession}>
                  End Session
                </Button>
              ) : null}
            </Stack>
          </Stack>

          {!hasSession ? (
            <Stack spacing={2} alignItems="center" sx={{ py: { xs: 4, md: 8 } }}>
              <Typography variant="h5">{formatMode(mode)}</Typography>
              {mode === 'REPETITION' ? (
                <Typography color="text.secondary">
                  Any wrong answer gets recycled back into the queue until you answer it correctly.
                </Typography>
              ) : null}
              {mode === 'TIMED_QUIZ' ? (
                <Typography color="text.secondary">
                  Answer as many cards as you can before the timer runs out.
                </Typography>
              ) : null}
              {mode === 'STREAK' ? (
                <Typography color="text.secondary">
                  You must answer every card correctly in one run or the streak resets back to the start.
                </Typography>
              ) : null}
            </Stack>
          ) : quizCompleted ? (
            <Stack spacing={2} alignItems="center" sx={{ py: { xs: 4, md: 8 } }}>
              <Typography variant="h5">Session Complete</Typography>
              <Typography color="text.secondary">
                {quizSession.mode === 'STREAK'
                  ? `Perfect streak: ${quizSession.currentStreak} in a row`
                  : `${quizSession.correctAnswers} correct out of ${quizSession.answeredCount}`}
              </Typography>
              {quizSession.endedEarly ? (
                <Typography color="text.secondary">
                  Session ended early.
                </Typography>
              ) : null}
              {quizSession.mode === 'STREAK' ? (
                <Typography color="text.secondary">
                  Best streak: {quizSession.bestStreak}
                </Typography>
              ) : null}
              <Button variant="contained" onClick={handleRestartSession}>
                {quizSession.mode === 'TIMED_QUIZ' ? 'Set Time Again' : `Restart ${formatMode(mode)}`}
              </Button>
            </Stack>
          ) : !activeCard ? (
            <Alert severity="info">This deck does not have any flashcards yet.</Alert>
          ) : (
            <>
              {!isQuizDeck ? (
                <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                  <IconButton
                    aria-label="Previous card"
                    onClick={() => goToCard(Math.max(visibleIndex - 1, 0))}
                    disabled={visibleIndex === 0 || sessionLoading}
                    sx={{ border: '1px solid', borderColor: 'divider' }}
                  >
                    <ArrowBackRounded />
                  </IconButton>
                  <IconButton
                    aria-label={flipped ? 'Show prompt' : 'Show answer'}
                    onClick={() => setFlipped((current) => !current)}
                    disabled={sessionLoading}
                    sx={{ border: '1px solid', borderColor: 'divider' }}
                  >
                    <CollectionsBookmarkRounded />
                  </IconButton>
                  <IconButton
                    aria-label="Next card"
                    onClick={() => goToCard(Math.min(visibleIndex + 1, cardCount - 1))}
                    disabled={visibleIndex === cardCount - 1 || sessionLoading}
                    sx={{ border: '1px solid', borderColor: 'divider' }}
                  >
                    <ArrowForwardRounded />
                  </IconButton>
                </Stack>
              ) : null}

              <Box
                onClick={() => {
                  if (!sessionLoading && !isQuizDeck) {
                    setFlipped((current) => !current)
                  }
                }}
                sx={{
                  perspective: 1600,
                  cursor: sessionLoading ? 'progress' : isQuizDeck ? 'default' : 'pointer',
                  userSelect: 'none',
                }}
              >
                {isQuizDeck ? (
                  <Card
                    sx={{
                      minHeight: { xs: 340, md: 420 },
                      display: 'flex',
                      borderRadius: 3,
                      background: 'linear-gradient(145deg, rgba(244,247,255,1) 0%, rgba(255,255,255,1) 75%)',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 24px 48px rgba(15, 23, 42, 0.08)',
                    }}
                  >
                    <Stack spacing={3} sx={{ p: { xs: 3, md: 5 }, width: '100%' }}>
                      <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.08em' }}>
                        Quiz
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: '1.4rem', md: '2rem' },
                          lineHeight: 1.35,
                          fontWeight: 500,
                          color: 'text.primary',
                          textAlign: 'center',
                        }}
                      >
                        {activeCard.prompt}
                      </Typography>
                      <Stack spacing={1.5} sx={{ mt: 'auto' }}>
                        {(activeCard.choices ?? []).map((choice, index) => {
                          const isSelected = selectedChoice === choice
                          const showResult = Boolean(selectedChoice)
                          const isCorrect = choice === activeCard.answer
                          return (
                            <Button
                              key={`${activeCard.id}-${index}`}
                              variant={isSelected ? 'contained' : 'outlined'}
                              color={showResult ? (isCorrect ? 'success' : isSelected ? 'error' : 'primary') : 'primary'}
                              onClick={() => handleQuizAnswer(choice)}
                              disabled={Boolean(selectedChoice)}
                              sx={{ justifyContent: 'flex-start', py: 1.25 }}
                            >
                              {choice}
                            </Button>
                          )
                        })}
                      </Stack>
                      {selectedChoice ? (
                        <Stack spacing={2}>
                          <Alert severity={selectedChoice === activeCard.answer ? 'success' : 'error'}>
                            {selectedChoice === activeCard.answer ? 'Correct' : `Correct answer: ${activeCard.answer}`}
                          </Alert>
                          <Button variant="contained" onClick={handleNextQuizCard}>
                            {quizSession?.mode === 'REPETITION' && !quizSession?.lastAnswerCorrect ? 'Try Next Card' : 'Continue'}
                          </Button>
                        </Stack>
                      ) : null}
                    </Stack>
                  </Card>
                ) : (
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
                        key={`${session?.mode ?? mode}-${activeCard.id}-${face.key}`}
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
                )}
              </Box>
            </>
          )}
        </Stack>
      </Card>

      <Stack spacing={3}>
        <Stack spacing={1}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            sx={{ width: '100%' }}
          >
            <Box sx={{ minWidth: 0, flexGrow: 1, width: { xs: '100%', md: 'auto' } }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: '0.08em', display: 'block', mb: 0.5 }}
              >
                Full Study Set
              </Typography>
              <Typography variant="h4" sx={{ lineHeight: 1.1 }}>
                Review every card
              </Typography>
            </Box>
            {flashcards.length > 0 ? (
              <Stack
                spacing={1}
                alignItems={{ xs: 'flex-start', md: 'flex-end' }}
                sx={{ ml: { md: 'auto' }, flexShrink: 0 }}
              >
                <Typography color="text.secondary">
                  {flashcards.length} cards in this deck
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleToggleRevealAll}
                  sx={{ alignSelf: { xs: 'flex-start', md: 'flex-end' } }}
                >
                  {allCardsRevealed ? 'Hide all answers' : 'Reveal all answers'}
                </Button>
              </Stack>
            ) : null}
          </Stack>
        </Stack>

        {flashcards.length === 0 ? (
          <Alert severity="info">This deck does not have any flashcards yet.</Alert>
        ) : (
          <Stack spacing={2}>
            {flashcards.map((card, index) => (
              (() => {
                const cardKey = card.id ?? `${studySetId}-${index}`
                const isRevealed = Boolean(revealedCards[cardKey])

                return (
              <Card
                key={cardKey}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 12px 28px rgba(15, 23, 42, 0.05)',
                  overflow: 'hidden',
                }}
              >
                <Stack
                  direction={{ xs: 'column', lg: 'row' }}
                  divider={<Divider orientation="vertical" flexItem />}
                  sx={{ minHeight: { lg: 180 } }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      p: { xs: 2.5, md: 3 },
                      bgcolor: '#ffffff',
                    }}
                  >
                    <Stack spacing={2} sx={{ height: '100%' }}>
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Chip
                          label={`Card ${index + 1}`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                      <Box>
                        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.08em' }}>
                          Prompt
                        </Typography>
                        <Typography sx={{ mt: 1, fontSize: '1.05rem', lineHeight: 1.6 }}>
                          {card.prompt}
                        </Typography>
                      </Box>
                      {isQuizDeck && card.choices?.length ? (
                        <Stack spacing={1} sx={{ mt: 'auto' }}>
                          {card.choices.map((choice, choiceIndex) => (
                            <Chip
                              key={`${cardKey}-choice-${choiceIndex}`}
                              label={choice}
                              size="small"
                              variant="outlined"
                              sx={{ justifyContent: 'flex-start', '& .MuiChip-label': { whiteSpace: 'normal' } }}
                            />
                          ))}
                        </Stack>
                      ) : null}
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      flex: 1,
                      p: { xs: 2.5, md: 3 },
                      bgcolor: '#f9fbff',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.08em' }}>
                        Answer
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => toggleCardReveal(cardKey)}
                        sx={{ flexShrink: 0, ml: 2 }}
                        aria-label={isRevealed ? 'Hide answer' : 'Reveal answer'}
                      >
                        {isRevealed ? <VisibilityOffOutlined fontSize="small" /> : <VisibilityOutlined fontSize="small" />}
                      </IconButton>
                    </Box>
                    {isRevealed ? (
                      <Typography
                        sx={{
                          mt: 1,
                          fontSize: '1.05rem',
                          lineHeight: 1.6,
                          flexGrow: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                        }}
                      >
                        {card.answer}
                      </Typography>
                    ) : (
                      <Box
                        sx={{
                          mt: 1,
                          minHeight: 96,
                          borderRadius: 2,
                          border: '1px dashed',
                          borderColor: 'divider',
                          bgcolor: '#ffffff',
                          display: 'grid',
                          placeItems: 'center',
                          px: 2,
                        }}
                      >
                        <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                          Hidden until you Reveal.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Stack>
              </Card>
                )
              })()
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}
