import { API } from '@/api/config/env'
import { useDailyFormStore } from '@/stores/dailyReportStore'

export async function CreatedailyReport() {
  const { newDailyReportData } = useDailyFormStore.getState()
  const payload = newDailyReportData()

  const res = await fetch(API.DAILYREPORT, {
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

// 노무쪽 인력 데이터 조회
export async function GetEmployeeInfoService({
  pageParam = 0,
  size = 5,
  keyword = '',
  type = 'REGULAR_EMPLOYEE',
}) {
  const resData = await fetch(
    `${API.LABOR}/search?page=${pageParam}&size=${size}&keyword=${keyword}&type=${type}`,
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

// 직원 데이터 조회
export async function GetEmployeesByFilterService({
  pageParam = 0,
  size = 5,
  sort = 'id,asc',
  siteId = 0,
  siteProcessId = 0,
  reportDate = '',
}) {
  const query = new URLSearchParams({
    page: pageParam.toString(),
    size: size.toString(),
    sort,
    siteId: siteId.toString(),
    siteProcessId: siteProcessId.toString(),
    reportDate,
  })

  const res = await fetch(`${API.DAILYREPORT}/employees?${query.toString()}`, {
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

  const data = await res.json()
  return data
}

// 외주 데이터 조회
export async function GetOutsoucingByFilterService({
  pageParam = 0,
  size = 5,
  sort = 'id,asc',
  siteId = 0,
  siteProcessId = 0,
  reportDate = '',
}) {
  const query = new URLSearchParams({
    page: pageParam.toString(),
    size: size.toString(),
    sort,
    siteId: siteId.toString(),
    siteProcessId: siteProcessId.toString(),
    reportDate,
  })

  const res = await fetch(`${API.DAILYREPORT}/outsourcings?${query.toString()}`, {
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

  const data = await res.json()
  return data
}

// 장비 데이터 조회
export async function GetEquipmentByFilterService({
  pageParam = 0,
  size = 5,
  sort = 'id,asc',
  siteId = 0,
  siteProcessId = 0,
  reportDate = '',
}) {
  const query = new URLSearchParams({
    page: pageParam.toString(),
    size: size.toString(),
    sort,
    siteId: siteId.toString(),
    siteProcessId: siteProcessId.toString(),
    reportDate,
  })

  const res = await fetch(`${API.DAILYREPORT}/equipments?${query.toString()}`, {
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

  const data = await res.json()
  return data
}

// 유류 데이터 조회
export async function GetFuelByFilterService({
  pageParam = 0,
  size = 5,
  sort = 'id,asc',
  siteId = 0,
  siteProcessId = 0,
  reportDate = '',
}) {
  const query = new URLSearchParams({
    page: pageParam.toString(),
    size: size.toString(),
    sort,
    siteId: siteId.toString(),
    siteProcessId: siteProcessId.toString(),
    reportDate,
  })

  const res = await fetch(`${API.DAILYREPORT}/fuels?${query.toString()}`, {
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

  const data = await res.json()
  return data
}

// 현장 사진 등록 데이터 조회
export async function GetAttachedFileByFilterService({
  pageParam = 0,
  size = 5,
  sort = 'id,asc',
  siteId = 0,
  siteProcessId = 0,
  reportDate = '',
}) {
  const query = new URLSearchParams({
    page: pageParam.toString(),
    size: size.toString(),
    sort,
    siteId: siteId.toString(),
    siteProcessId: siteProcessId.toString(),
    reportDate,
  })

  const res = await fetch(`${API.DAILYREPORT}/files?${query.toString()}`, {
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

  const data = await res.json()
  return data
}

// 노무쪽 인력 데이터 조회

export async function OutsourcingWorkerNameScroll({
  pageParam = 0,
  size = 5,
  keyword = '',
  id = 0,
  sort = '',
}) {
  const resData = await fetch(
    `${API.OUTSOURCINGCOMPANY}/${id}/contract-workers?page=${pageParam}&size=${size}&keyword=${keyword}&sort=${sort}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  )

  if (!resData.ok) {
    if (resData.status === 401) throw new Error('권한이 없습니다.')
    throw new Error(`서버 에러: ${resData.status}`)
  }

  const data = await resData.json()
  return data
}
