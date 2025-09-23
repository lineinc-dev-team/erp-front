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
  const isLoginPage = pathname === '/' || pathname === '/resetPassword' || pathname === '/dashboard'

  // 다른 브라우저로 이동 시 쿠키에 세션값이 있으면 유저의 정보를 세션스토리지에 넣기

  return (
    <html lang="ko">
      <body>
        <QueryClientProvider client={queryClient}>
          <HeaderWrapper />

          <div className={isLoginPage ? '' : 'mt-32'}>{children}</div>

          <Snackbar
            open={open}
            autoHideDuration={3000} // 필요 없으면 제거 가능
            onClose={(event, reason) => {
              if (reason !== 'clickaway') closeSnackbar() // 바깥 클릭은 무시
            }}
            sx={{
              position: 'fixed',
              top: '-10%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%', // 전체 넓이 확보
            }}
          >
            <Alert
              severity={severity}
              sx={{ fontSize: '17px', minWidth: '300px' }} // 가운데 보이도록 최소폭
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
