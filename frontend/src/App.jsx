import { useEffect, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  CssBaseline,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import {
  Link as RouterLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0f766e'
    },
    secondary: {
      main: '#c2410c'
    },
    background: {
      default: '#f4f6f1',
      paper: '#ffffff'
    }
  },
  shape: {
    borderRadius: 18
  },
  typography: {
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 700
    },
    h2: {
      fontWeight: 700
    },
    h3: {
      fontWeight: 700
    }
  }
});

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  let body = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    body = await response.json();
  }

  if (!response.ok) {
    throw new Error(body?.error || 'Request failed.');
  }

  return body;
}

function App() {
  const [session, setSession] = useState({ loading: true, authenticated: false, username: null });

  useEffect(() => {
    let active = true;
    fetchJson('/api/auth/me')
      .then((me) => {
        if (!active) {
          return;
        }
        setSession({
          loading: false,
          authenticated: me.authenticated,
          username: me.username ?? null
        });
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setSession({ loading: false, authenticated: false, username: null });
      });

    return () => {
      active = false;
    };
  }, []);

  if (session.loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PageShell>
          <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography color="text.secondary">Loading...</Typography>
          </Container>
        </PageShell>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<LandingPage session={session} />} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage session={session} onSessionChange={setSession} />} />
        <Route path="/register" element={<RegisterPage session={session} onSessionChange={setSession} />} />
        <Route path="/create" element={<CreatePage session={session} />} />
        <Route path="/library" element={<LibraryPage session={session} />} />
        <Route path="/study-set/:id" element={<StudySetPage session={session} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

function PageShell({ children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(15,118,110,0.22), transparent 28%), radial-gradient(circle at bottom right, rgba(194,65,12,0.18), transparent 24%), linear-gradient(180deg, #f8faf7 0%, #edf2ea 100%)'
      }}
    >
      {children}
    </Box>
  );
}

function AppNav({ session }) {
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    navigate('/auth');
    window.location.reload();
  }

  const links = [
    { to: '/', label: 'Home' },
    { to: '/library', label: 'My Study Sets' },
    { to: '/create', label: 'Create' },
    ...(session.authenticated ? [] : [{ to: '/login', label: 'Login' }, { to: '/register', label: 'Register' }])
  ];

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(10px)' }}>
      <Toolbar
        sx={{
          mx: 'auto',
          width: '100%',
          maxWidth: 1200,
          justifyContent: 'space-between',
          px: { xs: 2, md: 3 }
        }}
      >
        <Button
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.02em' }}
        >
          Quizards
        </Button>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="center">
          <Chip
            label={session.authenticated ? `Logged in as ${session.username}` : 'Browsing'}
            color={session.authenticated ? 'primary' : 'default'}
            variant={session.authenticated ? 'filled' : 'outlined'}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {links
              .filter((link) => location.pathname !== link.to)
              .map((link) => (
                <Button key={link.to} component={RouterLink} to={link.to} color="inherit" variant="text">
                  {link.label}
                </Button>
              ))}
            {session.authenticated && (
              <Button color="error" variant="outlined" onClick={handleLogout}>
                Log out
              </Button>
            )}
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

function LandingPage({ session }) {
  return (
    <PageShell>
      <AppNav session={session} />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 8,
            backgroundColor: alpha('#ffffff', 0.82),
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(15, 23, 42, 0.08)'
          }}
        >
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4} alignItems="stretch">
            <Box sx={{ flex: 1.5 }}>
              <Chip label="React + Spring Boot + MUI" color="secondary" sx={{ mb: 2 }} />
              <Typography variant="h2" sx={{ mb: 2, fontSize: { xs: '2.4rem', md: '3.5rem' } }}>
                Turn notes into study sets, review every flashcard, then save the final deck.
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 720 }}>
                Quizards serves a built React SPA from Spring Boot. Sign in, generate one AI draft, review it as a
                carousel, and keep the version you actually want.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button component={RouterLink} to="/create" size="large" variant="contained">
                  Start Creating
                </Button>
                <Button component={RouterLink} to="/login" size="large" variant="outlined" color="secondary">
                  Sign In
                </Button>
              </Stack>
            </Box>
            <Card
              elevation={0}
              sx={{
                flex: 1,
                borderRadius: 6,
                border: '1px solid rgba(15, 23, 42, 0.08)',
                backgroundColor: '#fffdf7'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                  How it works
                </Typography>
                <StepBlurb
                  title="1. Register or log in"
                  body="Create a user session tied to your saved study sets."
                />
                <StepBlurb
                  title="2. Generate one draft"
                  body="Use a single AI prompt to draft the deck."
                />
                <StepBlurb
                  title="3. Review before saving"
                  body="Edit flashcards in a carousel, then persist the final set."
                />
              </CardContent>
            </Card>
          </Stack>
        </Paper>
      </Container>
    </PageShell>
  );
}

