import { useRouter } from 'next/navigation'
import { API } from '@/api/config/env'

export default function OutsourcingCompanyService() {
  const router = useRouter()

  const handleNewOrderCreate = () => router.push('/ordering/registration')

  return {
    handleNewOrderCreate,
  }
}

// 외주업체 조회
export async function OutsourcingCompanyInfoService(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.OUTSOURCINGCOMPANY}?${query}`, {
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

//외주업체 삭제
export async function OutsourcingCompanyRemoveService(outsourcingCompanyIds: number[]) {
  const res = await fetch(API.OUTSOURCINGCOMPANY, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ outsourcingCompanyIds }),
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

// // 외주업체 엑셀 다운로드
export async function OutsourcingCompanyExcelDownload({
  sort = '',
  name = '',
  businessNumber,
  ceoName,
  type,
  landlineNumber,
  isActive,
  createdStartDate,
  createdEndDate,
  fields,
}: {
  sort?: string
  name?: string
  businessNumber?: string
  ceoName?: string
  type: string
  landlineNumber?: string
  isActive?: boolean
  createdStartDate?: string
  createdEndDate?: string
  fields?: string[]
}) {
  const queryParams = new URLSearchParams()

  queryParams.append('sort', sort)
  if (name) queryParams.append('name', name)
  if (businessNumber) queryParams.append('businessNumber', businessNumber)
  if (type) queryParams.append('type', type)
  if (ceoName) queryParams.append('ceoName', ceoName)
  if (landlineNumber) queryParams.append('landlineNumber', landlineNumber)
  if (isActive !== undefined) queryParams.append('isActive', String(isActive))
  if (createdStartDate) queryParams.append('createdStartDate', createdStartDate)
  if (createdEndDate) queryParams.append('createdEndDate', createdEndDate)

  if (fields && fields.length > 0) {
    queryParams.append('fields', fields.join(','))
  }

  const res = await fetch(`${API.OUTSOURCINGCOMPANY}/download?${queryParams.toString()}`, {
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
  a.download = '외주업체 목록.xlsx'
  a.click()
  window.URL.revokeObjectURL(url)

  return res.status
}
