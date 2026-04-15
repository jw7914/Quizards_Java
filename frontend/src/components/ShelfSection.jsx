import { Alert, Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material'
import StudySetCard from './StudySetCard'

export default function ShelfSection({ title, subtitle, icon, items, emptyLabel, showDelete = false, deletingId = null, onDelete }) {
  return (
    <Card sx={{ borderLeft: '4px solid #ea4335' }}>
      <CardContent sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            {icon}
            <Box>
              <Typography variant="h5">{title}</Typography>
              <Typography color="text.secondary" variant="body2">{subtitle}</Typography>
            </Box>
          </Stack>
          {items.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 0 }}>
              {emptyLabel}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {items.map((item) => (
                <Grid item key={item.id} xs={12} sm={6}>
                  <StudySetCard
                    studySet={item}
                    showDelete={showDelete}
                    deleting={deletingId === item.id}
                    onDelete={onDelete}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
