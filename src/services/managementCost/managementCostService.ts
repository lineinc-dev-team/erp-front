'use client'

import { API } from '@/api/config/env'

// 검색 시 구분 을 기타로 설정하느 경우 해당하는 설명에 대한 팝업 창 뜨기

// 관리비 조회
export async function ManagementCostInfoService(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.COST}?${query}`, {
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
export async function CostRemoveService(managementCostIds: number[]) {
  const res = await fetch(API.COST, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ managementCostIds }),
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  return await res.status
}

// 관리비엑셀 다운로드
export async function CostExcelDownload({
  sort = '',
  siteName = '',
  processName = '',
  itemType = '',
  itemTypeDescription = '',
  paymentStartDate = '',
  paymentEndDate = '',
  fields = [],
}: {
  sort?: string
  siteName?: string
  processName?: string
  itemType?: string
  itemTypeDescription?: string
  paymentStartDate?: string
  paymentEndDate?: string
  fields?: string[]
}) {
  const queryParams = new URLSearchParams()

  if (sort) queryParams.append('sort', sort)
  if (siteName) queryParams.append('siteName', siteName)
  if (processName) queryParams.append('processName', processName)
  if (itemType) queryParams.append('itemType', itemType)
  if (itemTypeDescription) queryParams.append('itemTypeDescription', itemTypeDescription)
  if (paymentStartDate) queryParams.append('paymentStartDate', paymentStartDate)
  if (paymentEndDate) queryParams.append('paymentEndDate', paymentEndDate)

  if (fields && fields.length > 0) {
    queryParams.append('fields', fields.join(','))
  }

  const res = await fetch(`${API.COST}/download?${queryParams.toString()}`, {
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
  a.download = 'export23test.xlsx'
  a.click()
  window.URL.revokeObjectURL(url)

  return res.status
}

export async function GetTypeCostDesInfoService({ pageParam = 0, size = 5, keyword = '' }) {
  const resData = await fetch(
    `${API.COST}/etc-item-type-descriptions/search?page=${pageParam}&size=${size}&keyword=${keyword}`,
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
