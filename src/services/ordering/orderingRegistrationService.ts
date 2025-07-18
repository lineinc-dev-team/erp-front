import { API } from '@/api/config/env'

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
