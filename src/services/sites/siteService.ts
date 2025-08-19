'use client'

import { API } from '@/api/config/env'

// 현장 조회

export async function SiteInfoService(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.SITES}?${query}`, {
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

// 현장 삭제
export async function SiteRemoveService(siteIds: number[]) {
  const res = await fetch(API.SITES, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ siteIds }),
    credentials: 'include',
  })

  if (!res.ok) {
    if (res.status === 401) {
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }
    throw new Error(`서버 에러: ${res.status}`)
  }

  return await res.status
}

// 현장 엑셀 다운로드
export async function SiteExcelDownload({
  sort = '',
  name = '',
  processName,
  city,
  district,
  type,
  processStatuses,
  clientCompanyName,
  startDate,
  endDate,
  createdStartDate,
  createdEndDate,
  createdBy,
  fields,
}: {
  sort?: string
  name?: string
  processName?: string
  city?: string
  district?: string
  type?: string
  processStatuses?: string[]
  clientCompanyName?: string
  startDate?: string
  endDate?: string
  createdStartDate?: string
  createdEndDate?: string
  createdBy?: string
  fields?: string[]
}) {
  const queryParams = new URLSearchParams()

  queryParams.append('sort', sort)
  if (name) queryParams.append('name', name)
  if (processName) queryParams.append('processName', processName)
  if (city) queryParams.append('city', city)
  if (district) queryParams.append('district', district)
  if (type) queryParams.append('type', type)
  if (processStatuses && processStatuses.length > 0) {
    processStatuses.forEach((status) => {
      queryParams.append('processStatuses', status)
    })
  }
  if (clientCompanyName) queryParams.append('clientCompanyName', clientCompanyName)
  if (startDate) queryParams.append('startDate', startDate)
  if (endDate) queryParams.append('endDate', endDate)
  if (createdStartDate) queryParams.append('createdStartDate', createdStartDate)
  if (createdEndDate) queryParams.append('createdEndDate', createdEndDate)
  if (createdBy) queryParams.append('createdBy', createdBy)

  if (fields && fields.length > 0) {
    queryParams.append('fields', fields.join(','))
  }

  const res = await fetch(`${API.SITES}/download?${queryParams.toString()}`, {
    method: 'GET',
    // headers: {
    //   Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // },

    credentials: 'include',
  })

  if (!res.ok) {
    if (res.status === 401) {
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }
    throw new Error(`서버 에러: ${res.status}`)
  }

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'export23test.xlsx'
  a.click()
  window.URL.revokeObjectURL(url)

  return res.status
}
