'use client'

import { API } from '@/api/config/env'
import { useRouter } from 'next/navigation'

// 검색 시 구분 을 기타로 설정하느 경우 해당하는 설명에 대한 팝업 창 뜨기

export function SiteMoveService() {
  const router = useRouter()

  const handleNewSiteCreate = () => router.push('/siteManagement/registration')

  return {
    handleNewSiteCreate,
  }
}

// 현장 본사 관리비
export async function SiteManagementInfoService(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.SITEMANAGEMENT}?${query}`, {
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

// 관리비 삭제
export async function SiteManamentRemoveService(siteManagementCostIds: number[]) {
  const res = await fetch(API.SITEMANAGEMENT, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ siteManagementCostIds }),
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  return await res.status
}

// 관리비엑셀 다운로드
export async function SiteManagementExcelDownload({
  sort = '',
  siteName = '',
  siteProcessName = '',
  startYearMonth = '',
  endYearMonth = '',
  fields = [],
}: {
  sort?: string
  siteName?: string
  siteProcessName: string
  startYearMonth?: string
  endYearMonth?: string
  fields?: string[]
}) {
  const queryParams = new URLSearchParams()

  if (sort) queryParams.append('sort', sort)
  if (siteName) queryParams.append('siteName', siteName)

  if (siteProcessName) queryParams.append('siteProcessName', siteProcessName)
  if (startYearMonth) queryParams.append('startYearMonth', startYearMonth)
  if (endYearMonth) queryParams.append('endYearMonth', endYearMonth)

  if (fields && fields.length > 0) {
    queryParams.append('fields', fields.join(','))
  }

  const res = await fetch(`${API.SITEMANAGEMENT}/download?${queryParams.toString()}`, {
    method: 'GET',

    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '현장/본사 관리비 목록.xlsx'
  a.click()
  window.URL.revokeObjectURL(url)

  return res.status
}
