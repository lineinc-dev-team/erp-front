'use client'

import { API } from '@/api/config/env'

// 노무데이터 조회
export async function LaborListInfoService(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.LABOR}?${query}`, {
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

// 노무데이터 삭제
export async function LaborListRemoveService(laborIds: number[]) {
  const res = await fetch(API.LABOR, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ laborIds }),
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

// 노무엑셀 다운로드
export async function LaborExcelDownload({
  sort = '',
  type = '',
  typeDescription = '',
  name = '',
  residentNumber = '',
  outsourcingCompanyId,
  phoneNumber = '',
  isHeadOffice = undefined,
  fields,
}: {
  sort?: string
  type?: string
  typeDescription?: string
  name?: string
  residentNumber?: string
  outsourcingCompanyId?: number
  phoneNumber?: string
  isHeadOffice?: boolean
  fields?: string[]
}) {
  const queryParams = new URLSearchParams()

  if (sort) queryParams.append('sort', sort)
  if (type) queryParams.append('type', type)
  if (typeDescription) queryParams.append('typeDescription', typeDescription)
  if (name) queryParams.append('name', name)
  if (residentNumber) queryParams.append('residentNumber', residentNumber)
  if (outsourcingCompanyId !== undefined && outsourcingCompanyId !== -1) {
    queryParams.append('outsourcingCompanyId', String(outsourcingCompanyId))
  }
  if (phoneNumber) queryParams.append('phoneNumber', phoneNumber)
  if (isHeadOffice !== undefined) queryParams.append('isHeadOffice', String(isHeadOffice))

  if (fields && fields.length > 0) {
    queryParams.append('fields', fields.join(','))
  }

  const res = await fetch(`${API.LABOR}/download?${queryParams.toString()}`, {
    method: 'GET',

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
