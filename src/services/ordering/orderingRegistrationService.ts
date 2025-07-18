import { API } from '@/api/config/env'
import { useOrderingFormStore } from '@/stores/orderingStore'

type PresignedUrlResponse = {
  uploadUrl: string
  publicUrl: string
}

export async function getPresignedUrl(
  contentType: string,
  uploadTarget: string,
): Promise<PresignedUrlResponse> {
  const response = await fetch(`${API.FILEUPLOAD}/upload-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ contentType, uploadTarget }), // 예: 'image/jpeg'
  })
  if (!response.ok) throw new Error('Presigned URL 요청 실패')
  const { data } = await response.json()

  console.log('파일 업로드 전 데이터 확인 ', data)

  const { publicUrl, uploadUrl } = data
  return { publicUrl, uploadUrl }
}

export async function uploadToS3(uploadUrl: string, file: File) {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  })

  if (!res.ok) {
    throw new Error(`S3 업로드 실패: ${res.statusText}`)
  }
}
// 발주처 생성 엔드포인트

export async function CreateClientCompany() {
  const { newClientCompanyData } = useOrderingFormStore.getState()
  const payload = newClientCompanyData()

  const res = await fetch(API.CLIENTCOMPANY, {
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
export async function ClientDetailService(clientCompanyId: number) {
  const res = await fetch(`${API.CLIENTCOMPANY}/${clientCompanyId}`, {
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
export async function ModifyClientCompany(clientModifyId: number) {
  const { newClientCompanyData } = useOrderingFormStore.getState()
  const payload = newClientCompanyData()

  const res = await fetch(`${API.CLIENTCOMPANY}/${clientModifyId}`, {
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
