import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import PublicRounded from "@mui/icons-material/PublicRounded";
import MenuBookRounded from "@mui/icons-material/MenuBookRounded";
import PsychologyRounded from "@mui/icons-material/PsychologyRounded";
import EditNoteRounded from "@mui/icons-material/EditNoteRounded";
import SectionHeading from "../components/SectionHeading";
import StudySetCard from "../components/StudySetCard";

function WorkspaceMetric({ label, value, helper, icon }) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 0,
        boxShadow: "none",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={1.25}>
          <Box sx={{ color: "primary.main" }}>{icon}</Box>
          <Typography variant="h4" sx={{ fontWeight: 600, lineHeight: 1 }}>
            {value}
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {helper}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function OverviewPage({
  authUser,
  dashboardError,
  publicSets,
  randomPublicSets,
  mySets,
}) {
  const isAuthenticated = authUser?.authenticated;
  const username = authUser?.username || "there";
  const publicDeckCount = mySets.filter(
    (studySet) => studySet.visibility === "PUBLIC",
  ).length;
  const aiDeckCount = mySets.filter((studySet) => studySet.createdByAi).length;
  const nonAiDeckCount = mySets.length - aiDeckCount;

  return (
    <Stack spacing={5}>
      <Card
        sx={{
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #ffffff 0%, #eef4ff 55%, #f8fbff 100%)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 6 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={3}>
                <Chip
                  icon={<AutoAwesomeRounded fontSize="small" />}
                  label="AI-powered study decks"
                  color="primary"
                  variant="outlined"
                  sx={{
                    alignSelf: "flex-start",
                    bgcolor: "rgba(255,255,255,0.72)",
                  }}
                />
                <SectionHeading
                  title={
                    isAuthenticated
                      ? `Welcome back, ${username}.`
                      : "Create an account to unlock your full study workspace."
                  }
                  subtitle={
                    isAuthenticated
                      ? "Your study workspace is ready. Create a new deck, browse public sets, or jump back into your library."
                      : "Quizards helps you generate decks with AI, save private study sets, and manage your library once you sign in."
                  }
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    component={RouterLink}
                    to={isAuthenticated ? "/create" : "/register"}
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<MenuBookRounded />}
                  >
                    {isAuthenticated ? "Create Deck" : "Create Account"}
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/browse"
                    variant="outlined"
                    color="primary"
                    size="large"
                  >
                    Browse Public Decks
                  </Button>
                  {isAuthenticated ? (
                    <Button
                      component={RouterLink}
                      to="/library"
                      variant="outlined"
                      color="primary"
                      size="large"
                    >
                      View Library
                    </Button>
                  ) : null}
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {dashboardError && <Alert severity="error">{dashboardError}</Alert>}

      {isAuthenticated ? (
        <Stack spacing={4}>
          <Card sx={{ borderRadius: 0 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    Workspace Snapshot
                  </Typography>
                  <Typography color="text.secondary">
                    Open your library, create another deck, and review the key numbers for your workspace in one place.
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <WorkspaceMetric
                      label="Decks In Workspace"
                      value={mySets.length}
                      helper="All study sets currently saved to your account."
                      icon={<MenuBookRounded />}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <WorkspaceMetric
                      label="Originally AI Generated"
                      value={aiDeckCount}
                      helper="Study sets that started from the AI generation flow."
                      icon={<PsychologyRounded />}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <WorkspaceMetric
                      label="Manually Created"
                      value={nonAiDeckCount}
                      helper="Study sets created without the AI generation flow."
                      icon={<EditNoteRounded />}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <WorkspaceMetric
                      label="Public Decks"
                      value={publicDeckCount}
                      helper="Study sets currently visible on the public browse page."
                      icon={<PublicRounded />}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      ) : null}

      {!isAuthenticated && randomPublicSets.length > 0 ? (
        <Stack spacing={3}>
          <SectionHeading
            title="Preview public decks, then create an account to start building."
            subtitle="Guest browsing is limited. Sign up to generate decks, save your own sets, and access your library."
          />
          <Grid container spacing={3}>
            {randomPublicSets.map((studySet) => (
              <Grid
                key={studySet.id}
                size={{ xs: 12, md: 4 }}
                sx={{ display: "flex" }}
              >
                <StudySetCard studySet={studySet} />
              </Grid>
            ))}
          </Grid>
        </Stack>
      ) : null}
    </Stack>
  );
}
