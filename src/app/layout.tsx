'use client'

import './globals.css'
import HeaderWrapper from '@/components/layout/HeaderWrapper'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Snackbar, Alert } from '@mui/material'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useState } from 'react'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // QueryClient를 useState로 딱 한 번만 생성
  const [queryClient] = useState(() => new QueryClient())
  const { open, message, severity, closeSnackbar } = useSnackbarStore()

  return (
    <html lang="ko">
      <body>
        <QueryClientProvider client={queryClient}>
          <HeaderWrapper />
          {children}

          <Snackbar
            open={open}
            autoHideDuration={1200}
            onClose={closeSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              onClose={closeSnackbar}
              severity={severity}
              sx={{ width: '100%', fontSize: '17px' }}
            >
              {message}
            </Alert>
          </Snackbar>
        </QueryClientProvider>
      </body>
    </html>
  )
}
