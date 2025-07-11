'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginService } from '@/services/login/loginService'
// import { API } from '@/api/config/env'
import { MyInfoService } from '@/services/myInfo/myInfoService'
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
          await MyInfoService()
          router.push('/business')
        } catch (err) {
          console.error('내 정보 불러오기 실패, 라우팅 중단', err)
          // 실패 시 라우팅 안함
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
