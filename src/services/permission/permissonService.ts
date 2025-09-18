import { API } from '@/api/config/env'
import { usePermissionGroupStore } from '@/stores/permissionStore'

// 권한 그룹 전체 조회
export async function PermissionService(params = {}) {
  const query = new URLSearchParams(params).toString()

  const resData = await fetch(`${API.SINGLEROLE}?${query}`, {
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

// 여러 권한 그룹 삭제 !!
export async function PermissionGroupRemove(roleIds: number[]) {
  const res = await fetch(API.SINGLEROLE, {
    method: 'DELETE',
    body: JSON.stringify({
      roleIds: roleIds,
    }),
    headers: { 'Content-Type': 'application/json' },
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

  return true
}
// 권한 그룹 생성

export async function CreatePermission() {
  const { newPermissionGroupData } = usePermissionGroupStore.getState()
  const payload = newPermissionGroupData()

  const res = await fetch(API.SINGLEROLE, {
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
      return
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

// 유저 계정 조회 권한에서

export async function UserInfoFromPermissionService({
  pageParam = 0,
  hasRole = false,
  size = 20,
  loginIdKeyword = '',
  sort = '',
}) {
  const resData = await fetch(
    `${API.USER}/search?page=${pageParam}&size=${size}&loginIdKeyword=${loginIdKeyword}&sort=${sort}&hasRole=${hasRole}`,
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

// 전체 메뉴 조회
export async function MenuListService() {
  const resData = await fetch(`${API.SIDEMENU}`, {
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

// 단일 권한 그룹 조회
export async function SinglepermissionService(singleId: number) {
  const resData = await fetch(`${API.SINGLEROLE}/${singleId}`, {
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

// 단일 권한 그룹 조회
export async function SinglepermissionUserService(singleId: number) {
  const resData = await fetch(`${API.SINGLEROLE}/${singleId}/users`, {
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

// 단일 권한 그룹 조회
export async function SinglepermissionMenuService(singleId: number) {
  const resData = await fetch(`${API.SINGLEROLE}/${singleId}/menu-permissions`, {
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

//  권한  수정
export async function ModifyPermissionService(permissionModifyId: number) {
  const { newPermissionGroupData } = usePermissionGroupStore.getState()
  const payload = newPermissionGroupData()

  const res = await fetch(`${API.SINGLEROLE}/${permissionModifyId}`, {
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
      return
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
