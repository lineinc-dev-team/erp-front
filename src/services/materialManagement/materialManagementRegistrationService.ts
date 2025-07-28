import { API } from '@/api/config/env'
import { useManagementMaterialFormStore } from '@/stores/materialManagementStore'

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
