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

export async function LaborCostInfoServiceByAggregate(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.AGGREGATE}/labor-cost?${query}`, {
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
// 집계 노무비에서 사용하는 (용역별 데이터 조회)

export async function OutsourcingLaborCostInfoServiceByAggregate(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.AGGREGATE}/outsourcing-labor-cost?${query}`, {
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

// 집계에서 장비비  조회

// 집계 노무비에서 사용하는 (용역별 데이터 조회)

export async function EquipmentCostInfoServiceByAggregate(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.AGGREGATE}/equipment-cost?${query}`, {
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

// 집계 장비비 가동현황

export async function EquipmentStatusInfoServiceByAggregate(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.AGGREGATE}/equipment-operation-status?${query}`, {
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

// 집계 월별 일자별 날씨 조회

export async function WeatherInfoServiceByAggregate(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.AGGREGATE}/daily-weather?${query}`, {
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

// 집계에서 노무명세서

export async function LaborPayInfoServiceByAggregate(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.AGGREGATE}/labor-payroll?${query}`, {
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

// // 집계에서 관리비 조회
export async function ManagementCostInfoServiceByAggregate(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.AGGREGATE}/management-cost?${query}`, {
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
