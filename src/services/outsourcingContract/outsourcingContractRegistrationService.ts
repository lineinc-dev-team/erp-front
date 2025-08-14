import { API } from '@/api/config/env'
import { useContractFormStore } from '@/stores/outsourcingContractStore'

export async function CreateOutsourcingContract() {
  const { newOutsourcingContractData } = useContractFormStore.getState()
  const payload = newOutsourcingContractData()

  const res = await fetch(API.OUTSOURCINGCONTRACT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  return await res.status
}

// 외주 업체 등록 시 필요한 구분 목록 조회
export async function OutsourcingContractTypesIdInfoService() {
  const resData = await fetch(`${API.OUTSOURCINGCONTRACT}/types`, {
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

// 외주 계약 세금계산서 발행 조건
export async function OutsourcingContractTaxIdInfoService() {
  const resData = await fetch(`${API.OUTSOURCINGCONTRACT}/tax-invoice-conditions`, {
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

// 외주 계약 상태 조건
export async function OutsourcingContractStatuseIdInfoService() {
  const resData = await fetch(`${API.OUTSOURCINGCONTRACT}/statuses`, {
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

// 외주 계약 공제항목 조건
export async function OutsourcingContractDeductionIdInfoService() {
  const resData = await fetch(`${API.OUTSOURCINGCONTRACT}/default-deductions`, {
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

// 업체명 + 자동완성 사업자등록 번호
export async function GetCompanyNameInfoService({
  pageParam = 0,
  size = 5,
  keyword = '',
  sort = '',
}) {
  const resData = await fetch(
    `${API.OUTSOURCINGCOMPANY}/search?page=${pageParam}&size=${size}&keyword=${keyword}&sort=${sort}`,
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

// 유형 구분이 장비에서만 있는
export async function OutsourcingContractCategoryTypeInfoService() {
  const resData = await fetch(`${API.OUTSOURCINGCONTRACT}/category-types`, {
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

// 외주업체 계약 상세
export async function ContractDetailService(outsourcingContractId: number) {
  const res = await fetch(`${API.OUTSOURCINGCONTRACT}/${outsourcingContractId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  return await res.json()
}

// 외주업체 계약 상세(인력 정보)
export async function ContractPersonDetailService(outsourcingContractId: number) {
  const res = await fetch(`${API.OUTSOURCINGCONTRACT}/${outsourcingContractId}/workers`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  return await res.json()
}
// 외주업체 계약 상세(장비 정보)
export async function ContractEquipmentDetailService(outsourcingContractId: number) {
  const res = await fetch(`${API.OUTSOURCINGCONTRACT}/${outsourcingContractId}/equipments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  return await res.json()
}
// 외주업체 계약 상세(기사운전사 정보)
export async function OutsourcingDriverDetailService(outsourcingContractId: number) {
  const res = await fetch(`${API.OUTSOURCINGCONTRACT}/${outsourcingContractId}/drivers`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  return await res.json()
}

// 외주업체 계약 상세(공사 정보)
export async function OutsourcingConstructionDetailService(outsourcingContractId: number) {
  const res = await fetch(`${API.OUTSOURCINGCONTRACT}/${outsourcingContractId}/constructions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  return await res.json()
}

//  외주업체 수정
export async function ContractModifyMutation(outsourcingContractId: number) {
  const { newOutsourcingContractData } = useContractFormStore.getState()
  const payload = newOutsourcingContractData()

  const res = await fetch(`${API.OUTSOURCINGCONTRACT}/${outsourcingContractId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  return await res.status
}

// 외주업체 수정이력 조회
// 외주업체 수정이력 조회 (페이지네이션 추가)
export async function OutsourcingCompanyInfoHistoryService(
  historyId: number,
  page: number = 0,
  size: number = 4,
  sort: string,
) {
  const resData = await fetch(
    `${API.OUTSOURCINGCOMPANY}/${historyId}/change-histories?page=${page}&size=${size}&sort=${sort}`,
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