function StepBlurb({ title, body }) {
  return (
    <Box sx={{ '&:not(:last-child)': { mb: 3 } }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography color="text.secondary">{body}</Typography>
    </Box>
  );
}

function RegisterPage({ session, onSessionChange }) {
  const navigate = useNavigate();
  const [registerStatus, setRegisterStatus] = useState(null);

  useEffect(() => {
    if (session.authenticated) {
      navigate('/create', { replace: true });
    }
  }, [session.authenticated, navigate]);

  async function handleRegister(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setRegisterStatus({ tone: 'info', message: 'Creating account...' });
    try {
      const me = await fetchJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: form.get('username'),
          password: form.get('password')
        })
      });
      onSessionChange({ loading: false, authenticated: true, username: me.username });
      navigate('/create');
    } catch (error) {
      setRegisterStatus({ tone: 'error', message: error.message });
    }
  }

  return (
    <PageShell>
      <AppNav session={session} />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <AuthLayout
          title="Create your account"
          description="Register first, then move into the AI study-set workspace."
          alternateText="Already have an account?"
          alternateAction="Log in here"
          alternateTo="/login"
        >
          <AuthCard title="Register" buttonLabel="Create Account" buttonColor="secondary" onSubmit={handleRegister}>
            <TextField label="Username" name="username" fullWidth required />
            <TextField label="Password" name="password" type="password" fullWidth required inputProps={{ minLength: 8 }} />
            {registerStatus && <InlineAlert tone={registerStatus.tone}>{registerStatus.message}</InlineAlert>}
          </AuthCard>
        </AuthLayout>
      </Container>
    </PageShell>
  );
}

function LoginPage({ session, onSessionChange }) {
  const navigate = useNavigate();
  const [loginStatus, setLoginStatus] = useState(null);

  useEffect(() => {
    if (session.authenticated) {
      navigate('/create', { replace: true });
    }
  }, [session.authenticated, navigate]);

  async function handleLogin(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoginStatus({ tone: 'info', message: 'Logging in...' });
    try {
      const me = await fetchJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: form.get('username'),
          password: form.get('password')
        })
      });
      onSessionChange({ loading: false, authenticated: true, username: me.username });
      navigate('/create');
    } catch (error) {
      setLoginStatus({ tone: 'error', message: error.message });
    }
  }

  return (
    <PageShell>
      <AppNav session={session} />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <AuthLayout
          title="Welcome back"
          description="Log in to continue creating and saving study sets."
          alternateText="Need an account?"
          alternateAction="Register here"
          alternateTo="/register"
        >
          <AuthCard title="Log In" buttonLabel="Log In" buttonColor="primary" onSubmit={handleLogin}>
            <TextField label="Username" name="username" fullWidth required />
            <TextField label="Password" name="password" type="password" fullWidth required />
            {loginStatus && <InlineAlert tone={loginStatus.tone}>{loginStatus.message}</InlineAlert>}
          </AuthCard>
        </AuthLayout>
      </Container>
    </PageShell>
  );
}

function AuthLayout({ title, description, alternateText, alternateAction, alternateTo, children }) {
  return (
    <Stack spacing={4}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid rgba(15, 23, 42, 0.08)' }}>
        <Typography variant="h3" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Paper>

      <Stack spacing={2} alignItems="center">
        <Box sx={{ width: '100%', maxWidth: 540 }}>{children}</Box>
        <Typography color="text.secondary">
          {alternateText}{' '}
          <Button component={RouterLink} to={alternateTo} variant="text" sx={{ minWidth: 0, p: 0, verticalAlign: 'baseline' }}>
            {alternateAction}
          </Button>
        </Typography>
      </Stack>
    </Stack>
  );
}

