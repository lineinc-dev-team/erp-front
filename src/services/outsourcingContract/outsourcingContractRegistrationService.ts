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
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
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
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
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
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
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
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }
    throw new Error(`서버 에러: ${resData.status}`)
  }

  const data = await resData.json()
  return data
}

// 소속 업체 선택 시  해당 업체계약  넣기

export async function GetOutSourcingContractInfoService({
  pageParam = 0,
  size = 50,
  keyword = '',
  sort = 'id,asc',
  outsourcingCompanyId = 0,
}) {
  const resData = await fetch(
    `${API.OUTSOURCINGCONTRACT}/search?page=${pageParam}&size=${size}&keyword=${keyword}&outsourcingCompanyId=${outsourcingCompanyId}&sort=${sort}`,
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

// 업체명 + 자동완성 사업자등록 번호
export async function GetCompanyNameInfoService({
  pageParam = 0,
  size = 200,
  keyword = '',
  sort = 'name,asc',
  type = '',
  outsourcingCompanyId = 0,
}) {
  const resData = await fetch(
    `${API.OUTSOURCINGCOMPANY}/search?page=${pageParam}&size=${size}&keyword=${keyword}&sort=${sort}&outsourcingCompanyId=${outsourcingCompanyId}&type=${type}`,
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
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
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
    if (res.status === 401) {
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }
    throw new Error(`서버 에러: ${res.status}`)
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
    if (res.status === 401) {
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }
    throw new Error(`서버 에러: ${res.status}`)
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
    if (res.status === 401) {
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }
    throw new Error(`서버 에러: ${res.status}`)
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
    if (res.status === 401) {
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }
    throw new Error(`서버 에러: ${res.status}`)
  }
  return await res.json()
}

// 외주업체 계약 상세(공사 정보)
export async function OutsourcingConstructionDetailService(outsourcingContractId: number) {
  const res = await fetch(`${API.OUTSOURCINGCONTRACT}/${outsourcingContractId}/constructions-v2`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
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

// 외주업체 계약 수정이력 조회
// 외주업체 계약 수정이력 조회 (페이지네이션 추가)
export async function OutsourcingContractInfoHistoryService(
  historyId: number,
  page: number = 0,
  size: number = 4,
  sort: string,
) {
  const resData = await fetch(
    `${API.OUTSOURCINGCONTRACT}/${historyId}/change-histories?page=${page}&size=${size}&sort=${sort}`,
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

    // 서버에서 내려준 메시지 꺼내기
    let errorMessage = `서버 에러: ${resData.status}`
    try {
      const errorData = await resData.json()
      if (errorData?.message) {
        errorMessage = errorData.message
      }
    } catch {
      // json 파싱 실패 시는 그냥 status만 전달
    }

    throw new Error(errorMessage)
  }

  const data = await resData.json()
  return data
}

// 외주 계약에서 업체 선택 시 담담자 불러오기
export async function ContractInfoDetailService(id: number) {
  const res = await fetch(`${API.OUTSOURCINGCOMPANY}/${id}/contacts`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
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

  return await res.json()
}
