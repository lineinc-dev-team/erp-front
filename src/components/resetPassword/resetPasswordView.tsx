'use client'

import { useState } from 'react'
import CommonInput from '../common/Input'
import CommonButton from '../common/Button'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { API } from '@/api/config/env'

export default function ResetPasswordView() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { showSnackbar } = useSnackbarStore()

  function isValidPassword(password: string): boolean {
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/
    return regex.test(password)
  }
  const handleSubmit = async () => {
    if (!isValidPassword(password)) {
      setError('비밀번호 양식에 맞지 않습니다.')
      setSuccess(false)
      return
    }
    if (password !== confirmPassword) {
      setError('비밀번호와 확인 비밀번호가 일치하지 않습니다.')
      setSuccess(false)
      return
    }

    try {
      const response = await fetch(`${API.RESETPASSWORD}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword: password }),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        showSnackbar(data.message || '비밀번호 변경에 실패했습니다.', 'error')
        return // 중요한 부분: 에러 페이지로 안 넘어가게 막음
      }

      showSnackbar('비밀번호가 성공적으로 변경되었습니다.', 'success')
      window.location.href = '/' // 혹은 라우터 사용
    } catch (err) {
      if (err instanceof Error) showSnackbar('비밀번호 변경에 실패했습니다.', 'error')
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">비밀번호 변경</h2>

        <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
          최초 로그인 시 비밀번호를 반드시 변경해야 합니다. <br />
          비밀번호 변경 후 다시 로그인해주세요.
        </p>

        <p className="text-sm text-red-400 ">
          비밀번호는 8~16자리, 영문/숫자/특수문자를 각각 포함해야 합니다. 예: Fds!hdu6@@
        </p>

        <div className="space-y-4">
          <CommonInput
            placeholder="새 비밀번호"
            type="password"
            className="flex"
            value={password}
            onChange={(value) => {
              setPassword(value)
              setError('')
              setSuccess(false)
            }}
          />

          <CommonInput
            className="flex"
            placeholder="비밀번호 확인"
            type="password"
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(value)
              setError('')
              setSuccess(false)
            }}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">비밀번호가 설정되었습니다.</p>}

          <div className="flex gap-3 justify-center mt-4">
            <CommonButton
              label="취소"
              variant="secondary"
              className="px-16 py-2"
              onClick={() => (window.location.href = '/')}
            />
            <CommonButton label="확인" className="px-16 py-2" onClick={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
  )
}
