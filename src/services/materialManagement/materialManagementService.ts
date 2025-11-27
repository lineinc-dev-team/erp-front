'use client'

import { useRouter } from 'next/navigation'
import { API } from '@/api/config/env'

export function ManagementMaterialService() {
  const router = useRouter()

  const handleNewMaterialCreate = () => router.push('/materialManagement/registration')

  return {
    handleNewMaterialCreate,
  }
}

// 자재 조회
export async function ManagementMaterialInfoService(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.MATERIAL}?${query}`, {
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

// 자재 삭제
export async function MaterialRemoveService(materialManagementIds: number[]) {
  const res = await fetch(API.MATERIAL, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ materialManagementIds }),
    credentials: 'include',
  })

  if (!res.ok) {
    if (res.status === 401) {
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }

    // 서버에서 내려준 메시지 꺼내기
    let errorMessage = `서버 에러: ${res.status}`
    try {
      const errorData = await res.json()
      if (errorData?.message) {
        errorMessage = errorData.message
      }
    } catch {
      // json 파싱 실패 시는 그냥 status만 전달
    }

    throw new Error(errorMessage)
  }

  return await res.status
}

// 자재 엑셀 다운로드
export async function MaterialExcelDownload({
  sort = '',
  siteName = '',
  processName = '',
  outsourcingCompanyName = '',
  materialName = '',
  deliveryStartDate,
  deliveryEndDate,
  fields,
}: {
  sort?: string
  siteName?: string
  processName?: string
  outsourcingCompanyName?: string
  materialName?: string
  deliveryStartDate?: string
  deliveryEndDate?: string
  fields?: string[]
}) {
  const queryParams = new URLSearchParams()

  queryParams.append('sort', sort)
  if (siteName) queryParams.append('siteName', siteName)
  if (processName) queryParams.append('processName', processName)
  if (outsourcingCompanyName) queryParams.append('outsourcingCompanyName', outsourcingCompanyName)
  if (materialName) queryParams.append('materialName', materialName)
  if (deliveryStartDate) queryParams.append('deliveryStartDate', deliveryStartDate)
  if (deliveryEndDate) queryParams.append('deliveryEndDate', deliveryEndDate)

  if (fields && fields.length > 0) {
    queryParams.append('fields', fields.join(','))
  }

  const res = await fetch(`${API.MATERIAL}/download?${queryParams.toString()}`, {
    method: 'GET',

    credentials: 'include',
  })

  if (!res.ok) {
    if (res.status === 401) {
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }

    // 서버에서 내려준 메시지 꺼내기
    let errorMessage = `서버 에러: ${res.status}`
    try {
      const errorData = await res.json()
      if (errorData?.message) {
        errorMessage = errorData.message
      }
    } catch {
      // json 파싱 실패 시는 그냥 status만 전달
    }

    throw new Error(errorMessage)
  }

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '자재 목록.xlsx'
  a.click()
  window.URL.revokeObjectURL(url)

  return res.status
}

// 추가 내용 ==> 품명

// 자재관리 투입구분 목록 조회
export async function MaterialSearchTypeService({ pageParam = 0, size = 40, keyword = '' }) {
  const resData = await fetch(
    `${API.MATERIAL}/detail-names/search?page=${pageParam}&size=${size}&keyword=${keyword}`,
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
