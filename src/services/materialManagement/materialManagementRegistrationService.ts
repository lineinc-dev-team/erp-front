import { API } from '@/api/config/env'
import { useManagementMaterialFormStore } from '@/stores/materialManagementStore'

// 자재관리 투입구분 목록 조회
export async function MaterialInputTypeService() {
  const resData = await fetch(`${API.MATERIAL}/input-types`, {
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

// 자재 등록
export async function CreateManagementMaterial() {
  const { newMaterialData } = useManagementMaterialFormStore.getState()
  const payload = newMaterialData()

  const res = await fetch(API.MATERIAL, {
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

// 자재 상세
export async function MaterialDetailService(materialDetailId: number) {
  const res = await fetch(`${API.MATERIAL}/${materialDetailId}`, {
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

//자재 수정
export async function ModifyMaterialManagement(materialId: number) {
  const { newMaterialData } = useManagementMaterialFormStore.getState()

  const payload = newMaterialData()

  const res = await fetch(`${API.MATERIAL}/${materialId}`, {
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

  return res.status
}

// 자재 계약 수정이력 조회
// 자재 계약 수정이력 조회 (페이지네이션 추가)
export async function MaterialInfoHistoryService(
  historyId: number,
  page: number = 0,
  size: number = 4,
  sort: string,
) {
  const resData = await fetch(
    `${API.MATERIAL}/${historyId}/change-histories?page=${page}&size=${size}&sort=${sort}`,
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
