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

// 강재데이터 조회
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
      throw new Error('권한이 없습니다.')
    }
    throw new Error(`서버 에러: ${resData.status}`)
  }

  const data = await resData.json()
  return data
}

// 강재데이터 삭제
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
    throw new Error(`서버 오류: ${res.status}`)
  }

  return await res.status
}

// 강재수불부 엑셀 다운로드
export async function MaterialExcelDownload({
  sort = '',
  username = '',
  roleId,
  isActive,
  createdStartDate,
  createdEndDate,
  lastLoginStartDate,
  lastLoginEndDate,
  fields,
}: {
  sort?: string
  username?: string
  roleId?: number
  isActive?: boolean
  createdStartDate?: string
  createdEndDate?: string
  lastLoginStartDate?: string
  lastLoginEndDate?: string
  fields?: string[]
}) {
  const queryParams = new URLSearchParams()

  queryParams.append('sort', sort)
  if (username) queryParams.append('username', username)
  if (roleId !== undefined) queryParams.append('roleId', String(roleId))
  if (isActive !== undefined) queryParams.append('isActive', String(isActive))
  if (createdStartDate) queryParams.append('createdStartDate', createdStartDate)
  if (createdEndDate) queryParams.append('createdEndDate', createdEndDate)
  if (lastLoginStartDate) queryParams.append('lastLoginStartDate', lastLoginStartDate)
  if (lastLoginEndDate) queryParams.append('lastLoginEndDate', lastLoginEndDate)

  if (fields && fields.length > 0) {
    queryParams.append('fields', fields.join(','))
  }

  const res = await fetch(`${API.MATERIAL}/download?${queryParams.toString()}`, {
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

// 추가 내용 ==> 품명

// 자재관리 투입구분 목록 조회
export async function MaterialSearchTypeService({ pageParam = 0, size = 5, keyword = '' }) {
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
      throw new Error('권한이 없습니다.')
    }
    throw new Error(`서버 에러: ${resData.status}`)
  }

  const data = await resData.json()
  return data
}
