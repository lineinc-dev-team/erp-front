'use client'

import CommonInput from '../common/Input'
import CommonButton from '../common/Button'
import { useLoginForm } from '@/hooks/useLoginForm'

export default function LoginView() {
  const {
    loginId,
    setLoginId,
    password,
    setPassword,
    autoLogin,
    setAutoLogin,
    userErrorId,
    setUserErrorId,
    setUserErrorPassword,
    userErrorPassword,
    handleLogin,
  } = useLoginForm()

  return (
    <div>
      <h1 className="text-[42px] mb-4">라인공영 관리 시스템 현재 dev에서 테스트</h1>

      <div className="w-88 flex flex-col gap-2 m-0">
        <CommonInput
          value={loginId}
          placeholder="아이디를 입력하세요."
          onChange={(value) => {
            setLoginId(value)
            setUserErrorId(value === '') // 빈 값이면 에러 표시
          }}
          error={userErrorId}
          helperText={userErrorId ? '아이디를 입력해주세요.' : ''}
          required
          className="m-0"
        />

        <CommonInput
          value={password}
          error={userErrorPassword}
          helperText={userErrorPassword ? '비밀번호를 입력해주세요.' : ''}
          placeholder="비밀번호를 입력하세요."
          onChange={(value) => {
            setPassword(value)
            setUserErrorPassword(value === '')
          }}
          type="password"
          required
          className="m-0"
        />

        <label className="flex items-center gap-2 mt-1.5 mb-3.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoLogin}
            onChange={() => setAutoLogin((prev) => !prev)}
            className="
                      appearance-none w-5 h-5 border border-black rounded-full 
                      checked:bg-blue-600 checked:border-blue-600 
                      relative transition-all
                      after:content-[''] after:block after:w-2.5 after:h-2.5 after:bg-white after:rounded-full after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:scale-0 checked:after:scale-100 after:transition
                    "
          />
          <span>자동 로그인</span>
        </label>

        <CommonButton
          label="로그인"
          variant="secondary"
          onClick={handleLogin}
          fullWidth
          className="mb-3"
        />

        <p className="text-gray-500">아이디/비밀번호 재설정은 OOOO부서에 문의 바랍니다.</p>
        <p className="text-center">031-1234-1234</p>
      </div>
    </div>
  )
}
