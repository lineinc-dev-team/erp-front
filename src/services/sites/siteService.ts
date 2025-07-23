'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { API } from '@/api/config/env'

export function SiteMoveService() {
  const router = useRouter()
  const [selectedFields, setSelectedFields] = useState<string[]>([])

  // 계약 이력

  const handleToggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    )
  }

  const handleNewOrderCreate = () => router.push('/sites/registration')

  return {
    selectedFields,
    handleToggleField,

    handleNewOrderCreate,
  }
}

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
      throw new Error('권한이 없습니다.')
    }
    throw new Error(`서버 에러: ${resData.status}`)
  }

  const data = await resData.json()
  console.log('파싱된 유저 데이터', data)
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
    throw new Error(`서버 오류: ${res.status}`)
  }

  return await res.status
}

// 현장 엑셀 다운로드
export async function SiteExcelDownload({
  sort = '',
  name,
  type,
  processName,
  city,
  district,
  processStatuses,
  clientCompanyName,
  createdBy,
  startDate,
  endDate,
  createdStartDate,
  createdEndDate,
  fields,
}: {
  sort?: string
  name?: string
  type?: 'CONSTRUCTION' | 'CIVIL_ENGINEERING' | 'OUTSOURCING'
  processName?: string
  city?: string
  district?: string
  processStatuses?: ('NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED')[]
  clientCompanyName?: string
  createdBy?: string
  startDate?: string
  endDate?: string
  createdStartDate?: string
  createdEndDate?: string
  fields: string[] // ✅ 필수
}) {
  const queryParams = new URLSearchParams()

  // 필수 값
  // queryParams.append('fields', fields)

  // 선택 값들
  if (sort) queryParams.append('sort', sort)
  if (name) queryParams.append('name', name)
  if (type) queryParams.append('type', type)
  if (processName) queryParams.append('processName', processName)
  if (city) queryParams.append('city', city)
  if (district) queryParams.append('district', district)
  if (processStatuses && processStatuses.length > 0) {
    processStatuses.forEach((status) => queryParams.append('processStatuses', status))
  }
  if (clientCompanyName) queryParams.append('clientCompanyName', clientCompanyName)
  if (createdBy) queryParams.append('createdBy', createdBy)
  if (startDate) queryParams.append('startDate', startDate)
  if (endDate) queryParams.append('endDate', endDate)
  if (createdStartDate) queryParams.append('createdStartDate', createdStartDate)
  if (createdEndDate) queryParams.append('createdEndDate', createdEndDate)

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
