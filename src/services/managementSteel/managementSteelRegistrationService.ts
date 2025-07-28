import { API } from '@/api/config/env'
import { useManagementSteelFormStore } from '@/stores/managementSteelStore'

export async function CreateManagementSteel() {
  const { newSteelData } = useManagementSteelFormStore.getState()
  const payload = newSteelData()

  const res = await fetch(API.STEEL, {
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

// 강재 상세
export async function SteelDetailService(steelDetailId: number) {
  const res = await fetch(`${API.STEEL}/${steelDetailId}`, {
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

// 강재 수정
export async function ModifySteelManagement(steelId: number) {
  const { newSteelData } = useManagementSteelFormStore.getState()
  const originalPayload = newSteelData()

  // 'type' 필드를 제외한 새로운 payload 생성
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { type, ...payloadWithoutType } = originalPayload

  console.log('수정 페이로드 (type 제외)', payloadWithoutType)

  const res = await fetch(`${API.STEEL}/${steelId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payloadWithoutType),
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  return res.status
}
