import { API } from '@/api/config/env'
import { useManagementCostFormStore } from '@/stores/managementCostsStore'

export default function managementCostRegistrationService() {}

// 현장명 무한 스크롤 조회
export async function SitesPersonScroll({ pageParam = 0, size = 5, keyword = '', sort = '' }) {
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
  console.log('파싱된 유저 데이터', data)
  return data
}

// 공정명 무한 스크롤 조회
export async function SitesProcessNameScroll({ pageParam = 0, size = 5, keyword = '', sort = '' }) {
  const resData = await fetch(
    `${API.PROCESS}/search?page=${pageParam}&size=${size}&keyword=${keyword}&sort=${sort}`,
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
  console.log('파싱된 유저 데이터', data)
  return data
}

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
