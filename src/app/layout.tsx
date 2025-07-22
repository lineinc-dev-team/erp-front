'use client'

import './globals.css'
import HeaderWrapper from '@/components/layout/HeaderWrapper'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Snackbar, Alert } from '@mui/material'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [queryClient] = useState(() => new QueryClient())
  const { open, message, severity, closeSnackbar } = useSnackbarStore()

  const pathname = usePathname()
  const isLoginPage = pathname === '/'

  return (
    <html lang="ko">
      <body>
        <QueryClientProvider client={queryClient}>
          <HeaderWrapper />

          <div className={isLoginPage ? '' : 'mt-32'}>{children}</div>

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
