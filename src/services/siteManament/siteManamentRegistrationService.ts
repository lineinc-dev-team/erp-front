import { API } from '@/api/config/env'
import { useSiteManamentFormStore } from '@/stores/siteManamentStore'
import { useRouter } from 'next/navigation'

export function SiteMSCancel() {
  const router = useRouter()

  const handleCancelData = () => {
    router.push('/siteManagement')
  }

  return {
    handleCancelData,
  }
}

// 관리비 등록
export async function CreateSiteManament() {
  const { newSiteManamentSummary } = useSiteManamentFormStore.getState()
  const payload = newSiteManamentSummary()

  const res = await fetch(API.SITEMANAGEMENT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  return await res.status
}

// 현자/본사 상세
export async function SiteManagementDetailService(siteManagementDetailId: number) {
  const res = await fetch(`${API.SITEMANAGEMENT}/${siteManagementDetailId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  return await res.json()
}

//  수정
export async function ModifySiteManagement(siteId: number) {
  const { newSiteManamentSummary } = useSiteManamentFormStore.getState()
  const payload = newSiteManamentSummary()

  const res = await fetch(`${API.SITEMANAGEMENT}/${siteId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  return await res.status
}

// 식대 인력 조회

//  관리비 수정이력 조회 (페이지네이션 추가)
export async function SiteManagementInfoHistoryService(
  historyId: number,
  page: number = 0,
  size: number = 4,
  sort: string,
) {
  const resData = await fetch(
    `${API.SITEMANAGEMENT}/${historyId}/change-histories?page=${page}&size=${size}&sort=${sort}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  )

  if (!resData.ok) {
    if (resData.status === 401) {
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }
    throw new Error(`서버 에러: ${resData.status}`)
  }

  const data = await resData.json()
  return data
}
