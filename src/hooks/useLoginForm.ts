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

        // '/sites' 탭이 sessionStorage와 탭 스토어에 없으면 추가
        const tabPath = '/sites'
        const tabLabel = '현장 관리 - 조회' // 적절한 탭 이름

        // sessionStorage에서 탭 리스트 불러오기
        const storedTabs = JSON.parse(sessionStorage.getItem('tabs') || '[]') as Array<{
          path: string
          label: string
        }>

        // 없으면 추가
        if (!storedTabs.some((tab) => tab.path === tabPath)) {
          storedTabs.push({ path: tabPath, label: tabLabel })
          sessionStorage.setItem('tabs', JSON.stringify(storedTabs))
        }

        // 전역 탭 스토어에도 없으면 추가
        const tabStore = useTabStore.getState()
        if (!tabStore.tabs.find((t) => t.path === tabPath)) {
          tabStore.addTab({ path: tabPath, label: tabLabel })
        }

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
    autoLogin,
    setAutoLogin,
    userErrorId,
    userErrorPassword,
    setUserErrorId,
    setUserErrorPassword,
    handleLogin,
  }
}
