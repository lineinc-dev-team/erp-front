export interface PageInfo {
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface PermissionItem {
  id: number
  name: string
  userCount: number
  createdAt: string
  updatedAt: string
}

export type PermissionSingleResponse = {
  status: number
  data: PermissionItem
}

export interface PermissionResponse {
  status: number
  data: {
    pageInfo: PageInfo
    content: PermissionItem[]
  }
}

export interface MenuPermissionItem {
  id: number
  name: string
  permissions: {
    id: number
    action: string
  }[]
}

export interface MenuPermissionResponse {
  status: number
  data: MenuPermissionItem[]
}

export interface GroupUserItem {
  id: number
  loginId: string
  username: string
  memo: string
  createdAt: string
}

export interface GroupUserResponse {
  status: number
  data: {
    pageInfo: PageInfo
    content: GroupUserItem[]
  }
}
