'use client'

import { API } from '@/api/config/env'

// 유류집계데이터 조회
export async function FuelAggregationInfoService(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.FUELAGGRE}?${query}`, {
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

// 조회에서 차량번호 조회
export async function FuelCarNumberTypeService({
  pageParam = 0,
  size = 5,
  keyword = '',
  sort = '',
}) {
  const resData = await fetch(
    `${API.OUTSOURCINGCONTRACT}/equipments/vehicle-numbers/search?page=${pageParam}&size=${size}&keyword=${keyword}&sort=${sort}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  )

  if (!resData.ok) {
    if (resData.status === 401) throw new Error('권한이 없습니다.')
    throw new Error(`서버 에러: ${resData.status}`)
  }

  const data = await resData.json()
  return data
}

// 유류 삭제
// export async function MaterialRemoveService(materialManagementIds: number[]) {
//   const res = await fetch(API.MATERIAL, {
//     method: 'DELETE',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ materialManagementIds }),
//     credentials: 'include',
//   })
//   if (!res.ok) {
//     if (res.status === 401) {
//       // 로그인 페이지로 이동
//       window.location.href = '/'
//       return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
//     }
//     throw new Error(`서버 에러: ${res.status}`)
//   }

//   return await res.status
// }

// 강재수불부 엑셀 다운로드
export async function FuelExcelDownload({
  sort = '',
  siteName = '',
  processName = '',
  fuelTypes = [],
  outsourcingCompanyName = '',
  vehicleNumber = '',
  dateStartDate,
  dateEndDate,
  fields = [],
}: {
  sort?: string
  siteName?: string
  processName?: string
  fuelTypes?: string[]
  outsourcingCompanyName?: string
  vehicleNumber?: string
  dateStartDate?: string
  dateEndDate?: string
  fields?: string[]
}) {
  const queryParams = new URLSearchParams()

  queryParams.append('sort', sort)
  if (siteName) queryParams.append('siteName', siteName)
  if (processName) queryParams.append('processName', processName)
  if (fuelTypes && fuelTypes.length > 0) queryParams.append('fuelTypes', fuelTypes.join(','))
  if (outsourcingCompanyName) queryParams.append('outsourcingCompanyName', outsourcingCompanyName)
  if (vehicleNumber) queryParams.append('vehicleNumber', vehicleNumber)
  if (dateStartDate) queryParams.append('dateStartDate', dateStartDate)
  if (dateEndDate) queryParams.append('dateEndDate', dateEndDate)
  if (fields && fields.length > 0) queryParams.append('fields', fields.join(','))

  if (fields && fields.length > 0) {
    queryParams.append('fields', fields.join(','))
  }

  const res = await fetch(`${API.FUELAGGRE}/download?${queryParams.toString()}`, {
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
