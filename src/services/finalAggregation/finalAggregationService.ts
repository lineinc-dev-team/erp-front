'use client'

import { API } from '@/api/config/env'

// 집계에서 재료비 조회
export async function MaterialInfoServiceByAggregate(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.AGGREGATE}/material-cost?${query}`, {
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

// 집계에서 유류집계 조회

export async function FuelInfoServiceByAggregate(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.AGGREGATE}/fuel?${query}`, {
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

// 집계에서 유류집계  월별 유종별 가격 조회
export async function FuelPriceInfoServiceByAggregate(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.AGGREGATE}/daily-weather/fuel-prices?${query}`, {
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

// 집계에서 노무비 조회
