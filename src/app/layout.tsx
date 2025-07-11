'use client'

import './globals.css'
import HeaderWrapper from '@/components/layout/HeaderWrapper'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Snackbar, Alert } from '@mui/material'
import { useSnackbarStore } from '@/stores/useSnackbarStore'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const queryClient = new QueryClient()
  const { open, message, severity, closeSnackbar } = useSnackbarStore()

  return (
    <html lang="ko">
      <body>
        <QueryClientProvider client={queryClient}>
          <HeaderWrapper />
          {children}
          <ReactQueryDevtools initialIsOpen={false} />

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
