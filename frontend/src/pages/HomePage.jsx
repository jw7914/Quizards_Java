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
import LockOpenRounded from "@mui/icons-material/LockOpenRounded";
import MenuBookRounded from "@mui/icons-material/MenuBookRounded";
import PersonAddAltRounded from "@mui/icons-material/PersonAddAltRounded";
import SectionHeading from "../components/SectionHeading";
import StudySetCard from "../components/StudySetCard";

export default function OverviewPage({
  authUser,
  dashboardError,
  publicSets,
  randomPublicSets,
  mySets,
}) {
  const isAuthenticated = authUser?.authenticated;

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
                  title="Create an account to unlock your full study workspace."
                  subtitle="Quizards helps you generate decks with AI, save private study sets, and manage your library once you sign in."
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
                  ) : (
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <Button
                        component={RouterLink}
                        to="/login"
                        variant="outlined"
                        color="primary"
                        size="large"
                        startIcon={<LockOpenRounded />}
                      >
                        Login
                      </Button>
                      <Button
                        component={RouterLink}
                        to="/register"
                        variant="text"
                        color="primary"
                        size="large"
                        startIcon={<PersonAddAltRounded />}
                      >
                        Register
                      </Button>
                    </Stack>
                  )}
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                  <Box>
                    <Typography variant="h4">{publicSets.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      public decks
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4">
                      {isAuthenticated ? mySets.length : "Sign Up"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {isAuthenticated
                        ? "saved in your workspace"
                        : "to save decks and access AI tools"}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {dashboardError && <Alert severity="error">{dashboardError}</Alert>}

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
