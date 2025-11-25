'use client'

import { API } from '@/api/config/env'

export async function DashBoardInfoService() {
  const resData = await fetch(`${API.DASHBOARD}/site-costs`, {
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

export async function DashBoardBatchInfoService() {
  const resData = await fetch(`${API.DASHBOARD}/batch-names`, {
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

export async function DashBoardBatchDaysInfoService(params = {}) {
  const query = new URLSearchParams(params).toString()
  const resData = await fetch(`${API.DASHBOARD}/batch-latest-execution-time?${query}`, {
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

// 대시보드 상세 데이터

export async function DashBoardDetailInfoService(params = {}) {
  const query = new URLSearchParams(params).toString()
  const resData = await fetch(`${API.DASHBOARD}/monthly-costs?${query}`, {
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

// 현장명 무한 스크롤 조회
export async function NoHeadOfficeDashBoardInfoService({ keyword = '' }) {
  const resData = await fetch(`${API.DASHBOARD}/sites?keyword=${keyword}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!resData.ok) {
    if (resData.status === 401) throw new Error('권한이 없습니다.')
    throw new Error(`서버 에러: ${resData.status}`)
  }

  const data = await resData.json()
  return data
}
