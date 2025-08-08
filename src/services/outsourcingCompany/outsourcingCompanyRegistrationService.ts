import { API } from '@/api/config/env'
import { useOutsourcingFormStore } from '@/stores/outsourcingCompanyStore'
export default function outsourcingCompanyRegistrationService() {
  // api 로직이 들어감
}

export async function CreateOutsourcingCompany() {
  const { newOutsourcingCompanyData } = useOutsourcingFormStore.getState()
  const payload = newOutsourcingCompanyData()

  const res = await fetch(API.OUTSOURCINGCOMPANY, {
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
export async function OutsourcingTypesIdInfoService() {
  const resData = await fetch(`${API.OUTSOURCINGCOMPANY}/types`, {
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
  console.log('파싱된 유저 부서 데이터@@@ 데이터44444', data)
  return data
}

// 외주 업체 등록 시 필요한 공제 항목 조회
export async function OutsourcingDeductionIdInfoService() {
  const resData = await fetch(`${API.OUTSOURCINGCOMPANY}/default-deductions`, {
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
  console.log('파싱된 유저 부서 데이터@@@ 데이터OUTSOURCINGCOMPANYOUTSOURCINGCOMPANY', data)
  return data
}

// 외주업체 상세
export async function OutsourcingDetailService(outsourcingCompanyId: number) {
  const res = await fetch(`${API.OUTSOURCINGCOMPANY}/${outsourcingCompanyId}`, {
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
export async function ModifyOutsourcingCompany(outsourcingCompanyId: number) {
  const { newOutsourcingCompanyData } = useOutsourcingFormStore.getState()
  const payload = newOutsourcingCompanyData()

  const res = await fetch(`${API.OUTSOURCINGCOMPANY}/${outsourcingCompanyId}`, {
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
export async function CLientCompanyInfoHistoryService(
  historyId: number,
  page: number = 0,
  size: number = 4,
) {
  const resData = await fetch(
    `${API.CLIENTCOMPANY}/${historyId}/change-histories?page=${page}&size=${size}`,
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
  console.log('파싱된 유저 데이터', data)
  return data
}
