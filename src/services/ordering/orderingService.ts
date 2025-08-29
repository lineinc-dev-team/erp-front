'use client'

import { useRouter } from 'next/navigation'
import { API } from '@/api/config/env'

export function OrderingService() {
  const router = useRouter()

  const handleNewOrderCreate = () => router.push('/ordering/registration')

  return {
    handleNewOrderCreate,
  }
}

// 발주처 조회

export async function ClientCompanyInfoService(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.CLIENTCOMPANY}?${query}`, {
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

// 발주처 삭제
export async function ClientRemoveService(clientCompanyIds: number[]) {
  const res = await fetch(API.CLIENTCOMPANY, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ clientCompanyIds }),
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

// 엑셀 다운로드
export async function ClientCompanyExcelDownload({
  sort = '',
  name = '',
  businessNumber,
  ceoName,
  landlineNumber,
  contactName,
  email,
  userName,
  isActive = true,
  createdStartDate,
  createdEndDate,
  fields,
}: {
  sort?: string
  name?: string
  businessNumber?: string
  ceoName?: string
  landlineNumber?: string
  contactName?: string
  email?: string
  userName?: string
  isActive?: boolean
  createdStartDate?: string
  createdEndDate?: string
  hasFile?: boolean
  fields?: string[]
}) {
  const queryParams = new URLSearchParams()

  queryParams.append('sort', sort)
  if (name) queryParams.append('name', name)
  if (businessNumber) queryParams.append('businessNumber', businessNumber)
  if (ceoName) queryParams.append('ceoName', ceoName)
  if (landlineNumber) queryParams.append('landlineNumber', landlineNumber)
  if (contactName) queryParams.append('contactName', contactName)
  if (email) queryParams.append('email', email)
  if (userName) queryParams.append('userName', userName)
  queryParams.append('isActive', String(isActive))
  // if (isActive !== undefined) queryParams.append('isActive', String(isActive))
  if (createdStartDate) queryParams.append('createdStartDate', createdStartDate)
  if (createdEndDate) queryParams.append('createdEndDate', createdEndDate)

  if (fields && fields.length > 0) {
    queryParams.append('fields', fields.join(','))
  }

  const res = await fetch(`${API.CLIENTCOMPANY}/download?${queryParams.toString()}`, {
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
  a.download = '발주처 목록.xlsx'
  a.click()
  window.URL.revokeObjectURL(url)

  return res.status
}