function AuthCard({ title, buttonLabel, buttonColor, onSubmit, children }) {
  return (
    <Card elevation={0} sx={{ flex: 1, borderRadius: 6, border: '1px solid rgba(15, 23, 42, 0.08)' }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          {title}
        </Typography>
        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2.5}>
            {children}
            <Button type="submit" variant="contained" color={buttonColor} size="large">
              {buttonLabel}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

function CreatePage({ session }) {
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState([]);
  const [draftStatus, setDraftStatus] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [promptConsumed, setPromptConsumed] = useState(false);
  const [visibility, setVisibility] = useState('PRIVATE');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftSummary, setDraftSummary] = useState('');
  const [draftCards, setDraftCards] = useState([{ prompt: '', answer: '' }]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useEffect(() => {
    if (!session.authenticated) {
      navigate('/auth', { replace: true });
    }
  }, [navigate, session.authenticated]);

  const currentCard = draftCards[currentCardIndex] ?? { prompt: '', answer: '' };

  async function handleGenerate(event) {
    event.preventDefault();
    if (promptConsumed) {
      setDraftStatus({ tone: 'warning', message: 'You can only prompt the AI once on this page.' });
      return;
    }

    const form = new FormData(event.currentTarget);
    const prompt = String(form.get('prompt') || '').trim();
    setPromptConsumed(true);
    setChatMessages([{ role: 'user', message: prompt }]);
    setDraftStatus({ tone: 'info', message: 'Generating draft deck...' });

    try {
      const draft = await fetchJson('/api/ai/generate-draft', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          visibility
        })
      });
      setChatMessages((current) => [
        ...current,
        {
          role: 'assistant',
          message: `Generated "${draft.title}" with ${draft.flashcards.length} flashcards. Review it before saving.`
        }
      ]);
      setDraftTitle(draft.title || '');
      setDraftSummary(draft.summary || '');
      setDraftCards(draft.flashcards?.length ? draft.flashcards : [{ prompt: '', answer: '' }]);
      setCurrentCardIndex(0);
      setDraftStatus({ tone: 'success', message: 'Draft generated. Review and edit before saving.' });
    } catch (error) {
      setChatMessages((current) => [...current, { role: 'assistant', message: error.message }]);
      setDraftStatus({ tone: 'error', message: error.message });
    }
  }

  function updateCurrentCard(key, value) {
    setDraftCards((current) =>
      current.map((card, index) => (index === currentCardIndex ? { ...card, [key]: value } : card))
    );
  }

  function addCard() {
    setDraftCards((current) => {
      const next = [...current, { prompt: '', answer: '' }];
      setCurrentCardIndex(next.length - 1);
      return next;
    });
  }

  function removeCard() {
    if (draftCards.length <= 1) {
      return;
    }
    setDraftCards((current) => {
      const next = current.filter((_, index) => index !== currentCardIndex);
      setCurrentCardIndex((index) => Math.max(0, Math.min(index, next.length - 1)));
      return next;
    });
  }

  async function handleSave(event) {
    event.preventDefault();
    const cleanedCards = draftCards
      .map((card) => ({ prompt: card.prompt.trim(), answer: card.answer.trim() }))
      .filter((card) => card.prompt && card.answer);

    if (!cleanedCards.length) {
      setSaveStatus({ tone: 'error', message: 'Add at least one flashcard before saving.' });
      return;
    }

    setSaveStatus({ tone: 'info', message: 'Saving study set...' });
    try {
      const saved = await fetchJson('/api/ai/save-generated-study-set', {
        method: 'POST',
        body: JSON.stringify({
          title: draftTitle.trim(),
          description: draftSummary.trim(),
          visibility,
          flashcards: cleanedCards
        })
      });
      setSaveStatus({ tone: 'success', message: `Saved "${saved.title}" to ${session.username}.` });
    } catch (error) {
      setSaveStatus({ tone: 'error', message: error.message });
    }
  }

  const showChat = !promptConsumed || chatMessages.length < 2;

  return (
    <PageShell>
      <AppNav session={session} />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        {showChat ? (
          <Card elevation={0} sx={{ borderRadius: 6, border: '1px solid rgba(15, 23, 42, 0.08)' }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    Create With AI
                  </Typography>
                  <Typography color="text.secondary">
                    Use one prompt to generate a draft study set. After generation, the chat disappears and the review carousel takes over.
                  </Typography>
                </Box>
                <Chip label="One Prompt" color="secondary" />
              </Stack>

              <Stack spacing={2} sx={{ mb: 3, maxHeight: 360, overflowY: 'auto' }}>
                {chatMessages.map((entry, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      ml: entry.role === 'user' ? { xs: 0, sm: 8 } : 0,
                      mr: entry.role === 'assistant' ? { xs: 0, sm: 8 } : 0,
                      p: 2.25,
                      borderRadius: 4,
                      bgcolor: entry.role === 'user' ? 'primary.main' : 'grey.100',
                      color: entry.role === 'user' ? 'primary.contrastText' : 'text.primary'
                    }}
                  >
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', opacity: 0.78 }}>
                      {entry.role}
                    </Typography>
                    <Typography sx={{ mt: 0.75 }}>{entry.message}</Typography>
                  </Paper>
                ))}
              </Stack>

              <Box component="form" onSubmit={handleGenerate}>
                <Stack spacing={3}>
                  <TextField
                    label="Prompt or Notes"
                    name="prompt"
                    multiline
                    minRows={8}
                    placeholder="Example: Build a study set on cellular respiration with conceptual flashcards and one or two definition cards."
                    required
                    disabled={promptConsumed}
                    fullWidth
                  />
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      select
                      label="Visibility"
                      value={visibility}
                      onChange={(event) => setVisibility(event.target.value)}
                      disabled={promptConsumed}
                      sx={{ minWidth: 220 }}
                    >
                      <MenuItem value="PRIVATE">Private</MenuItem>
                      <MenuItem value="PUBLIC">Public</MenuItem>
                    </TextField>
                    <Button type="submit" variant="contained" size="large" disabled={promptConsumed}>
                      Generate Draft
                    </Button>
                  </Stack>
                  {draftStatus && <InlineAlert tone={draftStatus.tone}>{draftStatus.message}</InlineAlert>}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Card elevation={0} sx={{ borderRadius: 6, border: '1px solid rgba(15, 23, 42, 0.08)' }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    Draft Review
                  </Typography>
                  <Typography color="text.secondary">
                    Review flashcards one at a time like a carousel before saving this deck to your account.
                  </Typography>
                </Box>
                <Chip label="Review First" color="primary" />
              </Stack>

              <Box component="form" onSubmit={handleSave}>
                <Stack spacing={3}>
                  <TextField
                    label="Study Set Title"
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Summary / Description"
                    value={draftSummary}
                    onChange={(event) => setDraftSummary(event.target.value)}
                    required
                    fullWidth
                    multiline
                    minRows={4}
                  />

                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2.5, md: 3.5 },
                      borderRadius: 5,
                      border: '1px solid rgba(15, 23, 42, 0.08)',
                      minHeight: 360
                    }}
                  >
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" sx={{ mb: 3 }}>
                      <Box>
                        <Typography variant="h6">Flashcard Review</Typography>
                        <Typography color="text.secondary">
                          Card {currentCardIndex + 1} of {draftCards.length}
                        </Typography>
                      </Box>
                      <Button color="error" variant="outlined" onClick={removeCard} disabled={draftCards.length === 1}>
                        Remove Card
                      </Button>
                    </Stack>

                    <Stack spacing={3}>
                      <TextField
                        label="Prompt"
                        value={currentCard.prompt}
                        onChange={(event) => updateCurrentCard('prompt', event.target.value)}
                        required
                        fullWidth
                        multiline
                        minRows={4}
                      />
                      <TextField
                        label="Answer"
                        value={currentCard.answer}
                        onChange={(event) => updateCurrentCard('answer', event.target.value)}
                        required
                        fullWidth
                        multiline
                        minRows={5}
                      />
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" sx={{ mt: 3 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setCurrentCardIndex((index) => Math.max(0, index - 1))}
                        disabled={currentCardIndex === 0}
                      >
                        Previous
                      </Button>
                      <Button variant="outlined" color="secondary" onClick={addCard}>
                        Add Card
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setCurrentCardIndex((index) => Math.min(draftCards.length - 1, index + 1))}
                        disabled={currentCardIndex === draftCards.length - 1}
                      >
                        Next
                      </Button>
                    </Stack>
                  </Paper>

                  <Button type="submit" variant="contained" color="secondary" size="large">
                    Save To My Account
                  </Button>
                  {saveStatus && <InlineAlert tone={saveStatus.tone}>{saveStatus.message}</InlineAlert>}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </PageShell>
  );
}

