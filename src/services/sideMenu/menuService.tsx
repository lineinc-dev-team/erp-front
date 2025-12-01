// src/api/menuService.ts
import { API } from '@/api/config/env'

export async function HeaderMenuService(roleId: number) {
  const resData = await fetch(`${API.SINGLEROLE}/${roleId}/menu-permissions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    cache: 'no-store',
  })

  if (!resData.ok) {
    if (resData.status === 401) {
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }

    // 서버에서 내려준 메시지 꺼내기
    let errorMessage = `서버 에러: ${resData.status}`
    try {
      const errorData = await resData.json()
      if (errorData?.message) {
        errorMessage = errorData.message
      }
    } catch {
      // json 파싱 실패 시는 그냥 status만 전달
    }

    throw new Error(errorMessage)
  }

  const data = await resData.json()
  return data
}
