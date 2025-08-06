'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginService } from '@/services/login/loginService'
import { MyInfoService } from '@/services/myInfo/myInfoService'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useTabStore } from '@/stores/useTabStore'

export function useLoginForm() {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  // const [autoLogin, setAutoLogin] = useState(false)
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
      return
    }

    const result = await loginService({ loginId, password })
    showSnackbar(result.message, result.status)

    if (result.status === 'success') {
      try {
        const isInfoLoaded = await MyInfoService()

        // requirePasswordReset이면 위에서 바로 redirect 됨 (false 반환)
        if (!isInfoLoaded) return

        // '/sites' 탭이 sessionStorage와 탭 스토어에 없으면 추가
        const tabPath = '/dashboard'
        const tabLabel = '대쉬보드 - 관리'

        const storedTabs = JSON.parse(sessionStorage.getItem('tabs') || '[]') as Array<{
          path: string
          label: string
        }>

        if (!storedTabs.some((tab) => tab.path === tabPath)) {
          storedTabs.push({ path: tabPath, label: tabLabel })
          sessionStorage.setItem('tabs', JSON.stringify(storedTabs))
        }

        const tabStore = useTabStore.getState()
        if (!tabStore.tabs.find((t) => t.path === tabPath)) {
          tabStore.addTab({ path: tabPath, label: tabLabel })
        }
        router.refresh()

        router.push(tabPath)
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
    userErrorId,
    userErrorPassword,
    setUserErrorId,
    setUserErrorPassword,
    handleLogin,
  }
}
