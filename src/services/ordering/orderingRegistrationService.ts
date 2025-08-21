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

  console.log('파일 업로드 시 !!@24', data)

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
    if (res.status === 401) {
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }
    throw new Error(`서버 에러: ${res.status}`)
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
    if (res.status === 401) {
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }
    throw new Error(`서버 에러: ${res.status}`)
  }

  return await res.status
}

// 발주처에 본사 담당자

export async function OrderingInfoNameScroll({ pageParam = 0, size = 5, keyword = '', sort = '' }) {
  const resData = await fetch(
    `${API.USER}/search?page=${pageParam}&size=${size}&keyword=${keyword}&sort=${sort}`,
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

// 결제 정보
export async function PayIdInfoService() {
  const resData = await fetch(`${API.CLIENTCOMPANY}/payment-methods`, {
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
    if (res.status === 401) {
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }
    throw new Error(`서버 에러: ${res.status}`)
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
    if (res.status === 401) {
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }
    throw new Error(`서버 에러: ${res.status}`)
  }

  return await res.status
}

// 발주처 수정이력 조회
// 발주처 수정이력 조회 (페이지네이션 추가)
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
      // 로그인 페이지로 이동
      window.location.href = '/'
      return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
    }
    throw new Error(`서버 에러: ${resData.status}`)
  }
  const data = await resData.json()
  return data
}
