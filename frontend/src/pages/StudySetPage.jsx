import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
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
import TimerOutlined from '@mui/icons-material/TimerOutlined'
import SectionHeading from '../components/SectionHeading'
import { fetchStudySession, fetchStudySetDetail } from '../api'

const STUDY_MODES = [
  { value: 'LEITNER', label: 'Leitner' },
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
  const [mode, setMode] = useState('LEITNER')
  const [loading, setLoading] = useState(true)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [timedMinutes, setTimedMinutes] = useState('10')
  const [selectedChoice, setSelectedChoice] = useState('')

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
        setMode('LEITNER')
        setActiveIndex(0)
        setFlipped(false)
        setSelectedChoice('')
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

  const flashcards = session?.queue ?? []
  const deckCardType = studySet.deckType ?? 'TEXT'
  const displayCards = deckCardType === 'QUIZ' ? (quizSession?.queue ?? flashcards) : (studySet.flashcards ?? [])
  const cardCount = displayCards.length
  const visibleIndex = deckCardType === 'QUIZ'
    ? Math.min(quizSession?.currentIndex ?? 0, Math.max(cardCount - 1, 0))
    : Math.min(activeIndex, Math.max(cardCount - 1, 0))
  const activeCard = displayCards[visibleIndex]
  const progressValue = deckCardType === 'QUIZ'
    ? quizSession?.mode === 'LEITNER'
      ? (((quizSession?.originalCount ?? 0) - (quizSession?.queue?.length ?? 0)) / Math.max(quizSession?.originalCount ?? 1, 1)) * 100
      : quizSession?.mode === 'STREAK'
        ? ((quizSession?.currentStreak ?? 0) / Math.max(quizSession?.originalCount ?? 1, 1)) * 100
        : ((quizSession?.answeredCount ?? 0) / Math.max(quizSession?.originalCount ?? 1, 1)) * 100
    : cardCount > 0
      ? ((visibleIndex + 1) / cardCount) * 100
      : 0
  const timeLimitLabel = formatTimeLimit(
    deckCardType === 'QUIZ' ? (quizSession?.remainingSeconds ?? session?.timeLimitSeconds ?? 0) : 0,
  )

  const goToCard = (nextIndex) => {
    setActiveIndex(nextIndex)
    setFlipped(false)
    setSelectedChoice('')
  }

  const hasSession = deckCardType === 'QUIZ' ? Boolean(session) : true
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

    if (quizSession.mode === 'LEITNER') {
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

  return (
    <Stack spacing={4}>
      <SectionHeading title={studySet.title} subtitle={studySet.description || 'No description provided.'} />

      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <Chip label={studySet.visibility} color={studySet.visibility === 'PUBLIC' ? 'primary' : 'default'} variant="outlined" />
        <Chip label={`${studySet.flashcardCount} cards`} icon={<CollectionsBookmarkRounded />} color="primary" />
        <Chip label={deckCardType === 'QUIZ' ? 'Quiz Deck' : 'Flashcards'} variant="outlined" />
        {deckCardType === 'QUIZ' ? <Chip label={formatMode(session?.mode ?? mode)} variant="outlined" /> : null}
        {deckCardType === 'QUIZ' && timeLimitLabel ? <Chip label={timeLimitLabel} icon={<TimerOutlined />} variant="outlined" /> : null}
        {deckCardType === 'QUIZ' && quizSession?.mode !== 'STREAK' ? <Chip label={`${quizSession.correctAnswers} correct`} variant="outlined" /> : null}
        {deckCardType === 'QUIZ' && quizSession?.mode === 'STREAK' ? <Chip label={`Streak ${quizSession.currentStreak}`} variant="outlined" /> : null}
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
              {deckCardType === 'QUIZ' ? (
                <TextField
                  select
                  size="small"
                  label="Mode"
                  value={mode}
                  onChange={(event) => {
                    setMode(event.target.value)
                    setSession(null)
                    setActiveIndex(0)
                    setFlipped(false)
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

              {deckCardType === 'QUIZ' && !hasSession && mode === 'TIMED_QUIZ' ? (
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

              {hasSession && deckCardType === 'TEXT' ? (
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
              {deckCardType === 'QUIZ' && hasSession && !quizCompleted ? (
                <Button variant="outlined" onClick={handleEndQuizSession}>
                  End Session
                </Button>
              ) : null}
            </Stack>
          </Stack>

          {!hasSession ? (
            <Stack spacing={2} alignItems="center" sx={{ py: { xs: 4, md: 8 } }}>
              <Typography variant="h5">{formatMode(mode)}</Typography>
              {mode === 'LEITNER' ? <Typography color="text.secondary">Review due cards first.</Typography> : null}
              {mode === 'TIMED_QUIZ' ? <Typography color="text.secondary">Race through the deck on a timer.</Typography> : null}
              {mode === 'STREAK' ? <Typography color="text.secondary">Keep your run going card by card.</Typography> : null}
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
              <Button variant="contained" onClick={handleStartSession}>
                Restart {formatMode(mode)}
              </Button>
            </Stack>
          ) : !activeCard ? (
            <Alert severity="info">This deck does not have any flashcards yet.</Alert>
          ) : (
            <>
              {deckCardType === 'TEXT' ? (
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
                  if (!sessionLoading && deckCardType !== 'QUIZ') {
                    setFlipped((current) => !current)
                  }
                }}
                sx={{
                  perspective: 1600,
                  cursor: sessionLoading ? 'progress' : deckCardType === 'QUIZ' ? 'default' : 'pointer',
                  userSelect: 'none',
                }}
              >
                {deckCardType === 'QUIZ' ? (
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
                            {quizSession?.mode === 'LEITNER' && !quizSession?.lastAnswerCorrect ? 'Try Next Card' : 'Continue'}
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
    </Stack>
  )
}
