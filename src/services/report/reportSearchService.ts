'use client'

import { API } from '@/api/config/env'

export async function SiteIdInfoService({
  siteIds,
  startYearMonth,
  endYearMonth,
}: {
  siteIds: number[]
  startYearMonth?: string
  endYearMonth?: string
}) {
  const params = new URLSearchParams()

  siteIds.forEach((id) => params.append('siteIds', String(id)))
  if (startYearMonth) params.append('startYearMonth', startYearMonth)
  if (endYearMonth) params.append('endYearMonth', endYearMonth)

  const resData = await fetch(`${API.REPORT}/site-monthly-costs?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

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