function LibraryPage({ session }) {
  const navigate = useNavigate();
  const [studySets, setStudySets] = useState([]);
  const [loadingState, setLoadingState] = useState('Loading your study sets...');

  useEffect(() => {
    if (!session.authenticated) {
      navigate('/auth', { replace: true });
      return;
    }

    fetchJson('/api/my/study-sets')
      .then((data) => {
        setStudySets(data);
        setLoadingState(`${data.length} saved study set${data.length === 1 ? '' : 's'} loaded.`);
      })
      .catch(() => {
        setLoadingState('Unable to load your study sets.');
      });
  }, [navigate, session.authenticated]);

  return (
    <PageShell>
      <AppNav session={session} />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Card elevation={0} sx={{ borderRadius: 6, border: '1px solid rgba(15, 23, 42, 0.08)' }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Typography variant="h4" sx={{ mb: 1 }}>
              My Saved Study Sets
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              All study sets saved under your account, including AI-generated decks.
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {loadingState}
            </Typography>

            {!studySets.length ? (
              <Alert severity="info">You have not saved any study sets yet.</Alert>
            ) : (
              <Stack spacing={2}>
                {studySets.map((studySet) => (
                  <Card key={studySet.id} elevation={0} sx={{ borderRadius: 5, border: '1px solid rgba(15, 23, 42, 0.08)' }}>
                    <CardContent>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
                        <Box>
                          <Typography variant="h6">{studySet.title}</Typography>
                          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                            {studySet.description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                            ID: {studySet.id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {studySet.flashcardCount} flashcard{studySet.flashcardCount === 1 ? '' : 's'}
                          </Typography>
                        </Box>
                        <Stack spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
                          <Chip
                            label={studySet.visibility}
                            color={studySet.visibility === 'PUBLIC' ? 'success' : 'default'}
                          />
                          <Button component={RouterLink} to={`/study-set/${studySet.id}`} variant="outlined">
                            Open Study Set
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Container>
    </PageShell>
  );
}

function StudySetPage({ session }) {
  const { id } = useParams();
  const [studySet, setStudySet] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJson(`/api/study-sets/${id}`)
      .then(setStudySet)
      .catch((err) => setError(err.message));
  }, [id]);

  return (
    <PageShell>
      <AppNav session={session} />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Stack spacing={3}>
          <Card elevation={0} sx={{ borderRadius: 6, border: '1px solid rgba(15, 23, 42, 0.08)' }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              {error ? (
                <>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    Unable to load study set
                  </Typography>
                  <Typography color="text.secondary">{error}</Typography>
                </>
              ) : studySet ? (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" sx={{ mb: 1 }}>
                      {studySet.title}
                    </Typography>
                    <Typography color="text.secondary">{studySet.description}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {studySet.flashcardCount} flashcard{studySet.flashcardCount === 1 ? '' : 's'}
                    </Typography>
                  </Box>
                  <Chip
                    label={studySet.visibility}
                    color={studySet.visibility === 'PUBLIC' ? 'success' : 'default'}
                    sx={{ alignSelf: 'flex-start' }}
                  />
                </Stack>
              ) : (
                <Typography color="text.secondary">Loading study set...</Typography>
              )}
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ borderRadius: 6, border: '1px solid rgba(15, 23, 42, 0.08)' }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Flashcards
              </Typography>
              {studySet?.flashcards?.length ? (
                <Stack spacing={2}>
                  {studySet.flashcards.map((card, index) => (
                    <Card key={card.id} elevation={0} sx={{ borderRadius: 5, border: '1px solid rgba(15, 23, 42, 0.08)' }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                          Card {index + 1}
                        </Typography>
                        <Typography variant="h6">Prompt</Typography>
                        <Typography sx={{ mt: 0.75 }}>{card.prompt}</Typography>
                        <Divider sx={{ my: 2.5 }} />
                        <Typography variant="subtitle1" color="text.secondary">
                          Answer
                        </Typography>
                        <Typography sx={{ mt: 0.75 }}>{card.answer}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          Type: {card.type} | Mastery: {card.masteryLevel}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Alert severity={error ? 'error' : 'info'}>
                  {error ? 'The study set could not be opened.' : 'This study set has no flashcards yet.'}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </PageShell>
  );
}

function InlineAlert({ tone, children }) {
  const severity = tone === 'danger' ? 'error' : tone;
  return <Alert severity={severity}>{children}</Alert>;
}

export default App;
