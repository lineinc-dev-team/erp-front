import { API } from '@/api/config/env'
import { useFuelFormStore } from '@/stores/fuelAggregationStore'

// 유류집계에서 날씨 조회 타입
export async function FuelWeatherTypeService() {
  const resData = await fetch(`${API.FUELAGGRE}/weather-types`, {
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

// 유류집계에서 유종 조회 타입
export async function FuelOilTypeService() {
  const resData = await fetch(`${API.FUELAGGRE}/fuel-types`, {
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

// 유류집계 등록
export async function CreateFuelInfo() {
  const { newFuelData } = useFuelFormStore.getState()
  const payload = newFuelData()

  const res = await fetch(API.FUELAGGRE, {
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

// 외주 업체에 대한 기사명
export async function FuelDriverNameScroll({
  pageParam = 0,
  size = 200,
  keyword = '',
  id = 0,
  sort = '',
}) {
  const resData = await fetch(
    `${API.OUTSOURCINGCOMPANY}/${id}/contract-drivers?page=${pageParam}&size=${size}&keyword=${keyword}&sort=${sort}`,
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

// 외주 업체에 대한 차량번호
export async function FuelEquipmentNameScroll({
  pageParam = 0,
  size = 200,
  keyword = '',
  id = 0,
  sort = '',
}) {
  const resData = await fetch(
    `${API.OUTSOURCINGCOMPANY}/${id}/contract-equipments?page=${pageParam}&size=${size}&keyword=${keyword}&sort=${sort}`,
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

// 유류 상세
export async function FuelDetailService(fuelDetailId: number) {
  const res = await fetch(`${API.FUELAGGRE}/${fuelDetailId}`, {
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

//자재 수정
export async function ModifyFuel(fuelId: number) {
  const { newFuelData } = useFuelFormStore.getState()

  const payload = newFuelData()

  const res = await fetch(`${API.FUELAGGRE}/${fuelId}`, {
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

  return res.status
}

// 자재 계약 수정이력 조회
// 자재 계약 수정이력 조회 (페이지네이션 추가)
export async function FuelInfoHistoryService(
  historyId: number,
  page: number = 0,
  size: number = 4,
  sort: string,
) {
  const resData = await fetch(
    `${API.FUELAGGRE}/${historyId}/change-histories?page=${page}&size=${size}&sort=${sort}`,
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
