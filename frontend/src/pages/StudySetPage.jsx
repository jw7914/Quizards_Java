import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Link as RouterLink, useParams } from 'react-router-dom'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import ArrowOutwardRounded from '@mui/icons-material/ArrowOutwardRounded'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import CollectionsBookmarkRounded from '@mui/icons-material/CollectionsBookmarkRounded'
import TimerOutlined from '@mui/icons-material/TimerOutlined'
import SectionHeading from '../components/SectionHeading'
import { fetchMyStudySets, fetchPublicStudySets, fetchStudySession, fetchStudySetDetail } from '../api'

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
  const [relatedStudySets, setRelatedStudySets] = useState([])
  const [session, setSession] = useState(null)
  const [quizSession, setQuizSession] = useState(null)
  const [pendingQuizSession, setPendingQuizSession] = useState(null)
  const [mode, setMode] = useState('REPETITION')
  const [loading, setLoading] = useState(true)
  const [relatedLoading, setRelatedLoading] = useState(true)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [error, setError] = useState('')
  const [relatedError, setRelatedError] = useState('')
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
        setMode('REPETITION')
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
    let active = true

    async function loadRelatedStudySets() {
      setRelatedLoading(true)
      setRelatedError('')

      try {
        const [publicSets, mySets] = await Promise.all([
          fetchPublicStudySets(),
          authUser?.authenticated ? fetchMyStudySets() : Promise.resolve([]),
        ])

        if (!active) return

        const mergedSets = [...mySets, ...publicSets]
        const uniqueSets = Array.from(
          new Map(mergedSets.map((item) => [item.id, item])).values(),
        )

        uniqueSets.sort((left, right) => {
          if (left.id === studySetId) return -1
          if (right.id === studySetId) return 1

          const leftDeckTypeScore = left.deckType === studySet?.deckType ? 1 : 0
          const rightDeckTypeScore = right.deckType === studySet?.deckType ? 1 : 0
          if (leftDeckTypeScore !== rightDeckTypeScore) {
            return rightDeckTypeScore - leftDeckTypeScore
          }

          return left.title.localeCompare(right.title)
        })

        setRelatedStudySets(uniqueSets.filter((item) => item.id !== studySetId))
      } catch (loadError) {
        if (active) {
          setRelatedError(loadError.message)
        }
      } finally {
        if (active) {
          setRelatedLoading(false)
        }
      }
    }

    loadRelatedStudySets()
    return () => {
      active = false
    }
  }, [authUser?.authenticated, studySetId, studySet?.deckType])

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

  const relatedSetsLabel = relatedStudySets.length === 1
    ? '1 study set'
    : `${relatedStudySets.length} study sets`

  return (
    <Stack spacing={5}>
      <SectionHeading title={studySet.title} subtitle={studySet.description || 'No description provided.'} />

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
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'flex-end' }}
        >
          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: '0.08em', display: 'block', mb: 0.5 }}
            >
              More To Study
            </Typography>
            <Typography variant="h4" sx={{ lineHeight: 1.1 }}>
              Explore more study sets
            </Typography>
          </Box>
          <Typography color="text.secondary">
            {relatedLoading ? 'Loading study sets...' : relatedSetsLabel}
          </Typography>
        </Stack>

        {relatedError ? <Alert severity="warning">{relatedError}</Alert> : null}

        {relatedLoading ? (
          <LinearProgress />
        ) : relatedStudySets.length === 0 ? (
          <Alert severity="info">No additional study sets are available yet.</Alert>
        ) : (
          <Grid container spacing={2.5}>
            {relatedStudySets.map((item) => (
              <Grid key={item.id} size={{ xs: 12, sm: 6, xl: 4 }}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 18px 38px rgba(15, 23, 42, 0.06)',
                    overflow: 'hidden',
                    background: item.deckType === 'QUIZ'
                      ? 'linear-gradient(180deg, #f7faff 0%, #ffffff 100%)'
                      : 'linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)',
                  }}
                >
                  <CardActionArea
                    component={RouterLink}
                    to={`/study-set/${item.id}`}
                    sx={{
                      height: '100%',
                      alignItems: 'stretch',
                    }}
                  >
                    <Stack spacing={2} sx={{ p: 2.5, height: '100%' }}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              lineHeight: 1.25,
                              mb: 0.75,
                              overflowWrap: 'anywhere',
                            }}
                          >
                            {item.title}
                          </Typography>
                          <Typography
                            color="text.secondary"
                            sx={{
                              fontSize: '0.95rem',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              minHeight: '4.2em',
                            }}
                          >
                            {item.description || 'No description provided.'}
                          </Typography>
                        </Box>
                        <ArrowOutwardRounded color="primary" sx={{ flexShrink: 0, mt: 0.25 }} />
                      </Stack>

                      <Divider />

                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 'auto' }}>
                        <Chip
                          icon={<CollectionsBookmarkRounded sx={{ fontSize: 16 }} />}
                          label={`${item.flashcardCount} cards`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={item.deckType === 'QUIZ' ? 'Practice test' : 'Flashcards'}
                          size="small"
                          color={item.deckType === 'QUIZ' ? 'primary' : 'default'}
                          variant="outlined"
                        />
                        <Chip
                          label={item.visibility}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </Stack>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </Stack>
  )
}
