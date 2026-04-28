export const studySetMetaChipSx = {
  minHeight: 40,
  height: 'auto',
  width: 'auto',
  maxWidth: '100%',
  flexShrink: 0,
  alignItems: 'center',
  '& .MuiChip-icon': {
    alignSelf: 'center',
    my: 'auto',
  },
  '& .MuiChip-label': {
    display: 'flex',
    alignItems: 'center',
    minHeight: '100%',
    paddingTop: '6px',
    paddingBottom: '6px',
    whiteSpace: 'nowrap',
  },
}

export const visibilityIconChipSx = {
  width: 40,
  height: 40,
  minWidth: 40,
  minHeight: 40,
  maxWidth: 40,
  flexShrink: 0,
  justifyContent: 'center',
  alignItems: 'center',
  '& .MuiChip-label': {
    display: 'none',
  },
  '& .MuiChip-icon': {
    margin: 0,
    fontSize: 18,
  },
}

export const aiGeneratedChipSx = {
  ...studySetMetaChipSx,
  color: '#6b4fa3',
  borderColor: '#d8ccf0',
  bgcolor: '#f6f2fc',
  width: 'auto',
  minWidth: 0,
  flexShrink: 0,
  '& .MuiChip-label': {
    ...studySetMetaChipSx['& .MuiChip-label'],
    whiteSpace: 'normal',
    overflowWrap: 'break-word',
    wordBreak: 'normal',
  },
}

export const aiGeneratedIconChipSx = {
  ...visibilityIconChipSx,
  color: '#6b4fa3',
  borderColor: '#d8ccf0',
  bgcolor: '#f6f2fc',
  '& .MuiChip-icon': {
    margin: 0,
    fontSize: 18,
    color: '#6b4fa3',
  },
}
