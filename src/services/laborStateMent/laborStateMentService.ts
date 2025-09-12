'use client'

import { API } from '@/api/config/env'
import { useLaborSummaryFormStore } from '@/stores/laborStateMentStore'

// 노무 명세서 데이터 조회
export async function LaborStateMentListInfoService(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.LABORPAY}?${query}`, {
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

// 노무엑셀 다운로드
export async function LaborStateMentExcelDownload({
  sort = '',
  siteName = '',
  processName = '',
  yearMonth = '',
  fields,
}: {
  sort?: string
  siteName?: string
  processName?: string
  yearMonth?: string
  fields?: string[]
}) {
  const queryParams = new URLSearchParams()

  if (sort) queryParams.append('sort', sort)
  if (siteName) queryParams.append('siteName', siteName)
  if (processName) queryParams.append('processName', processName)
  if (yearMonth) queryParams.append('yearMonth', yearMonth)
  if (fields && fields.length > 0) {
    queryParams.append('fields', fields.join(','))
  }

  const res = await fetch(`${API.LABORPAY}/download?${queryParams.toString()}`, {
    method: 'GET',

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

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '노무 명세서.xlsx'
  a.click()
  window.URL.revokeObjectURL(url)

  return res.status
}

// 노무명세 집계 조회

export async function LaborSummaryDetailService(laborSummaryId: number) {
  const res = await fetch(`${API.LABORPAY}/summary/${laborSummaryId}`, {
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

// 노무명세 집계 수정

export async function LaborSummaryModifyMutation(laborSummaryId: number) {
  const { newLaborSummary } = useLaborSummaryFormStore.getState()
  const payload = newLaborSummary()

  const res = await fetch(`${API.LABORPAY}/summary/${laborSummaryId}`, {
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

  return await res.status
}

// 노무명세서 상세

export async function GetLaborStementInfoService(
  yearMonth: string,
  type: string,
  siteId: number,
  processId: number,
) {
  const resData = await fetch(
    `${API.LABORPAY}/details?type=${type}&yearMonth=${yearMonth}&siteId=${siteId}&processId=${processId}`,
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

// 노무명세서 수정

export async function LaborExcelModifyMutation() {
  const { updateLaborSummary } = useLaborSummaryFormStore.getState()
  const payload = updateLaborSummary()

  console.log('해당 명세서 수정 콘솔!!', payload)

  const res = await fetch(`${API.LABORPAY}`, {
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

  return await res.status
}

// 노무명세서 수정이력 조회 (페이지네이션 추가)
export async function LaborStateMentInfoHistoryService(
  historyId: number,
  page: number = 0,
  size: number = 4,
  sort: string,
) {
  const resData = await fetch(
    `${API.LABORPAY}/summary/${historyId}/change-histories?page=${page}&size=${size}&sort=${sort}`,
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

    // 서버에서 내려준 메시지 꺼내기
    let errorMessage = `서버 에러: ${resData.status}`
    try {
      const errorData = await resData.json()
      if (errorData?.message) {
        errorMessage = errorData.message
      }
    } catch {
      // json 파싱 실패 시는 그냥 status만 전달
    }

    throw new Error(errorMessage)
  }

  const data = await resData.json()
  return data
}

// 노무명세서 메모 변경 이력 수정

export async function LaborSummaryMemoModifyMutation(laborModifyId: number, modifyMemo: string) {
  const res = await fetch(`${API.LABORPAY}/change-histories/${laborModifyId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ memo: modifyMemo }), // ✅ 객체 형태로 감싸기
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
