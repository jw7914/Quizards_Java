export const studySetMetaChipSx = {
  minHeight: 40,
  height: 'auto',
  alignItems: 'stretch',
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
    whiteSpace: 'normal',
    overflowWrap: 'anywhere',
  },
}

export const aiGeneratedChipSx = {
  ...studySetMetaChipSx,
  color: '#6b4fa3',
  borderColor: '#d8ccf0',
  bgcolor: '#f6f2fc',
}
