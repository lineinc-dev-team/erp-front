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
      sessionStorage.setItem('myInfo', JSON.stringify(data.data))
    } else {
      alert('세션이 없거나 데이터가 없습니다.')
      return
    }
  } catch (err) {
    if (err instanceof Error) {
      alert(`내 정보 불러오기 실패: ${err.message}`)
    }
    return
  }
}
