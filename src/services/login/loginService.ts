import { API } from '@/api/config/env'

export async function loginService({
  loginId,
  password,
}: {
  loginId: string
  password: string
  autoLogin?: boolean
}) {
  try {
    const res = await fetch(API.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ loginId, password }),
      cache: 'no-store',
    })

    if (!res.ok) {
      // 즉, 401, 403, 400, 500 등 모든 HTTP 에러는 여기서 처리 가능
      const data = await res.json()

      if (res.status === 401 || res.status === 403) {
        return {
          status: 'error',
          message: data.message || '아이디 또는 비밀번호가 잘못되었습니다.',
        }
      }
      return { status: 'error', message: data.message || '로그인에 실패했습니다.' }
    }

    return { status: 'success', message: '로그인에 성공했습니다.' }
  } catch (err) {
    if (err instanceof Error) {
      return { status: 'error', message: '네트워크 에러입니다.' }
    }
    return { status: 'error', message: '알 수 없는 에러가 발생했습니다.' }
  }
}
