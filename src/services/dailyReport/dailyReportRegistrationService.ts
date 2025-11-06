import { API } from '@/api/config/env'
import { useDailyFormStore } from '@/stores/dailyReportStore'

// 출역일보  조회
export async function DailyListInfoService(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.DAILYREPORT}?${query}`, {
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

// 출역일보 등록
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

// // 출역일보(직원) 수정

export async function ModifyEmployeesReport({
  siteId,
  siteProcessId,
  reportDate,
}: {
  siteId: number
  siteProcessId: number
  reportDate: string
}) {
  const { modifyEmployees } = useDailyFormStore.getState()
  const payload = modifyEmployees()

  const res = await fetch(
    `${API.DAILYREPORT}/employees?siteId=${siteId}&siteProcessId=${siteProcessId}&reportDate=${reportDate}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    },
  )

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

// 계약/인력 쪽 인력 데이터 조회
export async function GetContractNameInfoService({
  pageParam = 0,
  size = 200,
  keyword = '',
}: {
  pageParam?: number
  size?: number
  keyword?: string
}) {
  const url = `${API.LABOR}/search?page=${pageParam}&size=${size}&keyword=${encodeURIComponent(
    keyword,
  )}&types=DIRECT_CONTRACT`

  const resData = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
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

// 직영/용역에서  용역 데이터의 이름 조회

export async function GetContractNameInfoByOutsourcing({
  pageParam = 0,
  size = 200,
  keyword = '',
  outsourcingCompanyId = 0,
}: {
  pageParam?: number
  size?: number
  keyword?: string
  outsourcingCompanyId?: string | number | ''
}) {
  const url = `${
    API.LABOR
  }/search?page=${pageParam}&outsourcingCompanyId=${outsourcingCompanyId}  &size=${size}&keyword=${encodeURIComponent(
    keyword,
  )}&types=OUTSOURCING`

  const resData = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
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

//현재 관리비에서 사용하고 있는 외주인력명 조회 이름 가져오기  외주 인력 데이터만 가져옴

export async function GetOutSourcingContractByLabor({
  pageParam = 0,
  size = 200,
  keyword = '',
  outsourcingCompanyId = 0,
}: {
  pageParam?: number
  size?: number
  keyword?: string
  outsourcingCompanyId?: string | number | ''
}) {
  const url = `${
    API.LABOR
  }/search?page=${pageParam}&outsourcingCompanyId=${outsourcingCompanyId}  &size=${size}&keyword=${encodeURIComponent(
    keyword,
  )}&types=OUTSOURCING_CONTRACT`

  const resData = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
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

// 외주 (직영/용역)에서의 계약명 가져오기

// 계약/인력 쪽 인력 데이터 조회
export async function GetDirectContractNameInfoService({
  pageParam = 0,
  size = 200,
  keyword = '',
  outsourcingCompanyId = 0,
}: {
  pageParam?: number
  size?: number
  outsourcingCompanyId?: string | number | ''
  keyword?: string
}) {
  const url = `${
    API.OUTSOURCINGCONTRACT
  }/search?page=${pageParam}&size=${size}&outsourcingCompanyId=${outsourcingCompanyId}&keyword=${encodeURIComponent(
    keyword,
  )}&types=CONSTRUCTION`

  const resData = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
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

// 직영/계약직 수정

export async function ModifyContractReport({
  siteId,
  siteProcessId,
  reportDate,
}: {
  siteId: number
  siteProcessId: number
  reportDate: string
}) {
  const { modifyDirectContracts } = useDailyFormStore.getState()
  const payload = modifyDirectContracts()

  const res = await fetch(
    `${API.DAILYREPORT}/direct-contracts?siteId=${siteId}&siteProcessId=${siteProcessId}&reportDate=${reportDate}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    },
  )

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

// 직영/계약직에서 용역 데이터 수정 전송

export async function ModifyDirContractReport({
  siteId,
  siteProcessId,
  reportDate,
}: {
  siteId: number
  siteProcessId: number
  reportDate: string
}) {
  const { modifyDirectContractByOutsourcing } = useDailyFormStore.getState()
  const payload = modifyDirectContractByOutsourcing()

  const res = await fetch(
    `${API.DAILYREPORT}/direct-contract-outsourcings?siteId=${siteId}&siteProcessId=${siteProcessId}&reportDate=${reportDate}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    },
  )

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

// 직영/계약직 용역 데이터 조회

export async function GetViewDirectContractList({
  pageParam = 0,
  size = 100,
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

  const res = await fetch(`${API.DAILYREPORT}/direct-contract-outsourcings?${query.toString()}`, {
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

// 직영/계약직에서 외주 부분 수정

// 직영/계약직 수정

export async function ModifyDirectContractReport({
  siteId,
  siteProcessId,
  reportDate,
}: {
  siteId: number
  siteProcessId: number
  reportDate: string
}) {
  const { modifyDirectContractOutsourcing } = useDailyFormStore.getState()
  const payload = modifyDirectContractOutsourcing()

  const res = await fetch(
    `${API.DAILYREPORT}/direct-contract-outsourcings-contract?siteId=${siteId}&siteProcessId=${siteProcessId}&reportDate=${reportDate}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    },
  )

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

// 노무쪽 인력 데이터 조회(정직원))
export async function GetEmployeeInfoService({
  pageParam = 0,
  size = 200,
  keyword = '',
  types = 'REGULAR_EMPLOYEE',
}) {
  const resData = await fetch(
    `${API.LABOR}/search?page=${pageParam}&size=${size}&keyword=${keyword}&types=${types}`,
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
  size = 10,
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

// 계약직 데이터 조회

export async function GetContractByFilterService({
  pageParam = 0,
  size = 10,
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

  const res = await fetch(`${API.DAILYREPORT}/direct-contracts?${query.toString()}`, {
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

// 직영/용역에서 외주 데이터 조회 탭

export async function GetDirectContractByFilterService({
  pageParam = 0,
  size = 100,
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

  const res = await fetch(
    `${API.DAILYREPORT}/direct-contract-outsourcings-contract?${query.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  )

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

// 외주(공사) 데이터 조회
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

  const res = await fetch(`${API.DAILYREPORT}/outsourcing-constructions?${query.toString()}`, {
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

// 외주  수정
export async function ModifyOutsourcingReport({
  siteId,
  siteProcessId,
  reportDate,
}: {
  siteId: number
  siteProcessId: number
  reportDate: string
}) {
  const { modifyOutsourcing } = useDailyFormStore.getState()
  const payload = modifyOutsourcing()

  const res = await fetch(
    `${API.DAILYREPORT}/outsourcing-constructions?siteId=${siteId}&siteProcessId=${siteProcessId}&reportDate=${reportDate}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    },
  )

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

// 장비를 가지고 있는 업체만 조회

export async function GetWithEquipmentService({
  pageParam = 0,
  size = 200,
  keyword = '',
  sort = '',
}) {
  const resData = await fetch(
    `${API.OUTSOURCINGCOMPANY}/search?page=${pageParam}&size=${size}&sort=${sort}&keyword=${keyword}`,
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

// 장비 데이터 수정
export async function ModifyEquipmentReport({
  siteId,
  siteProcessId,
  reportDate,
}: {
  siteId: number
  siteProcessId: number
  reportDate: string
}) {
  const { modifyEquipment } = useDailyFormStore.getState()
  const payload = modifyEquipment()

  const res = await fetch(
    `${API.DAILYREPORT}/equipments?siteId=${siteId}&siteProcessId=${siteProcessId}&reportDate=${reportDate}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    },
  )

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

// 공사일보에서 주요공정 상세 조회

// 유류 데이터 조회
export async function GetMainProcessService({
  pageParam = 0,
  size = 10,
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

  const res = await fetch(`${API.DAILYREPORT}/main-processes?${query.toString()}`, {
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

// 주요공정 수정

export async function ModifyMainProcessReport({
  siteId,
  siteProcessId,
  reportDate,
}: {
  siteId: number
  siteProcessId: number
  reportDate: string
}) {
  const { modifyMainProcess } = useDailyFormStore.getState()
  const payload = modifyMainProcess()

  const res = await fetch(
    `${API.DAILYREPORT}/main-processes?siteId=${siteId}&siteProcessId=${siteProcessId}&reportDate=${reportDate}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    },
  )

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

// 투입현황
export async function GetInputStatusService({
  pageParam = 0,
  size = 10,
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

  const res = await fetch(`${API.DAILYREPORT}/input-statuses?${query.toString()}`, {
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

// 투입현황 수정

export async function ModifyInputStatusReport({
  siteId,
  siteProcessId,
  reportDate,
}: {
  siteId: number
  siteProcessId: number
  reportDate: string
}) {
  const { modifyInputStatus } = useDailyFormStore.getState()
  const payload = modifyInputStatus()

  const res = await fetch(
    `${API.DAILYREPORT}/input-statuses?siteId=${siteId}&siteProcessId=${siteProcessId}&reportDate=${reportDate}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    },
  )

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

// 자재현황 조회

export async function GetMaterialStatusService({
  pageParam = 0,
  size = 10,
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

  const res = await fetch(`${API.DAILYREPORT}/material-statuses?${query.toString()}`, {
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

// 자재 현항 수정

export async function ModifyMaterialStatusReport({
  siteId,
  siteProcessId,
  reportDate,
}: {
  siteId: number
  siteProcessId: number
  reportDate: string
}) {
  const { modifyMaterialStatus } = useDailyFormStore.getState()
  const payload = modifyMaterialStatus()

  const res = await fetch(
    `${API.DAILYREPORT}/material-statuses?siteId=${siteId}&siteProcessId=${siteProcessId}&reportDate=${reportDate}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    },
  )

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

// 작업 내용 조회

export async function GetWorkerStatusService({
  pageParam = 0,
  size = 10,
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

  const res = await fetch(`${API.DAILYREPORT}/works?${query.toString()}`, {
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

// 작업 내용  수정

export async function ModifyWorkerReport({
  siteId,
  siteProcessId,
  reportDate,
}: {
  siteId: number
  siteProcessId: number
  reportDate: string
}) {
  const { modifyWorkerProcess } = useDailyFormStore.getState()
  const payload = modifyWorkerProcess()

  const res = await fetch(
    `${API.DAILYREPORT}/works?siteId=${siteId}&siteProcessId=${siteProcessId}&reportDate=${reportDate}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    },
  )

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

// 유류 데이터 수정
// export async function ModifyFuelReport({
//   siteId,
//   siteProcessId,
//   reportDate,
// }: {
//   siteId: number
//   siteProcessId: number
//   reportDate: string
// }) {
//   const { modifyFuel } = useDailyFormStore.getState()
//   const payload = modifyFuel()

//   const res = await fetch(
//     `${API.DAILYREPORT}/fuels?siteId=${siteId}&siteProcessId=${siteProcessId}&reportDate=${reportDate}`,
//     {
//       method: 'PATCH',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload),
//       credentials: 'include',
//     },
//   )

//   if (!res.ok) {
//     if (res.status === 401) {
//       // 로그인 페이지로 이동
//       window.location.href = '/'
//       return // 혹은 throw new Error('권한이 없습니다.') 후 처리를 중단
//     }
//     // 서버에서 내려준 메시지 꺼내기
//     let errorMessage = `서버 에러: ${res.status}`
//     try {
//       const errorData = await res.json()
//       if (errorData?.message) {
//         errorMessage = errorData.message
//       }
//     } catch {
//       // json 파싱 실패 시는 그냥 status만 전달
//     }

//     throw new Error(errorMessage)
//   }

//   return await res.status
// }

//유류 수정
export async function ModifyDailyFuel(fuelId: number) {
  const { modifyFuel } = useDailyFormStore.getState()

  const payload = modifyFuel()

  const res = await fetch(`${API.FUELAGGRE}/${fuelId}`, {
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

  return res.status
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

  // 출역일보 파일 조회
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

export async function ModifyFileReport({
  siteId,
  siteProcessId,
  reportDate,
}: {
  siteId: number
  siteProcessId: number
  reportDate: string
}) {
  const { modifyFile } = useDailyFormStore.getState()
  const payload = modifyFile()

  const res = await fetch(
    `${API.DAILYREPORT}/files?siteId=${siteId}&siteProcessId=${siteProcessId}&reportDate=${reportDate}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    },
  )

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

// 노무쪽 인력 데이터 조회

export async function OutsourcingWorkerNameScroll({
  pageParam = 0,
  size = 200,
  keyword = '',
  id = 0,
  siteIdList = 0,
  sort = '',
}) {
  const resData = await fetch(
    `${API.OUTSOURCINGCOMPANY}/${id}/contract-workers?page=${pageParam}&size=${size}&siteId=${siteIdList}&keyword=${keyword}&sort=${sort}`,
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

// 출역일보 상세 조회

export async function DetaileReport({
  siteId,
  siteProcessId,
  reportDate,
}: {
  siteId: number
  siteProcessId: number
  reportDate: string
}) {
  const res = await fetch(
    `${API.DAILYREPORT}/detail?siteId=${siteId}&siteProcessId=${siteProcessId}&reportDate=${reportDate}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  )

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

  return await res.json()
}

// 마감 api

export async function CompleteInfoData({
  siteId,
  siteProcessId,
  reportDate,
}: {
  siteId: number
  siteProcessId: number
  reportDate: string
}) {
  const res = await fetch(
    `${API.DAILYREPORT}/complete?siteId=${siteId}&siteProcessId=${siteProcessId}&reportDate=${reportDate}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  )

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

// 출역일보 날씨 수정

export async function ModifyWeatherReport({
  siteId,
  siteProcessId,
  reportDate,
  activeTab,
}: {
  siteId: number
  siteProcessId: number
  reportDate: string
  activeTab: string
}) {
  const { modifyWeather } = useDailyFormStore.getState()
  const payload = modifyWeather(activeTab)

  const res = await fetch(
    `${API.DAILYREPORT}?siteId=${siteId}&siteProcessId=${siteProcessId}&reportDate=${reportDate}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    },
  )

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

// 출역일보 증빙서류 파일 조회

export async function GetReportByEvidenceFilterService({
  pageParam = 0,
  size = 200,
  sort = 'id,asc',
  id = 0,
  fileType = '',
}: {
  pageParam?: number
  size?: number
  sort?: string
  id: number
  fileType: string
}) {
  const res = await fetch(
    `${API.DAILYREPORT}/evidence-files?page=${pageParam}&size=${size}&sort=${sort}&id=${id}&fileType=${fileType}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  )

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

  return await res.json()
}

// 유류 집계 기름 가격 조회

export async function GetFuelPrice({ siteId = 0, siteProcessId = 0, reportDate = '' }) {
  const query = new URLSearchParams({
    siteId: siteId.toString(),
    siteProcessId: siteProcessId.toString(),
    reportDate,
  })

  const res = await fetch(`${API.FUELAGGRE}/fuel-prices?${query.toString()}`, {
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

// 유류 집계에서 업체명  가져오는 로직

// 유류 집계 기름 가격 조회

export async function GetFuelCompany({ siteId = 0, siteProcessId = 0, reportDate = '' }) {
  const query = new URLSearchParams({
    siteId: siteId.toString(),
    siteProcessId: siteProcessId.toString(),
    reportDate,
  })

  const res = await fetch(`${API.FUELAGGRE}/fuel-company?${query.toString()}`, {
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

// 외주(공사) 항목명, 항목 조회

export async function GetContractGroup({
  id,
  siteId = 0,
  pageParam = 0,
  size = 10,
}: {
  id: number
  siteId?: number
  pageParam?: number
  size?: number
}) {
  const query = new URLSearchParams({
    siteId: siteId.toString(),
    page: pageParam.toString(),
    size: size.toString(),
  })

  const res = await fetch(
    `${API.OUTSOURCINGCOMPANY}/${id}/contract-construction-groups?${query.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  )

  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = '/'
      return
    }
    throw new Error(`서버 에러: ${res.status}`)
  }

  const data = await res.json()
  return data
}

// 외주(공사) 규격 데이터  조회

export async function GetContractSpecifications({
  id,
  constructionGroupId = 0,
  itemName = '',
}: {
  id: number
  constructionGroupId?: number
  itemName?: string
}) {
  const query = new URLSearchParams({
    constructionGroupId: constructionGroupId.toString(),
    itemName,
  })

  const res = await fetch(`${API.OUTSOURCINGCOMPANY}/${id}/specifications?${query.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = '/'
      return
    }
    throw new Error(`서버 에러: ${res.status}`)
  }

  const data = await res.json()
  return data
}

// 유류 데이터 등록 (출역일보 있을 시 ) 현재 존재 시

// 유류집계 등록
export async function DailyAlreadyFuelInfo() {
  const { modifyFuel } = useDailyFormStore.getState()
  const payload = modifyFuel()

  const res = await fetch(API.FUELAGGRE, {
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
