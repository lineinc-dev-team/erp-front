'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginService } from '@/services/login/loginService'
import { MyInfoService } from '@/services/myInfo/myInfoService'

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

      if (resultValue === 200) {
        await MyInfoService()

        router.push('/business')
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
