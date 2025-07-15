import { API } from '@/api/config/env'
import {
  GroupUserResponse,
  MenuPermissionResponse,
  PermissionResponse,
  PermissionSingleResponse,
} from '@/types/allRoles'

// 권한 그룹 전체 조회
export async function PermissionService(): Promise<PermissionResponse> {
  const res = await fetch(API.SINGLEROLE, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`서버 에러: ${res.status}`)
  }

  return res.json()
}

// 여러 권한 그룹 삭제 !!

export async function PermissionGroupRemove(removId: number[]) {
  const res = await fetch(API.SINGLEROLE, {
    method: 'DELETE',
    body: JSON.stringify({
      roleIds: removId,
    }),
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`서버 에러: ${res.status}`)
  }

  return true
}
// 권한 그룹 생성  !!

export async function PermissionGroupAdd(groupName: string) {
  const res = await fetch(API.SINGLEROLE, {
    method: 'POST',
    body: JSON.stringify({
      name: groupName,
    }),
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`서버 에러: ${res.status}`)
  }

  console.log('서버에서 보내준 데이터 값', res)

  // return true
  const resultData = await res.status

  return resultData
}

export async function PermissionSingleService(id: number): Promise<PermissionSingleResponse> {
  const res = await fetch(`${API.SINGLEROLE}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`서버 에러: ${res.status}`)
  }

  return res.json()
}

// 권한 그룹 메뉴별 권한 조회

export async function MenuPermissionService(groupId: number): Promise<MenuPermissionResponse> {
  const res = await fetch(`${API.SINGLEROLE}/${groupId}/menu-permissions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`서버 에러: ${res.status}`)
  }

  return res.json()
}

// 권한 그룹에 속한 유저 목록 조회

export async function GroupUserList(userId: number): Promise<GroupUserResponse> {
  const res = await fetch(`${API.SINGLEROLE}/${userId}/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`서버 에러: ${res.status}`)
  }

  return res.json()
}

// 권한 그룹에 속한 유저 목록 삭제

export async function GroupUserRemove(userId: number, removId: number[]) {
  const res = await fetch(`${API.SINGLEROLE}/${userId}/users`, {
    method: 'DELETE',
    body: JSON.stringify({
      userIds: removId,
    }),
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`서버 에러: ${res.status}`)
  }

  return true
}

// 유저 추가

export async function addUsersToRole(roleId: number, userIds: number[]) {
  const res = await fetch(`${API.SINGLEROLE}/${roleId}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userIds,
    }),
    credentials: 'include', // 세션 쿠키 필요하면 추가
  })

  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`)
  }

  // return res.json()
  // return true
  const text = await res.text()

  let data
  try {
    data = JSON.parse(text)
  } catch {
    console.warn('JSON 파싱 실패, 그냥 text 반환:', text)
    data = text
  }

  return data
}
