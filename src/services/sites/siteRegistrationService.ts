'use client'

import { API } from '@/api/config/env'
import { useSiteFormStore } from '@/stores/siteStore'
import { useRouter } from 'next/navigation'

export function SiteRegistrationService() {
  const router = useRouter()

  const handleCancelData = () => {
    router.push('/sites')
  }

  return {
    handleCancelData,
  }
}

// 현장 등록
export async function CreateSiteInfo() {
  const { toPayload } = useSiteFormStore.getState()
  const payload = toPayload()

  const res = await fetch(API.SITES, {
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
// 발주처에 담당자 리스트 조회

export async function OrderingPersonScroll({ pageParam = 0, size = 5, keyword = '', sort = '' }) {
  const resData = await fetch(
    `${API.CLIENTCOMPANY}/search?page=${pageParam}&size=${size}&keyword=${keyword}&sort=${sort}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  )

  if (!resData.ok) {
    if (resData.status === 401) throw new Error('권한이 없습니다.')
    throw new Error(`서버 에러: ${resData.status}`)
  }

  const data = await resData.json()
  console.log('파싱된 유저 데이터', data)
  return data
}

// 현장 상세
export async function SiteDetailService(siteId: number) {
  const res = await fetch(`${API.SITES}/${siteId}`, {
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

//  현장 수정
export async function ModifySiteService(siteModifyId: number) {
  const { toPayload } = useSiteFormStore.getState()
  const payload = toPayload()

  const res = await fetch(`${API.SITES}/${siteModifyId}`, {
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

// 현장유형 조회
export async function SiteIdInfoService() {
  const resData = await fetch(`${API.SITES}/site-types`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!resData.ok) {
    if (resData.status === 401) {
      throw new Error('권한이 없습니다.')
    }
    throw new Error(`서버 에러: ${resData.status}`)
  }

  const data = await resData.json()
  return data
}

// 발주처 수정이력 조회 (페이지네이션 추가)
export async function SiteInfoHistoryService(
  historyId: number,
  page: number = 0,
  size: number = 4,
) {
  const resData = await fetch(
    `${API.SITES}/${historyId}/change-histories?page=${page}&size=${size}`,
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
      throw new Error('권한이 없습니다.')
    }
    throw new Error(`서버 에러: ${resData.status}`)
  }

  const data = await resData.json()
  console.log('파싱된 유저 데이터', data)
  return data
}
