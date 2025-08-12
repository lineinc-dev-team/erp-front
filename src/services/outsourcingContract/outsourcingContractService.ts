import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { API } from '@/api/config/env'

export default function OutsourcingCompanyService() {
  const router = useRouter()
  const [selectedFields, setSelectedFields] = useState<string[]>([])

  // 외주업체 이력
  const [contract, setContract] = useState(false)

  const handleToggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    )
  }

  const handleNewOrderCreate = () => router.push('/ordering/registration')

  return {
    selectedFields,
    handleToggleField,

    handleNewOrderCreate,
    setContract,
    contract,
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
      throw new Error('권한이 없습니다.')
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
    throw new Error(`서버 오류: ${res.status}`)
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
  isActive = true,
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
  queryParams.append('isActive', String(isActive))
  // if (isActive !== undefined) queryParams.append('isActive', String(isActive))
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
