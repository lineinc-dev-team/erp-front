'use client'

import { Box, Button, Paper, Typography } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="calc(100vh - 64px)"
      bgcolor="#f5f5f5"
      padding={2}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          borderRadius: 3,
        }}
      >
        <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          문제가 발생했습니다.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => reset()} sx={{ mt: 2, px: 4 }}>
          다시 시도하기.
        </Button>
      </Paper>
    </Box>
  )
}
