'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginService } from '@/services/login/loginService'
import { API } from '@/api/config/env'
// import { MyInfoService } from '@/services/myInfo/myInfoService'

export function useLoginForm() {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [autoLogin, setAutoLogin] = useState(false)

  const [userErrorId, setUserErrorId] = useState(false)
  const [userErrorPassword, setUserErrorPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const router = useRouter()

  const validate = () => {
    const hasError = loginId === '' || password === ''
    setUserErrorId(loginId === '')
    setUserErrorPassword(password === '')
    return !hasError
  }

  const handleLogin = async () => {
    if (!validate()) return

    try {
      const resultValue = await loginService({ loginId, password, autoLogin })

      console.log('로그인 상태 값', resultValue)
      if (resultValue === 200) {
        try {
          const res = await fetch(API.MYINFO, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Accept: '*/*',
            },
            credentials: 'include', // 쿠키 포함 필수
            cache: 'no-store',
          })

          if (!res.ok) {
            throw new Error(`서버 에러: ${res.status}`)
          }

          const text = await res.text()
          const data = text ? JSON.parse(text) : null

          console.log(' 내정 보 데이터', data)

          if (data?.data) {
            sessionStorage.setItem('myInfo', JSON.stringify(data.data))
            router.push('/business')
          } else {
            alert('세션이 없거나 데이터가 없습니다.')
            return
          }
        } catch (err) {
          if (err instanceof Error) {
            alert(`내 정보 불러오기 실패: ${err.message}`)
          }
          return
        }
      } else {
        // 로그인 실패 (200이 아닐 때)
        return
      }
    } catch (err) {
      if (err instanceof Error) setErrorMessage(err.message)
    }
  }

  return {
    loginId,
    setLoginId,
    password,
    setPassword,
    autoLogin,
    setAutoLogin,
    userErrorId,
    userErrorPassword,
    errorMessage,
    setUserErrorId,
    setUserErrorPassword,
    handleLogin,
  }
}
