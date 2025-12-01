import { API } from '@/api/config/env'

export async function MyInfoService() {
  try {
    const res = await fetch(API.MYINFO, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`서버 에러: ${res.status}`)
    }

    const text = await res.text()
    const data = text ? JSON.parse(text) : null

    if (data?.data) {
      const { requirePasswordReset } = data.data

      if (requirePasswordReset) {
        // 비밀번호 재설정 페이지로 이동하고 이후 로직 중단
        window.location.href = '/resetPassword'
        return false // 이후 로직 실행하지 않도록 false 반환
      }

      // 비밀번호 재설정이 필요하지 않은 경우에만 세션 저장
      sessionStorage.setItem('myInfo', JSON.stringify(data.data))
      return true // 성공적으로 정보 저장
    } else {
      throw new Error('세션이 없거나 데이터가 없습니다.')
    }
  } catch (err) {
    if (err instanceof Error) {
      alert('내 정보를 불러올 수 있는 권한이 없습니다.')
    }
    throw err
  }
}
