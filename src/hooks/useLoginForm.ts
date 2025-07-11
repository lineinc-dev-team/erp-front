'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginService } from '@/services/login/loginService'
import { MyInfoService } from '@/services/myInfo/myInfoService'
import { useSnackbarStore } from '@/stores/useSnackbarStore'

export function useLoginForm() {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [autoLogin, setAutoLogin] = useState(false)
  const [userErrorId, setUserErrorId] = useState(false)
  const [userErrorPassword, setUserErrorPassword] = useState(false)

  const router = useRouter()

  const validate = () => {
    const hasError = loginId === '' || password === ''
    setUserErrorId(loginId === '')
    setUserErrorPassword(password === '')
    return !hasError
  }

  const { showSnackbar } = useSnackbarStore()

  const handleLogin = async () => {
    if (!validate()) {
      showSnackbar('아이디와 비밀번호를 모두 입력해주세요.', 'error')
    }

    const result = await loginService({ loginId, password, autoLogin })
    showSnackbar(result.message, result.status)
    if (result.status === 'success') {
      try {
        await MyInfoService()
        router.push('/business')
      } catch (err) {
        console.error('내 정보를 불러 올 권한이 없습니다.', err)
      }
    }

    return result
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
    setUserErrorId,
    setUserErrorPassword,
    handleLogin,
  }
}
