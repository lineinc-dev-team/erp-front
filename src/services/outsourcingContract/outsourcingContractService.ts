import { API } from '@/api/config/env'

// 외주계약 조회
export async function OutsourcingContractInfoService(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.OUTSOURCINGCONTRACT}?${query}`, {
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
export async function OutsourcingContractRemoveService(contractIds: number[]) {
  const res = await fetch(API.OUTSOURCINGCONTRACT, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contractIds }),
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  return await res.status
}

// // 외주업체 엑셀 다운로드
export async function OutsourcingContractExcelDownload({
  sort = '',
  siteName,
  processName,
  companyName,
  businessNumber,
  contractType,
  contractStatus,
  contractStartDate,
  contractEndDate,
  contactName,
  isActive = true,
  fields,
}: {
  sort?: string
  siteName?: string
  processName?: string
  companyName?: string
  businessNumber?: string
  contractType?: string
  contractStatus?: string
  contractStartDate?: string
  contractEndDate?: string
  contactName?: string
  isActive?: boolean
  fields?: string[]
}) {
  const queryParams = new URLSearchParams()

  queryParams.append('sort', sort)
  if (siteName) queryParams.append('siteName', siteName)
  if (processName) queryParams.append('processName', processName)
  if (companyName) queryParams.append('companyName', companyName)
  if (businessNumber) queryParams.append('businessNumber', businessNumber)
  if (contractType) queryParams.append('contractType', contractType)
  if (contractStatus) queryParams.append('contractStatus', contractStatus)
  if (contractStartDate) queryParams.append('contractStartDate', contractStartDate)
  if (contractEndDate) queryParams.append('contractEndDate', contractEndDate)
  if (contactName) queryParams.append('contactName', contactName)

  queryParams.append('isActive', String(isActive))

  if (fields && fields.length > 0) {
    queryParams.append('fields', fields.join(','))
  }

  const res = await fetch(`${API.OUTSOURCINGCONTRACT}/download?${queryParams.toString()}`, {
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
