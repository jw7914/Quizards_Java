import { Box, Card, CardContent, Chip, List, ListItem, ListItemText, Stack, Typography } from '@mui/material'
import MenuBookIcon from '@mui/icons-material/MenuBook'

export default function DraftPreview({ draft }) {
  return (
    <Card variant="outlined" sx={{ bgcolor: '#f8f9fa' }}>
      <CardContent sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box borderBottom="1px solid #dadce0" pb={2}>
            <Stack direction="row" alignItems="center" spacing={2} mb={1}>
              <MenuBookIcon color="primary" />
              <Typography variant="h6" color="primary">{draft.title}</Typography>
            </Stack>
            <Typography color="text.secondary">{draft.summary}</Typography>
          </Box>
          {draft.keyTakeaways?.length ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {draft.keyTakeaways.map((takeaway) => (
                <Chip key={takeaway} label={takeaway} color="secondary" variant="outlined" />
              ))}
            </Stack>
          ) : null}
          <List dense disablePadding>
            {draft.flashcards?.map((card, index) => (
              <ListItem key={`${card.prompt}-${index}`} sx={{ alignItems: 'flex-start', borderLeft: '2px solid #1a73e8', mb: 2, bgcolor: 'white' }}>
                <ListItemText
                  primary={<Typography fontWeight="500" color="text.primary">{`${index + 1}. ${card.prompt}`}</Typography>}
                  secondary={<Typography sx={{ mt: 1, color: 'text.secondary' }}>{card.answer}</Typography>}
                />
              </ListItem>
            ))}
          </List>
        </Stack>
      </CardContent>
    </Card>
  )
}
