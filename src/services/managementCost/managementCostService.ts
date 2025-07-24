'use client'

import { useRouter } from 'next/navigation'
import { API } from '@/api/config/env'

export function ManagementCostService() {
  const router = useRouter()

  const handleNewCostCreate = () => router.push('/managementCost/registration')

  return {
    handleNewCostCreate,
  }
}

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
  console.log('파싱된 유저 데이터', data)
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
// export async function ClientCompanyExcelDownload({
//   sort = '',
//   username = '',
//   roleId,
//   isActive,
//   createdStartDate,
//   createdEndDate,
//   lastLoginStartDate,
//   lastLoginEndDate,
//   fields,
// }: {
//   sort?: string
//   username?: string
//   roleId?: number
//   isActive?: boolean
//   createdStartDate?: string
//   createdEndDate?: string
//   lastLoginStartDate?: string
//   lastLoginEndDate?: string
//   fields?: string[]
// }) {
//   const queryParams = new URLSearchParams()

//   queryParams.append('sort', sort)
//   if (username) queryParams.append('username', username)
//   if (roleId !== undefined) queryParams.append('roleId', String(roleId))
//   if (isActive !== undefined) queryParams.append('isActive', String(isActive))
//   if (createdStartDate) queryParams.append('createdStartDate', createdStartDate)
//   if (createdEndDate) queryParams.append('createdEndDate', createdEndDate)
//   if (lastLoginStartDate) queryParams.append('lastLoginStartDate', lastLoginStartDate)
//   if (lastLoginEndDate) queryParams.append('lastLoginEndDate', lastLoginEndDate)

//   if (fields && fields.length > 0) {
//     queryParams.append('fields', fields.join(','))
//   }

//   const res = await fetch(`${API.CLIENTCOMPANY}/download?${queryParams.toString()}`, {
//     method: 'GET',
//     // headers: {
//     //   Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//     // },

//     credentials: 'include',
//   })

//   if (!res.ok) {
//     throw new Error(`서버 오류: ${res.status}`)
//   }

//   const blob = await res.blob()
//   const url = window.URL.createObjectURL(blob)
//   const a = document.createElement('a')
//   a.href = url
//   a.download = 'export23test.xlsx'
//   a.click()
//   window.URL.revokeObjectURL(url)

//   return res.status
// }
