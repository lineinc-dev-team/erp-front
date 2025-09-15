'use client'

import './globals.css'
import HeaderWrapper from '@/components/layout/HeaderWrapper'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Snackbar, Alert, IconButton } from '@mui/material'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Close } from '@mui/icons-material'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [queryClient] = useState(() => new QueryClient())
  const { open, message, severity, closeSnackbar } = useSnackbarStore()

  const pathname = usePathname()
  const isLoginPage = pathname === '/' || pathname === '/resetPassword'

  return (
    <html lang="ko">
      <body>
        <QueryClientProvider client={queryClient}>
          <HeaderWrapper />

          <div className={isLoginPage ? '' : 'mt-32'}>{children}</div>

          <Snackbar
            open={open}
            autoHideDuration={2000} // 필요 없으면 제거 가능
            onClose={(event, reason) => {
              if (reason !== 'clickaway') closeSnackbar() // 바깥 클릭은 무시
            }}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              severity={severity}
              sx={{ width: '100%', fontSize: '17px' }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={closeSnackbar} // X 버튼 클릭 시 닫힘
                >
                  <Close fontSize="small" />
                </IconButton>
              }
            >
              {message}
            </Alert>
          </Snackbar>
        </QueryClientProvider>
      </body>
    </html>
  )
}
