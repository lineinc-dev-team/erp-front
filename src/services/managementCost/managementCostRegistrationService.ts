import { API } from '@/api/config/env'
import { useManagementCostFormStore } from '@/stores/managementCostsStore'

// 현장명 무한 스크롤 조회
export async function SitesPersonScroll({ pageParam = 0, size = 200, keyword = '', sort = '' }) {
  const resData = await fetch(
    `${API.SITES}/search?page=${pageParam}&size=${size}&keyword=${keyword}&sort=${sort}`,
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

// 공정명 무한 스크롤 조회
export async function SitesProcessNameScroll({
  pageParam = 0,
  size = 200,
  siteId = '',
  keyword = '',
  sort = '',
}: {
  pageParam?: number
  size?: number
  siteId?: string | number | ''
  keyword?: string
  sort?: string
}) {
  const resData = await fetch(
    `${API.PROCESS}/search?page=${pageParam}&size=${size}&siteId=${siteId}&keyword=${keyword}&sort=${sort}`,
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

// 관리비 항목 타입 조회

export async function CostNameTypeService() {
  const resData = await fetch(`${API.COST}/item-types`, {
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

// 관리비 등록
export async function CreateManagementCost() {
  const { newCostData } = useManagementCostFormStore.getState()
  const payload = newCostData()

  const res = await fetch(API.COST, {
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

// 발주처 상세
export async function CostDetailService(costDetailId: number) {
  const res = await fetch(`${API.COST}/${costDetailId}`, {
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

//  수정
export async function ModifyCostManagement(costId: number) {
  const { newCostData } = useManagementCostFormStore.getState()
  const payload = newCostData()

  const res = await fetch(`${API.COST}/${costId}`, {
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

// 식대 인력 조회

export async function GetPersonCostInfoService({ pageParam = 0, size = 200, keyword = '' }) {
  const resData = await fetch(
    `${API.LABOR}/search?page=${pageParam}&size=${size}&keyword=${keyword}`,
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

//  관리비 수정이력 조회 (페이지네이션 추가)
export async function CostInfoHistoryService(
  historyId: number,
  page: number = 0,
  size: number = 4,
  sort: string,
) {
  const resData = await fetch(
    `${API.COST}/${historyId}/change-histories?page=${page}&size=${size}&sort=${sort}`,
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
