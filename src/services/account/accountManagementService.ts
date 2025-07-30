'use client'

// import { GridRowSelectionModel } from '@mui/x-data-grid'
import { API } from '@/api/config/env'
import { useAccountFormStore } from '@/stores/accountManagementStore'

//조회

export async function UserInfoService(params = {}) {
  const query = new URLSearchParams(params).toString()

  console.log('받아온 데이터 확인@@~', query)

  const resData = await fetch(`${API.USER}?${query}`, {
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
  console.log('파싱된 유저 데이터', data)
  return data
}

// 키워드 - 이름 검색 시 무한 스크롤
export async function UserInfoNameScroll({ pageParam = 0, size = 3, keyword = '', sort = '' }) {
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
    if (resData.status === 401) throw new Error('권한이 없습니다.')
    throw new Error(`서버 에러: ${resData.status}`)
  }

  const data = await resData.json()
  console.log('파싱된 유저 데이터', data)
  return data
}

// 부서 목록 조회
export async function DepartmentIdInfoService() {
  const resData = await fetch(`${API.DEPARTMENTS}`, {
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
  console.log('파싱된 유저 부서 데이터@@@ 데이터', data)
  return data
}

// 직급 목록 조회

export async function GradeIdInfoService() {
  const resData = await fetch(`${API.GRADES}`, {
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
  console.log('파싱된 유저 부서 데이터@@@ 데이터', data)
  return data
}
// 직잭 목록 조회

export async function PositionIdInfoService() {
  const resData = await fetch(`${API.POSITIONS}`, {
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
  console.log('파싱된 유저 부서 데이터@@@ 데이터', data)
  return data
}

// 유저 생성 엔드포인트
export async function CreateAccount() {
  const { newAccountUser } = useAccountFormStore.getState()
  const payload = newAccountUser()

  const res = await fetch(API.USER, {
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

// 유저 삭제
export async function UserRemoveService(userIds: number[]) {
  const res = await fetch(API.USER, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userIds }),
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  return await res.status
}

// 엑셀 다운로드
export async function UserDataExcelDownload({
  sort = '',
  username = '',
  roleId,
  isActive,
  createdStartDate,
  createdEndDate,
  lastLoginStartDate,
  lastLoginEndDate,
  fields,
}: {
  sort?: string
  username?: string
  roleId?: number
  isActive?: boolean
  createdStartDate?: string
  createdEndDate?: string
  lastLoginStartDate?: string
  lastLoginEndDate?: string
  fields?: string[]
}) {
  const queryParams = new URLSearchParams()

  queryParams.append('sort', sort)
  if (username) queryParams.append('username', username)
  if (roleId !== undefined) queryParams.append('roleId', String(roleId))
  if (isActive !== undefined) queryParams.append('isActive', String(isActive))
  if (createdStartDate) queryParams.append('createdStartDate', createdStartDate)
  if (createdEndDate) queryParams.append('createdEndDate', createdEndDate)
  if (lastLoginStartDate) queryParams.append('lastLoginStartDate', lastLoginStartDate)
  if (lastLoginEndDate) queryParams.append('lastLoginEndDate', lastLoginEndDate)

  if (fields && fields.length > 0) {
    queryParams.append('fields', fields.join(','))
  }

  const res = await fetch(`${API.USER}/download?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },

    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'export23test.xlsx'
  a.click()
  window.URL.revokeObjectURL(url)

  return res.status
}

// 유저 상세

export async function UserDetailService(userDetailId: number) {
  const res = await fetch(`${API.USER}/${userDetailId}`, {
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

// 유저 수정
export async function ModifyUserManagement(userId: number) {
  const { newAccountUser } = useAccountFormStore.getState()
  const payload = newAccountUser()

  const res = await fetch(`${API.USER}/${userId}`, {
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

// 비밀번호 수정

export async function ModifyUserPasswordManagement(userIds: number) {
  const res = await fetch(`${API.USER}/${userIds}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userIds }),
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  return await res.status
}
