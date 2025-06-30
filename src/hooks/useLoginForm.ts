'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginService } from '@/services/login/loginService'

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

      console.log('해당 결과 깂이..', resultValue)

      if (resultValue === 200) {
        router.push('/business')
      } else {
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
